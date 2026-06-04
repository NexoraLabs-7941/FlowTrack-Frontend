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
import { Router } from '@angular/router';
import { InventoryStore } from '../../application/inventory.store';
import { Batch } from '../../domain/model/batch.entity';
import { RestockingYoloState } from '../restocking-yolo-page/restocking-yolo-page';

export interface ProductRow {
  productId: string;
  quantity: number;
}

@Component({
  selector: 'app-restocking-dialog',
  templateUrl: './restocking-dialog.html',
  styleUrls: ['./restocking-dialog.css'],
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatIconModule, MatDatepickerModule,
    MatSelectModule, FormsModule, MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()]
})
export class RestockingDialogComponent implements OnInit {
  protected readonly store = inject(InventoryStore);
  private dialogRef = inject(MatDialogRef<RestockingDialogComponent>);
  private router = inject(Router);

  lote: string = '';
  fechaRecepcion: Date | null = null;
  fechaVencimiento: Date | null = null;
  rows: ProductRow[] = [{ productId: '', quantity: 0 }];

  get loading(): boolean { return this.store.loading(); }
  get error(): string | null { return this.store.error(); }
  get products() { return this.store.products().filter(p => p.isActive === true); }

  ngOnInit(): void {}

  getCurrentStock(productId: string): number {
    if (!productId) return 0;
    return this.store.getStockForProduct(productId);
  }

  getRowTotal(row: ProductRow): number {
    return this.getCurrentStock(row.productId) + row.quantity;
  }

  increment(row: ProductRow): void { row.quantity++; }
  decrement(row: ProductRow): void { if (row.quantity > 0) row.quantity--; }

  addRow(): void { this.rows.push({ productId: '', quantity: 0 }); }

  removeRow(index: number): void {
    if (this.rows.length > 1) this.rows.splice(index, 1);
  }

  openYoloView(): void {
    const productIds = this.rows.map(r => r.productId).filter(id => !!id);
    this.dialogRef.close();
    this.router.navigate(['/inventario/reposicion/yolo'], {
      state: {
        lote: this.lote,
        fechaRecepcion: this.fechaRecepcion?.toISOString() ?? null,
        fechaVencimiento: this.fechaVencimiento?.toISOString() ?? null,
        productIds: productIds.length > 0 ? productIds : []
      } as RestockingYoloState
    });
  }

  isValidDate(d: Date | null): boolean {
    return d !== null && d instanceof Date && !isNaN(d.getTime());
  }

  isExpirationBeforeReception(): boolean {
    if (!this.isValidDate(this.fechaRecepcion) || !this.isValidDate(this.fechaVencimiento)) return false;
    return this.fechaVencimiento! < this.fechaRecepcion!;
  }

  get canSave(): boolean {
    const datesOk = this.isValidDate(this.fechaRecepcion)
      && this.isValidDate(this.fechaVencimiento)
      && !this.isExpirationBeforeReception();
    const rowsOk = this.rows.some(r => r.productId && r.quantity > 0);
    return datesOk && rowsOk;
  }

  onCancel(): void { this.dialogRef.close(); }

  onSave(): void {
    if (!this.canSave) return;
    for (const row of this.rows.filter(r => r.productId && r.quantity > 0)) {
      const batch = new Batch({
        id: '',
        productId: row.productId,
        quantity: row.quantity,
        expirationDate: this.fechaVencimiento!.toISOString(),
        receptionDate: this.fechaRecepcion!.toISOString()
      });
      this.store.addBatch(batch);
    }
    this.dialogRef.close(true);
  }
}
