import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ConferenceService } from '../../data-access/conference.service';
import { AuthService } from '../../../../../auth/data-access/auth.service';
import { Router } from '@angular/router';


import { ModalComponent } from '../../../../modal/modal.component';
import { toast } from 'ngx-sonner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Define the structure of the form and its questions
interface FormQuestion {
  type: 'single' | 'multiple' | 'text'; // The type of the question
  question: string; // The question text
  options?: { [key: string]: string }; // Options for 'single' or 'multiple' types
}

interface Form {
  [key: string]: FormQuestion; // Each question is a map with an incremental key
}

@Component({
  selector: 'app-fill-revision-form',
  templateUrl: './fill-revision-form.component.html',
  styleUrls: ['./fill-revision-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    ModalComponent, 
    MatProgressSpinnerModule 
  ]
})
export class FillRevisionFormComponent implements OnInit {
  presentationId: string | null = null;
  conferenceId: string | null = null;
  formId: string | null = null; // Holds the form ID
  form: Form | null = null; // Holds the questions retrieved from the form
  answers: any = {}; // Holds the user's answers
  finalScore: string | null = null; // Holds the value of the final score question
  requiredChanges: string | null = null; // Holds the value of the required changes text
  reviewerId: string | null = null; // Holds the ID of the reviewer
  overallResult: string | null = null;

  isSavingModalOpened: boolean = false;
  isSubmittingForm: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private conferenceService: ConferenceService,
    private authService: AuthService, // Inject AuthService to get the current user
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Get the presentationId from the route parameters
    this.presentationId = this.route.snapshot.paramMap.get('presentationId');
    console.log('ngOnInit: presentationId:', this.presentationId); // Debugging statement

    this.route.queryParams.subscribe((params) => {
      this.conferenceId = params['conferenceId'];
      console.log('ngOnInit: conferenceId:', this.conferenceId); // Debugging statement
    });

    if (this.presentationId) {
      await this.loadForm(this.presentationId);
    }

    const currentUser = this.authService.getCurrentUser();
    if (currentUser()) {
      this.reviewerId = currentUser()?.uid || null;
    } else {
      console.error('Error: Unable to retrieve the current user.');
      return;
    }
    
  }

  async loadForm(presentationId: string): Promise<void> {
    try {
      console.log('loadForm: Fetching form for presentationId:', presentationId); // Debugging statement
  
      // Fetch the form data
      const formData = await this.conferenceService.getFormForPresentation(presentationId);
  
      this.overallResult = formData.overallResult;

      // Extract formId and form data
      this.formId = formData.formId;
      console.log('loadForm: formId:', this.formId); // Debugging statement
  
      // Filter out only the fields with numeric keys (questions)
      this.form = Object.keys(formData)
        .filter((key) => !isNaN(Number(key))) // Keep only numeric keys
        .reduce((acc, key) => {
          acc[key] = formData[key];
          return acc;
        }, {} as Form);
  
      console.log('loadForm: form:', this.form); // Debugging statement
  
      // Initialize answers for multiple selection questions
      if (this.form) {
        Object.keys(this.form).forEach((key) => {
          if (this.form && this.form[key].type === 'multiple') {
            this.answers[key] = {}; // Initialize as an empty object
          }
        });
        console.log('loadForm: Initialized answers for multiple selection:', this.answers); // Debugging statement
      }
    } catch (error) {
      console.error('Error loading form:', error);
      alert('An error occurred while loading the form. Please try again later.'); // Notify the user
    }
  }

  // Handle changes to the answers
  onAnswerChange(questionId: string, answer: any): void {
    if (!this.answers[questionId]) {
      this.answers[questionId] = {};
    }
    this.answers[questionId] = answer;
    console.log('onAnswerChange: Updated answers:', this.answers); // Debugging statement
  }

  // Handle changes to the final score question
  onFinalScoreChange(value: string): void {
    this.finalScore = value;
    console.log('onFinalScoreChange: finalScore:', this.finalScore); // Debugging statement

    if (value !== 'Aceptada con cambios requeridos') {
      this.requiredChanges = null;
    }
  }

  // Save the filled form
  async saveForm(): Promise<void> {

    this.openSavingModal();

    try {
      if (!this.formId || !this.presentationId || !this.reviewerId) {
        console.error('Form ID, Presentation ID, or Reviewer ID is missing');
        alert('Error: Form ID, Presentation ID, or Reviewer ID is missing. Please reload the page or contact support.');
        return;
      }
  
      if (!this.form) {
        console.error('Form data is missing');
        alert('Error: Form data is missing. Please reload the page or contact support.');
        return;
      }
  
      const formattedAnswers = Object.keys(this.form).map((key) => {
        const question = this.form![key];
        const answer = this.answers[key];
  
        if (question.type === 'multiple') {
          const selectedAnswers = Object.keys(answer || {})
            .filter((optionKey) => answer[optionKey])
            .map((optionKey) => question.options?.[optionKey] || '');
          return {
            question: question.question,
            type: question.type,
            options: question.options,
            answer: selectedAnswers,
          };
        } else if (question.type === 'text') {
          return {
            question: question.question,
            type: question.type,
            answer: answer,
          };
        } else {
          return {
            question: question.question,
            type: question.type,
            options: question.options,
            answer: answer,
          };
        }
      });
  
      // Add final score question with required changes if applicable
      const finalScoreQuestion: any = {
        question: '¿Cómo califica esta ponencia?',
        type: 'single',
        options: {
          1: 'Aceptada',
          2: 'Aceptada con cambios requeridos',
          3: 'No aceptada',
        },
        answer: this.finalScore,
      };
  
      if (this.finalScore === 'Aceptada con cambios requeridos') {
        finalScoreQuestion.requiredChanges = this.requiredChanges; // Add required changes to the same question
      }
  
      formattedAnswers.push(finalScoreQuestion);
  
      const response = await this.conferenceService.saveFilledForm(this.formId, this.presentationId, this.reviewerId, formattedAnswers);
      console.log('Form saved successfully:', response);
      toast.success('Revisión guardada exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
      this.router.navigate([`/eventos-academicos/conferencias/revisor/ponencias/${this.conferenceId}`]);
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Error al guardar la revisión', {
        duration: 5000,
        position: 'top-center'
      });    
    } finally{
      this.closeSavingModal();
    }
  }

  openSavingModal(): void {
    this.isSavingModalOpened = true;
    this.isSubmittingForm = true;
  }

  closeSavingModal(): void {
    this.isSavingModalOpened = false;
    this.isSubmittingForm = false;
  }
}