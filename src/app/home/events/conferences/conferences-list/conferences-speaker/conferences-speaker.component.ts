import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Importar MatProgressSpinnerModule
import { ConferenceService } from '../../data-access/conference.service';
import { AuthService } from '../../../../../auth/data-access/auth.service';

@Component({
  selector: 'app-conferences-speaker',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule // Agregar MatProgressSpinnerModule
  ],
  templateUrl: './conferences-speaker.component.html',
  styleUrls: ['./conferences-speaker.component.css']
})
export class ConferencesSpeakerComponent implements OnInit {
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
  isLoading = true; // Nueva variable para controlar el estado de carga

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
  
    await this.loadUserConferences(this.userId);
  }
  
  async loadUserConferences(userId: string | null): Promise<void> {
    try {
      this.isLoading = true; // Activar el estado de carga
      this.dataSource = await this.conferenceService.getUserConferences(userId!);
    } catch (error) {
      console.log('Error when retrieving the user conferences: ', error);
    } finally {
      this.isLoading = false; // Desactivar el estado de carga
    }
  }

  viewMyPresentations(conference: any): void {
    console.log('Navigating to PresentationsSpeakerComponent with conference ID:', conference.id); // Debugging log
    this.router.navigate([`/eventos-academicos/conferencias/ponente/${conference.id}`]);
  }
}