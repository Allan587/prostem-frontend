// Update: src/app/home/news/create-news/create-news.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router'; // Add ActivatedRoute
import { NewsService, NewsItem } from '../data-access/news-service.service';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'app-create-news',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './create-news.component.html',
  styleUrl: './create-news.component.css'
})
export class CreateNewsComponent implements OnInit {
  newsForm: FormGroup;
  selectedFiles: File[] = [];
  isSubmitting = false;
  userId: string | null = null;
  
  // Edit mode properties
  isEditMode = false;
  newsId: string | null = null;
  existingNews: NewsItem | null = null;
  existingImages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute // Add this
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser()) {
      this.userId = currentUser()?.uid || null;
    }
  }

  async ngOnInit(): Promise<void> {
    // Check if we're in edit mode
    this.newsId = this.route.snapshot.paramMap.get('id');
    
    if (this.newsId) {
      this.isEditMode = true;
      await this.loadNewsForEdit();
    }
  }

  async loadNewsForEdit(): Promise<void> {
    try {
      if (!this.newsId) return;

      this.existingNews = await this.newsService.getNewsById(this.newsId);

      // Check if current user owns this news
      if (this.existingNews.creatorId !== this.userId) {
        this.snackBar.open('No tienes permisos para editar esta noticia', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.router.navigate(['/noticias']);
        return;
      }

      // Populate form with existing data
      this.newsForm.patchValue({
        title: this.existingNews.title,
        content: this.existingNews.content
      });

      // Store existing images
      this.existingImages = [...(this.existingNews.imageLinks || [])];

    } catch (error) {
      console.error('Error loading news for edit:', error);
      this.snackBar.open('Error al cargar la noticia', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.router.navigate(['/noticias']);
    }
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      this.snackBar.open('Solo se permiten archivos de imagen (JPEG, PNG, GIF)', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Validate file sizes (5MB limit)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      this.snackBar.open('Las imágenes deben ser menores a 5MB', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Check total images limit (existing + new)
    const totalImages = this.existingImages.length + files.length;
    if (totalImages > 10) {
      this.snackBar.open(`Máximo 10 imágenes permitidas. Ya tienes ${this.existingImages.length}`, 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.selectedFiles = files;
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.existingImages.splice(index, 1);
    }
  }

  getImageUrl(imagePath: string): string {
    return this.newsService.getImageUrl(imagePath);
  }

  async onSubmit(): Promise<void> {
    if (this.newsForm.invalid || !this.userId) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.isEditMode && this.newsId) {
        await this.updateNews();
      } else {
        await this.createNews();
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  private async createNews(): Promise<void> {
    const formData = new FormData();
    formData.append('title', this.newsForm.get('title')?.value);
    formData.append('content', this.newsForm.get('content')?.value);
    formData.append('creatorId', this.userId!);

    // Append new images
    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    await this.newsService.createNews(formData);

    this.snackBar.open('Noticia creada exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });

    this.router.navigate(['/noticias']);
  }

  private async updateNews(): Promise<void> {
    const formData = new FormData();
    formData.append('title', this.newsForm.get('title')?.value);
    formData.append('content', this.newsForm.get('content')?.value);
    formData.append('creatorId', this.userId!);
    
    // Send existing images to keep
    formData.append('existingImages', JSON.stringify(this.existingImages));

    // Append new images
    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    await this.newsService.updateNews(this.newsId!, formData);

    this.snackBar.open('Noticia actualizada exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });

    this.router.navigate(['/noticias']);
  }

  cancel(): void {
    this.router.navigate(['/noticias']);
  }
}