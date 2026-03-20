import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConferenceService } from '../../data-access/conference.service';
import { AuthService } from '../../../../../auth/data-access/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../../../environments/environment';
import { ModalComponent } from '../../../../modal/modal.component';

import { toast } from 'ngx-sonner';


@Component({
  selector: 'app-presentations-speaker',
  templateUrl: './presentations-speaker.component.html',
  styleUrls: ['./presentations-speaker.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ModalComponent
  ]
})
export class PresentationsSpeakerComponent implements OnInit {
  // UPDATED: Removed 'lastModified', added 'presentation' and 'payment' columns
  displayedColumns: string[] = ['id', 'title', 'description', 'document', 'createdAt', 'presentation', 'payment', 'state', 'options'];
  dataSource: any[] = [];
  tooltipMap: { [key: string]: string } = {};
  conferenceId: string | null = null;
  userId: string | null = null;
  isLoading = true;
  private apiUrl = environment.API_URL;
  
  conferenceData: any = null;
  conferenceResultsSent: number = 0;

  isUploadingModalOpened: boolean = false;
  isSubmittingDocument: boolean = false;
  uploadingDocumentType: string = '';

  constructor(
    private route: ActivatedRoute,
    private conferenceService: ConferenceService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.conferenceId = this.route.snapshot.paramMap.get('conferenceId');
    console.log('Conference ID received:', this.conferenceId);

    if (this.conferenceId) {
      await this.loadConferenceData(this.conferenceId);
      await this.loadPresentations(this.conferenceId);
    }
  }

