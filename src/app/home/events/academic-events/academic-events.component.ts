import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardComponent } from '../../card/card.component';
import { ICard } from '../../../Interfaces/ICard';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-academic-events',
  standalone: true,
  imports: [CommonModule, CardComponent, RouterModule],
  templateUrl: './academic-events.component.html',
  styleUrl: './academic-events.component.css'
})
export class AcademicEventsComponent {
  cardList: ICard[] = [
    {
      id: 'conferencias',
      title: 'Conferencias',
      body: 'Conferencias académicas con ponencias',
      icon: 'mic',
      roles: ['admin'],
      routerLink: '/eventos-academicos/conferencias' 
    },
    {
      id: 'eventos-generales',
      title: 'Eventos generales',
      body: 'Talleres, foros, charlas, entre otros...',
      icon: 'event',
      roles: ['admin'],
      routerLink: '/eventos'
    },
  ];
}