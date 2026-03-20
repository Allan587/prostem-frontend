import { Component, inject } from '@angular/core';
import { AuthStateService } from '../auth-state.service';
import { Router, RouterModule } from '@angular/router';
import { toast } from 'ngx-sonner';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-header',
  imports: [RouterModule, MatMenuModule, MatIconModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export default class HeaderComponent {

  private authState = inject(AuthStateService);
  private router = inject(Router);
  logoPath = '../../../../assets/ProSTEM-logo-with-label.jpg';

  homeTooltipText = 'Ir al inicio';
  myAccountTooltipText = 'Ver mis datos';
  contactusTooltipText = '¡Envíanos tus comentarios!';
  logoutTooltipText = 'Cierra la sesión actual';

  tooltipDuration = 25;

  async logOut() {
    try {
      await this.authState.logOut();
      this.router.navigateByUrl('auth/sign-in');
      toast.info('¡Hasta pronto!')
    } catch (error) {
      console.log(error)
      toast.error('Ups, algo salió mal...')
    }
  }
}
