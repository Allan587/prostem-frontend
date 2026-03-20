import { inject, Injectable, Injector, runInInjectionContext, signal } from "@angular/core";
import { Auth, authState, signOut } from "@angular/fire/auth";
import { docData, Firestore } from "@angular/fire/firestore";
import { Observable, of, switchMap } from "rxjs";
import { User as FirebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc } from "firebase/firestore";
import { IAppUser } from "../Interfaces/IAppUser";

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  authResolved = signal(false);
  isLogged = signal<true | false>(false);

  get authState$(): Observable<FirebaseUser | null> {
    return runInInjectionContext(this.injector, () => {
      return authState(this.auth);
    });
  }

  get currentUser$(): Observable<IAppUser | null> {
    return this.authState$.pipe(
      switchMap(user => {
        this.authResolved.set(true);
        if (!user) return of(null);
        return runInInjectionContext(this.injector, () => {
          const ref = doc(this.firestore, 'users', user.uid);
          return docData(ref, { idField: 'uid' }) as Observable<IAppUser>;
        });
      })
    );
  }

  resetPassword(email: string) {
    return runInInjectionContext(this.injector, () => {
      return sendPasswordResetEmail(this.auth, email);
    });
  }

  logOut() {
    this.isLogged.set(false);
    return runInInjectionContext(this.injector, () => {
      return signOut(this.auth);
    });
  }
}