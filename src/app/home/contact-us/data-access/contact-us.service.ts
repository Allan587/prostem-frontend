import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {
  #http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  async sendContactMessage(data: { recipient: string, subject: string; phone: string; comment: string }) {
    const response = await firstValueFrom(this.#http.post(`${this.apiUrl}contact-us`, data));
    return response;
  }
}
