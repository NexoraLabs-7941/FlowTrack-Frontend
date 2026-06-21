import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog" [attr.aria-labelledby]="'dialog-title'" [attr.aria-describedby]="'dialog-message'">
      <div class="dialog-header" [class]="data.type || 'info'">
        <mat-icon class="dialog-icon" [attr.aria-hidden]="true">
          {{ getIcon() }}
        </mat-icon>
        <h2 class="dialog-title" id="dialog-title">{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p id="dialog-message">{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-stroked-button 
          class="btn-cancel" 
          (click)="onCancel()"
          [attr.aria-label]="data.cancelText || 'Cancelar'">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button 
          mat-raised-button 
          [class]="'btn-confirm ' + (data.type || 'info')" 
          (click)="onConfirm()"
          [attr.aria-label]="data.confirmText || 'Confirmar'">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 320px;
      max-width: 400px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 16px;
    }
    
    .dialog-header.danger .dialog-icon {
      color: #dc2626;
      background: #fef2f2;
    }
    
    .dialog-header.warning .dialog-icon {
      color: #d97706;
      background: #fffbeb;
    }
    
    .dialog-header.info .dialog-icon {
      color: #2563eb;
      background: #eff6ff;
    }
    
    .dialog-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .dialog-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .dialog-content {
      padding: 0 24px 16px !important;
    }
    
    .dialog-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9375rem;
      line-height: 1.5;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px !important;
    }
    
    .dialog-actions button {
      min-width: 100px;
      height: 40px;
      font-weight: 500;
      border-radius: 8px;
      text-transform: none;
    }
    
    .btn-cancel {
      border: 1px solid #e5e7eb !important;
      color: #6b7280 !important;
      background: white !important;
    }
    
    .btn-cancel:hover {
      background: #f9fafb !important;
    }
    
    .btn-confirm.danger {
      background: #dc2626 !important;
      color: white !important;
    }
    
    .btn-confirm.danger:hover {
      background: #b91c1c !important;
    }
    
    .btn-confirm.warning {
      background: #d97706 !important;
      color: white !important;
    }
    
    .btn-confirm.info {
      background: #2563eb !important;
      color: white !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'warning';
      case 'warning': return 'error_outline';
      default: return 'info';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

