import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConferenceService } from '../../data-access/conference.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-corrected-document-review-modal',
  template: `
    <div class="modal-header">
      <h2 mat-dialog-title>Revisión de Documento Corregido</h2>
      <button mat-icon-button class="close-button" (click)="onClose()" [disabled]="isLoading" matTooltip="Cerrar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <p>¿Qué calificación final le da a esta ponencia?</p>
      <p><strong>{{ data.title }}</strong></p>
      <!-- Loading spinner -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="30" color="primary"></mat-progress-spinner>
        <p>Procesando...</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" (click)="onReject()" [disabled]="isLoading">
        <mat-icon>cancel</mat-icon>
        No aceptada
      </button>
      <button mat-button color="primary" (click)="onAccept()" [disabled]="isLoading">
        <mat-icon>check_circle</mat-icon>
        Aceptada
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .close-button {
      margin-left: auto;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .loading-container p {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule]
})
export class CorrectedDocumentReviewModalComponent {
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<CorrectedDocumentReviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  onAccept(): void {
    this.isLoading = true;
    this.dialogRef.close('accept');
  }

  onReject(): void {
    this.isLoading = true;
    this.dialogRef.close('reject');
  }

  // Close method for X button
  onClose(): void {
    this.dialogRef.close();
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }
}

// PAYMENT REVIEW MODAL COMPONENT
@Component({
  selector: 'app-payment-review-modal',
  template: `
    <div class="modal-header">
      <h2 mat-dialog-title>Revisión de Comprobante de Pago</h2>
      <button mat-icon-button class="close-button" (click)="onClose()" [disabled]="isLoading" matTooltip="Cerrar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <p>Elija el resultado de la revisión del comprobante de pago de la ponencia: <strong>{{ data.title }}</strong></p>
      <!-- Loading spinner -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="30" color="primary"></mat-progress-spinner>
        <p>Procesando...</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" (click)="onReject()" [disabled]="isLoading">
        <mat-icon>cancel</mat-icon>
        Rechazar
      </button>
      <button mat-button color="primary" (click)="onAccept()" [disabled]="isLoading">
        <mat-icon>check_circle</mat-icon>
        Aceptar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .close-button {
      margin-left: auto;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .loading-container p {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule]
})
export class PaymentReviewModalComponent {
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<PaymentReviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  onAccept(): void {
    this.isLoading = true;
    this.dialogRef.close('accept');
  }

  onReject(): void {
    this.isLoading = true;
    this.dialogRef.close('reject');
  }

  // Close method for X button
  onClose(): void {
    this.dialogRef.close();
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }
}

// MAIN COMPONENT
@Component({
  selector: 'app-manager-presentations-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './manager-presentations-list.component.html',
  styleUrls: ['./manager-presentations-list.component.css']
})
export class ManagerPresentationsListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'area', 'summary', 'document', 'presentation', 'payment', 'paymentResult', 'overallResult', 'options'];
  dataSource: any[] = [];
  isLoading = true;
  private apiUrl = environment.API_URL;

  conferenceData: any = null;


  constructor(
    private route: ActivatedRoute,
    private conferenceService: ConferenceService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (paramMap) => {
      const conferenceId = paramMap.get('conferenceId');
      if (conferenceId) {
        try {
          this.isLoading = true;
          this.conferenceData = await this.conferenceService.getConferenceById(conferenceId);
  
          // Get presentations
          const presentations = await this.conferenceService.getAllPresentationsByConference(conferenceId);
          
          // Add conferenceCreationId to each presentation for frontend use
          this.dataSource = presentations.map(presentation => ({
            ...presentation,
            conferenceCreationId: this.conferenceData.creationId // Use the conference creationId we already fetched
          }));
  
          this.isLoading = false;
        } catch (error) {
          console.error('Error fetching presentations:', error);
          this.isLoading = false;
        }
      } else {
        console.error('No conference ID provided in route parameters.');
      }
    });
  }

  areAllButtonsDisabled(): boolean {
    return this.conferenceData?.resultsSent === 3;
  }

  assignReviewer(element: any): void {
    this.router.navigate(['/eventos-academicos/conferencias/asignar-revisor', element.id]);
  }

  manageReviewers(conference: any): void {
    console.log('Navigating to manage reviewers for conference ID:', conference.id);
    this.router.navigate(['/eventos-academicos/conferencias/revisores'], {
      state: { conferenceId: conference.id }
    });
  }

  downloadDocument(conferenceId: string, creationId: string): void {
    this.conferenceService.downloadDocument(conferenceId, creationId);
  }

  viewDocument(conferenceId: string, creationId: string): void {
    const documentUrl = this.conferenceService.viewDocument(conferenceId, creationId);
    window.open(documentUrl, '_blank');
  }

