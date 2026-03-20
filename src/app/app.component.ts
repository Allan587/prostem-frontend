import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner'
import { AuthStateService } from './shared/auth-state.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from './auth/data-access/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster, MatProgressSpinner],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ProSTEM';
  //readonly authStateService = inject(AuthStateService)
  private authService = inject(AuthService);

  readonly authReady = this.authService.isAuthResolved();

}
