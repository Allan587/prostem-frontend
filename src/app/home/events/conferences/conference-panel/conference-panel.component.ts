import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../card/card.component';
import { ICard } from '../../../../Interfaces/ICard';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-conference-panel',
  standalone: true,
  imports: [CommonModule, CardComponent, RouterModule],
  templateUrl: './conference-panel.component.html',
  styleUrls: ['./conference-panel.component.css']
})
export class ConferencePanelComponent {
  cardList: ICard[] = [
    {
      id: 'crear-conferencia',
      title: 'Crear nueva conferencia',
      body: '',
      icon: 'add_circle',
      roles: ['admin', 'user'],
      routerLink: '/eventos-academicos/conferencias/nueva' 
    },
    {
      id: 'administrar-conferencias',
      title: 'Administrar conferencias existentes',
      body: '',
      icon: 'manage_accounts',
      roles: ['admin'],
      routerLink: '/eventos-academicos/conferencias/administrador' 
    },
    {
      id: 'conferencias-ponencias',
      title: 'Conferencias disponibles',
      body: '',
      icon: 'event_available',
      roles: ['creator'],
      routerLink: '/eventos-academicos/conferencias/conferences-presentations-creator-list'
    },
    {
      id: 'conferencias-ponente',
      title: 'Conferencias donde tengo ponencias',
      body: '',
      icon: 'list_alt',
      roles: ['creator'],
      routerLink: '/eventos-academicos/conferencias/conferencias-ponente'
    },

    {
      id: 'conferencias-revisor',
      title: 'Conferencias donde soy revisor',
      body: '',
      icon: 'list_alt',
      roles: ['creator'],
      routerLink: '/eventos-academicos/conferencias/formularios-revision/ver'
    }
  ];

  //eventos-academicos/conferencias/conferencias-ponente
}