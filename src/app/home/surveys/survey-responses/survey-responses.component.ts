import { Component, ViewChild, OnInit, inject, Injector, runInInjectionContext, signal, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Firestore } from '@angular/fire/firestore';
import { collection, CollectionReference, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { toast } from 'ngx-sonner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-survey-responses',
  imports: [CommonModule, MatTableModule, MatPaginator, MatProgressSpinnerModule],
  templateUrl: './survey-responses.component.html',
  styleUrl: './survey-responses.component.css'
})
export default class SurveyResponsesComponent implements OnInit {
  firestore = inject(Firestore);
  displayedColumns: string[] = ['uid', 'name', 'email', 'createdAt', 'answers'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = signal(false);
  private hasLoadedUsers = false;
  private hasLoadedResponses = false;

  userMap = new Map<string, any>();

  answersPerPage = 1;
  surveyTitle = '';

  constructor(
    private route: ActivatedRoute,
    private injector: Injector,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.isLoading.set(true);

    const surveyID = this.route.snapshot.paramMap.get('surveyID');

    if (surveyID) {
      const surveyRef = doc(this.firestore, 'surveys', surveyID);
      const surveySnap = await getDoc(surveyRef);
      if (surveySnap.exists()) {
        const data = surveySnap.data();
        this.surveyTitle = data['title'] || 'Encuesta';
      }
    }

    await this.loadUsers();

    runInInjectionContext(this.injector, () => {
      const ref = collection(this.firestore, `surveys/${surveyID}/responses`) as CollectionReference;

      onSnapshot(ref, snapshot => {
        if (snapshot.empty) {
          console.log('La colección no existe o está vacía');
          toast.warning('La colección de respuestas a la que intentaste ingresar no existe o está vacía.');
          this.router.navigateByUrl('/configuracion')
          return;
        }

        const responses = snapshot.docs.map(doc => {
          const raw = doc.data();
          const timestamp = raw['createdAt'];
          return {
            uid: doc.id,
            ...raw,
            createdAt: timestamp && typeof timestamp.seconds === 'number'
              ? new Date(timestamp.seconds * 1000)
              : null,
            name: this.userMap.get(doc.id)?.name + ' ' + this.userMap.get(doc.id)?.lastName1 || 'Desconocido',
            email: this.userMap.get(doc.id)?.email
          };
        });
        this.dataSource.data = responses;
        this.hasLoadedResponses = true;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.checkIfLoadingComplete();
      });
    });
  }

  private waitForViewInit() {
    const check = () => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  }

  async loadUsers() {
    const usersRef = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersRef);
    this.userMap = new Map(
      snapshot.docs.map(doc => [doc.id, doc.data()])
    );
    this.hasLoadedUsers = true;
  }

  private checkIfLoadingComplete() {
    if (this.hasLoadedUsers && this.hasLoadedResponses) {
      this.ngZone.run(() => {
        this.isLoading.set(false);
        setTimeout(() => this.waitForViewInit(), 0);
        this.cdr.detectChanges();
      });
    }
  }

  objectKeys = Object.keys;

  isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  convertToDate(value: any): Date | null {
    if (!value || !('_seconds' in value)) return null;
    return new Date(value._seconds * 1000);
  }

}
