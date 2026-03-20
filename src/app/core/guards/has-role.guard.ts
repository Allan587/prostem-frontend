import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../../shared/auth-state.service';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';

export const hasRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthStateService)
  const roles = route.data?.['roles'] as string[];
  const router = inject(Router)

  return authService.currentUser$.pipe(
    map(user => {
      if (!user) {
        router.navigateByUrl('/auth/sign-in');
        return false;
      }

      if (!roles.includes(user.role)) {
        toast.warning('¡No tienes permiso para acceder a ese módulo!')
        router.navigateByUrl('/home');
        return false;
      }

      return true;
    })
  );
};
