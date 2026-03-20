import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthStateService } from '../../shared/auth-state.service';
import { IUserProfile } from '../../Interfaces/IUserProfile';
import { Firestore, collection, doc, getDoc } from '@angular/fire/firestore';
import { toast } from 'ngx-sonner';
import { IEvent } from '../../Interfaces/IEvent';
import { UserService } from '../users/data-access/user.service';
import { ModalComponent } from '../modal/modal.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-user-account-settings',
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, MatFormFieldModule, ModalComponent, MatProgressSpinner],
  templateUrl: './user-account-settings.component.html',
  styleUrl: './user-account-settings.component.css'
})
export default class UserAccountSettingsComponent {
  private formBuilder = inject(FormBuilder);
  private authStateService = inject(AuthStateService);
  private userService = inject(UserService);
  private firestore = inject(Firestore);

  availableTeachingLevels: string[] = ['Primaria', 'Secundaria'];
  availableSpecializations: string[] = ['Biología', 'Ciencias (tercer ciclo)', 'Física', 'Ingeniería', 'Matemáticas', 'Química', 'Tecnología'];

  uploadedFile: File | null = null;
  selectedFileName: string = '';
  maxFileSizeMB = 1.5;
  profileBlankPicturePath = "../../../assets/blank-profile-picture100x100.png"
  photoURLWithCacheBypass: string = '';


  user: IUserProfile | null = null;
  userEvents: IEvent[] = [];
  selectedTeachingLevel: string | null = null;

  minNameLength = 2;
  maxNameLength = 20;
  minInstitutionLength = 10;
  maxInstitutionLength = 60;
  theTextPattern = /^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\s'-]+$/;
  form = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(this.theTextPattern)]),
    lastName1: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(this.theTextPattern)]),
    lastName2: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minNameLength), Validators.maxLength(this.maxNameLength), Validators.pattern(this.theTextPattern)]),
    birthDate: this.formBuilder.control('', Validators.required),
    institution: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minInstitutionLength), Validators.maxLength(this.maxInstitutionLength), Validators.pattern(this.theTextPattern)]),
    phone: this.formBuilder.control('', [Validators.required, Validators.pattern(/^(\d{4}-\d{4}|\d{8})$/)]),
    teachingLevel: this.formBuilder.control('', Validators.required),
    specializations: this.formBuilder.control<string[]>([]),
  });

  isPassRecoveryModalOpened = false;

  isSubmitting = false;
  isSubmittingReset = false;
  coolDownIsActive = false;

  ngOnInit(): void {
    this.authStateService.currentUser$.subscribe(user => {
      if (!user) return;
      this.user = user as IUserProfile;

      this.form.patchValue({
        ...this.user,
        specializations: this.user.specializations || []
      });
      // Force update
      //this.user.photoURL = `${this.user.photoURL}?t=${Date.now()}`;

      this.selectedTeachingLevel = this.user.teachingLevel;
      if (this.selectedTeachingLevel === 'Secundaria') {
        const specializationsControl = this.form.get('specializations');

        specializationsControl?.setValidators(Validators.required);
        specializationsControl?.updateValueAndValidity();
      }
    });
  }

  get specializationsArray(): FormArray {
    return this.form.get('specializations') as FormArray;
  }

  onTeachingLevelChange(event: MatSelectChange<any>): void {
    this.selectedTeachingLevel = event.value;
    this.form.patchValue({ teachingLevel: this.selectedTeachingLevel });

    const specializationsControl = this.form.get('specializations');

    if (this.selectedTeachingLevel === 'Primaria') {
      this.specializationsArray.setValue([]);
      //Remove validators
      specializationsControl?.clearValidators();
      specializationsControl?.updateValueAndValidity();
    } else if (this.selectedTeachingLevel === 'Secundaria') {
      // Add validators again
      specializationsControl?.setValidators(Validators.required);
      specializationsControl?.updateValueAndValidity();
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

  // Password recovery functions
  openPasswordRecoveryModal() {
    this.isPassRecoveryModalOpened = true;
  }

  closePasswordRecoveryModal() {
    this.isPassRecoveryModalOpened = false;
  }

  async submitPasswordRecovery() {
    const email = this.user?.email;
    if (email) {
      try {
        this.isSubmittingReset = true;

        const resetPasswordPromise = this.authStateService.resetPassword(email);

        toast.promise(resetPasswordPromise, {
          loading: 'Enviando correo de recuperación...',
          success: `Se envió el correo de cambio de contraseña a '${email}'. Revisa tu bandeja de entrada y la carpeta spam.`
        });

        await resetPasswordPromise;
        // await this.authStateService.resetPassword(email);
        // toast.success(`Se envió el correo de cambio de contraseña a '${email}'. Revisa tu bandeja de entrada y la carpeta spam.`);
      } catch (error) {
        console.error(error);
        toast.error('Ocurrió un error enviando correo de cambio de contraseña.');
      } finally {
        this.closePasswordRecoveryModal();
        this.isSubmittingReset = false;
      }
    } else {
      toast.error(`Error: el email es '${email}'`);
    }

  }

  async submitUserAccountForm() {
    if (this.form.invalid || !this.user) {
      toast.warning("Formulario inválido. Por favor revisa y completa todos los campos requeridos.");
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.coolDownIsActive = true;

    const userUID = this.user.uid;
    const data = this.form.value as any;

    const formData = new FormData();

    if (this.uploadedFile) {
      formData.append('photo', this.uploadedFile);
    } else if (this.user.photoURL) {
      formData.append('photo', this.user.photoURL);
    }

    formData.append('name', data.name);
    formData.append('lastName1', data.lastName1);
    formData.append('lastName2', data.lastName2);
    formData.append('phone', data.phone);
    formData.append('birthDate', data.birthDate);
    formData.append('institution', data.institution);
    formData.append('teachingLevel', data.teachingLevel);
    formData.append('specializations', JSON.stringify(this.specializationsArray.value));

    try {
      const updateProfilePromise = this.userService.updateUserProfile(userUID, formData);

      toast.promise(updateProfilePromise, {
        loading: 'Actualizando datos del perfil...',
        success: '¡Datos actualizados!'
      });

      await updateProfilePromise;
      // await this.userService.updateUserProfile(userUID, formData);

      // Force update
      this.uploadedFile = null;
      this.user.photoURL = `${this.user.photoURL}?t=${Date.now()}`;
      this.photoURLWithCacheBypass = this.user.photoURL;
      // toast.success('¡Datos actualizados!');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error('Error actualizando los datos de tu perfil.');
    } finally {
      // Cool down
      this.isSubmitting = false;
      setTimeout(() => {
        this.coolDownIsActive = false;
      }, 5000);
    }
  }
}
