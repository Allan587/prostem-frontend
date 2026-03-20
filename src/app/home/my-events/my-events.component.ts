import { Component, inject, Injector, runInInjectionContext, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { AuthStateService } from '../../shared/auth-state.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ModalComponent } from '../modal/modal.component';
import { IEvent } from '../../Interfaces/IEvent';

@Component({
  selector: 'app-my-events',
  imports: [CommonModule, MatTableModule, MatSort, MatSortModule, MatPaginator,
    MatPaginatorModule, MatProgressSpinner, RouterLink, MatTooltipModule,
    MatIconModule, ModalComponent],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css'
})
export default class MyEventsComponent {
  private authStateService = inject(AuthStateService);
  private firestore = inject(Firestore);

  isLoadingEvents = true;
  tooltipDuration = 25;   // In milliseconds
  seeSurveyTooltipText = "Responder la encuesta."
  seeGradeTooltipText = "Ver mi calificación";

  isGradeModalOpened = false;
  selectedEvent: any = null;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['title', 'dates', 'place', 'description', 'evaluationType', 'options'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private injector: Injector) { }

  ngOnInit(): void {
    this.authStateService.currentUser$.subscribe((user) => {
      const myEventsMap = user?.myEvents ?? {};
      const eventEntries = Object.entries(myEventsMap); // [ [eventId, {grade, type}], ... ]

      runInInjectionContext(this.injector, async () => {
        // const eventDocs = await Promise.all(
        //   myEvents.map(async (eventId) => {
        //     const ref = doc(this.firestore, 'events', eventId);
        //     const snapshot = await getDoc(ref);
        //     if (snapshot.exists()) {
        //       return { id: snapshot.id, ...snapshot.data() };
        //     }
        //     return null;
        //   })
        // );

        const eventDocs = await Promise.all(
          eventEntries.map(async ([eventId, userEventData]) => {
            const ref = doc(this.firestore, 'events', eventId);
            const snapshot = await getDoc(ref);

            if (snapshot.exists()) {
              const eventData = snapshot.data();
              return {
                id: snapshot.id,
                ...eventData,
                grade: userEventData.grade ?? null,
                type: userEventData.type
              };
            }
            return null;
          })
        );


        const validEvents = eventDocs.filter(event => event !== null);
        this.dataSource.data = validEvents;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.isLoadingEvents = false;
        setTimeout(() => this.waitForViewInit(), 0);
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

  openSeeGradeModal(event: IEvent) {
    this.selectedEvent = event;
    this.isGradeModalOpened = true;
  }

  closeSeeGradeModal() {
    this.isGradeModalOpened = false;
  }

  getGradeColorClass(grade: number | null | undefined): string {
    if (grade == null) return 'grade-neutral';
    if (grade >= 70) return 'grade-green';
    if (grade >= 47) return 'grade-yellow';
    return 'grade-red';
  }

}

