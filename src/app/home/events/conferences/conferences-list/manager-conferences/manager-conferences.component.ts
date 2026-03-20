import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConferenceService } from '../../data-access/conference.service';
import { AuthService } from '../../../../../auth/data-access/auth.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalComponent } from '../../../../modal/modal.component'; // ADD THIS IMPORT
import { toast } from 'ngx-sonner'; 

@Component({
  selector: 'app-manager-conferences',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule, 
    MatTooltipModule,
    MatProgressSpinnerModule,
    ModalComponent 
  ],
  templateUrl: './manager-conferences.component.html',
  styleUrls: ['./manager-conferences.component.css']
})

export class ManagerConferencesComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'title',
    'description',
    'startDate',
    'finishDate',
    'resultados',
    'estado',
    'options'
  ];
  dataSource: any[] = [];
  userId: string | null = null;
  isLoading = true; // Loading state

  isResultsModalOpened: boolean = false;
  selectedConference: any = null;
  isSubmittingResults: boolean = false;

  constructor(
    private conferenceService: ConferenceService,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser()) {
      this.userId = currentUser()?.uid || null;
    } else {
      console.log('Error when obtaining the user for the conferences');
      return;
    }

    await this.loadConferences(this.userId);
  }

  async loadConferences(userId: string | null): Promise<void> {
    try {
      this.isLoading = true;
      this.dataSource = await this.conferenceService.getAllConferences(userId);
      console.log('Conferences loaded:', this.dataSource); // Debugging statement
    } catch (error) {
      console.error('Error when retrieving the conferences:', error);
    } finally{
      this.isLoading = false;
    }
  }

  getResultadosMessage(resultsSent: number): string {
    switch (resultsSent) {
      case 1:
        return "Primeros resultados enviados";
      case 2:
        return "Segundos resultados enviados";
      case 3:
        return "Resultados finales enviados";
      default:
        return "No se han enviado resultados";
    }
  }
  
  getResultsButtonTooltip(resultsSent: number): string {
    switch (resultsSent) {
      case 0:
        return 'Enviar primeros resultados';
      case 1:
        return 'Enviar segundos resultados';
      case 2:
        return 'Enviar resultados finales';
      default:
        return 'Resultados enviados';
    }
  }

  openResultsModal(conference: any): void {
    this.selectedConference = conference;
    this.isResultsModalOpened = true;
  }

  closeResultsModal(): void {
    this.isResultsModalOpened = false;
    this.selectedConference = null;
  }

  getNextResultsType(resultsSent: number): string {
    switch (resultsSent) {
      case 0:
        return 'primeros resultados';
      case 1:
        return 'segundos resultados';
      case 2:
        return 'resultados finales';
      default:
        return 'resultados';
    }
  }

  async confirmSendResults(): Promise<void> {
    if (!this.selectedConference) {
      return;
    }

    this.isSubmittingResults = true;

    try {
      const updatedResultsSent = await this.conferenceService.updateResultsSent(this.selectedConference.id);
      this.selectedConference.resultsSent = updatedResultsSent; // Update the local dataSource immediately
      
      // Show success toast based on what was sent
      let successMessage = '';
      switch (updatedResultsSent) {
        case 1:
          successMessage = 'Primeros resultados enviados exitosamente';
          break;
        case 2:
          successMessage = 'Segundos resultados enviados exitosamente';
          break;
        case 3:
          successMessage = 'Resultados finales enviados exitosamente';
          break;
        default:
          successMessage = 'Resultados enviados exitosamente';
      }

      toast.success(successMessage, {
        duration: 5000,
        position: 'top-center'
      });

    } catch (error) {
      console.error('Error updating resultsSent:', error);
      toast.error('Error al enviar los resultados');
    } finally {
      this.closeResultsModal();
      this.isSubmittingResults = false;
    }
  }
  
  async updateResultsSent(conference: any): Promise<void> {
    this.openResultsModal(conference);
  }

  editConference(conference: any): void {
    this.router.navigate(['/eventos-academicos/conferencias/editar', conference.id]);
  }

  viewPresentations(conference: any): void {
    console.log('Navigating to view presentations for conference ID:', conference.id); // Debugging log
    this.router.navigate([`/eventos-academicos/conferencias/ponencias/administrador/${conference.id}`]);
  }

  viewAvailableforms(conference: any): void {
    this.router.navigate([`/eventos-academicos/conferencias/formularios-revision/formularios-disponibles/${conference.id}]`]);
  }

  //prostem-frontend/src/app/home/home.routes.ts
  async toggleActive(conference: any): Promise<void> {
    try {
      const updatedConference = await this.conferenceService.toggleConferenceActive(conference.id);
      conference.active = updatedConference.active; 
      const message = conference.active
        ? 'Conferencia habilitada exitosamente'
        : 'Conferencia deshabilitada exitosamente';
      this.snackBar.open(message, 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    } catch (error) {
      console.error('Error toggling conference active status:', error);
      this.snackBar.open('Error al cambiar el estado de la conferencia', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }


  async downloadCertificates(conference: any): Promise<void> {
    try {
      // Show loading state
      this.snackBar.open('Generando certificados...', '', {
        duration: 0, // Keep open until dismissed
        panelClass: ['snackbar-info']
      });

      await this.conferenceService.downloadBulkCertificates(conference.id);
      
      // Close loading snackbar and show success
      this.snackBar.dismiss();
      this.snackBar.open('Certificados descargados exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });

    } catch (error) {
      console.error('Error downloading certificates:', error);
      this.snackBar.dismiss();
      this.snackBar.open('Error al generar los certificados', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  // Method to handle file selection and upload
  onCertificateFileSelected(event: any, conference: any): void {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      this.snackBar.open('Por favor seleccione un archivo ZIP', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }
    
    // Upload the file
    this.uploadSignedCertificates(conference, file);
  }

  async uploadSignedCertificates(conference: any, file: File): Promise<void> {
    try {
      // Show loading state
      this.snackBar.open('Subiendo certificados firmados...', '', {
        duration: 0, // Keep open until dismissed
        panelClass: ['snackbar-info']
      });

      const result = await this.conferenceService.uploadSignedCertificates(conference.id, file);
      
      // Close loading snackbar and show success
      this.snackBar.dismiss();
      
      let successMessage = `Certificados firmados subidos exitosamente: ${result.processedCount}/${result.expectedCount}`;
      
      if (result.errors && result.errors.length > 0) {
        successMessage += ` (${result.errors.length} errores)`;
      }
      
      this.snackBar.open(successMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['snackbar-success']
      });

      // Log detailed results for debugging
      console.log('Upload results:', result);
      
      if (result.errors && result.errors.length > 0) {
        console.warn('Upload errors:', result.errors);
        
        // Show errors in a separate snackbar
        setTimeout(() => {
          this.snackBar.open(`Errores encontrados: ${result.errors.length}. Ver consola para detalles.`, 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-warning']
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Error uploading signed certificates:', error);
      this.snackBar.dismiss();
      this.snackBar.open('Error al subir los certificados firmados', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  // Method to trigger file input
  triggerCertificateUpload(conference: any): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = (event: any) => this.onCertificateFileSelected(event, conference);
    input.click();
  }

  async sendCertificates(conference: any): Promise<void> {
    try {
      // Show loading snackbar
      this.snackBar.open('Enviando certificados por email...', '', {
        duration: 0, // Don't auto-dismiss
        panelClass: ['snackbar-info']
      });
  
      const result = await this.conferenceService.sendCertificates(conference.id);
  
      // Close loading snackbar and show success
      this.snackBar.dismiss();
      
      let successMessage = `Certificados enviados exitosamente: ${result.sentCount}/${result.totalCount}`;
      
      if (result.errors && result.errors.length > 0) {
        successMessage += ` (${result.errors.length} errores)`;
      }
      
      this.snackBar.open(successMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['snackbar-success']
      });
  
      // Log detailed results for debugging
      console.log('Send certificates results:', result);
      
      if (result.errors && result.errors.length > 0) {
        console.warn('Send certificates errors:', result.errors);
        
        // Show errors in a separate snackbar
        setTimeout(() => {
          this.snackBar.open(`Errores encontrados: ${result.errors.length}. Ver consola para detalles.`, 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-warning']
          });
        }, 2000);
      }
  
    } catch (error) {
      console.error('Error sending certificates:', error);
      this.snackBar.dismiss();
      this.snackBar.open('Error al enviar los certificados', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  isConferenceEnded(conference: any): boolean {
    if (!conference.finishDate || !conference.finishTime) {
      return false; // If no finish date/time, consider it not ended
    }
  
    try {
      // Parse the finish date (assuming format like "2024-12-15")
      const finishDateParts = conference.finishDate.split('-');
      const year = parseInt(finishDateParts[0]);
      const month = parseInt(finishDateParts[1]) - 1; // Month is 0-indexed
      const day = parseInt(finishDateParts[2]);
  
      // Parse the finish time (assuming format like "17:30" or "5:30 PM")
      let hour: number;
      let minute: number;
  
      if (conference.finishTime.includes(':')) {
        // 24-hour format like "17:30"
        const timeParts = conference.finishTime.split(':');
        hour = parseInt(timeParts[0]);
        minute = parseInt(timeParts[1]);
      } else {
        // Handle other formats if needed
        hour = 23;
        minute = 59;
      }
  
      // Create the conference end datetime
      const conferenceEndDate = new Date(year, month, day, hour, minute);
      
      // Get current datetime
      const currentDate = new Date();
  
      // Return true if current time is after conference end time
      return currentDate > conferenceEndDate;
  
    } catch (error) {
      console.error('Error parsing conference date/time:', error);
      return false; // If parsing fails, consider it not ended
    }
  }
  
  getCertificateButtonTooltip(conference: any, defaultTooltip: string): string {
    if (!this.isConferenceEnded(conference)) {
      return 'Disponible después de que termine la conferencia';
    }
    return defaultTooltip;
  }
  
}