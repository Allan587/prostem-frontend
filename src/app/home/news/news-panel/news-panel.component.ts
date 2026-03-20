
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Add MatSnackBarModule
import { Router } from '@angular/router';
import { NewsService, NewsItem } from '../data-access/news-service.service';
import { AuthService } from '../../../auth/data-access/auth.service';


@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule // Add this import
  ],
  templateUrl: './news-panel.component.html',
  styleUrl: './news-panel.component.css'
})
export class NewsPanelComponent implements OnInit {
  newsList: NewsItem[] = [];
  allNewsList: NewsItem[] = [];
  filteredNewsList: NewsItem[] = [];
  isLoading = true;
  userId: string | null = null;
  expandedNewsIds: Set<string> = new Set();
  selectedFilter = 'all';

  filterOptions = [
    { value: 'all', label: 'Todas las noticias' },
    { value: 'mine', label: 'Mis noticias' }
  ];

  constructor(
    private newsService: NewsService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar // Make sure this is properly injected
  ) {
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser()) {
      this.userId = currentUser()?.uid || null;
    }
  }
  async ngOnInit(): Promise<void> {
    await this.loadNews();
  }

  async loadNews(): Promise<void> {
    try {
      this.isLoading = true;
      this.allNewsList = await this.newsService.getAllNews();
      this.applyFilter(); // Apply the current filter
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilter(): void {
    if (this.selectedFilter === 'mine') {
      // Show only news created by current user
      this.filteredNewsList = this.allNewsList.filter(news => 
        news.creatorId === this.userId
      );
    } else {
      // Show all news
      this.filteredNewsList = [...this.allNewsList];
    }
    
    // Update the displayed list
    this.newsList = this.filteredNewsList;
    
    console.log(`Filter applied: ${this.selectedFilter}`);
    console.log(`Showing ${this.newsList.length} of ${this.allNewsList.length} news items`);
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  createNews(): void {
    this.router.navigate(['/noticias/crear']);
  }

  getImageUrl(imagePath: string): string {
    return this.newsService.getImageUrl(imagePath);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.error('Failed to load image:', target.src);
      target.style.display = 'none';
    }
  }

  onImageLoad(event: Event, imagePath: string): void {
    console.log('Successfully loaded image:', imagePath);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  isContentTruncated(content: string): boolean {
    return content.length > 200;
  }

  toggleContent(news: NewsItem): void {
    if (!news.id) return;
    
    if (this.expandedNewsIds.has(news.id)) {
      this.expandedNewsIds.delete(news.id);
    } else {
      this.expandedNewsIds.add(news.id);
    }
  }

  isExpanded(newsId?: string): boolean {
    return newsId ? this.expandedNewsIds.has(newsId) : false;
  }

  editNews(news: NewsItem): void {
    console.log('Edit news:', news);
    
    // Navigate to edit page
    this.router.navigate(['/noticias/editar', news.id]);
  }

  deleteNews(news: NewsItem): void {
    console.log('Delete news:', news);
    
    const confirmDialog = confirm(`¿Estás seguro de que quieres eliminar la noticia "${news.title}"?`);
    
    if (confirmDialog) {
      this.performDelete(news);
    }
  }

  private async performDelete(news: NewsItem): Promise<void> {
    try {
      if (!news.id) {
        this.snackBar.open('Error: ID de noticia no válido', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      this.snackBar.open('Eliminando noticia...', '', {
        duration: 0
      });

      await this.newsService.deleteNews(news.id);

      this.allNewsList = this.allNewsList.filter(n => n.id !== news.id);
      this.applyFilter();

      this.snackBar.dismiss();
      this.snackBar.open('Noticia eliminada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });

    } catch (error) {
      console.error('Error deleting news:', error);
      this.snackBar.dismiss();
      this.snackBar.open('Error al eliminar la noticia', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }
}