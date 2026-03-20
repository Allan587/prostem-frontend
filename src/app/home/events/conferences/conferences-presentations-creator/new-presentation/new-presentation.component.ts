import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConferenceService } from '../../data-access/conference.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../../auth/data-access/auth.service';
import { Router } from '@angular/router';

import { ModalComponent } from '../../../../modal/modal.component';
import { toast } from 'ngx-sonner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@Component({
  selector: 'app-new-presentation',
  templateUrl: './new-presentation.component.html',
  styleUrls: ['./new-presentation.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    FormsModule, 
    ModalComponent,
    MatProgressSpinnerModule]
})

export class NewPresentationComponent implements OnInit {
  presentationForm: FormGroup;
  newAreaControl = new FormControl('', [Validators.required]);
  areas: string[] = [];
  isAddingArea = false;
  conferenceId: string | null = null;
  userId: string | null = null;
  selectedGeneralDocument: File | null = null;

  isCreatingModalOpened: boolean = false;
  isSubmittingPresentation: boolean = false;

  currentUserAuthor: { name: string; email: string; institution: string } = {
    name: '',
    email: '',
    institution: ''
  };
  // Authors array - each author has name, email, institution
  additionalAuthors: Array<{ name: string; email: string; institution: string }> = [];

  private conferenceService = inject(ConferenceService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.presentationForm = this.fb.group({
      title: ['', [Validators.required]],
      summary: ['', [Validators.required]],
      area: ['', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    // Get conferenceId from route parameters
    this.conferenceId = this.route.snapshot.paramMap.get('conferenceId');
    if (!this.conferenceId) {
      this.snackBar.open('No se proporcionó el conferenceId en la ruta.', 'Close', {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
      this.router.navigate(['/eventos-academicos/conferencias']);
      return;
    }

    // Get userId from AuthService
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userId = currentUser()?.uid || null;
      await this.loadCurrentUserAsAuthor();
    } else {
      this.snackBar.open('No hay un usuario autenticado.', 'Close', {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
      this.router.navigate(['/']);
      return;
    }

    // Load areas
    try {
      this.areas = await this.conferenceService.getAreas();
    } catch (error) {
      console.error('Error loading areas:', error);
      this.snackBar.open('Error al cargar las áreas.', 'Close', {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
    }
  }

  async loadCurrentUserAsAuthor(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser()) {
        const userData = currentUser();
        
        if (userData && userData.uid) {
          // Fetch complete user data from Firestore via the backend
          const fullUserData = await this.conferenceService.getUserData(userData.uid);
          
          // Set current user data (for display only)
          this.currentUserAuthor = {
            name: `${fullUserData.name || ''} ${fullUserData.lastName1 || ''} ${fullUserData.lastName2 || ''}`.trim(),
            email: fullUserData.email || '',
            institution: fullUserData.institution || ''
          };
          
          console.log('Current user author loaded:', this.currentUserAuthor);
        }
      }
    } catch (error) {
      console.error('Error loading current user data:', error);
      this.snackBar.open('Error al cargar los datos del usuario.', 'Close', {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
    }
  }

  addAdditionalAuthor(): void {
    this.additionalAuthors.push({
      name: '',
      email: '',
      institution: ''
    });
  }

  removeAdditionalAuthor(index: number): void {
    this.additionalAuthors.splice(index, 1);
  }

  toggleAddArea(): void {
    this.isAddingArea = !this.isAddingArea;
    if (!this.isAddingArea) {
      this.newAreaControl.reset();
    }
  }

  async addNewArea(): Promise<void> {
    if (this.newAreaControl.valid && this.newAreaControl.value) {
      try {
        await this.conferenceService.createArea(this.newAreaControl.value);
        this.areas.push(this.newAreaControl.value);
        this.presentationForm.patchValue({ area: this.newAreaControl.value });
        this.newAreaControl.reset();
        this.isAddingArea = false;
        this.snackBar.open('Área agregada exitosamente.', 'Close', {
          duration: 3000,
          panelClass: 'snackbar-success'
        });
      } catch (error) {
        console.error('Error creating area:', error);
        this.snackBar.open('Error al crear el área.', 'Close', {
          duration: 3000,
          panelClass: 'snackbar-error'
        });
      }
    }
  }

  onFileSelected(event: any, fileType: string): void {
    const file = event.target.files[0];
    if (file) {
      if (fileType === 'generalDocument') {
        this.selectedGeneralDocument = file;
      }
    }
  }

  validateAdditionalAuthors(): boolean {
    // Only validate additional authors that have at least one field filled
    for (let i = 0; i < this.additionalAuthors.length; i++) {
      const author = this.additionalAuthors[i];
      
      // If any field is filled, all fields must be filled
      const hasAnyData = author.name.trim() || author.email.trim() || author.institution.trim();
      
      if (hasAnyData) {
        if (!author.name.trim() || !author.email.trim() || !author.institution.trim()) {
          this.snackBar.open(`Por favor complete todos los campos del autor ${i + 2} o déjelos vacíos para eliminarlo.`, 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error'
          });
          return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(author.email)) {
          this.snackBar.open(`Por favor ingrese un email válido para el autor ${i + 2}.`, 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error'
          });
          return false;
        }
      }
    }
    return true;
  }

  async createPresentation(): Promise<void> {
    if (this.presentationForm.invalid) {
      toast.error('Por favor complete todos los campos requeridos.', {
        duration: 5000,
        position: 'top-center'
      });
      return;
    }
  
    if (!this.validateAdditionalAuthors()) {
      return;
    }
  
    if (!this.selectedGeneralDocument) {
      toast.error('Por favor seleccione un documento general.', {
        duration: 5000,
        position: 'top-center'
      });
      return;
    }
  
    if (!this.userId || !this.conferenceId) {
      toast.error('Faltan datos del usuario o conferencia.', {
        duration: 5000,
        position: 'top-center'
      });
      return;
    }
  
    // Open the modal
    this.openCreatingModal();
  
    try {
      const formData = new FormData();
      formData.append('userId', this.userId);
      formData.append('conferenceId', this.conferenceId);
      formData.append('title', this.presentationForm.value.title);
      formData.append('summary', this.presentationForm.value.summary);
      formData.append('area', this.presentationForm.value.area);
      
      // Combine current user + additional authors (filter out empty additional authors)
      const validAdditionalAuthors = this.additionalAuthors.filter(author => 
        author.name.trim() && author.email.trim() && author.institution.trim()
      );
      
      const allAuthors = [this.currentUserAuthor, ...validAdditionalAuthors];
      formData.append('authors', JSON.stringify(allAuthors));
  
      if (this.selectedGeneralDocument) {
        formData.append('generalDocument', this.selectedGeneralDocument);
      }
  
      const response = await this.conferenceService.createPresentationWithDocuments(formData);
      
      toast.success('Ponencia creada exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
  
      this.router.navigate(['/eventos-academicos/conferencias/mis-conferencias']);
    } catch (error) {
      console.error('Error creating presentation:', error);
      toast.error('Error al crear la ponencia', {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeCreatingModal();
    }
  }

  openCreatingModal(): void {
    this.isCreatingModalOpened = true;
    this.isSubmittingPresentation = true;
  }

  closeCreatingModal(): void {
    this.isCreatingModalOpened = false;
    this.isSubmittingPresentation = false;
  }
}