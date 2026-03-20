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
import { Router } from '@angular/router';


@Component({
  selector: 'app-presentations-reviewer',
  templateUrl: './presentations-reviewer.component.html',
  styleUrls: ['./presentations-reviewer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ]
})
export class PresentationsReviewerComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'description', 'createdAt', 'document', 'estado', 'options'];
  dataSource: any[] = [];
  conferenceId: string | null = null;
  userId: string | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private conferenceService: ConferenceService,
    private authService: AuthService,
    private router: Router // Inject the Router service
  ) {}

  async ngOnInit(): Promise<void> {
    // Get the conferenceId from the route parameters
    this.conferenceId = this.route.snapshot.paramMap.get('conferenceId');

    // Get the current user's ID
    const currentUser = this.authService.getCurrentUser();
    if (currentUser()) {
      this.userId = currentUser()?.uid || null;
    } else {
      console.error('Error: Unable to retrieve the current user.');
      return;
    }

    // Load the presentations for the user and conference
    if (this.userId && this.conferenceId) {
      await this.loadPresentations(this.userId, this.conferenceId);
    }
  }

  async loadPresentations(userId: string, conferenceId: string): Promise<void> {
    try {
      this.isLoading = true;
      
      // Get conference data to obtain its creationId
      const conferenceData = await this.conferenceService.getConferenceById(conferenceId);
      
      // Get reviewer presentations (keep your existing method call)
      const presentations = await this.conferenceService.getReviewerPresentations(userId, conferenceId);
      
      // Add conferenceCreationId to each presentation for frontend use
      this.dataSource = presentations.map(presentation => ({
        ...presentation,
        conferenceCreationId: conferenceData.creationId
      }));
  
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading reviewer presentations:', error);
      this.isLoading = false;
    }
  }

// Add these methods to your reviewer component
viewDocument(conferenceCreationId: string, presentationCreationId: string): void {
  const documentUrl = this.conferenceService.viewDocument(conferenceCreationId, presentationCreationId);
  console.log('=== REVIEWER FRONTEND VIEW DOCUMENT DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  console.log('Document URL:', documentUrl);
  window.open(documentUrl, '_blank');
}

downloadDocument(conferenceCreationId: string, presentationCreationId: string): void {
  console.log('=== REVIEWER FRONTEND DOWNLOAD DOCUMENT DEBUG ===');
  console.log('conferenceCreationId:', conferenceCreationId);
  console.log('presentationCreationId:', presentationCreationId);
  this.conferenceService.downloadDocument(conferenceCreationId, presentationCreationId);
}

  navigateToFillRevisionForm(presentationId: string, formId: string): void {
    this.router.navigate([`/eventos-academicos/conferencias/revisor/ponencias/revision/${presentationId}`], {
      queryParams: { formId: formId, conferenceId: this.conferenceId } // Include conferenceId as a query parameter
    });
  }
}