import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryStore } from '../../application/inventory.store';
import { Batch } from '../../domain/model/batch.entity';

@Component({
  selector: 'app-restocking-dialog',
  templateUrl: './restocking-dialog.html',
  styleUrls: ['./restocking-dialog.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    FormsModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  providers: [provideNativeDateAdapter()]
})
export class RestockingDialogComponent implements OnInit {
  protected readonly store = inject(InventoryStore);
  private dialogRef = inject(MatDialogRef<RestockingDialogComponent>);

  selectedProductId: string = '';
  quantity: number = 0;
  fechaRecepcion: Date | null = null;
  fechaVencimiento: Date | null = null;

  get loading(): boolean {
    return this.store.loading();
  }

  get error(): string | null {
    return this.store.error();
  }

  get products() {
    return this.store.products().filter(p => p.isActive === true);
  }

  get selectedProduct() {
    return this.products.find(p => p.id === this.selectedProductId);
  }

  get currentStock(): number {
    if (!this.selectedProductId) return 0;

    // Calculate stock from batches
    const batches = this.store.batches();
    return batches
      .filter(b => b.productId === this.selectedProductId)
      .reduce((sum, batch) => sum + batch.quantity, 0);
  }

  get totalStock(): number {
    return this.currentStock + this.quantity;
  }

  ngOnInit(): void {
    // No need to load anything, data is already in store
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.canSave) return;

    const batch = new Batch({
      id: '', // Backend will assign the ID
      productId: this.selectedProductId,
      quantity: this.quantity,
      expirationDate: this.fechaVencimiento!.toISOString(),
      receptionDate: this.fechaRecepcion!.toISOString()
    });

    this.store.addBatch(batch);
    this.dialogRef.close(true);
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 0) {
      this.quantity--;
    }
  }

  onQuantityChange(): void {
    if (this.quantity < 0) {
      this.quantity = 0;
    }
  }

  isValidDate(d: Date | null): boolean {
    return d !== null && d instanceof Date && !isNaN(d.getTime());
  }

  isExpirationBeforeReception(): boolean {
    if (!this.isValidDate(this.fechaRecepcion) || !this.isValidDate(this.fechaVencimiento)) return false;
    return this.fechaVencimiento! < this.fechaRecepcion!;
  }

  get canSave(): boolean {
    const productOk = !!this.selectedProductId;
    const quantityOk = this.quantity > 0;
    const recOk = this.isValidDate(this.fechaRecepcion);
    const expOk = this.isValidDate(this.fechaVencimiento);
    const orderOk = !this.isExpirationBeforeReception();
    return productOk && quantityOk && recOk && expOk && orderOk;
  }
}