  async loadConferenceData(conferenceId: string): Promise<void> {
    try {
      this.conferenceData = await this.conferenceService.getConferenceById(conferenceId);
      this.conferenceResultsSent = this.conferenceData?.resultsSent || 0;
      console.log('Conference data loaded:', this.conferenceData);
      console.log('Conference resultsSent:', this.conferenceResultsSent);
    } catch (error) {
      console.error('Error fetching conference data:', error);
    }
  }

 
  async loadPresentations(conferenceId: string): Promise<void> {
    this.isLoading = true;
    try {
      const presentations = await this.conferenceService.getAllPresentationsByConference(conferenceId);
      
      // Get the conference data to obtain its creationId
      const conferenceData = await this.conferenceService.getConferenceById(conferenceId);
      const conferenceCreationId = conferenceData.creationId;
      
      // Add conferenceCreationId to each presentation for frontend use
      this.dataSource = presentations.map(presentation => ({
        ...presentation,
        conferenceCreationId: conferenceCreationId
      }));
  
      this.dataSource.forEach((presentation) => {
        this.tooltipMap[presentation.id] = this.getTooltipText(presentation.overallResult);
      });
    } catch (error) {
      console.error('Error fetching presentations:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getTooltipText(overallResult: string): string {
    switch (overallResult) {
      case 'Aceptada con cambios requeridos':
        return 'Subir versión con correcciones';
      case 'Aceptada':
        return 'Subir versión completa con autores';
      default:
        return '';
    }
  }

  isButtonDisabled(element: any, buttonType: string): boolean {
    // If conference resultsSent is 3, disable all buttons
    if (this.conferenceResultsSent === 3) {
      return true;
    }

    // Original button-specific logic
    switch (buttonType) {
      case 'corrected':
        return element.correctedDocumentSent === true || element.overallResult !== 'Aceptada con cambios requeridos';
      case 'final':
      case 'presentation':
      case 'payment':
        return element.overallResult !== 'Aceptada';
      default:
        return false;
    }
  }

  viewDocument(conferenceCreationId: string, presentationCreationId: string): void {
    const documentUrl = this.conferenceService.viewDocument(conferenceCreationId, presentationCreationId);
    window.open(documentUrl, '_blank');
  }

  downloadDocument(conferenceId: string, creationId: string): void {
    this.conferenceService.downloadDocument(conferenceId, creationId);
  }

 // NEW METHODS FOR PRESENTATION DOCUMENT HANDLING - FIXED
downloadPresentationDocument(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/download-presentation`;
  console.log('=== FRONTEND DOWNLOAD PRESENTATION DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('Download URL:', url);
  window.open(url, '_blank');
}

viewPresentationDocument(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/view-presentation`;
  console.log('=== FRONTEND VIEW PRESENTATION DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('View URL:', url);
  window.open(url, '_blank');
}

  // NEW METHODS FOR PAYMENT RECEIPT HANDLING - FIXED
downloadPaymentReceipt(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/download-payment`;
  console.log('=== FRONTEND DOWNLOAD PAYMENT DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('Download URL:', url);
  window.open(url, '_blank');
}

viewPaymentReceipt(conferenceCreationId: string, presentationCreationId: string): void {
  const url = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/view-payment`;
  console.log('=== FRONTEND VIEW PAYMENT DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('View URL:', url);
  window.open(url, '_blank');
}

  // NEW HELPER METHODS FOR DISPLAY LOGIC
  hasPresentationDocument(element: any): boolean {
    if (element.overallResult !== "Aceptada") {
      return false; // This will show "No aplica"
    }
    return element.presentationDocumentPath && element.presentationDocumentPath.trim() !== '';
  }

  hasPaymentReceipt(element: any): boolean {
    if (element.overallResult !== "Aceptada") {
      return false; // This will show "No aplica"
    }
    return element.paymentReceiptPath && element.paymentReceiptPath.trim() !== '';
  }

  showNotApplicableForPresentation(element: any): boolean {
    return element.overallResult !== "Aceptada";
  }

  showNotApplicableForPayment(element: any): boolean {
    return element.overallResult !== "Aceptada";
  }

  async uploadCorrectedDocument(conferenceCreationId: string, presentationCreationId: string, file: File, presentationId: string): Promise<void> {
    const formData = new FormData();
    formData.append('correctedDocument', file);
    formData.append('presentationId', presentationId);

    console.log('=== FRONTEND UPLOAD CORRECTED DOCUMENT DEBUG ===');
    console.log('conferenceCreationId:', conferenceCreationId);
    console.log('presentationCreationId:', presentationCreationId);
    console.log('presentationId (document ID):', presentationId);

    // Open the modal
    this.openUploadingModal('corrected');

    try {
      const response = await this.conferenceService.uploadCorrectedDocument(conferenceCreationId, presentationCreationId, formData);
      console.log('Corrected document uploaded successfully:', response);
      toast.success('Documento corregido subido exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
      window.location.reload();
    } catch (error) {
      console.error('Error uploading corrected document:', error);
      toast.error('Error al subir el documento corregido. Inténtelo nuevamente.', {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeUploadingModal();
    }
  }

  // Update uploadPresentationDocument method
  async uploadPresentationDocument(conferenceCreationId: string, presentationCreationId: string, file: File, presentationId: string): Promise<void> {
    const formData = new FormData();
    formData.append('presentationDocument', file);
    formData.append('presentationId', presentationId);

    console.log('=== FRONTEND UPLOAD PRESENTATION DEBUG ===');
    console.log('conferenceCreationId:', conferenceCreationId);
    console.log('presentationCreationId:', presentationCreationId);
    console.log('presentationId (document ID):', presentationId);

    // Open the modal
    this.openUploadingModal('presentation');

    try {
      const response = await this.conferenceService.uploadPresentationDocument(conferenceCreationId, presentationCreationId, formData);
      console.log('Presentation document uploaded successfully:', response);
      toast.success('Presentación subida exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
      window.location.reload();
    } catch (error) {
      console.error('Error uploading presentation document:', error);
      toast.error('Error al subir la presentación. Inténtelo nuevamente.', {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeUploadingModal();
    }
  }

  // Update uploadPaymentReceipt method
  async uploadPaymentReceipt(conferenceCreationId: string, presentationCreationId: string, file: File, presentationId: string): Promise<void> {
    const formData = new FormData();
    formData.append('paymentDocument', file); // CHANGED: was 'paymentReceipt', now 'paymentDocument'
    formData.append('presentationId', presentationId);
  
    console.log('=== FRONTEND UPLOAD PAYMENT RECEIPT DEBUG ===');
    console.log('conferenceCreationId:', conferenceCreationId);
    console.log('presentationCreationId:', presentationCreationId);
    console.log('presentationId (document ID):', presentationId);
  
    // Open the modal
    this.openUploadingModal('payment');
  
    try {
      const response = await this.conferenceService.uploadPaymentReceipt(conferenceCreationId, presentationCreationId, formData);
      console.log('Payment receipt uploaded successfully:', response);
      toast.success('Comprobante de pago subido exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
      window.location.reload();
    } catch (error) {
      console.error('Error uploading payment receipt:', error);
      toast.error('Error al subir el comprobante de pago. Inténtelo nuevamente.', {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeUploadingModal();
    }
  }

  // Update uploadFinalDocument method
  async uploadFinalDocument(conferenceCreationId: string, presentationCreationId: string, file: File, presentationId: string): Promise<void> {
    const formData = new FormData();
    formData.append('finalDocument', file);
    formData.append('presentationId', presentationId);

    console.log('=== FRONTEND UPLOAD FINAL DOCUMENT DEBUG ===');
    console.log('conferenceCreationId:', conferenceCreationId);
    console.log('presentationCreationId:', presentationCreationId);
    console.log('presentationId (document ID):', presentationId);

    // Open the modal
    this.openUploadingModal('final');

    try {
      const response = await this.conferenceService.uploadFinalDocument(conferenceCreationId, presentationCreationId, formData);
      console.log('Final document uploaded successfully:', response);
      toast.success('Documento final subido exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
      window.location.reload();
    } catch (error) {
      console.error('Error uploading final document:', error);
      toast.error('Error al subir el documento final. Inténtelo nuevamente.', {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeUploadingModal();
    }
  }
  
  // Update the method signature to be clear about what it expects
async onFileSelected(event: any, conferenceCreationId: string, presentationCreationId: string, presentationId: string): Promise<void> {
  if (!presentationId) {
    console.error('presentationId is missing!');
    alert('Error: Presentation ID is missing. Please try again.');
    return;
  }

  const file: File = event.target.files[0];
  if (file) {
    // Determine the upload type based on the input ID
    const inputId = event.target.id;
    
    if (inputId.includes('corrected')) {
      await this.uploadCorrectedDocument(conferenceCreationId, presentationCreationId, file, presentationId);
    } else if (inputId.includes('presentation')) {
      await this.uploadPresentationDocument(conferenceCreationId, presentationCreationId, file, presentationId);
    } else if (inputId.includes('payment')) {
      await this.uploadPaymentReceipt(conferenceCreationId, presentationCreationId, file, presentationId);
    } else if (inputId.includes('final')) {
      await this.uploadFinalDocument(conferenceCreationId, presentationCreationId, file, presentationId);
    }
  }
}

  triggerFileInput(type: string, creationId: string): void {
    const inputId = `${type}-${creationId}`;
    const inputElement = document.getElementById(inputId) as HTMLInputElement | null;
    if (inputElement) {
      inputElement.click();
    } else {
      console.error(`Input element not found for id: ${inputId}`);
    }
  }

  onButtonClick(type: string, creationId: string): void {
    this.triggerFileInput(type, creationId);
  }

  openUploadingModal(documentType: string): void {
    this.isUploadingModalOpened = true;
    this.isSubmittingDocument = true;
    this.uploadingDocumentType = documentType;
  }

  closeUploadingModal(): void {
    this.isUploadingModalOpened = false;
    this.isSubmittingDocument = false;
    this.uploadingDocumentType = '';
  }

  getUploadingMessage(): string {
    switch (this.uploadingDocumentType) {
      case 'corrected':
        return 'Subiendo documento corregido, por favor espera...';
      case 'presentation':
        return 'Subiendo presentación, por favor espera...';
      case 'payment':
        return 'Subiendo comprobante de pago, por favor espera...';
      case 'final':
        return 'Subiendo documento final, por favor espera...';
      default:
        return 'Subiendo documento, por favor espera...';
    }
  }

  getUploadingTitle(): string {
    switch (this.uploadingDocumentType) {
      case 'corrected':
        return 'Subiendo Documento Corregido';
      case 'presentation':
        return 'Subiendo Presentación';
      case 'payment':
        return 'Subiendo Comprobante de Pago';
      case 'final':
        return 'Subiendo Documento Final';
      default:
        return 'Subiendo Documento';
    }
  }

  
}