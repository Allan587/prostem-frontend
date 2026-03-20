import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, firstValueFrom, Observable, tap, throwError } from 'rxjs';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseError } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  #http = inject(HttpClient);
  private apiURL = environment.API_URL;
  readonly users = signal<IUserProfile[]>([]);
  loadingUsers = signal<boolean>(true);

  getUsers = toSignal(
    this.#http.get<IUserProfile[]>(`${this.apiURL}users`).pipe(
      tap(users => {
        this.users.set(users)
        this.loadingUsers.set(false)
      }),
      catchError(error => {
        this.loadingUsers.set(false);
        return throwError(() => error);
      })
    ),
    { initialValue: [] }
  );

  getUserById(uid: string): Observable<IUserProfile> {
    return this.#http.get<IUserProfile>(`${this.apiURL}users/${uid}`);
  }

  getUsersByUIDs(uids: string[]): Promise<any[]> {
    const params = new HttpParams({ fromObject: { uids } });
    return firstValueFrom(this.#http.get<any[]>(`${this.apiURL}users-from-list`, { params }));
  }

  updateUserProfile(uid: string, form: FormData): Promise<any> {
    try {
      return firstValueFrom(this.#http.post(`${this.apiURL}update-profile/${uid}`, form));
    } catch (error: any) {
      console.log('Error de login con Firebase Auth:', error);
      if (error instanceof FirebaseError) {
        console.log(error.code);
      }
      throw error;
    }
  }

  async updateUserRole(uid: string, role: string) {
    try {
      const response = await firstValueFrom(this.#http.put(`${this.apiURL}update-user-role/${uid}`, { role }));
      return response;
    } catch (error) {
      console.error('Error cambiando el rol del usuario:', error);
      throw error;
    }
  }

  async updateUserGrade(uid: string, eventID: string, grade: number | null): Promise<any> {
    const response = await firstValueFrom(this.#http.post(`${this.apiURL}update-user-grade`, { uid, eventID, grade }));
    return response;
  }

  async updateMultipleGrades(eventID: string, updates: { uid: string; grade: number | null }[]): Promise<any> {
    const response = await firstValueFrom(this.#http.post(`${this.apiURL}update-multiple-grades`, { eventID, updates }));
    return response;
  }

  async deleteUser(uid: string) {
    console.log('En el servicio', uid);
    try {
      const response = await firstValueFrom(this.#http.delete(`${this.apiURL}delete-user/${uid}`));
      return response;
    } catch (error) {
      console.error('Error eliminando el evento:', error);
      throw error;
    }
  }

}
