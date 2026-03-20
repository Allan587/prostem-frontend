import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { toast } from 'ngx-sonner';
import { ContactUsService } from './data-access/contact-us.service';
import { AuthStateService } from '../../shared/auth-state.service';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinner],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export default class ContactUsComponent {
  private formBuilder = inject(FormBuilder);
  private contactUsService = inject(ContactUsService);
  private authStateService = inject(AuthStateService);

  minSubjectLength = 10;
  maxSubjectLength = 50;
  theTextPattern = /^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ0-9\s'"¡!¿?:;,.()-]+$/;
  minCommentLength = 20;
  maxCommentLength = 400;

  form = this.formBuilder.group({
    subject: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minSubjectLength), Validators.maxLength(this.maxSubjectLength), Validators.pattern(this.theTextPattern)]),
    phone: this.formBuilder.control('', [Validators.pattern(/^(\d{4}-\d{4}|\d{8})$/)]),
    comment: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minCommentLength), Validators.maxLength(this.maxCommentLength), Validators.pattern(this.theTextPattern)]),
  });

  coolDownIsActive = false;
  coolDownTime = 10000;  // In seconds
  isSubmitting = false;

  user: any = null;

  ngOnInit() {
    this.authStateService.currentUser$.subscribe(user => {
      this.user = user;
    });
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


  async submitComment() {
    if (this.form.invalid) {
      toast.warning('Formulario inválido. Revisa los campos.');
      return
    };

    if (this.isSubmitting) {
      toast.info('Se está enviando tu comentario, por favor espera...');
      return
    };

    this.isSubmitting = true;
    const { subject, phone, comment } = this.form.value;

    if (!subject || !comment || (phone === undefined || phone === null)) {
      return;
    }

    try {
      const recipient = this.user.email;
      const contactUsMessagePromise = this.contactUsService.sendContactMessage({ recipient, subject, phone, comment });

      toast.promise(contactUsMessagePromise, {
        loading: 'Enviando comentario...',
        success: '¡Gracias por enviarnos tus comentarios! Pronto nos pondremos en contacto contigo.'
      });

      await contactUsMessagePromise;
    } catch (error) {
      console.error('No se pudo enviar el mensaje.', error);
      toast.error('No se pudo enviar comentario. Intenta de nuevo más tarde.');
    } finally {
      this.isSubmitting = false;
      this.coolDownIsActive = true;
      this.form.reset();

      setTimeout(() => this.coolDownIsActive = false, this.coolDownTime);
    }




  }

}
