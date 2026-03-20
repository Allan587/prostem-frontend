import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface NewsItem {
  id?: string;
  title: string;
  content: string;
  creatorId: string;
  creationDate: string;
  creationTime: string;
  imageLinks: string[];
  createdAt: string;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  async createNews(formData: FormData): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}news`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  async getAllNews(): Promise<NewsItem[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<NewsItem[]>(`${this.apiUrl}news`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  async getNewsById(newsId: string): Promise<NewsItem> {
    try {
      const response = await firstValueFrom(
        this.http.get<NewsItem>(`${this.apiUrl}news/${newsId}`)
      );
      return response;
    } catch (error) {
      console.error('Error fetching news by ID:', error);
      throw error;
    }
  }

  getImageUrl(imagePath: string): string {
    // Remove 'api/' from the URL construction since the image route doesn't use /api/
    const fullUrl = `${this.apiUrl.replace('/api/', '/')}${imagePath}`;
    console.log('Generated image URL:', fullUrl); // Debug log
    return fullUrl;
  }

  async deleteNews(newsId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.delete(`${this.apiUrl}news/${newsId}`)
      );
      return response;
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  async updateNews(newsId: string, formData: FormData): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.put(`${this.apiUrl}news/${newsId}`, formData)
      );
      return response;
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }
}