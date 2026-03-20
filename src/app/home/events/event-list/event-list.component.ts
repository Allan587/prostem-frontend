import { Component, inject, Injector, runInInjectionContext, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../data-access/event.service';
import { IEvent } from '../../../Interfaces/IEvent';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { toast } from 'ngx-sonner';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../users/data-access/user.service';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent, MatTableModule, MatIconModule,
    MatButtonModule, MatSortModule, MatFormFieldModule, MatInputModule, MatPaginator,
    MatTooltipModule, MatSelectModule, FormsModule, MatProgressSpinner],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export default class EventListComponent {
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private firestore = inject(Firestore);

  events: any[] = [];
  loadingEvents = false;
  isSubmitting = false;

  isDeleteModalOpened = false;
  selectedEvent: any = null;

  isRemoveUsersFromEventModalOpened = false;
  selectedEventForRemoveUsers: IEvent | null = null;
  registeredUserDetails: any[] = [];
  selectedUidsToRemove: string[] = [];

  isRequestModalOpened = false;
  selectedEventForRequests: IEvent | null = null;
  processingUsers = new Set<string>();  //to avoid click spam

  isWaitingListModalOpened = false;
  selectedEventForWaitingList: IEvent | null = null;
  processingWaitingListUsers = new Set<string>(); //to avoid click spam

  displayedColumns: string[] = [
    'id',
    'title',
    'startDate',
    'endDate',
    'time',
    'place',
    'description',
    'enrollmentType',
    'evaluationType',
    'capacity',
    'durationHours',
    'eventFormat',
    'options',
  ];

  editEventTooltipText = 'Editar evento';
  registrationRequestsTooltipText = 'Administrar solicitudes de registro'
  waitingListRequestsTooltipText = 'Administrar lista de espera';
  gradesTooltipText = 'Asignar notas a estudiantes';
  removeUsersTooltipText = 'Desmatricular estudiante(s)';
  deleteEventTooltipText = 'Eliminar evento';
  tooltipDuration = 25;   //In milliseconds.

  dataSource = new MatTableDataSource<IEvent>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private injector: Injector) { }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      this.loadingEvents = true;
      const surveysRef = collection(this.firestore, 'events');
      onSnapshot(surveysRef, async (snapshot) => {
        this.events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            eventFormat: data['virtualEvent'] ? 'Virtual' : 'Presencial'
          }
        });
        this.dataSource.data = this.events;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.loadingEvents = false;
        setTimeout(() => this.waitForViewInit(), 0);
      });

    });
  }

  ngAfterViewInit(): void {
    this.waitForViewInit();
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

  openDeleteModal(event: object): void {
    this.selectedEvent = event;
    this.isDeleteModalOpened = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpened = false;
    //toast sin cambios
  }

  openRequestModal(event: IEvent): void {
    this.selectedEventForRequests = event;
    this.isRequestModalOpened = true;
  }

  closeRequestModal(): void {
    this.isRequestModalOpened = false;
  }

  openWaitingListModal(event: IEvent): void {
    this.selectedEventForWaitingList = event;
    this.isWaitingListModalOpened = true;
  }

  closeWaitingListModal(): void {
    this.isWaitingListModalOpened = false;
  }

  async openRemoveUsersFromEventModal(event: IEvent) {
    this.selectedEventForRemoveUsers = event;
    this.selectedUidsToRemove = [];

    const uids: string[] = event.registeredUsers || [];

    if (!uids.length) return;


    try {
      const promise = this.userService.getUsersByUIDs(uids);

      toast.promise(promise, {
        loading: 'Cargando usuarios registrados...',
        success: '¡Usuarios cargados correctamente!',
        error: 'Hubo un error, no se pudieron obtener los usuarios.',
      });

      this.registeredUserDetails = await promise;

    } catch (error) {
      console.error('Error al cargar usuarios registrados:', error);
      toast.error('No se pudo cargar la lista de usuarios');
    }
    this.isRemoveUsersFromEventModalOpened = true;
  }

  closeRemoveUsersFromEventModal(): void {
    this.isRemoveUsersFromEventModalOpened = false;
  }

  async submitDeleteEvent(id: string) {
    try {
      this.isSubmitting = true;

      const deletePromise = this.eventService.deleteEvent(id);
      toast.promise(deletePromise, {
        loading: 'Eliminando evento...',
        success: '¡Se eliminó el evento!',
        error: 'No se pudo eliminar el evento.',
      });
      await deletePromise;
    } catch (error) {
      toast.error('Ocurrió un error al eliminar el evento');
      console.error(error);
    } finally {
      this.closeDeleteModal();
      this.isSubmitting = false;
    }
  }

  async submitRemoveUsers(event: IEvent, userUIDs: string[]) {
    if (!this.selectedEventForRemoveUsers || !this.selectedUidsToRemove.length) {
      if (this.selectedUidsToRemove.length === 0) {
        toast.warning('Debes seleccionar al menos un usuario.');
      }
      return;
    }

    try {
      this.isSubmitting = true;

      const removeUserPromise = this.eventService.unRegisterUserFromEvent(event.id, userUIDs);
      toast.promise(removeUserPromise, {
        loading: 'Desmatriculando usuario(s)...',
        success: '¡Usuario(s) desmatriculado(s) con éxito!',
        error: 'No se pudo desmatricular al usuario.',
      });

      await removeUserPromise;
    } catch (error) {
      console.error(error);
      toast.error('Error al desmatricular usuarios.');
    } finally {
      this.closeRemoveUsersFromEventModal();
      this.isSubmitting = false;
    }
  }

  async processRegistrationRequest(event: IEvent, userId: string, action: 'approve' | 'reject') {
    this.processingUsers.add(userId);

    try {
      const registrationReqPromise = this.eventService.processRestrictedRegistration(event.id, userId, action);

      toast.promise(registrationReqPromise, {
        loading: 'Procesando solicitud...',
        success: `Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`,
        error: 'No se pudo procesar la solicitud de inscripción.',
      });

      await registrationReqPromise;

      // Locally update the lists
      event.pendingRequests = event.pendingRequests.filter((req) => req.uid !== userId);
      if (action === 'approve') {
        event.registeredUsers.push(userId);
      }

      this.selectedEventForRequests = { ...event };
    } catch (error) {
      toast.error(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} la solicitud.`);
      console.error(error);
    } finally {
      this.processingUsers.delete(userId);
    }
  }

  async processWaitingListRequest(event: IEvent, userId: string, action: 'approve' | 'reject') {
    this.processingWaitingListUsers.add(userId);
    try {
      const waitingListReqPromise = this.eventService.processWaitingListRequest(event.id, userId, action);
      toast.promise(waitingListReqPromise, {
        loading: 'Procesando solicitud...',
        success: `Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`,
        error: 'No se pudo procesar la solicitud de lista de espera.',
      });
      await waitingListReqPromise;
      toast.success(`Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`);

      // Locally update the lists
      event.waitingList = event.waitingList?.filter((waitingReq) => waitingReq.uid !== userId);
      if (action === 'approve') {
        event.registeredUsers.push(userId);
      }

      this.selectedEventForRequests = { ...event };
    } catch (error: any) {
      if (error instanceof HttpErrorResponse) {
        toast.error(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'}: '${error.error.error}'`);
      } else {
        toast.error(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} la solicitud.`);
      }
      console.error(error);

    } finally {
      this.processingWaitingListUsers.delete(userId);
    }
  }

  async downloadCertificates(event: IEvent): Promise<void> {
    try {
      toast.promise(
        this.eventService.generateCertificates(event.id),
        {
          loading: 'Generando certificados...',
          success: '¡Certificados generados exitosamente!',
          error: 'Error al generar los certificados.',
        }
      );
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Error al generar los certificados.');
    }
  }

  async onFileSelected(event: Event, selectedEvent: IEvent): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
  
    if (!file) {
      toast.warning('Por favor, seleccione un archivo ZIP.');
      return;
    }
  
    try {
      toast.promise(
        this.eventService.uploadSignedCertificates(selectedEvent.id, file),
        {
          loading: 'Subiendo certificados...',
          success: '¡Certificados subidos exitosamente!',
          error: 'Error al subir los certificados.',
        }
      );
    } catch (error) {
      console.error('Error uploading signed certificates:', error);
    } finally {
      input.value = ''; // Reset the file input
    }
  }

  async sendCertificates(event: IEvent): Promise<void> {
    try {
      toast.promise(
        this.eventService.sendCertificates(event.id),
        {
          loading: 'Enviando certificados...',
          success: '¡Certificados enviados exitosamente!',
          error: 'Error al enviar los certificados.',
        }
      );
    } catch (error) {
      console.error('Error sending certificates:', error);
      toast.error('Error al enviar los certificados.');
    }
  }

  

}
