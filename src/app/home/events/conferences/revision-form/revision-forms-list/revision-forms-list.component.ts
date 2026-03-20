import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { ConferenceService } from '../../data-access/conference.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-revision-forms-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    FormsModule, // Add FormsModule here
  ],
  templateUrl: './revision-forms-list.component.html',
  styleUrls: ['./revision-forms-list.component.css']
})
export class RevisionFormsListComponent implements OnInit {
  forms: any[] = []; // Array to store forms data
  isLoading = true; // Loading state
  conferenceId: string | null = null; // Store the current conference ID
  currentFormAssigned: string | null = null; // Track the currently assigned form

  displayedColumns: string[] = ['id', 'creationDate', 'conferenceUsed', 'questionCount', 'viewForm', 'toggle'];

  constructor(
    private conferenceService: ConferenceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the conference ID from the route and sanitize it
    this.conferenceId = this.route.snapshot.paramMap.get('conferenceId')?.replace(/[\[\]]/g, '') || null;

    if (this.conferenceId) {
      this.fetchForms();
    } else {
      console.error('Conference ID is missing or invalid');
    }
  }

  // Fetch all forms and check their assignment status
  async fetchForms(): Promise<void> {
    try {
      this.isLoading = true;
      this.forms = await this.conferenceService.getAllForms();

      if (this.conferenceId) {
        const conference = await this.conferenceService.getConferenceById(this.conferenceId);
        this.currentFormAssigned = conference.formAssigned || null;

        // Update the isAssigned property for all forms
        for (const form of this.forms) {
          form.isAssigned = form.id === this.currentFormAssigned;
        }
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Navigate to the new revision form component
  navigateToNewRevisionForm(): void {
    this.router.navigate([`/eventos-academicos/conferencias/formularios-revision/nuevo/${this.conferenceId}`]);
  }

  // Navigate to the view form component
  navigateToViewForm(formId: string): void {
    const conferenceId = this.conferenceId; // Use the sanitized conferenceId
    this.router.navigate([
      `/eventos-academicos/conferencias/formularios-revision-revisor/ver/${formId}`
    ], {
      queryParams: { conferenceId } // Pass the conferenceId as a query parameter
    });
  }

  // Toggle form assignment
  async toggleFormAssignment(form: any): Promise<void> {
    if (!this.conferenceId) {
      console.error('Conference ID is missing');
      return;
    }

    try {
      // Call the backend to toggle the assignment
      const response = await this.conferenceService.toggleFormAssignment(this.conferenceId, form.id);
      console.log(response.message); // Log the success message

      // Update the currentFormAssigned based on the toggle operation
      if (form.id === this.currentFormAssigned) {
        this.currentFormAssigned = null; // Unassign the form
      } else {
        this.currentFormAssigned = form.id; // Assign the new form
      }

      // Update the isAssigned property for all forms
      this.forms.forEach((f) => {
        f.isAssigned = f.id === this.currentFormAssigned;
      });
    } catch (error) {
      console.error('Error toggling form assignment:', error);
    }
  }
}