import { Component, inject, Injector, runInInjectionContext, ViewChild, OnInit, NgZone, signal, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../data-access/survey.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSort } from '@angular/material/sort';
import { Firestore } from '@angular/fire/firestore';
import { onSnapshot, collection, getCountFromServer, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ISurvey } from '../../../Interfaces/ISurvey';
import { toast } from 'ngx-sonner';
import { ModalComponent } from '../../modal/modal.component';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-survey-list',
  imports: [CommonModule, RouterLink, MatTableModule, MatIconModule, ModalComponent, MatPaginator, MatTooltipModule, MatSelectModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './survey-list.component.html',
  styleUrl: './survey-list.component.css'
})
export class SurveyListComponent implements OnInit {
  private firestore = inject(Firestore)
  private surveyService = inject(SurveyService)
  isLoading = signal(true);
  isSubmitting = false;

  //SURVEYS
  surveys: any[] = [];
  dataSource = new MatTableDataSource<any>();
  private surveysLoaded = false;

  //TABLE UI
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  selectedSurvey: any | null = null;
  hasResponsesMap = new Map<string, boolean>();
  isDeleteModalOpened = false;
  isAssignSurveyModalOpened = false;
  displayedColumns: string[] = [
    'id',
    'title',
    'options'
  ];


  //  EVENTS RELATED TO THE SURVEY
  events: any[] = [];
  selectedEventIds: string[] = [];
  private eventsLoaded = false;


  //TOOLTIP VARIABLES
  seeSurveyTooltipText = 'Ver encuesta';
  seeSurveyResponsesToltilpText = 'Ver respuestas';
  downloadResponsesToltilpText = 'Descargar respuestas';
  addSurveyToEventTooltipText = 'Asignar encuesta a eventos';
  deleteSurveyTootilpText = 'Eliminar encuesta';
  toolTipDuration = 25;   //In milliseconds.

  constructor(
    private injector: Injector,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      this.isLoading.set(true);
      const surveysRef = collection(this.firestore, 'surveys');
      onSnapshot(surveysRef, async (snapshot) => {
        this.surveys = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.dataSource.data = this.surveys;
        this.surveysLoaded = true;

        await this.loadHasResponses();
        await this.loadAllEvents()

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.checkIfLoadingComplete();
      });
    });
  }

  private waitForViewInit() {
    const check = () => {
      if (this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  }

  private checkIfLoadingComplete() {
    if (this.surveysLoaded && this.eventsLoaded) {
      this.ngZone.run(() => {
        this.isLoading.set(false);
        setTimeout(() => this.waitForViewInit(), 0);
        this.cdr.detectChanges();
      });
    }
  }

  async loadHasResponses() {
    for (const survey of this.dataSource.data) {
      const ref = collection(this.firestore, `surveys/${survey.id}/responses`);
      const snapshot = await getCountFromServer(ref);
      this.hasResponsesMap.set(survey.id, snapshot.data().count > 0);
    }
  }

  async loadAllEvents() {
    const ref = collection(this.firestore, 'events');
    const snapshot = await getDocs(ref);

    this.events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    this.eventsLoaded = true;
    this.checkIfLoadingComplete();
  }

  openAssignSurveyModal(survey: ISurvey): void {
    this.selectedSurvey = survey;
    this.selectedEventIds = []; // clean the previous selection
    this.isAssignSurveyModalOpened = true;

    // Load all available events
    const eventsRef = collection(this.firestore, 'events');
    getDocs(eventsRef).then(snapshot => {
      this.events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as any
      })).filter(event => !event.survey);
    });
  }

  closeAssignSurveyModal(): void {
    this.isAssignSurveyModalOpened = false;
    this.selectedSurvey = null;
    this.selectedEventIds = [];
  }

  openDeleteModal(survey: ISurvey): void {
    this.selectedSurvey = survey;
    this.isDeleteModalOpened = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpened = false;
    this.selectedSurvey = null;
    //toast sin cambios
  }

  async submitAssignSurveyModal(surveyId: string) {
    if (this.selectedEventIds.length === 0) {
      this.closeAssignSurveyModal();
      return;
    }
    try {
      this.isSubmitting = true;

      const asignSurveyPromise = new Promise<void>(async (resolve, reject) => {
        try {
          for (const eventId of this.selectedEventIds) {
            const eventRef = doc(this.firestore, 'events', eventId);
            await updateDoc(eventRef, { survey: surveyId });
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      // for (const eventId of this.selectedEventIds) {
      //   const eventRef = doc(this.firestore, 'events', eventId);
      //   await updateDoc(eventRef, { survey: surveyId });
      // }

      toast.promise(asignSurveyPromise, {
        loading: 'Asignando encuesta a los eventos seleccionados...',
        success: '¡Encuesta asignada con éxito!'
      });

      await asignSurveyPromise;

      // toast.success('Encuesta asignada con éxito a los eventos seleccionados');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al asignar la encuesta');
    } finally {
      this.closeAssignSurveyModal();
      this.isSubmitting = false;
    }
  }

  async submitDeleteModal(id: string) {
    try {
      this.isSubmitting = true;

      const deleteSurveyPromise = this.surveyService.deleteSurvey(id);

      toast.promise(deleteSurveyPromise, {
        loading: 'Eliminando encuesta...',
        success: '¡Se eliminó la encuesta!'
      });

      await deleteSurveyPromise;
      // await this.surveyService.deleteSurvey(id);
      // toast.info('¡Se eliminó la encuesta!');
    } catch (error) {
      toast.error('Ocurrió un error al eliminar el evento');
      console.error(error);
    } finally {
      this.closeDeleteModal();
      this.isSubmitting = false;
    }
  }

  async downloadCSV(surveyId: string, surveyTitle: string) {
    try {
      const surveyResponsesPromise = this.surveyService.getSurveyResponsesToDownload(surveyId);

      toast.promise(surveyResponsesPromise, {
        loading: 'Obteniendo respuestas del servidor...',
        success: 'Respuestas cargadas. Generando el archivo...'
      });

      const responses = await surveyResponsesPromise;

      if (!responses || responses.length === 0) {
        toast.warning('No hay respuestas disponibles para esta encuesta.');
        return;
      }

      const headers = Object.keys(responses[0]);

      const rows = [headers.join(',')];

      for (const row of responses) {
        const line = headers.map(header => {
          const value = row[header];

          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }

          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        }).join(',');

        rows.push(line);
      }

      const bom = '\uFEFF';
      const csv = bom + rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fecha = DateTime.now().toFormat("dd-LL-yyyy");
      a.href = url;
      a.download = `ProSTEM_respuestas_encuesta_${surveyTitle}_${fecha}.csv`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al generar el archivo:', error);
      toast.error('No se pudieron obtener las respuestas. Verifica que la encuesta exista o que tenga respuestas.');
    }
  }
}
