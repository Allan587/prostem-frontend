import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  #http = inject(HttpClient);
  private apiURL = environment.API_URL;

  constructor() { }

  async getGeneralStats(months: number = 6): Promise<any> {
    try {
      const response = await firstValueFrom(this.#http.get(`${this.apiURL}stats?months=${months}`));
      return response;
    } catch (error) {
      console.error('Hubo un error al obtener las estadísticas generales:', error);
      throw error;
    }
  }

  async getUsersStatistics(): Promise<any> {
    try {
      const response = await firstValueFrom(this.#http.get<any>(`${this.apiURL}stats/users`));
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  }

  async getEventsStatistics(): Promise<any> {
    try {
      const response = await firstValueFrom(this.#http.get<any>(`${this.apiURL}stats/activities`));
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas de los eventos:', error);
      throw error;
    }
  }
}
