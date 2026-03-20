import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConferenceService } from '../../data-access/conference.service';
import { ModalComponent } from '../../../../modal/modal.component';
import { toast } from 'ngx-sonner';
import { Router, ActivatedRoute } from '@angular/router'; // Add ActivatedRoute
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-new-revision-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, MatProgressSpinnerModule],
  templateUrl: './new-revision-form.component.html',
  styleUrls: ['./new-revision-form.component.css']
})
export class NewRevisionFormComponent implements OnInit { // Add OnInit
  // Array to store the list of questions
  questions: any[] = [];

  isCreatingModalOpened: boolean = false;
  isSubmittingForm: boolean = false;
  conferenceId: string | null = null; // Add conferenceId property

  constructor(
    private conferenceService: ConferenceService,
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  // Add ngOnInit to get conferenceId from route
  ngOnInit(): void {
    this.conferenceId = this.route.snapshot.paramMap.get('conferenceId');
  }

  // Method to add a new question
  addQuestion(type: 'single' | 'multiple' | 'text'): void {
    const newQuestion = {
      type: type, // Type of the question: 'single', 'multiple', or 'text'
      text: '', // The question text
      options: type !== 'text' ? [''] : [] // Options for single/multiple choice questions
    };
    this.questions.push(newQuestion);
  }

  // Method to remove a question
  removeQuestion(index: number): void {
    this.questions.splice(index, 1);
  }

  // Method to add an option to a question
  addOption(question: any): void {
    if (question.type !== 'text') {
      question.options.push(''); // Add an empty option
    }
  }

  // Method to remove an option from a question
  removeOption(question: any, optionIndex: number): void {
    if (question.type !== 'text') {
      question.options.splice(optionIndex, 1); // Remove the option at the specified index
    }
  }

  // Method to save the form
  async saveForm(): Promise<void> {
    // Open the modal
    this.openCreatingModal();

    try {
      const form = { questions: this.questions }; // Prepare the form data
      console.log('Form to be saved:', form); // Debugging log
      const response = await this.conferenceService.saveForm(form); // Call the service method
      console.log('Form saved successfully:', response);
      
      toast.success('Formulario creado exitosamente', {
        duration: 5000,
        position: 'top-center'
      });
      
      // Navigate back to revision forms list with conferenceId
      this.router.navigate([`/eventos-academicos/conferencias/formularios-revision/formularios-disponibles/${this.conferenceId}`]);
    } catch (error) {
      console.error('Error saving form:', error);
      
      toast.error('Error al crear el formulario', {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      this.closeCreatingModal();
    }
  }

  // Track by function for ngFor
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Add these new methods
  openCreatingModal(): void {
    this.isCreatingModalOpened = true;
    this.isSubmittingForm = true;
  }

  closeCreatingModal(): void {
    this.isCreatingModalOpened = false;
    this.isSubmittingForm = false;
  }
}