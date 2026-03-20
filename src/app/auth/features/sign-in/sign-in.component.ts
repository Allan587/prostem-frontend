import { Component, inject, NgZone, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFormSignIn } from '../../../Interfaces/IFormSignIn';
import { IModal } from '../../../Interfaces/IModal';
import { isRequired, isInvalidEmail } from '../../utils/validators';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from '../../data-access/auth.service';
import { GoogleButtonComponent } from '../../google-button/google-button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStateService } from '../../../shared/auth-state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { Location } from '@angular/common';


@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleButtonComponent, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './sign-in.component.html',
  styleUrl: '../../auth.components.css'
})

export default class SignInComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private authStateService = inject(AuthStateService);

  //------------Modal settings----
  @ViewChild('recoverPasswordTemplate') recoverPasswordTemplate!: TemplateRef<any>;
  constructor(
    private dialog: MatDialog,
    private ngZone: NgZone,
    private location: Location
  ) { }

  openRemoveUserDialog() {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Recuperar contraseña',
        contentTemplate: this.recoverPasswordTemplate,
        showConfirmButton: true,
        confirmButtonText: 'Enviar correo',
      } as IModal,
    });


    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.submitPasswordRecovery();
        } catch (error) {
          console.error('Error enviando el correo de cambio de contraseña:', error);
        }
      }
    });
  }
  //------------------------------

  showPassword = false;
  isPassRecoveryModalOpened = false;

  logoPath = '../../../../assets/ProSTEM-logo-with-label.jpg';

  isLoading = signal(false);
  buttonClicked: 'email-password' | 'google' | null = null;

  ngOnInit() {
    // Sync form.email with passRecoveryForm
    this.form.get('email')?.valueChanges.subscribe(value => {
      this.passRecoveryForm.get('email')?.setValue(value, { emitEvent: false });
    });

    // Sync passRecoveryForm with form.email
    // this.passRecoveryForm.get('email')?.valueChanges.subscribe(value => {
    //   this.form.get('email')?.setValue(value, { emitEvent: false });
    // });
  }

  /**
   * This method is to validate that the 'email' field has a valid format. 
   * For example: email@test.com
   * Before implementing this method, text strings in the form 'example@test' were being allowed.
   * 
   * @param text the text got from the email input.
   * @returns  a boolean value indicating whether the text satisfies the pattern.
   */
  endsInDotSomething(text: string | null | undefined): boolean {
    if (text != null && text != undefined) {
      const regex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(text);
    }
    return false;
  }

  form = this.formBuilder.group<IFormSignIn>({
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', Validators.required)
  });

  passRecoveryForm = this.formBuilder.group({
    email: this.formBuilder.control('', [
      Validators.required, Validators.email,
      Validators.pattern(/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/)])
  });

  isRequired(field: 'email' | 'password', form: any) {
    return isRequired(field, form);
  }

  isValidEmail(theForm: any) {
    if (theForm.value.email == null ||
      theForm.value.email == undefined ||
      theForm.value.email == '') {
      return isInvalidEmail(theForm);
    }

    if (!this.endsInDotSomething(theForm.value.email)) return true;

    return isInvalidEmail(this.form);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private resetLoadingState(): void {
    this.buttonClicked = null;
    this.isLoading.set(false);
  }

  async submitSignIn() {
    if (this.form.invalid) {
      toast.info('Por favor, proporciona tu correo y tu contraseña');
      return;
    }

    this.isLoading.set(true);
    this.buttonClicked = 'email-password';

    try {
      const { email, password } = this.form.value;

      if (!email || !password) return;

      (await this.authService.signInEmailAndPassword({ email, password })).subscribe({
        next: (_) => {
          toast.success('¡Bienvenido de nuevo!');
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          console.error('Error de login:', err);
          toast.error('Error de inicio de sesión');
          this.resetLoadingState()
        }
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-credential') {
          toast.error('Error: correo o contraseña incorrecta.');
        }
      } else {
        toast.error('Ups, algo salió mal...');
        console.log(error)
      }
      this.resetLoadingState()
    }
  }

  async submitGoogleSignIn() {
    this.isLoading.set(true);
    this.buttonClicked = 'google';
    try {
      const signInWithGooglePromise = this.authService.signInWithGoogle();

      toast.promise(signInWithGooglePromise, {
        loading: 'Iniciando sesión con Google...',
        success: '¡Bienvenido de nuevo!'
      });

      await signInWithGooglePromise;
      // await this.authService.signInWithGoogle();
      // toast.success('¡Bienvenido de nuevo!');
      this.router.navigateByUrl('/home');
    } catch (error) {
      this.resetLoadingState();
      if (error instanceof HttpErrorResponse && error.error.message === 'Usuario no registrado en la base de datos') {
        toast.info('Parece que no te has registrado... Por favor, primero completa el registro.');
        //The following block is not redirecting to /auth/sign-up.
        /* //this.router.navigateByUrl('/auth/sign-up');
        this.ngZone.run(() => {
          this.router.navigateByUrl('/auth/sign-up');
        });
        */
      } else if (error instanceof FirebaseError) {
        let errToastMsg;
        if (error.code === 'auth/popup-closed-by-user') {
          errToastMsg = 'el usuario cerró el popup.';
          toast.error(`Error al iniciar sesión con Google: ${errToastMsg}`);
        } else if (error.code === 'auth/user-cancelled') {
          errToastMsg = 'acceso denegado al IdP. Esto suele ocurrir cuando el usuario deniega el permiso.';
          toast.error(`Error al iniciar sesión con Google: ${errToastMsg}`);
        } else if (error.code === 'auth/network-request-failed') {
          toast.error('Hubo un problema con la conexión a la red. Por favor, revisa tu conexión o intenta de nuevo más tarde.');
        } else if (error.code === 'auth/internal-error') {
          toast.error('El servidor de autenticación encontró un error inesperado intentando procesar la solicitud.');
        } else {
          toast.error(`Error al iniciar sesión con Google: ${error.message}`);
        }
      } else {
        toast.error('Ocurrió un error inesperado.');
      }
      this.resetLoadingState();
      console.log(this.isLoading());
    }
  }

  openPasswordRecoveryModal() {
    this.isPassRecoveryModalOpened = true;
  }

  closePasswordRecoveryModal() {
    this.isPassRecoveryModalOpened = false;
  }

  async submitPasswordRecovery() {
    if (this.passRecoveryForm.invalid) {
      toast.info('Formulario inválido. Revisa los campos');
      return;
    } else {
      const email = this.passRecoveryForm.value.email;
      console.log(email);
      if (email) {
        try {
          await this.authStateService.resetPassword(email);
          this.closePasswordRecoveryModal();
          toast.success(`Se envió el correo de recuperación a '${this.passRecoveryForm.value.email}' Revisa tu bandeja de entrada y la carpeta spam.`)
        } catch (error) {
          console.error(error);
          toast.error('Error enviando correo. Verifica el email.');
        }
      } else {
        toast.error(`Error: el email es '${email}'`);
      }
    }
  }

}
