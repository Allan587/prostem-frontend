import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConferenceService } from '../../data-access/conference.service';
import { ModalComponent } from '../../../../modal/modal.component';
import { toast } from 'ngx-sonner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-edit-conference',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, 
    MatProgressSpinnerModule], 
  templateUrl: './edit-conference.component.html',
  styleUrls: ['./edit-conference.component.css']
})
export class EditConferenceComponent implements OnInit {
  form: FormGroup;
  conferenceId: string | null = null;

  isUpdatingModalOpened: boolean = false;
  isSubmittingConference: boolean = false;

  constructor(
    private fb: FormBuilder,
    private conferenceService: ConferenceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
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
    this.conferenceId = this.route.snapshot.paramMap.get('id');
    if (this.conferenceId) {
      this.loadConference(this.conferenceId);
    }
  }

  async loadConference(conferenceId: string): Promise<void> {
    try {
      const conference = await this.conferenceService.getConferenceById(conferenceId);
      this.form.patchValue(conference);
    } catch (error) {
      console.error('Error loading conference:', error);
      this.snackBar.open('Error al cargar la conferencia', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  async submitForm(): Promise<void> {
    if (this.form.invalid) {
      console.error('Form is invalid');
      return;
    }

    // Open the modal
    this.openUpdatingModal();

    try {
      await this.conferenceService.updateConference(this.conferenceId!, this.form.value);
      
      toast.success('Conferencia actualizada exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
      
      this.router.navigate(['eventos-academicos/conferencias/administrador']);
    } catch (error) {
      console.error('Error updating conference:', error);
      
      toast.error('Error al actualizar la conferencia', {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeUpdatingModal();
    }
  }

  openUpdatingModal(): void {
    this.isUpdatingModalOpened = true;
    this.isSubmittingConference = true;
  }

  closeUpdatingModal(): void {
    this.isUpdatingModalOpened = false;
    this.isSubmittingConference = false;
  }
}