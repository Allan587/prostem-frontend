import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConferenceService } from '../data-access/conference.service';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ModalComponent } from '../../../modal/modal.component';
import { toast } from 'ngx-sonner';



@Component({
  selector: 'app-new-conference',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, MatProgressSpinnerModule],
  templateUrl: './new-conference.component.html',
  styleUrls: ['./new-conference.component.css']
})
export class NewConferenceComponent implements OnInit{

  userId: string | null = null

  form: FormGroup;

  isEditMode = false

  conferenceId: string | null = null

  isCreatingModalOpened: boolean = false;
  isSubmittingConference: boolean = false;

  constructor(private formBuilder: FormBuilder, private conferenceService: ConferenceService, private authService: AuthService, private snackBar: MatSnackBar, private router: Router) {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      startDate: ['', Validators.required],
      finishDate: ['', Validators.required],
      startTime: ['', Validators.required],
      finishTime: ['', Validators.required],
      place: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      placeLink: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser()) {
      this.userId = currentUser()?.uid || null;
      console.log('Logged-in user ID:', this.userId); // Debugging log
    }
  
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { conference: any };
  
    if (state?.conference) {
      console.log('Editing conference:', state.conference); // Debugging log
      this.isEditMode = true;
      this.conferenceId = state.conference.id;
      this.form.patchValue(state.conference); // Pre-fill the form with the conference data
    } else {
      console.log('No conference data passed to the form.'); // Debugging log
    }
  }

  async submitForm() {
    if (this.form.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.openCreatingModal();

    const conferenceData = {
      ...this.form.value,
      userId: this.userId
    };

    try {
      if (this.isEditMode && this.conferenceId) {
        // Edit mode
        await this.conferenceService.updateConference(this.conferenceId, conferenceData);
        toast.success('Conferencia actualizada exitosamente', {
          duration: 5000,
          position: 'top-center'
        });
      } else {
        // Create mode
        await this.conferenceService.createConference(this.userId, conferenceData);
        toast.success('Conferencia creada exitosamente', {
          duration: 5000,
          position: 'top-center'
        });
      }

      this.router.navigate(['/eventos-academicos/conferencias']);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = this.isEditMode ? 'Error al actualizar la conferencia' : 'Error al crear la conferencia';
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeCreatingModal();
    }
  }

  // Add these new methods
  openCreatingModal(): void {
    this.isCreatingModalOpened = true;
    this.isSubmittingConference = true;
  }

  closeCreatingModal(): void {
    this.isCreatingModalOpened = false;
    this.isSubmittingConference = false;
  }
}