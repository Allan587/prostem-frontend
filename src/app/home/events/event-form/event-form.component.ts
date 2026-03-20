import { Component, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventCreation, EventService } from '../data-access/event.service';
import { DateTime } from 'luxon';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSlideToggleModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    FormsModule, MatIconModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export default class EventComponent {
  private formBuilder = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);

  minTitleLength = 5;
  maxTitleLength = 100;
  minPlaceLength = 3;
  maxPlaceLength = 150;
  minDescriptionLength = 5;
  maxDescriptionLength = 500;
  maxCapacity = 2500
  form = this.formBuilder.group({
    title: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minTitleLength), Validators.maxLength(this.maxTitleLength), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s'"¡!¿?:;,.()-]+$/)]),
    startDate: this.formBuilder.control('', Validators.required),
    endDate: this.formBuilder.control('', Validators.required),
    durationHours: this.formBuilder.control<number | null>(null, Validators.min(0)),   // this information is optional
    startTime: this.formBuilder.control('', Validators.required),
    endTime: this.formBuilder.control('', Validators.required),
    place: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minPlaceLength), Validators.maxLength(this.maxPlaceLength)]),   //If the event is virtual, a meeting link can be added here.
    description: this.formBuilder.control('', [Validators.required, Validators.minLength(this.minDescriptionLength), Validators.maxLength(this.maxDescriptionLength)]),
    enrollmentType: this.formBuilder.control('', Validators.required),
    capacity: this.formBuilder.control(0, [Validators.min(0), Validators.max(this.maxCapacity)]),
    virtualEvent: this.formBuilder.control(false, Validators.required),
    teachingLevels: this.formBuilder.control<string[]>([], Validators.required),
    specialties: this.formBuilder.control<string[]>([], Validators.required),
    evaluationType: this.formBuilder.control('', Validators.required),
    eventCategory: this.formBuilder.control('', Validators.required),
  },
    {
      validators:
        [
          this.validateDateRange,
          this.validateTimeRange,
          this.capacityIsPositiveIntegerValidator,
          this.durationHoursIsPositiveIntegerValidator
        ]
    }
  );

  loadingSave = signal(false);  //This signal is used for updating the UI while the form is being submitted
  eventID = input.required<string>();
  //Asuming no one under the age of 18 will register to the system.
  today = DateTime.now();
  availableTeachingLevels = ['Primaria', 'Secundaria'];
  availableSpecialties = ['Biología', 'Ciencias (tercer ciclo)', 'Física', 'Ingeniería', 'Matemáticas', 'Química', 'Tecnología'];
  availableEnrollmentTypes = ['Abierta', 'Restringida'];
  avalaibleEvaluationTypes = ['Aprovechamiento', 'Participación'];
  avalaibleCategoryTypes = ['Curso', 'Conferencia', 'Taller', 'Simposio', 'Foro', 'Charla'];

  selectedEnrollmentType: string | null = null;
  selectedSpecialties: string | null = null;
  selectedEvaluationType: string | null = null;
  selectedCategoryType: string | null = null;

  showSpecialties = false;

  constructor(private location: Location) {
    effect(() => {
      const id = this.eventID();
      if (id) {
        this.getEvent(id);
      }
    });
  }

  ngOnInit() {
    this.form.get('teachingLevels')?.valueChanges.subscribe(() => {
      this.onTeachingLevelsChange();
    });
  }

  onCategoryTypeChange(event: MatSelectChange) {
    this.selectedCategoryType = event.value;
    this.form.patchValue({ eventCategory: this.selectedCategoryType });
  }

  onEvaluationTypeChange(event: MatSelectChange) {
    this.selectedEvaluationType = event.value;
    this.form.patchValue({ evaluationType: this.selectedEvaluationType });
  }

  onEnrollmentTypeChange(event: MatSelectChange) {
    this.selectedEnrollmentType = event.value;
    this.form.patchValue({ enrollmentType: this.selectedEnrollmentType });
  }

  onTeachingLevelsChange(): void {
    // If the selected teaching level is "Primaria", the specialties
    // select is shown and validators are added.
    const selectedLevels: string[] = this.form.get('teachingLevels')?.value || [];

    const specialtiesControl = this.form.get('specialties');

    if (selectedLevels.includes('Secundaria')) {
      specialtiesControl?.setValidators([Validators.required, Validators.minLength(1)]);
      this.showSpecialties = true;
    } else {
      this.showSpecialties = false;
      specialtiesControl?.clearValidators();
      specialtiesControl?.setValue([]);
    }

    specialtiesControl?.updateValueAndValidity();
  }

  onSpecialtiesChange(event: MatSelectChange) {
    this.form.get('specialties')?.setValue(event.value);
    this.form.get('specialties')?.updateValueAndValidity();
  }

  get minEndDate(): string {
    const startDate = this.form.get('startDate')?.value;
    if (startDate && startDate !== '') {
      if (startDate >= this.today.toISODate()) {
        return startDate;
      } else if (startDate <= this.today.toISODate()) {
        return this.today.toISODate();
      }
    }
    return startDate || this.today.toISODate();
  }

  validateDateRange(form: AbstractControl) {
    const start = form.get('startDate')?.value;
    const end = form.get('endDate')?.value;
    if (start && end && start > end) {
      return { invalidDateRange: true };
    }
    return null;
  }

  validateTimeRange(form: AbstractControl) {
    const startTime = form.get('startTime')?.value;
    const endTime = form.get('endTime')?.value;

    if (!startTime || !endTime) return null;

    if (startTime >= endTime) {
      return { invalidTimeRange: true };
    }

    return null;
  }

  durationHoursIsPositiveIntegerValidator(control: AbstractControl) {
    const durationHours = control.value.durationHours;
    if (durationHours == null || durationHours === '') return null;
    return Number.isInteger(+durationHours) ? null : { durationHoursNotInteger: true };
  }

  capacityIsPositiveIntegerValidator(control: AbstractControl) {
    const capacity = control.value.capacity;
    if (capacity == null || capacity === '') return null;
    return Number.isInteger(+capacity) ? null : { capacityNotInteger: true };
  }

  fieldIsEmpty(fieldName: string): boolean {
    return !!(this.form.get(fieldName)?.touched && this.form.get(fieldName)?.hasError('required'));
  }

  fieldIsTooShort(fieldName: string,): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && (control?.hasError('minlength') || control?.hasError('min')));
  }

  fieldIsTooLong(fieldName: string,): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.touched && (control?.hasError('maxlength') || control?.hasError('max')));
  }

  fieldHasPatternError(fieldName: string): boolean {
    return !!(this.form.get(fieldName)?.touched && this.form.get(fieldName)?.hasError('pattern'));
  }

  async submitEventForm() {
    if (this.form.invalid) {
      toast.warning('Datos inválidos o incompletos. Por favor, revisa los datos.');
      return;
    };

    try {
      const today = DateTime.now().toLocaleString();
      const defaultTitle = 'Mi evento';
      const defaultStartTime = '10:00';
      const defaultEndTime = '12:00';
      const defaultPlace = 'TEC';
      const defaultDescription = 'Mi descripción';
      const defaultEnrollmentType = 'Abierta';

      const {
        title,
        startDate,
        endDate,
        durationHours,
        startTime,
        endTime,
        place,
        description,
        enrollmentType,
        capacity,
        virtualEvent,
        teachingLevels,
        specialties,
        evaluationType,
        eventCategory,
      } = this.form.value;

      console.log(this.form.value);

      this.loadingSave.set(true);

      const id = this.eventID();

      let pendingRequests: { uid: string; name: string; }[] = [];
      let waitingList: { uid: string; name: string; }[] = [];
      if (id) {
        const existingEvent = await this.eventService.getEventByID(id);
        pendingRequests = existingEvent?.pendingRequests || [];
        waitingList = existingEvent?.waitingList || [];
      }

      const newEvent: EventCreation = {
        title: title || defaultTitle,
        startDate: startDate || today,
        endDate: endDate || today,
        durationHours: durationHours ?? null,
        startTime: startTime || defaultStartTime,
        endTime: endTime || defaultEndTime,
        place: place || defaultPlace,
        description: description || defaultDescription,
        enrollmentType: enrollmentType || defaultEnrollmentType,
        capacity: capacity || 0,
        virtualEvent: !!virtualEvent,
        teachingLevels: teachingLevels || ["Primaria", "Secundaria"],
        specialties: specialties || this.availableSpecialties,
        pendingRequests,
        waitingList,
        evaluationType: evaluationType || 'Participación',
        eventCategory: eventCategory || 'Curso',
      };

      if (id) {   //If the user is editing the event.
        await this.eventService.updateEvent(newEvent, id);
        toast.success('¡Evento editado!');
        this.goBack();
      } else {    //If the user is creating a new event.
        await this.eventService.createEvent(newEvent);
        toast.success('¡Evento creado!');
        this.goBack();
      }
    } catch (error) {
      toast.error('Ocurrió un error creando el evento');
      console.log(error);
    } finally {
      this.loadingSave.set(false);
    }
  }

  async getEvent(id: string) {
    try {
      const requestedEvent = await this.eventService.getEventByID(id);

      if (!requestedEvent) {
        toast.info(`No existe el evento con el id '${id}'`);
        this.goBack();
        return;
      }

      this.form.patchValue(requestedEvent);


    } catch (error) {
      console.error('Error al cargar el evento:', error);
      if (error instanceof HttpErrorResponse) {
        toast.error(`Error al cargar el evento: '${error.error.error}'`);
      } else {
        toast.error('Error al cargar el evento');
      }
      this.router.navigateByUrl('/');
    }
  }

  goBack(): void {
    //AVERTIR SI HAY CAMBIOS SIN GUARDAR
    this.location.back();
  }
}