// PRESENTATION DOCUMENT METHODS - FIXED
downloadPresentationDocument(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/download-presentation`;
  console.log('=== MANAGER FRONTEND DOWNLOAD PRESENTATION DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('Download URL:', url);
  window.open(url, '_blank');
}

viewPresentationDocument(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/view-presentation`;
  console.log('=== MANAGER FRONTEND VIEW PRESENTATION DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('View URL:', url);
  window.open(url, '_blank');
}

  // PAYMENT RECEIPT METHODS
downloadPaymentReceipt(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/download-payment`;
  console.log('=== MANAGER FRONTEND DOWNLOAD PAYMENT DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('Download URL:', url);
  window.open(url, '_blank');
}

viewPaymentReceipt(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/view-payment`;
  console.log('=== MANAGER FRONTEND VIEW PAYMENT DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('View URL:', url);
  window.open(url, '_blank');
}

  hasCorrectedDocument(element: any): boolean {
    return element.overallResult === 'Aceptada con cambios requeridos' && element.correctedDocumentSent === true;
  }

  reviewCorrectedDocument(element: any): void {
    const dialogRef = this.dialog.open(CorrectedDocumentReviewModalComponent, {
      width: '500px',
      data: { title: element.title }
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'accept' || result === 'reject') {
        try {
          // Convert modal result to backend string
          const overallResult = result === 'accept' ? 'Aceptada' : 'No aceptada';
          
          // Call the service to update the overall result
          await this.conferenceService.updatePresentationOverallResult(element.id, overallResult);
          
          // Show success message
          this.snackBar.open(`Documento corregido ${overallResult.toLowerCase()}`, 'Cerrar', {
            duration: 3000,
            panelClass: result === 'accept' ? 'success-snackbar' : 'error-snackbar'
          });
          
          // Refresh the presentations list using existing method
          await this.ngOnInit();
        } catch (error) {
          console.error('Error updating presentation result:', error);
          this.snackBar.open('Error al actualizar el resultado', 'Cerrar', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      }
    });
  }

  // PAYMENT REVIEW METHOD
  reviewPayment(element: any): void {
    const dialogRef = this.dialog.open(PaymentReviewModalComponent, {
      width: '500px',
      data: { title: element.title }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'accept' || result === 'reject') {
        try {
          const paidStatus = result === 'accept';
          
          await this.conferenceService.updatePaymentStatus(element.id, paidStatus);
          
          // Refresh the data source
          const conferenceId = this.route.snapshot.paramMap.get('conferenceId');
          if (conferenceId) {
            this.dataSource = await this.conferenceService.getAllPresentationsByConference(conferenceId);
          }
          
          // Show success toast
          const message = result === 'accept' ? 'Pago aceptado correctamente' : 'Pago rechazado correctamente';
          this.snackBar.open(message, 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });

        } catch (error) {
          console.error('Error updating payment status:', error);
          
          // Show error toast
          this.snackBar.open('Error al actualizar el estado del pago', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  // UPDATED HELPER METHODS - Add "Pendiente a revisión" to "No aplica" cases
  hasPresentationDocument(element: any): boolean {
    // Check if overall result makes presentation not applicable
    if (element.overallResult === "No Aceptada" || 
        element.overallResult === "Aceptada con cambios requeridos" || 
        element.overallResult === "Pendiente a revisión") {
      return false; // This will show "No aplica" instead
    }
    return element.presentationDocumentPath && element.presentationDocumentPath.trim() !== '';
  }

  hasPaymentReceipt(element: any): boolean {
    // Check if overall result makes payment receipt not applicable
    if (element.overallResult === "No Aceptada" || 
        element.overallResult === "Aceptada con cambios requeridos" || 
        element.overallResult === "Pendiente a revisión") {
      return false; // This will show "No aplica" instead
    }
    return element.paymentReceiptPath && element.paymentReceiptPath.trim() !== '';
  }

  hasPaymentReceiptForReview(element: any): boolean {
    // Check if overall result makes payment review not applicable
    if (element.overallResult === "No Aceptada" || 
        element.overallResult === "Aceptada con cambios requeridos" || 
        element.overallResult === "Pendiente a revisión") {
      return false; // Hide the payment review button
    }
    return this.hasPaymentReceipt(element);
  }

  // UPDATED METHOD FOR PAYMENT RESULT DISPLAY
  getPaymentResultText(element: any): string {
    // Check if overall result makes payment review not applicable
    if (element.overallResult === "No Aceptada" || 
        element.overallResult === "Aceptada con cambios requeridos" || 
        element.overallResult === "Pendiente a revisión") {
      return 'No aplica';
    }
    
    // If paymentReviewed is false or doesn't exist
    if (!element.paymentReviewed) {
      return 'El comprobante no ha sido subido o no ha sido revisado';
    }
    
    // If paymentReviewed is true, check the paid field
    if (element.paid === true) {
      return 'Pago aceptado';
    } else if (element.paid === false) {
      return 'Pago no aceptado';
    } else {
      return 'Estado de pago desconocido';
    }
  }

  // NEW METHOD FOR OVERALL RESULT DISPLAY
  getOverallResultText(element: any): string {
    return element.overallResult || 'Sin resultado';
  }

  // UPDATED HELPER METHODS FOR TEMPLATE DISPLAY
  showNotApplicableForPresentation(element: any): boolean {
    return element.overallResult === "No Aceptada" || 
           element.overallResult === "Aceptada con cambios requeridos" || 
           element.overallResult === "Pendiente a revisión";
  }

  showNotApplicableForPayment(element: any): boolean {
    return element.overallResult === "No Aceptada" || 
           element.overallResult === "Aceptada con cambios requeridos" || 
           element.overallResult === "Pendiente a revisión";
  }
}