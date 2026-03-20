import { CommonModule } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-google-button',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './google-button.component.html',
  styleUrl: './google-button.component.css'
})


export class GoogleButtonComponent {
  @Input() type: 'button' | 'submit' = 'submit';
  @Input() disabled: boolean = false;
  @Input() buttonClicked: 'email-password' | 'google' | null = null;
  @Input() buttonText: 'Iniciar sesión con Google' | 'Registrarse con Google' | 'Registrándose...' = 'Iniciar sesión con Google'

  onClick = output<void>();
  googleIcon = '../../../assets/google-icon.svg'

}
