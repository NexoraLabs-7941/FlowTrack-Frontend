import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryStore } from '../../application/inventory.store';
import { YoloDetection } from '../../domain/model/YoloDetection';
import { Batch } from '../../domain/model/batch.entity';

export interface RestockingYoloState {
  lote: string;
  fechaRecepcion: string | null;
  fechaVencimiento: string | null;
  productIds: string[];
}

@Component({
  selector: 'app-restocking-yolo-page',
  templateUrl: './restocking-yolo-page.html',
  styleUrls: ['./restocking-yolo-page.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class RestockingYoloPageComponent implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly router = inject(Router);

  lote: string = '';
  fechaRecepcion: Date | null = null;
  fechaVencimiento: Date | null = null;

  yoloImagePreview: string | null = null;
  yoloImageFile: File | null = null;
  yoloDetections: YoloDetection[] = [];

  get loading(): boolean { return this.store.loading(); }
  get error(): string | null { return this.store.error(); }

  // Getters para binding con input[type=date]
  get fechaRecepcionStr(): string {
    return this.fechaRecepcion
      ? this.fechaRecepcion.toISOString().substring(0, 10)
      : '';
  }

  get fechaVencimientoStr(): string {
    return this.fechaVencimiento
      ? this.fechaVencimiento.toISOString().substring(0, 10)
      : '';
  }

  onFechaRecepcionChange(value: string): void {
    this.fechaRecepcion = value ? new Date(value + 'T00:00:00') : null;
  }

  onFechaVencimientoChange(value: string): void {
    this.fechaVencimiento = value ? new Date(value + 'T00:00:00') : null;
  }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as RestockingYoloState | undefined;

    if (state) {
      this.lote = state.lote ?? '';
      this.fechaRecepcion = state.fechaRecepcion ? new Date(state.fechaRecepcion) : null;
      this.fechaVencimiento = state.fechaVencimiento ? new Date(state.fechaVencimiento) : null;
      this.yoloDetections = this.store.simulateYoloDetection(
        state.productIds?.length > 0
          ? state.productIds
          : this.store.products().filter(p => p.isActive).slice(0, 3).map(p => p.id)
      );
    } else {
      this.yoloDetections = this.store.simulateYoloDetection(
        this.store.products().filter(p => p.isActive).slice(0, 3).map(p => p.id)
      );
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.yoloImageFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.yoloImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(this.yoloImageFile);
  }

  updateDetectionQty(index: number, qty: number): void {
    this.yoloDetections[index] = this.yoloDetections[index].withValidatedQuantity(Math.max(0, qty));
  }

  incrementDetection(index: number): void {
    this.updateDetectionQty(index, this.yoloDetections[index].validatedQuantity + 1);
  }

  decrementDetection(index: number): void {
    this.updateDetectionQty(index, this.yoloDetections[index].validatedQuantity - 1);
  }

  isValidDate(d: Date | null): boolean {
    return d !== null && d instanceof Date && !isNaN(d.getTime());
  }

  get canSave(): boolean {
    return this.isValidDate(this.fechaRecepcion)
      && this.isValidDate(this.fechaVencimiento)
      && this.yoloDetections.some(d => d.validatedQuantity > 0);
  }

  goBack(): void {
    this.router.navigate(['/inventario']);
  }

  onSave(): void {
    if (!this.canSave) return;
    for (const d of this.yoloDetections.filter(d => d.validatedQuantity > 0)) {
      const batch = new Batch({
        id: '',
        productId: d.productId,
        quantity: d.validatedQuantity,
        expirationDate: this.fechaVencimiento!.toISOString(),
        receptionDate: this.fechaRecepcion!.toISOString()
      });
      this.store.addBatch(batch);
    }
    this.router.navigate(['/inventario']);
  }
}
