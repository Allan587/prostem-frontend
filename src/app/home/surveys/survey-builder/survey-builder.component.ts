import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SurveyService } from '../data-access/survey.service';
import { MatDividerModule } from '@angular/material/divider';
import { toast } from 'ngx-sonner';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-survey-builder',
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule,
    MatDividerModule, MatIconModule, MatTooltipModule],
  templateUrl: './survey-builder.component.html',
  styleUrl: './survey-builder.component.css'
})
export default class SurveyBuilderComponent {
  formBuilder = inject(FormBuilder);
  surveyService = inject(SurveyService);

  minTitleLength = 5;
  maxTitleLength = 100;
  minPlaceLength = 5;
  maxPlaceLength = 150;

  surveyForm!: FormGroup;

  isSaving = false;

  deleteElementTooltipText = 'Eliminar pregunta.';
  tooltipDuration = 25;


  get questions() {
    return this.surveyForm.get('questions') as any;
  }

  questionTypes = [
    { value: 'text', label: 'Texto corto' },
    { value: 'radiogroup', label: 'Opción única' },
    { value: 'checkbox', label: 'Selección múltiple' },
    { value: 'comment', label: 'Comentario largo' },
  ];

  ngOnInit(): void {
    this.surveyForm = this.formBuilder.group(
      {
        title: this.formBuilder.control('', [
          Validators.required,
          Validators.minLength(this.minTitleLength),
          Validators.maxLength(this.maxTitleLength),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s'"¡!¿?:;,.()-]+$/)
        ]),
        questions: this.formBuilder.array<any>([]),
      },
      { validators: this.atLeastOneQuestionValidator }
    );

    //Add empty question
    this.addQuestion();
  }

  atLeastOneQuestionValidator(control: AbstractControl): ValidationErrors | null {
    const questions = control.get('questions') as FormArray;
    if (!questions || questions.length === 0) {
      return { noQuestions: true };
    }
    return null;
  }

  choicesRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const type = control.get('type')?.value;
    const choices: string[] = control.get('choices')?.value || [];

    if (type === 'checkbox' || type === 'radiogroup') {
      const cleanedChoices = choices.map(choice => choice.trim()).filter(opt => opt.length > 0);

      const hasDuplicates = new Set(cleanedChoices).size !== cleanedChoices.length;
      const isValid = cleanedChoices.length > 0 && !hasDuplicates;

      if (!isValid) {
        return { choicesRequired: true };
      }
    }

    return null;
  }

  addQuestion() {
    this.questions.push(
      this.formBuilder.group({
        title: ['', [
          Validators.required,
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s'"¡!¿?:;,.()-]+$/),
          Validators.minLength(this.minTitleLength),
          Validators.maxLength(this.maxTitleLength)
        ]],
        type: this.formBuilder.control('text', Validators.required),
        choicesInput: [''],
        choices: [[]],
      },
        { validators: this.choicesRequiredValidator })
    );
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  onTypeChange(index: number) {
    const question = this.questions.at(index);
    const type = question.get('type')?.value;

    if (type !== 'checkbox' && type !== 'radiogroup') {
      question.patchValue({ choicesInput: '', choices: [] });
    }
  }

  onChoicesInputChange(index: number) {
    const question = this.questions.at(index);
    const raw = question.get('choicesInput')?.value || '';

    const parsed = raw
      .split(/[,;]\s*/)                         // divides by "," or ";" with the option of white spaces
      .map((opt: string) => opt.trim())         // cleans each option
      .filter((opt: string) => opt.length > 0); // discards empty options

    question.patchValue({ choices: parsed });
  }

  fieldIsEmpty(fieldName: string, theFormGroup: FormGroup): boolean {
    return !!(theFormGroup.get(fieldName)?.touched && theFormGroup.get(fieldName)?.hasError('required'));
  }

  fieldIsTooShort(fieldName: string, theFormGroup: FormGroup): boolean {
    const control = theFormGroup.get(fieldName);
    return !!(control?.touched && control?.hasError('minlength'));
  }

  fieldIsTooLong(fieldName: string, theFormGroup: FormGroup): boolean {
    const control = theFormGroup.get(fieldName);
    return !!(control?.touched && control?.hasError('maxlength'));
  }

  fieldHasPatternError(fieldName: string, theFormGroup: FormGroup): boolean {
    return !!(theFormGroup.get(fieldName)?.touched && theFormGroup.get(fieldName)?.hasError('pattern'));
  }

  async submitSurvey() {
    if (this.surveyForm.invalid) {
      toast.warning('Completa todos los campos');
      return;
    }

    this.isSaving = true;

    const formValue = this.surveyForm.value;

    const survey = {
      title: formValue.title,
      pages: [
        {
          questions: formValue.questions?.map((q: any) => {
            const question: any = {
              type: q.type,
              name: q.title,
              title: q.title,
            };

            if (q.type === 'radiogroup' || q.type === 'checkbox') {
              question.choices = q.choices;
            }

            return question;
          }),
        },
      ],
    };

    try {
      // await this.surveyService.saveSurvey(survey);
      // console.log(survey);
      // toast.success('Encuesta guardada con éxito');

      const saveSurveyPromise = this.surveyService.saveSurvey(survey);
      toast.promise(saveSurveyPromise, {
        loading: 'Guardando encuesta...',
        success: '¡Encuesta guardada con éxito!',
        error: 'Hubo un error, no se pudo guardar la encuesta.',
      });

      await saveSurveyPromise;

      this.surveyForm.reset();
      this.questions.clear();
      this.addQuestion()
    } catch (error) {
      toast.error('Error al guardar la encuesta');
    } finally {
      this.isSaving = false;
    }
  }
}
