import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { UserStore } from '../../application/user.store';
import { AuthStore } from '../../../auth/application/auth.store';
import { User, UserRole } from '../../domain/user.model';
import { UserFormDialog } from '../components/user-form-dialog/user-form-dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/presentation/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-personal-administration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './personal-administration.html',
  styleUrl: './personal-administration.css'
})
export class PersonalAdministrationComponent {
  private translate = inject(TranslateService);
  private userStore = inject(UserStore);
  private authStore = inject(AuthStore);
  private dialog = inject(MatDialog);

  searchTerm = '';
  filterRole = 'todos';

  displayedColumns = ['email', 'role', 'actions'];

  users = this.userStore.users;
  loading = this.userStore.loading;
  error = this.userStore.error;
  hasUsers = this.userStore.hasUsers;
  currentUser = this.authStore.currentUser;

  readonly ROLE_ADMIN = UserRole.ADMIN;
  readonly ROLE_USER = UserRole.USER;

  protected t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  get filteredUsers(): User[] {
    const allUsers = this.users();
    if (allUsers.length === 0) return [];

    const primaryUserId = this.getPrimaryUserId(allUsers);

    const search = this.searchTerm.toLowerCase();
    return allUsers
      .filter(user => {
        if (user.id === primaryUserId) return false;

        const matchesSearch =
          user.displayName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.roleDisplayName.toLowerCase().includes(search);

        const matchesRole = this.filterRole === 'todos' ||
          (this.filterRole === UserRole.ADMIN && user.hasRole(UserRole.ADMIN)) ||
          (this.filterRole === UserRole.USER && user.hasRole(UserRole.USER));

        return matchesSearch && matchesRole;
      });
  }

  private getPrimaryUserId(users: User[]): string {
    if (users.length === 0) return '';
    const sorted = [...users].sort((a, b) => Number(a.id) - Number(b.id));
    return sorted[0].id;
  }

  canDeleteUser(user: User): boolean {
    const currentUserId = this.currentUser()?.id;
    const primaryUserId = this.getPrimaryUserId(this.users());
    
    if (currentUserId && user.id === currentUserId) return false;
    if (user.id === primaryUserId) return false;
    
    return true;
  }

  getDeleteTooltip(user: User): string {
    const currentUserId = this.currentUser()?.id;
    const primaryUserId = this.getPrimaryUserId(this.users());
    
    if (currentUserId && user.id === currentUserId) {
      return this.t('personalAdministration.cannotDeleteSelf');
    }
    if (user.id === primaryUserId) {
      return this.t('personalAdministration.cannotDeleteOwner');
    }
    return this.t('personalAdministration.deleteUser');
  }

  get adminCount(): number {
    return this.filteredUsers.filter(u => u.hasRole(UserRole.ADMIN)).length;
  }

  get userCount(): number {
    return this.filteredUsers.filter(u => u.hasRole(UserRole.USER)).length;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialog, {
      width: '500px',
      data: { mode: 'create' },
      panelClass: 'custom-dialog',
      ariaLabel: this.t('personalAdministration.newUserTitle')
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User was created, list will auto-update from store
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialog, {
      width: '500px',
      data: { mode: 'edit', user },
      panelClass: 'custom-dialog',
      ariaLabel: this.t('personalAdministration.editUserTitle')
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User was updated, list will auto-update from store
      }
    });
  }

  confirmDelete(user: User): void {
    if (!this.canDeleteUser(user)) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.t('personalAdministration.confirmDeleteTitle'),
        message: this.t('personalAdministration.confirmDeleteMessage', { name: user.displayName }),
        confirmText: this.t('common.delete'),
        cancelText: this.t('common.cancel'),
        type: 'danger'
      } as ConfirmDialogData,
      ariaLabel: this.t('personalAdministration.confirmDeleteTitle')
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userStore.deleteUser(user.id);
      }
    });
  }

  clearFilters(): void {
    this.filterRole = 'todos';
    this.searchTerm = '';
  }

  getRoleClass(user: User): string {
    return user.isAdmin() ? 'role-chip admin' : 'role-chip seller';
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
