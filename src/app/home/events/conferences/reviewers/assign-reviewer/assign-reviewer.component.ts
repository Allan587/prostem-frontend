import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ConferenceService } from '../../data-access/conference.service';

@Component({
  selector: 'app-assign-reviewer',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './assign-reviewer.component.html',
  styleUrls: ['./assign-reviewer.component.css']
})
export class AssignReviewerComponent implements OnInit {
  presentationId: string | null = null;
  presentationArea: string = '';
  presentationTitle: string = '';
  matchingArea: string = '';
  selectedArea: string = '';
  areaOptions: string[] = [];
  displayedColumns: string[] = ['name', 'email', 'institution', 'presentationsAssigned', 'areas', 'assign'];
  dataSource = new MatTableDataSource<any>([]);
  selectedAssignmentFilter: string = 'Revisores disponibles';
  isLoading: boolean = true;

  constructor(
    private conferenceService: ConferenceService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.presentationId = this.route.snapshot.paramMap.get('presentationId');
      console.log('Presentation ID from route:', this.presentationId);

      if (!this.presentationId) {
        console.error('Presentation ID is missing from route parameters');
        return;
      }

      // Get presentation area and title
      console.log('Calling getPresentationAreaAndTitle...');
      const presentationInfo = await this.conferenceService.getPresentationAreaAndTitle(this.presentationId!);
      console.log('Received presentation info:', presentationInfo);
      
      this.presentationTitle = presentationInfo.title;
      this.matchingArea = presentationInfo.area;
      console.log('Set matchingArea to:', this.matchingArea);
      console.log('Set presentationTitle to:', this.presentationTitle);

      // LOAD AREA OPTIONS IMMEDIATELY AFTER GETTING PRESENTATION INFO
      await this.loadAreaOptions();
      
      // Set default filter and load initial data
      await this.setDefaultFilter();
    } catch (error) {
      console.error('Error during ngOnInit:', error);
    }
  }

  private async loadAreaOptions(): Promise<void> {
    try {
      console.log('Loading area options...');
      
      // Get all available areas from the database
      const allAreas = await this.conferenceService.getAreas();
      console.log('All areas from database:', allAreas);
      
      // Create a Set to avoid duplicates
      const uniqueAreas = new Set<string>();
      
      // Add the presentation's area first (if it exists)
      if (this.matchingArea) {
        uniqueAreas.add(this.matchingArea);
        console.log('Added presentation area:', this.matchingArea);
      }
      
      // Add "Todas las áreas" as second option
      uniqueAreas.add('Todas las áreas');
      
      // Add all other areas from the database
      if (Array.isArray(allAreas)) {
        allAreas.forEach(area => {
          if (area && area.trim() !== '') {
            uniqueAreas.add(area);
          }
        });
      }
      
      // Convert to array
      this.areaOptions = Array.from(uniqueAreas);
      
      // Set the default selected area to the presentation's area
      if (this.matchingArea && this.areaOptions.includes(this.matchingArea)) {
        this.selectedArea = this.matchingArea;
      } else if (this.areaOptions.length > 0) {
        this.selectedArea = this.areaOptions[0]; // Fallback to first option
      }
      
      console.log('Final area options:', this.areaOptions);
      console.log('Selected area set to:', this.selectedArea);
      
    } catch (error) {
      console.error('Error loading area options:', error);
      
      // Fallback: Just add the presentation area and "Todas las áreas"
      const uniqueAreas = new Set<string>();
      if (this.matchingArea) {
        uniqueAreas.add(this.matchingArea);
      }
      uniqueAreas.add('Todas las áreas');
      this.areaOptions = Array.from(uniqueAreas);
      
      if (this.matchingArea) {
        this.selectedArea = this.matchingArea;
      }
    }
  }

  

  async setDefaultFilter(): Promise<void> {
    try {
      // Get all reviewers for the presentation area to check assignments
      const allReviewers = await this.conferenceService.getReviewersByPresentation(this.presentationId!);
      
      // Check how many are assigned
      let assignedCount = 0;
      for (const reviewer of allReviewers) {
        const isAssigned = await this.conferenceService.isReviewerAssigned(reviewer.id, this.presentationId!);
        if (isAssigned) {
          assignedCount++;
        }
      }

      // Set default filter based on assigned count
      if (assignedCount === 0) {
        this.selectedAssignmentFilter = 'Revisores disponibles';
      } else {
        this.selectedAssignmentFilter = 'Revisores asignados actualmente';
      }

      // Apply the filter
      await this.onAssignmentFilterChange();
    } catch (error) {
      console.error('Error setting default filter:', error);
      // Default to available reviewers on error
      this.selectedAssignmentFilter = 'Revisores disponibles';
      await this.onAssignmentFilterChange();
    } finally {
      this.isLoading = false; // Stop loading
    }
  }

  async onAssignmentFilterChange(): Promise<void> {
    console.log('Assignment filter changed to:', this.selectedAssignmentFilter);
    
    if (this.selectedAssignmentFilter === 'Revisores disponibles') {
      // Reset to presentation area when switching to available reviewers
      if (this.matchingArea && this.areaOptions.includes(this.matchingArea)) {
        this.selectedArea = this.matchingArea;
      }
    }
    
    await this.fetchReviewers();
  }

  async fetchAssignedReviewers(): Promise<void> {
    try {
      console.log('Fetching assigned reviewers for presentation:', this.presentationId);
      
      // Get ALL reviewers (not filtered by area) using the "Todas las áreas" parameter
      const allReviewers = await this.conferenceService.getReviewersByPresentation(this.presentationId!, 'Todas las áreas');
      
      // Check assignment status and filter for assigned only
      const assignedReviewers = [];
      for (const reviewer of allReviewers) {
        reviewer.isAssigned = await this.conferenceService.isReviewerAssigned(reviewer.id, this.presentationId!);
        
        // Only include assigned reviewers
        if (reviewer.isAssigned) {
          assignedReviewers.push(reviewer);
        }
      }
      
      this.dataSource.data = assignedReviewers;
      console.log('Assigned reviewers fetched:', assignedReviewers);
    } catch (error) {
      console.error('Error fetching assigned reviewers:', error);
    }
  }
  

  async loadAreas(): Promise<void> {
    try {
      const areas = await this.conferenceService.getAreas();
      // Build the area options list
      this.areaOptions = [this.matchingArea, 'Todas las áreas', ...areas.filter(area => area !== this.matchingArea)];
      this.selectedArea = this.matchingArea; // Default to the matching area
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  }

  async onAreaChange(selectedArea: string): Promise<void> {
    console.log('Area changed to:', selectedArea);
    this.selectedArea = selectedArea;
    
    // Only reload if we're showing available reviewers
    if (this.selectedAssignmentFilter === 'Revisores disponibles') {
      await this.fetchReviewers();
    }
  }
  
  async fetchReviewersByArea(area: string): Promise<void> {
    try {
      console.log('Fetching reviewers for area:', area);
      const reviewers = await this.conferenceService.getReviewersByPresentation(this.presentationId!, area);

      // Check assignment status for each reviewer
      for (const reviewer of reviewers) {
        reviewer.isAssigned = await this.conferenceService.isReviewerAssigned(reviewer.id, this.presentationId!);
      }

      // Apply filtering based on selectedAssignmentFilter
      let filteredReviewers = reviewers;
      if (this.selectedAssignmentFilter === 'Revisores asignados actualmente') {
        filteredReviewers = reviewers.filter(reviewer => reviewer.isAssigned);
      }
      // If 'Revisores disponibles' is selected, show all reviewers (no additional filtering needed)

      this.dataSource.data = filteredReviewers;
      console.log('Reviewers fetched for area:', area, 'Filter:', this.selectedAssignmentFilter, filteredReviewers);
    } catch (error) {
      console.error('Error fetching reviewers for area:', error);
    }
  }
  

  async fetchPresentationDetails(): Promise<void> {
    try {
      const presentation = await this.conferenceService.getPresentationAreaAndTitle(this.presentationId!);
      this.presentationArea = presentation.area;
      this.presentationTitle = presentation.title;
    } catch (error) {
      console.error('Error fetching presentation details:', error);
    }
  }

  async fetchReviewers(): Promise<void> {
    if (!this.presentationId) {
      console.error('Presentation ID is missing');
      return;
    }
  
    this.isLoading = true;
  
    try {
      console.log('Fetching reviewers for presentation ID:', this.presentationId);
      console.log('Selected assignment filter:', this.selectedAssignmentFilter);
      console.log('Selected area:', this.selectedArea);
      console.log('Presentation matching area:', this.matchingArea);
  
      let reviewers: any[] = [];
  
      if (this.selectedAssignmentFilter === 'Revisores disponibles') {
        // Load available reviewers, optionally filtered by area
        const area = this.selectedArea !== 'Todas las áreas' ? this.selectedArea : undefined;
        reviewers = await this.conferenceService.getReviewersByPresentation(this.presentationId, area);
        
        // Check if each reviewer is assigned to the presentation
        for (const reviewer of reviewers) {
          reviewer.isAssigned = await this.conferenceService.isReviewerAssigned(reviewer.id, this.presentationId!);
        }
      } else {
        // FIXED: For assigned reviewers, load ALL reviewers first, then check assignment and filter
        reviewers = await this.conferenceService.getReviewersByPresentation(this.presentationId!);
        
        // Check assignment status for each reviewer FIRST
        for (const reviewer of reviewers) {
          reviewer.isAssigned = await this.conferenceService.isReviewerAssigned(reviewer.id, this.presentationId!);
        }
        
        // NOW filter to show only assigned reviewers
        reviewers = reviewers.filter(reviewer => reviewer.isAssigned === true);
        
        console.log('Assigned reviewers after filtering:', reviewers);
      }
  
      console.log('Reviewers loaded:', reviewers);
  
      this.dataSource.data = reviewers;
      console.log('Reviewers fetched and updated with assignment status:', reviewers);
    } catch (error) {
      console.error('Error fetching reviewers:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private async updateAreaOptions(presentationArea: string): Promise<void> {
    try {
      // First, get all available areas from the database
      const allAreas = await this.conferenceService.getAreas();
      console.log('All areas from database:', allAreas);
      
      // Create a Set to avoid duplicates
      const uniqueAreas = new Set<string>();
      
      // Add the presentation's area first (if it exists)
      if (presentationArea) {
        uniqueAreas.add(presentationArea);
      }
      
      // Add "Todas las áreas" as second option
      uniqueAreas.add('Todas las áreas');
      
      // Add all other areas from the database
      if (Array.isArray(allAreas)) {
        allAreas.forEach(area => {
          if (area && area.trim() !== '') {
            uniqueAreas.add(area);
          }
        });
      }
      
      // Convert to array
      this.areaOptions = Array.from(uniqueAreas);
      
      console.log('Updated area options:', this.areaOptions);
      console.log('Presentation area (matchingArea):', presentationArea);
      
    } catch (error) {
      console.error('Error loading areas:', error);
      
      // Fallback: Just add the presentation area and "Todas las áreas"
      const uniqueAreas = new Set<string>();
      if (presentationArea) {
        uniqueAreas.add(presentationArea);
      }
      uniqueAreas.add('Todas las áreas');
      this.areaOptions = Array.from(uniqueAreas);
    }
  }
  

  async toggleAssignment(reviewer: any): Promise<void> {
    if (!this.presentationId) {
      console.error('Presentation ID is missing');
      return;
    }
  
    console.log('Toggling assignment for:', {
      reviewerId: reviewer.id, // Log the reviewer ID
      presentationId: this.presentationId
    });
  
    try {
      // Call the endpoint to toggle the assignment
      const response = await this.conferenceService.toggleReviewerAssignment(reviewer.id, this.presentationId!);
      console.log(response.message); // Success message from the backend
  
      // Update the reviewer's assignment status after the backend response
      reviewer.isAssigned = await this.conferenceService.isReviewerAssigned(reviewer.id, this.presentationId!);
    } catch (error) {
      console.error('Error toggling reviewer assignment:', error);
      this.snackBar.open('Error al asignar/desasignar el revisor.', 'Cerrar', {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
    }
  }
}