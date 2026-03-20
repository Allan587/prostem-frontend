import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiURL = environment.API_URL;

  constructor(private http: HttpClient) { }

  async saveSurvey(survey: any) {
    try {
      const response = await firstValueFrom(this.http.post(`${this.apiURL}create-survey`, survey));
      return response;
    } catch (error) {
      console.error('Hubo un error al guardar la encuesta nueva', error);
      throw error;
    }
  }

  async saveSurveyResponse(surveyId: string, { uid, answers }: { uid: string; answers: any }) {
    try {
      const response = await firstValueFrom(this.http.post(`${this.apiURL}surveys/${surveyId}/responses`, { uid, answers }));
      return response;
    } catch (error) {
      console.error('Hubo un error al guardar la respuesta', error);
      throw error;
    }
  }

  async getSurveys() {
    try {
      const response = await firstValueFrom(this.http.get(`${this.apiURL}surveys`));
      return response;
    } catch (error) {
      console.error('Hubo un error al obtener las encuestas', error);
      throw error;
    }
  }

  async getSurveyByID(id: string) {
    try {
      const response = await firstValueFrom(this.http.get(`${this.apiURL}surveys/${id}`));
      return response;
    } catch (error) {
      console.error('Hubo un error al guardar la encuesta solicitada', error);
      throw error;
    }
  }

  async getSurveyResponses(surveyId: string) {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(`${this.apiURL}surveys/${surveyId}/responses`));
      return response
    } catch (error) {
      console.error('Hubo un error al obtener las respuestas de la encuesta', error);
      throw error;
    }
  }

  async getSurveyResponsesToDownload(surveyId: string) {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(`${this.apiURL}surveys/${surveyId}/download-responses`));
      return response
    } catch (error) {
      console.error('Hubo un error al obtener las respuestas de la encuesta para la descarga.', error);
      throw error;
    }
  }

  async deleteSurvey(id: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.delete(`${this.apiURL}delete-survey/${id}`)
      );
      return response;
    } catch (error) {
      console.error('Error eliminando la encuesta:', error);
      throw error;
    }
  }


}
