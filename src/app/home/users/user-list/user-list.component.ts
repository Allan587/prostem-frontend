import { Component, inject, Injector, runInInjectionContext, ViewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ModalComponent } from '../../modal/modal.component';
import { UserService } from '../data-access/user.service';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { toast } from 'ngx-sonner';
import { onSnapshot, collection } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatIconModule, MatSelectModule, ModalComponent, MatTooltipModule, MatPaginator],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  private userService = inject(UserService);
  private firestore = inject(Firestore);

  users: any[] = [];
  isLoadingUsers = true;
  isSubmitting = false;

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isDeleteModalOpened = false;
  isUserToAdminModalOpened = false;
  selectedUser: any = null;

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Docente' }
  ];
  selectedRole: string = '';

  displayedColumns: string[] = [
    'id',
    'fullName',
    'role',
    'email',
    'birthDate',
    'institution',
    'phone',
    'teachingLevel',
    'specializations',
    'options'
  ];

  changeUserRoleTooltipText = 'Cambiar el rol de este usuario';
  deleteUserTooltilpText = 'Eliminar usuario';
  tooltipDuration = 25;   //In milliseconds.

  constructor(private injector: Injector) { }

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      this.isLoadingUsers = true;
      const surveysRef = collection(this.firestore, 'users');
      onSnapshot(surveysRef, async (snapshot) => {
        this.users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.users = this.users.map((user) => ({
          ...user,
          fullName: `${user.name} ${user.lastName1} ${user.lastName2}`
        }));

        this.dataSource.data = this.users;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.isLoadingUsers = false;
        setTimeout(() => this.waitForViewInit(), 0);
      });

    });
  }

  ngAfterViewInit(): void {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
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

  openDeleteModal(user: IUserProfile): void {
    this.selectedUser = user;
    this.isDeleteModalOpened = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpened = false;
    //toast sin cambios
  }

  openUserToAdminModal(user: IUserProfile): void {
    this.selectedUser = user;
    this.selectedRole = user.role;
    this.isUserToAdminModalOpened = true;
  }

  closeUserToAdminModal(): void {
    this.isUserToAdminModalOpened = false;
    this.selectedUser = null;
    this.selectedRole = '';
  }

  async submitDeleteModal(userID: string) {
    try {
      this.isSubmitting = true;
      const deleteUserPromise = this.userService.deleteUser(userID);

      toast.promise(deleteUserPromise, {
        loading: 'Eliminando el usuario...',
        success: '¡Se eliminó el usuario!'
      });

      await deleteUserPromise;

      // await this.userService.deleteUser(userID);
      // toast.info('¡Se eliminó el usuario!');
    } catch (error) {
      toast.error('Ocurrió un error al eliminar el usuario');
      console.error(error);
    } finally {
      this.closeDeleteModal();
      this.isSubmitting = false;
    }
  }

  async submitUserToAdminModal(userID: string) {
    try {
      this.isSubmitting = true;

      const selectedRoleLabel = this.roles.find(r => r.value === this.selectedRole)?.label;
      const updateRolePromise = this.userService.updateUserRole(userID, this.selectedRole);

      toast.promise(updateRolePromise, {
        loading: 'Actualizando el rol del usuario...',
        success: `¡${this.selectedUser.fullName} ahora tiene el rol '${selectedRoleLabel}'!`
      });
      await updateRolePromise;
      // await this.userService.updateUserRole(userID, this.selectedRole);
      // toast.success(`¡${this.selectedUser.fullName} ahora tiene el rol '${this.selectedRole}'!`);
    } catch (error) {
      toast.error('Ocurrió un error al eliminar el usuario');
      console.error(error);
    } finally {
      this.closeUserToAdminModal();
      this.isSubmitting = false;
    }
  }
}
