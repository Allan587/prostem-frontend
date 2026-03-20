import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConferenceService } from '../../data-access/conference.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-view-revision-form',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule], // Import MatProgressSpinnerModule
  templateUrl: './view-revision-form.component.html',
  styleUrls: ['./view-revision-form.component.css']
})
export class ViewRevisionFormComponent implements OnInit {
  form: any = null; // Store the form data
  isLoading = true; // Loading state
  conferenceId: string | null = null; // Store the conference ID

  constructor(
    private route: ActivatedRoute,
    private conferenceService: ConferenceService
  ) {}

  ngOnInit(): void {
    const formId = this.route.snapshot.paramMap.get('formId');
    this.conferenceId = this.route.snapshot.queryParamMap.get('conferenceId'); // Retrieve the conferenceId from query parameters
    if (formId) {
      this.fetchForm(formId);
    }
  }

  // Fetch the form by ID
  async fetchForm(formId: string): Promise<void> {
    try {
      this.isLoading = true;
      this.form = await this.conferenceService.getFormById(formId);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Helper method to extract questions from the form
  getQuestions(form: any): any[] {
    return Object.keys(form)
      .filter((key) => !isNaN(Number(key))) // Filter numeric keys (questions)
      .map((key) => form[key]); // Map to question objects
  }

  // Helper method to extract options from a question
  getOptions(options: any): string[] {
    return Object.keys(options)
      .sort((a, b) => Number(a) - Number(b)) // Sort options by key
      .map((key) => options[key]); // Map to option strings
  }
}