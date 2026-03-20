import { inject, Injectable, Signal, signal } from '@angular/core';
import {
  Auth,
  getIdToken,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';
import { IUserSignIn } from '../../Interfaces/IUserSignIn';
import { HttpClient } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { FirebaseError } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { onAuthStateChanged, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private auth = inject(Auth);
  #http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  //------------------------------------------------
  private authReady = signal(false);
  private currentUser = signal<User | null>(null);


  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.authReady.set(true);
    });
  }

  getCurrentUser(): Signal<User | null> {
    return this.currentUser.asReadonly();
  }

  isAuthResolved(): Signal<boolean> {
    return this.authReady.asReadonly();
  }

  //------------------------------------------------


  async signUpWithEmailAndPassword(formData: FormData) {
    try {
      return this.#http.post(`${this.apiUrl}signUp-emailPassword`, formData)
    } catch (error: any) {
      console.log('Error de login con Firebase Auth:', error);
      if (error instanceof FirebaseError) {
        console.log(error.code);
      }
      throw error;
    }
  }

  async signUpWithGoogle(userData: any) {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, googleProvider);
      const idToken = await getIdToken(userCredential.user);

      const formData = new FormData();
      formData.append('idToken', idToken);
      formData.append('phone', userData.phone);
      formData.append('birthDate', userData.birthDate);
      formData.append('institution', userData.institution);
      formData.append('teachingLevel', userData.teachingLevel);
      formData.append('specializations', JSON.stringify(userData.specializations));

      return this.#http.post(`${this.apiUrl}signUp-Google`, formData)
    } catch (error) {
      //console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  async signInEmailAndPassword(user: IUserSignIn) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, user.email, user.password);
      //const idToken = await getIdToken(userCredential.user);
      const idToken = await userCredential.user.getIdToken();

      // Send the token to the backend
      return this.#http.post(`${this.apiUrl}signIn-emailPassword`, { idToken });
    } catch (error: any) {
      console.log('Error de login con Firebase Auth:', error);
      if (error instanceof FirebaseError) {
        console.log(error.code);
        if (error.code === 'auth/network-request-failed') {
          toast.warning('Hubo un problema con la conexión a la red. Por favor, revisa tu conexión o intenta de nuevo más tarde.');
        } else {
          toast.error('Error de login con Firebase Auth. Por favor vuelve a intentarlo más tarde.');
        }
      }
      throw error;
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const idToken = await getIdToken(userCredential.user);

      // Enviar solo el idToken al backend
      return await lastValueFrom(this.#http.post(`${this.apiUrl}signIn-Google`, { idToken }));
    } catch (error) {
      // if (error instanceof FirebaseError) {
      //   toast.error(`Error al iniciar sesión con Google: ${error.message}`);
      // }
      throw error;
    }

  }
}
