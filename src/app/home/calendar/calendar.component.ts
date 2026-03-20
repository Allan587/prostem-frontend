import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, Signal, WritableSignal } from '@angular/core';
import { DateTime, Info, Interval } from 'luxon';
import { toast } from 'ngx-sonner';
import { IEventsList } from '../../Interfaces/IEventsList';
import { RouterLink } from '@angular/router';
import { EventService } from '../events/data-access/event.service';
import { IEvent } from '../../Interfaces/IEvent';
import { AuthStateService } from '../../shared/auth-state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Settings } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { IAppUser } from '../../Interfaces/IAppUser';
import { Router } from '@angular/router';
import { IConference } from '../events/data-access/event.service';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  standalone: true
})
export default class CalendarComponent {
  eventsList = signal<IEventsList>({});
  userUid = signal<string | null>(null);
  isRegistering = signal(false);
  userRole = signal<'admin' | 'user' | null>(null);
  readonly userName = signal<string | null>(null);
  private authService = inject(AuthStateService);

  previousMonthTooltipText = 'Ir al mes anterior.';
  goToTodayTooltipText = 'Ir al día de hoy.'
  nextMonthTooltilpText = 'Ir al siguiente mes.';
  tooltipDuration = 25;   //In milliseconds.

  conferences = signal<IConference[]>([]);
  selectedConference = signal<IConference | null>(null);

  constructor(private eventService: EventService,
    private router: Router
  ) {
    Settings.defaultLocale = 'es';
    this.loadEvents();
    this.loadConferences();

    //Get the UID of the user
    effect(() => {
      this.authService.currentUser$.subscribe(user => {
        this.userUid.set(user?.uid ?? null);
        this.userName.set(user?.name ?? null);
        if (user?.role === 'admin' || user?.role === 'user') {
          this.userRole.set(user.role);
        }
      });
    });
  }

  async loadEvents() {
    const allEventsPromise = this.eventService.getEventsForCalendar();

    toast.promise(allEventsPromise, {
      loading: 'Cargando eventos dispomibles...',
      success: '¡Se han cargado los eventos disponibles!',
      error: 'Hubo un error, no se pudieron obtener los eventos.',
    });

    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      toast.warning("No se pudo obtener el usuario para cargar los eventos.")
      return;
    }

    let events = await allEventsPromise;
    events = events.filter(event => this.eventMatchesUser(event, user));

    const grouped: IEventsList = {};

