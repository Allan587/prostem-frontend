import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConferenceService } from '../../data-access/conference.service';
import { AuthService } from '../../../../../auth/data-access/auth.service';

@Component({
  selector: 'app-conferences-reviewer',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './conferences-reviewer.component.html',
  styleUrls: ['./conferences-reviewer.component.css']
})
export class ConferencesReviewerComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'title',
    'description',
    'startDate',
    'finishDate',
    'estado',
    'options'
  ];
  dataSource: any[] = [];
  userId: string | null = null;
  isLoading = true;

  constructor(
    private conferenceService: ConferenceService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser()) {
      this.userId = currentUser()?.uid || null;
    } else {
      console.log('Error when obtaining the user for the conferences');
      return;
    }

    await this.loadReviewerConferences(this.userId);
  }

  async loadReviewerConferences(userId: string | null): Promise<void> {
    try {
      this.isLoading = true;
      const conferences = await this.conferenceService.getReviewerConferences(userId!);

      if (conferences.length === 0) {
        console.log('Usted no ha sido asignado como revisor de ninguna conferencia hasta el momento');
      }

      this.dataSource = conferences;
    } catch (error) {
      console.log('Error when retrieving the reviewer conferences: ', error);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToPresentations(conferenceId: string): void {
    this.router.navigate(['/eventos-academicos/conferencias/revisor/ponencias', conferenceId]);
  }
  
}