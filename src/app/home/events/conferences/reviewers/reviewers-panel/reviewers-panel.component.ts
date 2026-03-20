import { Component, OnInit } from '@angular/core';
import { ConferenceService } from '../../data-access/conference.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Add this
import { Router } from '@angular/router';
import { ModalComponent } from '../../../../modal/modal.component'; // Add this
import { toast } from 'ngx-sonner'; // Add this

@Component({
  selector: 'app-reviewers-panel',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTooltipModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule, 
    MatDialogModule,
    MatProgressSpinnerModule, // Add this
    ModalComponent // Add this
  ],
  templateUrl: './reviewers-panel.component.html',
  styleUrl: './reviewers-panel.component.css'
})
export class ReviewersPanelComponent implements OnInit {

  dataSource: any[] = [];
  displayedColumns: string[] = ['name', 'email', 'institution', 'areas', 'options'];
  
  // Processing state
  private isProcessing = new Set<string>();
  
  // Modal properties - ADD THESE
  isConfirmationModalOpened: boolean = false;
  selectedUser: any = null;
  isSubmitting: boolean = false;

  constructor(
    private conferenceService: ConferenceService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      this.dataSource = await this.conferenceService.getNonReviewers(); // FIXED: Changed from getUsersWithoutReviewerStatus to getNonReviewers
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios'); // Changed from snackBar to toast
    }
  }

  // ADD THESE NEW MODAL METHODS
  openConfirmationModal(user: any): void {
    this.selectedUser = user;
    this.isConfirmationModalOpened = true;
  }

  closeConfirmationModal(): void {
    this.isConfirmationModalOpened = false;
    this.selectedUser = null;
  }

  async confirmMakeReviewer(): Promise<void> {
    if (!this.selectedUser) {
      return;
    }

    this.isSubmitting = true;

    try {
      // Start processing
      this.isProcessing.add(this.selectedUser.id);

      await this.conferenceService.makeUserReviewer(this.selectedUser.id);
      
      // Remove user from list since they're now a reviewer
      this.dataSource = this.dataSource.filter(user => user.id !== this.selectedUser.id);
      
      // Show success toast
      toast.success(`${this.selectedUser.name} ahora es revisor`, {
        duration: 5000,
        position: 'top-center'
      });

      console.log(`User ${this.selectedUser.name} made reviewer successfully`);

    } catch (error) {
      console.error('Error making user reviewer:', error);
      toast.error('Error al convertir usuario a revisor');
    } finally {
      // Stop processing
      this.isProcessing.delete(this.selectedUser.id);
      this.closeConfirmationModal();
      this.isSubmitting = false;
    }
  }

  // KEEP THE EXISTING makeReviewer METHOD BUT CHANGE IT TO OPEN MODAL
  async makeReviewer(user: any): Promise<void> {
    this.openConfirmationModal(user);
  }

  isUserBeingProcessed(userId: string): boolean {
    return this.isProcessing.has(userId);
  }

  createNewReviewer(): void {
    this.router.navigate(['/eventos-academicos/conferencias/revisores/nuevo-revisor']);
  }
}