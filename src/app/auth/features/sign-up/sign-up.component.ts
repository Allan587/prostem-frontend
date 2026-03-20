import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { IFormSignUp } from '../../../Interfaces/IFormSignUp';
import { isInvalidEmail, isInvalidPassword } from '../../utils/validators';
import { AuthService } from '../../data-access/auth.service';
import { toast } from 'ngx-sonner';
import { FirebaseError } from '@angular/fire/app';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoogleButtonComponent } from '../../google-button/google-button.component';
import { DateTime } from 'luxon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, GoogleButtonComponent, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, RouterLink, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})

export default class SignUpComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  logoPath = '../../../../assets/ProSTEM-logo-with-label.jpg';
  availableTeachingLevels: string[] = ['Primaria', 'Secundaria'];
  availableSpecializations: string[] = ['Biología', 'Ciencias (tercer ciclo)', 'Física', 'Ingeniería', 'Matemáticas', 'Química', 'Tecnología'];
  selectedMethod: string | null = null;
  selectedTeachingLevel: string | null = null;

  uploadedFile: File | null = null;
  selectedFileName: string = '';
  maxFileSizeMB = 1.5;

  //Asuming no one under the age of 18 will register to the system.
  minimumBirthDate = DateTime.now().minus({ years: 18 });
  isRegistering = false;

  showPassword = false;

  /**
   * This method is to validate that the 'email' field has a valid format. 
   * For example email@test.com
   * Before this method, text strings in the form 'example@test' were being allowed.
   * 
   * @param text the text got from the email input.
   * @returns a boolean value indicating whether the text satisfies the pattern.
   */
  endsInDotSomething(text: string | null | undefined): boolean {
    if (text != null && text != undefined) {
      const regex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(text);
    }
    return false;
  }

  maxEmailLength = 50;
  minNameLength = 2;
  maxNameLength = 20;
  minInstitutionLength = 10;
  maxInstitutionLength = 60;
  theTextPattern = /^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\s'-]+$/;
  form = this.formBuilder.group<IFormSignUp>({
    email: this.formBuilder.control('', [Validators.required, Validators.email, Validators.maxLength(this.maxEmailLength)]),
    password: this.formBuilder.control('', [Validators.required, Validators.minLength(6)]),
    name: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(this.theTextPattern)]),
    lastName1: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(this.theTextPattern)]),
    lastName2: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(this.theTextPattern)]),
    phone: this.formBuilder.control('', [Validators.required, Validators.pattern(/^(\d{4}-\d{4}|\d{8})$/)]),
    birthDate: this.formBuilder.control('', Validators.required),
    institution: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minInstitutionLength), Validators.maxLength(this.maxInstitutionLength), Validators.pattern(this.theTextPattern)]),
    teachingLevel: this.formBuilder.control('', Validators.required),
    specializations: this.formBuilder.array<FormControl<string | null>>([]),
    orcidDoi: this.formBuilder.control(''),
  });


  fieldIsEmpty(fieldName: string): boolean {
    return !!(this.form.get(fieldName)?.touched && this.form.get(fieldName)?.hasError('required'));
  }

  fieldIsTooShort(fieldName: string,): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && control?.hasError('minlength'));
  }

  fieldIsTooLong(fieldName: string,): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && control?.hasError('maxlength'));
  }

  fieldHasPatternError(fieldName: string): boolean {
    return !!(this.form.get(fieldName)?.touched && this.form.get(fieldName)?.hasError('pattern'));
  }

  invalidEmail() {
    if (this.form.value.email == null ||
      this.form.value.email == undefined ||
      this.form.value.email == '') {
      return isInvalidEmail(this.form);
    }

    if (!this.endsInDotSomething(this.form.value.email)) return true;

    return isInvalidEmail(this.form);
  }

  invalidPassword() {
    const password = this.form.get('password')?.value;

    if (!password || password.length === 0) {
      return isInvalidPassword(this.form);
    }

    const tooShort = password.length < 6;
    const hasNumber = /\d/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    return tooShort || !hasNumber || !hasLower || !hasUpper;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get specializationsArray(): FormArray {
    return this.form.get('specializations') as FormArray;
  }

  get teachingLevelArray() {
    return this.form.get('teachingLevel');
  }

  onRegisterMethodChange(event: MatSelectChange<any>) {
    this.selectedMethod = event.value;

    const emailControl = this.form.get('email');
    const passwordControl = this.form.get('password');
    const nameControl = this.form.get('name');
    const lastName1Control = this.form.get('lastName1');
    const lastName2Control = this.form.get('lastName2');
    if (this.selectedMethod === 'google') {
      //Remove validators
      emailControl?.clearValidators();
      emailControl?.updateValueAndValidity();

      passwordControl?.clearValidators();
      passwordControl?.updateValueAndValidity();

      nameControl?.clearValidators();
      nameControl?.updateValueAndValidity();

      lastName1Control?.clearValidators();
      lastName1Control?.updateValueAndValidity();

      lastName2Control?.clearValidators();
      lastName2Control?.updateValueAndValidity();
    } else {
      // Add validators again
      emailControl?.setValidators([Validators.required, Validators.email]);
      emailControl?.updateValueAndValidity();

      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      passwordControl?.updateValueAndValidity();

      nameControl?.setValidators([Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s'-]+$/)]);
      nameControl?.updateValueAndValidity();

      lastName1Control?.setValidators([Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s'-]+$/)]);
      lastName1Control?.updateValueAndValidity();

      lastName2Control?.setValidators([Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s'-]+$/)]);
      lastName2Control?.updateValueAndValidity();
    }
  }

  async processImage(file: File, maxWidth = 100, maxHeight = 100, quality = 0.65): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        const context = canvas.getContext('2d');
        if (!context) return reject('No se pudo obtener el contexto del canvas');

        context.drawImage(img, 0, 0, maxWidth, maxHeight);
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject('Error al generar la imagen');
          }
        }, 'image/webp', quality);
      };

      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const uploadedPhoto = input.files[0];
    this.selectedFileName = input.files[0].name;

    if (uploadedPhoto.size > this.maxFileSizeMB * 1024 * 1024) {
      toast.warning(`El archivo supera el límite de ${this.maxFileSizeMB} MB. Por favor selecciona una imagen más liviana.`);
      this.selectedFileName = '';
      console.log(this.uploadedFile);
      return;
    }

    this.processImage(uploadedPhoto).then(blob => {
      this.uploadedFile = new File([blob], uploadedPhoto.name, { type: 'image/webp' });
      toast.success("¡Imagen cargada!")
    }).catch(err => {
      console.log('Error', err);
      toast.error("Error al procesar la imagen subida");
      this.selectedFileName = '';
    });

    const reader = new FileReader();
    reader.readAsDataURL(uploadedPhoto);

    if (input.files?.length) {
      this.uploadedFile = input.files[0];
    }
  }

  onTeachingLevelChange(event: MatSelectChange<any>): void {
    this.selectedTeachingLevel = event.value;
    this.form.patchValue({ teachingLevel: this.selectedTeachingLevel });

    const specializationsControl = this.form.get('specializations');

    if (this.selectedTeachingLevel === 'Primaria') {
      this.specializationsArray.clear();
      //Remove validators
      specializationsControl?.clearValidators();
      specializationsControl?.updateValueAndValidity();
    } else if (this.selectedTeachingLevel === 'Secundaria') {
      // Add validators again
      specializationsControl?.setValidators(Validators.required);
      specializationsControl?.updateValueAndValidity();
    }
  }

  onSpecializationChange(event: MatSelectChange<any>): void {
    const selectedInterests = event.value;
    // Limpiamos el FormArray antes de actualizarlo
    this.specializationsArray.clear();

    selectedInterests.forEach((interest: string) => {
      this.specializationsArray.push(this.formBuilder.control(interest));
    });
  }

  async registerWithEmailAndPasword(formValue: any) {
    const formData = new FormData();

    console.log(formValue)
    formData.append('email', formValue.email);
    formData.append('password', formValue.password);
    formData.append('name', formValue.name);
    formData.append('lastName1', formValue.lastName1);
    formData.append('lastName2', formValue.lastName2);
    formData.append('phone', formValue.phone);
    formData.append('birthDate', formValue.birthDate);
    formData.append('institution', formValue.institution);
    formData.append('teachingLevel', formValue.teachingLevel);
    formData.append('specializations', JSON.stringify(formValue.specializations));

    if (this.uploadedFile) {
      formData.append('photo', this.uploadedFile);
    }

    //Use the service to create the user with Authenticator and also save it to the database.
    (await this.authService.signUpWithEmailAndPassword(formData)).subscribe({
      next: (_) => {
        //console.log("Usuario registrado", response)
        toast.success('Cuenta creada existosamente');
        this.router.navigateByUrl('/auth/sign-in');
      },
      error: (err) => {
        console.error("Error creando la cuenta:", err)
        if (err instanceof HttpErrorResponse) {
          if (err.error.error.includes('Missing password requirements')) {
            toast.warning('La contraseña no cumple con los requisitos. Por favor revisa la contraseña.')
          }
          else if (err.error.error.includes('The email address is already in use by another account.')) {
            toast.warning('El correo ingresado ya está en uso por otra cuenta. Por favor otro correo para registrarte.')
          } else {
            toast.error('Ocurrió un error inesperado al realizar el registro.')
          }
        } else {
          toast.error('Ocurrió un error inesperado al realizar el registro.')
        }
        this.isRegistering = false;
      }
    })
  }

  async registerWithGoogle(formValue: any) {
    try {
      (await this.authService.signUpWithGoogle(formValue)).subscribe({
        next: (_) => {
          toast.success('Cuenta creada existosamente');
          this.router.navigateByUrl('/auth/sign-in');
        },
        error: (err) => console.error('Error de registro con Google', err)
      });
    } catch (error) {
      console.log('en el catch', error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user') {
          toast.info('Error en el registro con Google: el usuario cerro el Popup');
        }
        if (error.code === 'auth/internal-error') {
          toast.warning('El servidor de autenticación encontró un error inesperado procesando la solicitud');
        }
      } else {
        toast.error(`Error en el registro con Google: ${error}`);
      }
      this.isRegistering = false;
    }
  }

  async submitSignUp() {
    if (this.form.invalid) {
      toast.warning('Datos inválidos o incompletos. Por favor, revisa los datos.');
      return;
    };
    this.isRegistering = true;

    const formValue = this.form.value;
    try {
      if (this.selectedMethod === 'google') {
        this.registerWithGoogle(formValue);
      } else {
        if (!formValue.email || !formValue.password || !formValue.name || !formValue.lastName1 || !formValue.lastName2 || !formValue.phone || !formValue.birthDate || !formValue.institution || !formValue.specializations) {
          toast.error('Todos los campos son requeridos');
          this.isRegistering = false;
          return;
        };
        this.registerWithEmailAndPasword(formValue);
      }
    } catch (error) {
      console.log('Ocurrió un error al registrarse:', error);
      toast.error('Ocurrió un error al registrarse.');
    }
    return;
  }

}
