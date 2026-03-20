import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStateService } from "../../shared/auth-state.service";
import { catchError, firstValueFrom, interval, map, of, takeWhile, timeout } from "rxjs";
import { AuthService } from "../../auth/data-access/auth.service";

export const privateGuard = (): CanActivateFn => {
  return () => {

    const router = inject(Router);
    const authState = inject(AuthStateService)

    if (authState.isLogged()) {
      console.log(true);
      return true
    }

    return authState.authState$.pipe(
      map(state => {
        if (!state) {
          router.navigateByUrl('/auth/sign-in');
          return false;
        }
        return true;
      })
    );
  }
}


// export const privateGuard: CanActivateFn = async () => {
//   const authService = inject(AuthService);

//   await waitForAuthReady(authService);

//   const user = authService.getCurrentUser()();
//   console.log(user);
//   return !!user;

// }

// // Utilidad para esperar a que authReady sea true
// async function waitForAuthReady(authService: AuthService): Promise<void> {
//   return firstValueFrom(
//     interval(50).pipe(
//       map(() => authService.isAuthResolved()()),
//       takeWhile((ready) => !ready, true) // parar cuando sea true
//     )
//   ).then(() => { });
// }

export const publicGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService)

    return authState.authState$.pipe(
      map(state => {
        if (state) {
          router.navigateByUrl('/home');
          return false;
        }
        return true;
      })
    );
  }
}