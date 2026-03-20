import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConferenceService } from '../../data-access/conference.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Add this
import { ModalComponent } from '../../../../modal/modal.component';
import { toast } from 'ngx-sonner';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-new-reviewer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule, // Add this import
    ModalComponent
  ],
  templateUrl: './new-reviewer.component.html',
  styleUrls: ['./new-reviewer.component.css']
})
export class NewReviewerComponent implements OnInit {
  form: FormGroup;
  availableTeachingLevels: string[] = ['Primaria', 'Secundaria'];
  availableSpecializations: string[] = ['Biología', 'Ciencias (tercer ciclo)', 'Física', 'Ingeniería', 'Matemáticas', 'Química', 'Tecnología'];
  selectedTeachingLevel: string = '';
  selectedSpecializations: string[] = [];
  areas: string[] = [];
  isAddingArea: boolean = false;
  newAreaControl = new FormControl('', Validators.required);
  isSubmitting: boolean = false;

  // Modal properties
  isConfirmationModalOpened: boolean = false;
  pendingReviewerData: any = null;

  // Validation constants
  minNameLength = 2;
  maxNameLength = 20;
  minInstitutionLength = 10;
  maxInstitutionLength = 60;
  maxEmailLength = 50;
  textPattern = /^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\s'-]+$/;
  
  // Minimum birth date (18 years old)
  minimumBirthDate = DateTime.now().minus({ years: 18 });

  constructor(
    private formBuilder: FormBuilder,
    private conferenceService: ConferenceService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadAreas();
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      // Personal Information
      name: ['', [
        Validators.required,
        Validators.minLength(this.minNameLength),
        Validators.maxLength(this.maxNameLength),
        Validators.pattern(this.textPattern)
      ]],
      lastName1: ['', [
        Validators.required,
        Validators.minLength(this.minNameLength),
        Validators.maxLength(this.maxNameLength),
        Validators.pattern(this.textPattern)
      ]],
      lastName2: ['', [
        Validators.required,
        Validators.minLength(this.minNameLength),
        Validators.maxLength(this.maxNameLength),
        Validators.pattern(this.textPattern)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(this.maxEmailLength)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^(\d{4}-\d{4}|\d{8})$/)
      ]],
      birthDate: ['', [
        Validators.required
      ]],
      institution: ['', [
        Validators.required,
        Validators.minLength(this.minInstitutionLength),
        Validators.maxLength(this.maxInstitutionLength)
      ]],
      
      // Teaching Information
      teachingLevel: ['', Validators.required],
      specializations: [[], []], // Use simple array instead of FormArray
      
      // Optional
      orcidDoi: ['']
    });
  }

  async loadAreas(): Promise<void> {
    try {
      this.areas = await this.conferenceService.getAreas();
    } catch (error) {
      console.error('Error loading areas:', error);
      toast.error('Error al cargar las áreas');
    }
  }

  onTeachingLevelChange(selectedLevel: string): void {
    this.selectedTeachingLevel = selectedLevel;
    this.form.patchValue({ teachingLevel: selectedLevel });

    if (selectedLevel === 'Primaria') {
      // Clear specializations for Primary level
      this.selectedSpecializations = [];
      this.form.patchValue({ specializations: [] });
      this.form.get('specializations')?.clearValidators();
      this.form.get('specializations')?.updateValueAndValidity();
    } else if (selectedLevel === 'Secundaria') {
      // Set validators for Secondary level
      this.form.get('specializations')?.setValidators(Validators.required);
      this.form.get('specializations')?.updateValueAndValidity();
    }
  }

  onSpecializationChange(selectedSpecializations: string[]): void {
    this.selectedSpecializations = selectedSpecializations;
    this.form.patchValue({ specializations: selectedSpecializations });
  }

  toggleAddArea(): void {
    this.isAddingArea = !this.isAddingArea;
    if (!this.isAddingArea) {
      this.newAreaControl.reset();
    }
  }

  async addNewArea(): Promise<void> {
    if (this.newAreaControl.invalid) {
      return;
    }

    try {
      const newAreaValue = this.newAreaControl.value?.trim();
      if (!newAreaValue) {
        return;
      }

      const response = await this.conferenceService.createArea(newAreaValue);
      
      if (response.success) {
        toast.success('Área agregada exitosamente');
        this.areas.push(response.originalWord);
        this.isAddingArea = false;
        this.newAreaControl.reset();
      }
    } catch (error: any) {
      if (error.error?.message === 'Area already exists') {
        toast.warning('El área ya existe. Selecciónala de las opciones disponibles.');
      } else {
        toast.error('Error al agregar área');
      }
    }
  }

  // Modal methods
  openConfirmationModal(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      toast.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const formValue = this.form.value;
    
    // Prepare data for confirmation
    this.pendingReviewerData = {
      email: formValue.email,
      name: formValue.name,
      lastName1: formValue.lastName1,
      lastName2: formValue.lastName2,
      phone: formValue.phone,
      birthDate: formValue.birthDate,
      institution: formValue.institution,
      teachingLevel: formValue.teachingLevel,
      specializations: formValue.specializations || [],
      orcidDoi: formValue.orcidDoi || ''
    };

    this.isConfirmationModalOpened = true;
  }

  closeConfirmationModal(): void {
    this.isConfirmationModalOpened = false;
    this.pendingReviewerData = null;
  }

  async submitForm(): Promise<void> {
    if (!this.pendingReviewerData) {
      return;
    }

    this.isSubmitting = true;

    try {
      const response = await this.conferenceService.createReviewerUser(this.pendingReviewerData);

      // Show success toast with temporary password
      toast.success(
        `Revisor creado exitosamente. Contraseña temporal: ${response.tempPassword}`,
        {
          duration: 8000,
          position: 'top-center'
        }
      );

      // Reset form
      this.form.reset();
      this.selectedTeachingLevel = '';
      this.selectedSpecializations = [];
      
      // Close modal
      this.closeConfirmationModal();

      // Redirect back to reviewers panel after a short delay
      setTimeout(() => {
        this.router.navigate(['/eventos-academicos/conferencias/revisores']);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating reviewer:', error);
      
      if (error.error?.error === 'Ya existe un usuario con este correo electrónico') {
        toast.error('Ya existe un usuario con este correo electrónico');
      } else {
        toast.error('Error al crear el revisor');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  // Validation helper methods
  fieldIsEmpty(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && control?.hasError('required'));
  }

  fieldIsTooShort(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && control?.hasError('minlength'));
  }

  fieldIsTooLong(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && control?.hasError('maxlength'));
  }

  fieldHasPatternError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && control?.hasError('pattern'));
  }

  invalidEmail(): boolean {
    const control = this.form.get('email');
    return !!(control?.touched && (control?.hasError('email') || control?.hasError('required')));
  }

  specializationsRequired(): boolean {
    const control = this.form.get('specializations');
    return this.selectedTeachingLevel === 'Secundaria' && 
           !!(control?.touched || control?.dirty) && 
           (!this.selectedSpecializations || this.selectedSpecializations.length === 0);
  }
}