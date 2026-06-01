import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InventoryStore } from '../../application/inventory.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-new-category-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, TranslatePipe],
  templateUrl: './new-category-dialog.html',
  styleUrls: ['./new-category-dialog.css'],
})
export class NewCategoryDialogComponent {
  protected readonly store = inject(InventoryStore);
  private dialogRef = inject(MatDialogRef<NewCategoryDialogComponent>);

  form = {
    name: '',
    description: ''
  };

  get isValid(): boolean {
    return this.form.name.trim().length > 0;
  }

  cancel() {
    this.dialogRef.close(false);
  }

  save() {
    if (!this.isValid) {
      return;
    }

    this.store.addCategory({
      name: this.form.name.trim(),
      description: this.form.description.trim()
    });
    this.dialogRef.close(true);
  }
}

