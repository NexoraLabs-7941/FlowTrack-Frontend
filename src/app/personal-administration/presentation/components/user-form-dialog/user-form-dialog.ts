import { Component, Inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { UserStore } from '../../../application/user.store';
import { User } from '../../../domain/user.model';
import { PermissionApi } from '../../../infrastructure/permission-api';
import { PermissionWithMetadata } from '../../../infrastructure/permission-response';
import { PermissionConfigService } from '../../../infrastructure/permission-config.service';

/**
 * Data passed to the user form dialog.
 */
export interface UserFormDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

/**
 * Dialog component for creating and editing users.
 */
@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    TranslatePipe
  ],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.css'
})
export class UserFormDialog implements OnInit {
  saving = false;
  loadingPermissions = true;
  form!: FormGroup;
  availablePermissions: PermissionWithMetadata[] = [];

  constructor(
    private fb: FormBuilder,
    private userStore: UserStore,
    private permissionApi: PermissionApi,
    private permissionConfigService: PermissionConfigService,
    private ref: MatDialogRef<UserFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormDialogData
  ) {
    effect(() => {
      if (this.saving && !this.userStore.loading()) {
        this.saving = false;
        this.ref.close(true);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPermissions();
  }

  get permissionsFormArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  getSelectedPermissionsCount(): number {
    return this.permissionsFormArray.controls.filter(control => control.value).length;
  }

  cancel(): void {
    this.ref.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const { email, password, permissions } = this.form.value;
    
    const selectedPermissions = this.availablePermissions
      .filter((_, index) => permissions[index])
      .map(perm => perm.value);
    
    if (this.data.mode === 'edit' && this.data.user) {
      const updatePassword = password && password.trim() !== '' ? password : undefined;
      this.userStore.updateUser(this.data.user.id, email, updatePassword, selectedPermissions);
    } else {
      this.userStore.createUser(email, password, selectedPermissions);
    }
  }

  private initializeForm(): void {
    const isEditMode = this.data.mode === 'edit' && this.data.user;
    const user = this.data.user;
    
    this.form = this.fb.group({
      email: [isEditMode && user ? user.email : '', [Validators.required, Validators.email]],
      password: ['', isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      permissions: this.fb.array([])
    });
  }

  private loadPermissions(): void {
    this.loadingPermissions = true;
    this.permissionApi.getAllPermissions().subscribe({
      next: (permissions) => {
        this.availablePermissions = this.permissionConfigService.enrichPermissionsWithMetadata(permissions);
        this.updateFormWithPermissions();
        this.loadingPermissions = false;
      },
      error: () => {
        this.loadingPermissions = false;
      }
    });
  }

  private updateFormWithPermissions(): void {
    const isEditMode = this.data.mode === 'edit' && this.data.user;
    const user = this.data.user;
    
    const permissionsArray = this.permissionsFormArray;
    while (permissionsArray.length !== 0) {
      permissionsArray.removeAt(0);
    }
    
    this.availablePermissions.forEach(perm => {
      const hasPermission = isEditMode && user ? user.hasPermission(perm.value) : false;
      permissionsArray.push(this.fb.control(hasPermission));
    });
  }
}

