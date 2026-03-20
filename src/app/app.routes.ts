import { Routes } from '@angular/router';
import { publicGuard, privateGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    canActivateChild: [publicGuard()],
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes'),
    title: 'Inicia sesión'
  },
  {
    canActivateChild: [privateGuard],
    path: '',
    loadComponent: () => import('./shared/ui/header.component'),
    loadChildren: () => import('./home/home.routes'),
    title: 'Página de inicio'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];