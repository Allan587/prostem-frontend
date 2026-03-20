import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IEvent } from '../../../Interfaces/IEvent';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

export interface IConference {
  id: string;
  title: string;
  startDate: string;
  finishDate: string;
  startTime: string;
  finishTime: string;
  description: string;
  place: string;
}

export type EventCreation = Omit<IEvent, 'id' | 'attendees' | 'survey' | 'registeredUsers'>;

@Injectable({
  providedIn: 'root'
})

export class EventService {
  //private fireStore = inject(Firestore);
  //private eventsCollection = collection(this.fireStore, PATH);
  #http = inject(HttpClient);
  private apiURL = environment.API_URL;
  readonly events = signal<IEvent[]>([]);
  loadingEvents = signal<boolean>(true);

  async createEvent(event: EventCreation) {
    //return addDoc(this.eventsCollection, event);
    try {
      const response = await firstValueFrom(this.#http.post(`${this.apiURL}create-event`, event));
      return response;
    } catch (error) {
      console.error('Error creando evento:', error);
      throw error;
    }
  }

  // getEvents = toSignal((collectionData(this.eventsCollection, { idField: 'id' }) as Observable<IEvent[]>).pipe(
  //   tap(() => {
  //     this.loadingEvents.set(false);
  //   }),
  //   catchError(error => {
  //     this.loadingEvents.set(false);
  //     return throwError(() => error)
  //   })
  // ), { initialValue: [] });

  getEvents = toSignal(
    this.#http.get<IEvent[]>(`${this.apiURL}events`).pipe(
      tap(events => {
        this.events.set(events)
        this.loadingEvents.set(false)
      }),
      catchError(error => {
        this.loadingEvents.set(false);
        return throwError(() => error);
      })
    ),
    { initialValue: [] }
  );

  updateEventLocally(updatedEvent: IEvent) {
    console.log('update locally')
    const updatedList = this.events().map(e =>
      e.id === updatedEvent.id ? updatedEvent : e
    );
    this.events.set(updatedList);
    console.log(this.events())
  }

  async getEventsForCalendar(): Promise<IEvent[]> {
    return await firstValueFrom(this.#http.get<IEvent[]>(`${this.apiURL}events`));
  }

  async getEventByID(id: string): Promise<IEvent> {
    // const docReference = doc(this.eventsCollection, id);
    // return getDoc(docReference)
    try {
      const response = await firstValueFrom(this.#http.get<IEvent>(`${this.apiURL}events/${id}`));
      return response;
    } catch (error) {
      console.error('Error obteniendo evento:', error);
      throw error;
    }
  }

  async updateEvent(event: EventCreation, id: string): Promise<any> {
    try {
      const response = await firstValueFrom(this.#http.put(`${this.apiURL}edit-event/${id}`, event));
      return response;
    } catch (error) {
      console.error('Error editando evento:', error);
      throw error;
    }
  }

  async registerUserToOpenEvent(eventId: string, uid: string): Promise<any> {
    try {
      const body = { userId: uid }
      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}register-to-event/${eventId}`, body)
      );
      return response;
    } catch (error) {
      console.error('Error inscribiéndose al evento:', error);
      throw error;
    }
  }

  async unRegisterUserFromEvent(eventId: string, uids: string[]): Promise<any> {
    console.log('UIDS en servicio', uids);
    try {
      const body = { uids };
      console.log('BODY en servicio', body);

      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}unregister-from-event/${eventId}`, body)
      );
      return response;
    } catch (error) {
      console.error('Error al desmatricular usuario(s) del evento:', error);
      throw error;
    }
  }

  async requestRegistrationToRestrictedEvent(eventId: string, uid: string): Promise<any> {
    try {
      const body = { userId: uid };
      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}request-registration/${eventId}`, body)
      );
      return response;
    } catch (error) {
      console.error('Error solicitando inscripción:', error);
      throw error;
    }
  }

  async processRestrictedRegistration(eventId: string, userId: string, action: 'approve' | 'reject'): Promise<any> {
    try {
      const body = { action };
      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}process-registration/${eventId}/${userId}`, body)
      );
      return response;
    } catch (error) {
      console.error(`Error en la solicitud '${action}':`, error);
      throw error;
    }
  }

  async joinWaitingList(eventId: string, uid: string) {
    const body = { userId: uid };
    const response = await firstValueFrom(
      this.#http.post(`${this.apiURL}add-user-to-waiting-list/${eventId}`, body)
    );
    return response;
  }

  async processWaitingListRequest(eventId: string, userId: string, action: 'approve' | 'reject'): Promise<any> {
    try {
      const body = { action };
      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}process-waiting-list/${eventId}/${userId}`, body)
      );
      return response;
    } catch (error) {
      console.error(`Error en la solicitud '${action}':`, error);
      throw error;
    }
  }

  userUIDListener(): string | null {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        return user.uid;
      } else {
        return null;
      }
    });
    return null;
  }

  async deleteEvent(id: string): Promise<any> {
    // const docReference = doc(this.eventsCollection, id);
    // return deleteDoc(docReference)
    try {
      const response = await firstValueFrom(
        this.#http.delete(`${this.apiURL}delete-event/${id}`)
      );
      return response;
    } catch (error) {
      console.error('Error eliminando el evento:', error);
      throw error;
    }
  }

  async sendCertificates(eventId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}events/${eventId}/send-certificates`, {})
      );
      console.log('Certificates sent successfully:', response);
    } catch (error) {
      console.error('Error sending certificates:', error);
      throw error;
    }
  }

  async uploadSignedCertificates(eventId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('signedCertificates', file);
  
    try {
      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}events/${eventId}/upload-event-signed-certificates`, formData)
      );
      console.log('Signed certificates uploaded successfully:', response);
    } catch (error) {
      console.error('Error uploading signed certificates:', error);
      throw error;
    }
  }

  async generateCertificates(eventId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.#http.post(`${this.apiURL}events/${eventId}/generate-certificates`, {}, { responseType: 'blob' })
      );
  
      // Create a download link for the ZIP file
      const blob = new Blob([response], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificados_event_${eventId}.zip`;
      link.click();
      window.URL.revokeObjectURL(url); // Clean up the URL
    } catch (error) {
      console.error('Error generating certificates:', error);
      throw error;
    }
  }

  async getConferencesForCalendar(): Promise<IConference[]> {
    try {
      const response = await firstValueFrom(this.#http.get<IConference[]>(`${this.apiURL}conferences-for-calendar`));
      return response;
    } catch (error) {
      console.error('Error obteniendo conferencias para calendario:', error);
      throw error;
    }
  }
}