    for (const event of events) {
      const dateKey = DateTime.fromISO(event.startDate).toISODate(); // ej: '2025-04-10'
      if (dateKey !== null) {
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }

        grouped[dateKey].push(event);
      }
    }
    this.eventsList.set(grouped);
  }

  async loadConferences() {
    const allConferencesPromise = this.eventService.getConferencesForCalendar();
  
    toast.promise(allConferencesPromise, {
      loading: 'Cargando conferencias disponibles...',
      success: '¡Se han cargado las conferencias disponibles!',
      error: 'Hubo un error, no se pudieron obtener las conferencias.',
    });
  
    try {
      const conferences = await allConferencesPromise;
      this.conferences.set(conferences);
    } catch (error) {
      console.error('Error loading conferences:', error);
    }
  }

  eventMatchesUser(event: IEvent, user: IAppUser): boolean {
    if (!event.teachingLevels?.includes(user.teachingLevel)) return false;

    // If it's "Primaria", it's not filtered by specialty
    if (user.teachingLevel === 'Primaria') return true;

    // If it's "Secundaria", there must be a specialty match
    return event.specialties?.some(s => user.specializations.includes(s));
  }

  selectedEvent = signal<IEvent | null>(null);

  selectEvent(item: IEvent | IConference): void {
    // Clear both selections first
    this.selectedEvent.set(null);
    this.selectedConference.set(null);
    
    // Check if it's a conference (has finishDate) or event (has endDate)
    if ('finishDate' in item) {
      this.selectedConference.set(item as IConference);
    } else {
      this.selectedEvent.set(item as IEvent);
    }
  }

  isConference(item: IEvent | IConference): boolean {
    return 'finishDate' in item;
  }

  navigateToNewPresentation(conferenceId: string): void {
    this.router.navigate([`/eventos-academicos/conferencias/${conferenceId}/nueva-ponencia`]);
  }

  selectDay(day: DateTime): void {
    this.activeDay.set(day);
    this.selectedEvent.set(null);
    this.selectedConference.set(null);
  }

  hasEventsOnDay(dateISO: string): boolean {
    const hasEvents = (this.eventsList()[dateISO] ?? []).length > 0;
    const hasConferences = this.conferences().some(conf => conf.startDate === dateISO);
    return hasEvents || hasConferences;
  }

  DATE_MEDIUM = DateTime.DATE_MED
  today: Signal<DateTime> = signal(DateTime.local());
  firstDayOfActiveMonth: WritableSignal<DateTime> = signal(
    this.today().startOf('month')
  );
  activeDay: WritableSignal<DateTime | null> = signal(null);

  activeDayEvents = computed(() => {
    const activeDay = this.activeDay();
    if (activeDay === null) {
      return [];
    }
    const activeDayISO = activeDay.toISODate();

    if (!activeDayISO) {
      return [];
    }

      // Get events for this day 
    const dayEvents = this.eventsList()[activeDayISO] ?? [];
    
    // Get conferences for this day
    const dayConferences = this.conferences().filter(conf => conf.startDate === activeDayISO);

    // Combine both
    return [...dayEvents, ...dayConferences];
  });

  // weekDays: Signal<string[]> = signal(Info.weekdays('short', { locale: 'en-US' }));
  weekDays: Signal<string[]> = signal(
    [...Info.weekdays('short', { locale: 'es-US' })].slice(-1).concat(
      Info.weekdays('short', { locale: 'es-US' }).slice(0, 6)
    )
  );

  daysOfTheMonth: Signal<DateTime[]> = computed(() => {
    const first = this.firstDayOfActiveMonth();
    const last = first.endOf('month');

    // Force the first day of the week to be Sunday
    const start = first.minus({ days: first.weekday % 7 });

    //Force the Saturday to be the last day of the week
    const end = last.plus({ days: (6 - (last.weekday % 7)) });

    return Interval.fromDateTimes(start, end)
      .splitBy({ day: 1 })
      .map(d => {
        if (!d.start) {
          toast.error('Fechas incorrectas');
          throw new Error('Fechas incorrectas');
        }
        return d.start;
      });

    // return Interval.fromDateTimes(
    //   this.firstDayOfActiveMonth().startOf('week'),
    //   this.firstDayOfActiveMonth().endOf('month').endOf('week')
    // ).splitBy({ day: 1 })
    //   .map((d) => {
    //     if (d.start === null) {
    //       toast.error('Fechas incorrectas');
    //       throw new Error('Fechas incorrectas');
    //     }
    //     return d.start;
    //   });
  });

  goToPreviuosMonth(): void {
    this.firstDayOfActiveMonth.set(
      this.firstDayOfActiveMonth().minus({ month: 1 })
    )
  }

  goToToday(): void {
    const today = DateTime.local();
    this.activeDay.set(today);

    this.firstDayOfActiveMonth.set(
      this.today().startOf('month')
    )
    this.selectedEvent.set(null);
  }

  goToNextMonth(): void {
    this.firstDayOfActiveMonth.set(
      this.firstDayOfActiveMonth().plus({ month: 1 })
    )
  }

  reformatDate(date: string) {
    if (!date) return '';

    const dateTime = DateTime.fromISO(date);
    return dateTime.toFormat("dd 'de' LLLL 'del' yyyy");
  }

  canRegister(event: IEvent, currentUserId: string): boolean {
    const alreadyRegistered = event.registeredUsers.includes(currentUserId);
    const unlimited = event.capacity === null || event.capacity === 0;
    const spotsLeft = event.capacity ? event.capacity - event.registeredUsers.length : Infinity;
    //const eventHasntBegun = !this.eventHasBegun(event);

    return !alreadyRegistered && (unlimited || spotsLeft > 0) //&& eventHasntBegun;
  }

  eventHasBegun(event: IEvent): boolean {
    const now = DateTime.local();
    const eventStart = DateTime.fromISO(event.startDate);
    return now > eventStart;
  }

  isUserRegistered(event: IEvent): boolean {
    const uid = this.userUid();
    return !!uid && event.registeredUsers.includes(uid);
  }

  async registerToTheEvent(event: IEvent) {
    const uid = this.userUid();
    if (!uid) {
      toast.error("Debes iniciar sesión para inscribirte.");
      return;
    }

    const alreadyRegistered = this.isUserRegistered(event);
    const unlimited = event.capacity === null || event.capacity === 0;
    const spotsLeft = event.capacity ? event.capacity - event.registeredUsers.length : Infinity;

    if (alreadyRegistered) {
      toast.info("¡Ya te has inscrito a este evento!");
      return;
    }

    if (!unlimited && spotsLeft <= 0) {
      toast.warning("Este evento ya está lleno.");
      return;
    }

    this.isRegistering.set(true);
    try {
      //Clone the current array (for security)
      const updatedUsers = [...(event.registeredUsers || []), uid];

      //Update the event on Firestore with the service
      const openEventRequestPromise = this.eventService.registerUserToOpenEvent(event.id, uid);

      toast.promise(openEventRequestPromise, {
        loading: 'Registrándote al evento...',
        success: '¡Te has inscrito al evento!',
        error: 'Ocurrió un error al inscribirte al evento.',
      });

      await openEventRequestPromise;

      // Refresh the event's local state
      const updatedEvent = { ...event, registeredUsers: updatedUsers };
      this.selectedEvent.set(updatedEvent);

      // Update the events of the day too
      const currentDayISO = DateTime.fromISO(event.startDate).toISODate();
      const allEvents = { ...this.eventsList() };

      if (currentDayISO && allEvents[currentDayISO]) {
        const updatedDayEvents = allEvents[currentDayISO].map(e =>
          e.id === event.id ? updatedEvent : e
        );
        allEvents[currentDayISO] = updatedDayEvents;
        this.eventsList.set(allEvents);
      }

      // toast.success('¡Te has inscrito al evento!');
    } catch (error) {
      console.error(error);
      toast.error('Error al inscribirse');
    } finally {
      this.isRegistering.set(false);
    }
  }

  async requestRegistration(event: IEvent) {
    const uid = this.userUid();
    const name = this.userName() ?? 'Usuario desconocido';
    if (!uid) {
      toast.error("Debes iniciar sesión para enviar una solicitud.");
      return;
    }

    if (event.pendingRequests?.some(req => req.uid === uid)) {
      toast.info("Ya enviaste una solicitud para este evento.");
      return;
    }

    this.isRegistering.set(true);
    try {

      const restrictedRequestPromise = this.eventService.requestRegistrationToRestrictedEvent(event.id, uid);

      toast.promise(restrictedRequestPromise, {
        loading: 'Enviando solicitud...',
        success: 'Solicitud enviada correctamente.',
        error: 'Ocurrió un error enviado la solicitud',
      });

      await restrictedRequestPromise;

      // Locally update pendingRequests
      const updatedRequests = [...event.pendingRequests, { uid, name }];
      const updatedEvent = { ...event, pendingRequests: updatedRequests };
      this.selectedEvent.set(updatedEvent);

      // Also update the events of the day
      const currentDayISO = DateTime.fromISO(event.startDate).toISODate();
      const allEvents = { ...this.eventsList() };

      if (currentDayISO && allEvents[currentDayISO]) {
        const updatedDayEvents = allEvents[currentDayISO].map(e =>
          e.id === event.id ? updatedEvent : e
        );
        allEvents[currentDayISO] = updatedDayEvents;
        this.eventsList.set(allEvents);
      }
      //toast.success("Solicitud enviada correctamente.");
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar la solicitud.");
    } finally {
      this.isRegistering.set(false);
    }
  }

  //Getters for the registration buttons

  get userHasRequestedToRegister(): boolean {
    const event = this.selectedEvent();
    const uid = this.userUid();
    return !!event?.pendingRequests?.some(req => req.uid === uid);
    // return this.selectedEvent()?.pendingRequests?.some(req => req.uid === this.userUid()!) ?? false;
  }

  get showRequestRegisterButton(): boolean {
    const event = this.selectedEvent();
    // const uid = this.userUid();

    if (!event) return false;

    var hasIlimitedCapacity = false;
    var hasLimitedCapacity = false;
    if (event.capacity === 0) {
      hasIlimitedCapacity = true
    }
    if (!event.capacity && event.capacity !== 0) {
      return false;
    } else if (event.capacity >= 0) {
      hasLimitedCapacity = true;
    }

    const isRestrictedEvent = event.enrollmentType === 'Restringida'
    // const isFull = event.registeredUsers?.length >= event.capacity;
    // const alreadyWaiting = event.waitingList?.some(w => w.uid === uid);

    // return (isRestrictedEvent && !isFull);

    return isRestrictedEvent && (hasIlimitedCapacity || hasLimitedCapacity);
  }

  get userIsAlreadyOnWaitingList(): boolean {
    const event = this.selectedEvent();
    const uid = this.userUid();

    if (!event || !uid || !event.capacity) return false;

    const alreadyWaiting = event.waitingList?.some(w => w.uid === uid);

    if (!alreadyWaiting) return false;

    return alreadyWaiting;
  }

  get showWaitingListButton(): boolean {
    const event = this.selectedEvent();
    const uid = this.userUid();

    if (!event || !uid || !event.capacity) return false;

    const isFull = event.registeredUsers?.length >= event.capacity;
    const alreadyRequested = event.pendingRequests?.some(req => req.uid === uid);
    const alreadyWaiting = event.waitingList?.some(w => w.uid === uid);
    const alreadyRegistered = this.isUserRegistered(event);

    return (
      event.enrollmentType === 'Restringida' &&
      isFull &&
      !alreadyRequested &&
      !alreadyWaiting &&
      !alreadyRegistered &&
      !this.eventHasBegun(event)
    );
  }

  get userIsInWaitingList(): boolean {
    const event = this.selectedEvent();
    const uid = this.userUid();
    return !!event?.waitingList?.some(user => user.uid === uid);
  }

  get eventIsFull(): boolean {
    const event = this.selectedEvent();
    const uid = this.userUid();

    if (!event || !uid || !event.capacity) return false;

    console.log(event.registeredUsers?.length >= event.capacity)

    return event.registeredUsers?.length >= event.capacity;
  }

  async joinWaitingList(event: IEvent) {
    const uid = this.userUid();
    const name = this.userName();

    if (!uid || !name) {
      toast.error('Debes iniciar sesión para unirte a la lista de espera.');
      return;
    }

    if (event.waitingList?.some(u => u.uid === uid)) {
      toast.info('Ya estás en la lista de espera.');
      return;
    }

    this.isRegistering.set(true);
    try {
      const joinWaitingListPromise = this.eventService.joinWaitingList(event.id, uid);

      toast.promise(joinWaitingListPromise, {
        loading: 'Enviando solicitud...',
        success: 'Te uniste a la lista de espera.',
        error: 'Ocurrió un error enviado la solicitud.',
      });

      await joinWaitingListPromise;

      const updatedEvent = {
        ...event,
        waitingList: [...(event.waitingList || []), { uid, name }]
      };
      this.selectedEvent.set(updatedEvent);

      // Update events locally
      this.eventService.updateEventLocally(updatedEvent);

      const dayISO = DateTime.fromISO(event.startDate).toISODate();
      const allEvents = { ...this.eventsList() };
      if (dayISO && allEvents[dayISO]) {
        allEvents[dayISO] = allEvents[dayISO].map(e =>
          e.id === event.id ? updatedEvent : e
        );
        this.eventsList.set(allEvents);
      }
      // toast.success('Te uniste a la lista de espera.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo unir a la lista de espera.');
    } finally {
      this.isRegistering.set(false);
    }
  }
}
