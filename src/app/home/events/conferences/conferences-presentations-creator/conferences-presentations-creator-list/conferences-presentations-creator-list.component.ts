import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConferenceService } from '../../data-access/conference.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../../auth/data-access/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-conferences-presentations-creator-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './conferences-presentations-creator-list.component.html',
  styleUrls: ['./conferences-presentations-creator-list.component.css']
})
export class ConferencesPresentationsCreatorListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'title',
    'description',
    'startDate',
    'finishDate',
    'options'
  ];
  dataSource: any[] = [];
  userId: string | null = null; // Store the current user ID
  isLoading = true; // Loading state

  constructor(
    private conferenceService: ConferenceService,
    private router: Router,
    private authService: AuthService
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
      this.isLoading = true; // Activate loading state
      this.dataSource = await this.conferenceService.getAllConferencesExcludingUser(userId!);
    } catch (error) {
      console.log('Error when retrieving the conferences: ', error);
    } finally {
      this.isLoading = false; // Deactivate loading state
    }
  }

  createPresentation(conference: any): void {
    console.log('Conference ID:', conference.id); // Debugging log
    this.router.navigate(['/eventos-academicos/conferencias', conference.id, 'nueva-ponencia']);
}
}