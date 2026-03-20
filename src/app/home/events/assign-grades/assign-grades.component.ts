import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EventService } from '../data-access/event.service';
import { UserService } from '../../users/data-access/user.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { toast } from 'ngx-sonner';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-assign-grades',
  imports: [CommonModule, MatTableModule, MatIconModule, FormsModule],
  templateUrl: './assign-grades.component.html',
  styleUrl: './assign-grades.component.css'
})
export default class AssignGradesComponent {
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  eventID: string | null = null;
  eventName = '';

  users: any[] = [];
  gradesMap: { [uid: string]: string } = {};
  isSavingGrades = false;

  isLoadingUsers = false;

  displayedColumns: string[] = [
    'name',
    'email',
    'grade'
  ];

  gradesTooltipText = 'Ingresa la nota de este estudiante';
  tooltipDuration = 25;   //In milliseconds.

  dataSource = new MatTableDataSource<any>([]);

  maxGrade = 100;
  form = this.formBuilder.group({
    capacity: this.formBuilder.control(0, [Validators.min(0), Validators.max(this.maxGrade)]),
  });

  constructor(private route: ActivatedRoute, private location: Location) { }

  goBack(): void {
    this.location.back();
  }

  ngOnInit() {
    this.eventID = this.route.snapshot.paramMap.get('eventID');
    if (this.eventID) {
      this.getUserFromTheEvent(this.eventID);
    }
  }

  async getUserFromTheEvent(id: string) {
    try {
      const getEventPromise = this.eventService.getEventByID(id);

      toast.promise(getEventPromise, {
        loading: 'Cargando usuarios matriculados...',
        success: '¡Usuarios cargados exitosamente!'
      });

      const requestedEvent = await getEventPromise;

      if (!requestedEvent) {
        toast.info(`No existe el evento con el id '${id}'`);
        this.goBack();
        return;
      }
      this.eventName = requestedEvent.title
      const uids: string[] = requestedEvent.registeredUsers || [];

      if (uids.length === 0) {
        toast.info('Aún no hay ningún usuario matriculado para ese evento.')
        this.router.navigateByUrl('/eventos');
        return;
      }

      this.users = await this.userService.getUsersByUIDs(uids);
      console.log(this.users);

      this.users = this.users.map((user) => ({
        ...user,
        fullName: `${user.name} ${user.lastName1} ${user.lastName2}`
      }));

      this.gradesMap = {};
      for (const user of this.users) {
        const grade = user.myEvents?.[this.eventID!]?.grade;
        this.gradesMap[user.uid] = grade != null ? grade.toString() : '';
      }

      this.dataSource.data = this.users;

    } catch (error) {
      console.error('Error al cargar el evento:', error);
      this.goBack();
    }
  }

  validateGradeInput(uid: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;


    // Eliminar signo negativo y todo lo que no sea dígito o punto
    value = value.replace(/[^0-9.]/g, '');


    // Limitar a solo un punto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limitar la parte entera a 3 dígitos
    const integerPart = parts[0].slice(0, 3);
    const decimalPart = parts[1] ?? '';
    value = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;

    this.gradesMap[uid] = value;
  }

  preventInvalidKeys(event: KeyboardEvent, currentValue: string) {
    const invalidKeys = ['-', '+', 'e', 'E'];

    // Bloquear signos negativos y notación científica
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }

    // Limitar a 3 dígitos enteros antes del punto
    const isDigit = /^\d$/.test(event.key);
    const [integerPart] = currentValue.split('.');
    if (isDigit && integerPart.length >= 3 && !currentValue.includes('.') && this.getCaretPosition(event) <= integerPart.length) {
      event.preventDefault();
    }
  }

  getCaretPosition(event: KeyboardEvent): number {
    const input = event.target as HTMLInputElement;
    return input.selectionStart ?? 0;
  }

  async updateSingleGrade(uid: string, value: string) {
    if (!this.eventID) {
      toast.warning('¡El ID del evento no debe ser vacío!');
      return;
    }
    try {
      const parsed = parseFloat(value);
      const grade = isNaN(parsed) ? null : parsed;
      await this.userService.updateUserGrade(uid, this.eventID, grade);
      // toast.success('Nota actualizada');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar la nota');
    }
  }

  async updateAllGrades() {
    if (!this.eventID) {
      toast.warning('¡El ID del evento no debe ser vacío!');
      return;
    }

    this.isSavingGrades = true;

    const updates = Object.entries(this.gradesMap).map(([uid, raw]) => {
      const parsed = parseFloat(raw);
      const grade = isNaN(parsed) ? null : parsed;
      return { uid, grade };
    });

    try {
      const updateAllGradesPromise = this.userService.updateMultipleGrades(this.eventID, updates);

      toast.promise(updateAllGradesPromise, {
        loading: 'Guardando notas...',
        success: 'Notas guardadas.'
      });

      await updateAllGradesPromise;
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar las notas');
    } finally {
      this.isSavingGrades = false;
    }
  }

  get hasEventID(): boolean {
    return !!this.eventID;
  }

  extractInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
