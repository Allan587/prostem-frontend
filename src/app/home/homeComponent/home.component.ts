import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component'
import { ICard } from '../../Interfaces/ICard';
import { AuthStateService } from '../../shared/auth-state.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export default class HomeComponent {
  private authStateService = inject(AuthStateService)
  userRole = signal<'admin' | 'user' | null>(null);

  //The icons are taken from the "Material Symbols & Icons" library, see https://fonts.google.com/icons
  cardList: ICard[] = [
    {
      id: 'calendario',
      title: 'Calendario',
      body: 'Ver los eventos disponibles.',
      //icon: '/assets/calendar.svg',
      icon: 'calendar_month',
      roles: ['admin', 'user']
    },
    {
      id: 'mis-cursos',
      title: 'Mis cursos',
      body: 'Ver mi historial de actividades, notas y certificados.',
      // icon: '/assets/closed-book.svg',
      icon: 'school',   //book, collections_bookmark
      roles: ['admin', 'user']
    },
    {
      id: 'estadisticas',
      title: 'Estadísticas',
      body: 'Accede a las estadísticas. Conteos, gráficos y más...',
      // icon: '/assets/pie-chart.svg',
      icon: 'query_stats',
      roles: ['admin']
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      body: 'Gestiona usuarios, cursos y encuestas.',
      // icon: '/assets/gear.svg',
      icon: 'settings',
      roles: ['admin']
    },
    {
      id: 'eventos-academicos',
      title: 'Eventos académicos',
      body: 'Revisa o crea eventos académicos',
      icon: 'local_library',
      roles: ['admin', 'user']
    },
    {
      id: 'noticias',
      title: 'Noticias',
      body: 'Gestiona y visualiza noticias del sistema',
      icon: 'newspaper',
      roles: ['admin', 'user']
    },
  ];

  filteredCards = computed(() =>
    this.cardList.filter(card => card.roles.includes(this.userRole() || 'user'))
  );

  constructor() {
    effect(() => {
      this.authStateService.currentUser$.subscribe(user => {
        if (user?.role === 'admin' || user?.role === 'user') {
          this.userRole.set(user.role);
        }
      });
    });
  }
}
