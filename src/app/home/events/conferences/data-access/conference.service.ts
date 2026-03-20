import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { error } from 'console';

@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  async createConference(userId: string | null, conferenceData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}conferences/${userId}`, conferenceData)
      );
      return response;
    } catch (error) {
      console.error('Error creating conference:', error);
      throw error;
    }
  }

  async getAllConferences(userId: string | null): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}conferences/${userId}`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching conferences:', error);
      throw error;
    }
  }

  async getAllConferencesGeneral(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}conferences`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching all conferences:', error);
      throw error;
    }
  }

  async getConferenceById(conferenceId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}conferences/getConference/${conferenceId}`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching conference by ID:', error);
      throw error;
    }
  }
  
  async updateConference(conferenceId: string, conferenceData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.put(`${this.apiUrl}conferences/${conferenceId}`, conferenceData)
      );
      return response;
    } catch (error) {
      console.error('Error updating conference:', error);
      throw error;
    }
  }

  async getAllPresentations(): Promise<any[]> {
    try{
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}conferences/presentations`)
      );
      return response;
    }catch(error){
      console.error('error fetching the presentations', error);
      throw error;
    }
  }

  async getAllPresentationsByConference(conferenceId: string): Promise<any[]> {
    try{
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}conferences/presentations/${conferenceId}`)
      );
      return response;
    }catch(error){
      console.error('error fetching the presentations', error);
      throw error;
    }
  }

  async getAllReviewers(): Promise<any[]> {
    try {
      console.log('Service: Calling getAllReviewers endpoint');
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}reviewers`)
      );
      console.log('Service: Response received:', response);
      
      // The response is already an array, not an object with reviewers property
      if (Array.isArray(response)) {
        return response;
      } else {
        console.error('Expected array but got:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all reviewers:', error);
      throw error;
    }
  }
  async createReviewer(reviewerData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}reviewers`, reviewerData) // Call the /reviewers endpoint
      );
      return response;
    } catch (error) {
      console.error('Error creating reviewer:', error);
      throw error;
    }
  }

  async updateReviewer(reviewerId: string, reviewerData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.put(`${this.apiUrl}reviewers/${reviewerId}`, reviewerData) // Call the /reviewers/:id endpoint
      );
      return response;
    } catch (error) {
      console.error('Error updating reviewer:', error);
      throw error;
    }
  }

  async deleteReviewer(reviewerId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.delete(`${this.apiUrl}reviewers/${reviewerId}`) // Call the /reviewers/:id endpoint
      );
      return response;
    } catch (error) {
      console.error('Error deleting reviewer:', error);
      throw error;
    }
  }

  async toggleConferenceActive(conferenceId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.patch(`${this.apiUrl}conferences/${conferenceId}/toggleActive`, {})
      );
      return response;
    } catch (error) {
      console.error('Error toggling conference active status:', error);
      throw error;
    }
  }

  async createPresentation(presentationData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}presentations`, presentationData)
      );
      return response;
    } catch (error) {
      console.error('Error creating presentation:', error);
      throw error;
    }
  }

  async isReviewerAssigned(reviewerId: string, presentationId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ isAssigned: boolean }>(`${this.apiUrl}isAssigned`, {
          params: { reviewerId, presentationId }
        })
      );
      return response.isAssigned;
    } catch (error) {
      console.error('Error checking if reviewer is assigned:', error);
      return false; // Return false instead of throwing error to prevent breaking the flow
    }
  }

  async getNonReviewers(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ nonReviewers: any[] }>(`${this.apiUrl}non-reviewers`)
      );
      return response.nonReviewers;
    } catch (error) {
      console.error('Error fetching non-reviewers:', error);
      throw error;
    }
  }

  async makeUserReviewer(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.patch(`${this.apiUrl}make-reviewer/${userId}`, {})
      );
      return response;
    } catch (error) {
      console.error('Error making user a reviewer:', error);
      throw error;
    }
  }

  async toggleReviewerAssignment(reviewerId: string, presentationId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.patch(`${this.apiUrl}toggleAssignment`, { reviewerId, presentationId })
      );
      return response;
    } catch (error) {
      console.error('Error toggling reviewer assignment:', error);
      throw error;
    }
  }

  async getUserConferences(userId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}user-conferences/${userId}`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching user conferences:', error);
      throw error;
    }
  }

  async getUserConferencePresentations(userId: string, conferenceId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}user-conference-presentations`, {
          params: { userId, conferenceId }
        })
      );
      return response;
    } catch (error) {
      console.error('Error fetching user conference presentations:', error);
      throw error;
    }
  }

  async createPresentationWithDocuments(formData: FormData): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}presentations`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error creating presentation with documents:', error);
      throw error;
    }
  }

  async getAreas(): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ names: string[] }>(`${this.apiUrl}areas/names`) // Use the correct endpoint
      );
      return response.names; // Return the names array
    } catch (error) {
      console.error('Error fetching areas:', error);
      throw error;
    }
  }

  async createArea(area: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}areas`, { area }) // Call the /api/areas endpoint
      );
      return response;
    } catch (error) {
      console.error('Error creating area:', error);
      throw error;
    }
  }
  
  async getReviewersByPresentation(presentationId: string, area?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (area) {
        params.area = area;
      }
  
      const response = await firstValueFrom(
        this.http.get<{ reviewers: any[] }>(`${this.apiUrl}reviewers-by-presentation/${presentationId}`, { params })
      );
      return response.reviewers;
    } catch (error) {
      console.error('Error fetching reviewers by presentation:', error);
      throw error;
    }
  }

  

  async getPresentationAreaAndTitle(presentationId: string): Promise<{ area: string; title: string }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ area: string; title: string }>(`${this.apiUrl}presentations/area-title/${presentationId}`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching presentation area and title:', error);
      throw error;
    }
  }

  // Method to view the document - FIXED
viewDocument(conferenceCreationId: string, presentationCreationId: string): string {
  return `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/view`;
}

// Method to download the document - FIXED
downloadDocument(conferenceCreationId: string, presentationCreationId: string): void {
  const downloadUrl = `${this.apiUrl.replace(/\/$/, '')}/presentations/${conferenceCreationId}/${presentationCreationId}/download`;
  window.open(downloadUrl, '_blank');
}

  async saveForm(form: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}forms`, form) // Call the /api/forms endpoint
      );
      return response;
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    }
  }

  async getAllForms(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}forms`) // Call the /api/forms endpoint
      );
      return response;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  }

  async getFormById(formId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}forms/${formId}`) // Call the /api/forms/:id endpoint
      );
      return response;
    } catch (error) {
      console.error('Error fetching form by ID:', error);
      throw error;
    }
  }

  async isFormAssignedToConference(conferenceId: string, formId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ isAssigned: boolean }>(
          `${this.apiUrl}conferences/${conferenceId}/forms/${formId}/assigned`
        )
      );
      return response.isAssigned;
    } catch (error) {
      console.error('Error checking if form is assigned to conference:', error);
      throw error;
    }
  }
  
  async toggleFormAssignment(conferenceId: string, formId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.patch(`${this.apiUrl}conferences/${conferenceId}/forms/${formId}/toggle-assignment`, {})
      );
      return response;
    } catch (error) {
      console.error('Error toggling form assignment:', error);
      throw error;
    }
  }

  async getReviewerConferences(userId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ conferences: any[] }>(`${this.apiUrl}reviewer-conferences/${userId}`)
      );
      return response.conferences;
    } catch (error) {
      console.error('Error fetching reviewer conferences:', error);
      throw error;
    }
  }

  async getReviewerPresentations(userId: string, conferenceId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ presentations: any[] }>(`${this.apiUrl}reviewer-presentations`, {
          params: { userId, conferenceId }
        })
      );
      return response.presentations;
    } catch (error) {
      console.error('Error fetching reviewer presentations:', error);
      throw error;
    }
  }

  async getFormForPresentation(presentationId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ formId: string; overallResult: string; [key: string]: any }>(
          `${this.apiUrl}presentations/${presentationId}/form`
        )
      );
      return response; // Return the entire response, including formId, overallResult, and form data
    } catch (error) {
      console.error('Error fetching form for presentation:', error);
      throw error;
    }
  }

  async saveFilledForm(formId: string, presentationId: string, reviewerId: string, answers: any): Promise<any> {
    try {
      const payload = {
        formId,
        presentationId,
        reviewerId,
        answers,
      };
  
      console.log('saveFilledForm: Payload:', payload); // Debugging statement
  
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}filled-forms`, payload)
      );
      return response;
    } catch (error) {
      console.error('Error saving filled form:', error);
      throw error;
    }
  }

  async updateResultsSent(conferenceId: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.http.patch<{ resultsSent: number }>(`${this.apiUrl}conferences/${conferenceId}/update-results`, {})
      );
      return response.resultsSent;
    } catch (error) {
      console.error('Error updating resultsSent:', error);
      throw error;
    }
  }

  // In conference.service.ts
  async uploadCorrectedDocument(conferenceCreationId: string, presentationCreationId: string, formData: FormData): Promise<any> {
    try {
      // ADD DEBUG LOGS
      console.log('=== SERVICE DEBUG ===');
      console.log('conferenceCreationId:', conferenceCreationId);
      console.log('presentationCreationId:', presentationCreationId);
      console.log('Calling URL:', `${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-corrected`);
      
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-corrected`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error uploading corrected document:', error);
      throw error;
    }
  }

  async updatePresentationOverallResult(presentationId: string, overallResult: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.patch(`${this.apiUrl}presentations/${presentationId}/overall-result`, { overallResult })
      );
      return response;
    } catch (error) {
      console.error('Error updating presentation overall result:', error);
      throw error;
    }
  }

  // Method to upload a presentation document
  async uploadPresentationDocument(conferenceCreationId: string, presentationCreationId: string, formData: FormData): Promise<any> {
    try {
      console.log('=== SERVICE UPLOAD PRESENTATION DEBUG ===');
      console.log('conferenceCreationId:', conferenceCreationId);
      console.log('presentationCreationId:', presentationCreationId);
      console.log('Calling URL:', `${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-presentation`);
  
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-presentation`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error uploading presentation document:', error);
      throw error;
    }
  }

  // Method to upload a payment receipt document
  async uploadPaymentReceipt(conferenceCreationId: string, presentationCreationId: string, formData: FormData): Promise<any> {
    try {
      console.log('=== SERVICE UPLOAD PAYMENT DEBUG ===');
      console.log('conferenceCreationId:', conferenceCreationId);
      console.log('presentationCreationId:', presentationCreationId);
      console.log('Calling URL:', `${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-payment`);
  
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-payment`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error uploading payment receipt:', error);
      throw error;
    }
  }

// Method to update payment status
async updatePaymentStatus(presentationId: string, paidStatus: boolean): Promise<any> {
  try {
    const response = await firstValueFrom(
      this.http.patch(`${this.apiUrl}presentations/${presentationId}/payment-status`, { paid: paidStatus })
    );
    return response;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

async getAllConferencesExcludingUser(userId: string): Promise<any[]> {
  try {
    const response = await firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}conferences`, { params: { userId } })
    );
    return response;
  } catch (error) {
    console.error('Error fetching conferences excluding user:', error);
    throw error;
  }
}

  async createReviewerUser(reviewerData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}create-reviewer`, reviewerData)
      );
      return response;
    } catch (error) {
      console.error('Error creating reviewer user:', error);
      throw error;
    }
  }

  async uploadFinalDocument(conferenceCreationId: string, presentationCreationId: string, formData: FormData): Promise<any> {
    try {
      console.log('=== SERVICE UPLOAD FINAL DEBUG ===');
      console.log('conferenceCreationId:', conferenceCreationId);
      console.log('presentationCreationId:', presentationCreationId);
      console.log('Calling URL:', `${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-final`);
  
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}presentations/${conferenceCreationId}/${presentationCreationId}/upload-final`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error uploading final document:', error);
      throw error;
    }
  }

async downloadBulkCertificates(conferenceId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}conferences/${conferenceId}/generate-bulk-certificates`, {}, {
          responseType: 'blob' // Important: specify blob response type for file download
        })
      );
      
      // Create blob URL and trigger download
      const blob = new Blob([response], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificados_conferencia_${conferenceId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading bulk certificates:', error);
      throw error;
    }
  }

  async uploadSignedCertificates(conferenceId: string, zipFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('signedCertificates', zipFile);
      
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}conferences/${conferenceId}/upload-signed-certificates`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error uploading signed certificates:', error);
      throw error;
    }
  }

  // Add this method to conference.service.ts
  async sendCertificates(conferenceId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}conferences/${conferenceId}/send-certificates`, {})
      );
      return response;
    } catch (error) {
      console.error('Error sending certificates:', error);
      throw error;
    }
  }

  async getUserData(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}users/${userId}`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
}

