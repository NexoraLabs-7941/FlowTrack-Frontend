import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryStore } from '../../application/inventory.store';
import { YoloDetection } from '../../domain/model/YoloDetection';
import { Product } from '../../domain/model/product.entity';
import { InventoryDetectionApi } from '../../infrastructure/inventory-detection-api';

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
export class RestockingYoloPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly detectionApi = inject(InventoryDetectionApi);

  @ViewChild('cameraVideo') private cameraVideo?: ElementRef<HTMLVideoElement>;

  lote: string = '';
  fechaRecepcion: Date | null = null;
  fechaVencimiento: Date | null = null;

  selectedProductId = '';
  yoloImagePreview: string | null = null;
  yoloImageFile: File | null = null;
  yoloDetections: YoloDetection[] = [];

  detecting = false;
  saving = false;
  saveError: string | null = null;
  detectionError: string | null = null;
  cameraActive = false;
  cameraError: string | null = null;

  private cameraStream: MediaStream | null = null;

  get loading(): boolean { return this.store.loading(); }
  get error(): string | null { return this.store.error(); }
  get activeProducts(): Product[] {
    return this.store.products().filter(product => product.isActive);
  }

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
      if (state.productIds?.length) {
        this.selectedProductId = state.productIds[0];
      }
    }

    this.ensureSelectedProduct();
    this.refreshDetectionRow();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  onProductChange(productId: string): void {
    this.selectedProductId = productId;
    this.refreshDetectionRow();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.stopCamera();
    this.yoloImageFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.yoloImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(this.yoloImageFile);
    void this.runDetection(this.yoloImageFile);
  }

  async activateCamera(): Promise<void> {
    if (this.cameraActive) return;

    this.detectionError = null;
    this.cameraError = null;
    this.yoloImagePreview = null;
    this.yoloImageFile = null;
    this.cameraActive = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      this.cameraStream = stream;
      const video = await this.waitForVideoElement();
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
    } catch {
      this.stopCamera();
      this.cameraError = 'No se pudo acceder a la cámara. Verifica los permisos del navegador.';
    }
  }

  capturePhoto(): void {
    const video = this.cameraVideo?.nativeElement;
    if (!video || !this.cameraActive) return;

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
      this.cameraError = 'Espera a que aparezca la imagen de la cámara antes de capturar.';
      return;
    }

    this.cameraError = null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) {
        this.cameraError = 'No se pudo capturar la foto. Intenta de nuevo.';
        return;
      }

      this.stopCamera();

      this.yoloImageFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.yoloImagePreview = canvas.toDataURL('image/jpeg');
      void this.runDetection(this.yoloImageFile);
    }, 'image/jpeg', 0.95);
  }

  stopCamera(): void {
    this.cameraStream?.getTracks().forEach(track => track.stop());
    this.cameraStream = null;
    this.cameraActive = false;

    const video = this.cameraVideo?.nativeElement;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }

  updateDetectionQty(index: number, qty: number): void {
    this.yoloDetections[index] = this.yoloDetections[index].withValidatedQuantity(Math.max(0, qty));
  }

  isValidDate(d: Date | null): boolean {
    return d !== null && d instanceof Date && !isNaN(d.getTime());
  }

  get canSave(): boolean {
    return !!this.yoloImageFile
      && !!this.lote.trim()
      && this.isValidDate(this.fechaRecepcion)
      && this.isValidDate(this.fechaVencimiento)
      && this.yoloDetections.some(d => d.validatedQuantity > 0);
  }

  goBack(): void {
    this.stopCamera();
    this.router.navigate(['/inventario']);
  }

  onSave(): void {
    if (!this.canSave || !this.yoloImageFile) return;

    const detectionsToSave = this.yoloDetections.filter(d => d.validatedQuantity > 0);
    if (!detectionsToSave.length) return;

    this.saving = true;
    this.saveError = null;

    const saveNext = (index: number) => {
      if (index >= detectionsToSave.length) {
        this.saving = false;
        this.store.refresh();
        this.router.navigate(['/inventario']);
        return;
      }

      const detection = detectionsToSave[index];
      this.detectionApi.saveRestockRecord({
        image: this.yoloImageFile!,
        lote: this.lote.trim(),
        receptionDate: this.fechaRecepcionStr,
        expirationDate: this.fechaVencimientoStr,
        productId: detection.productId,
        detectedQuantity: detection.detectedQuantity,
        verifiedQuantity: detection.validatedQuantity,
        filename: this.yoloImageFile instanceof File ? this.yoloImageFile.name : 'capture.jpg'
      }).subscribe({
        next: () => saveNext(index + 1),
        error: err => {
          this.saving = false;
          this.saveError = this.formatSaveError(err);
        }
      });
    };

    saveNext(0);
  }

  private formatSaveError(error: unknown): string {
    if (error && typeof error === 'object') {
      const err = error as { error?: { message?: string }; message?: string; status?: number };
      if (err.error?.message) return err.error.message;
      if (err.message) return err.message;
      if (err.status === 0) {
        return 'No se pudo conectar con el backend para guardar el registro.';
      }
    }
    return 'No se pudo guardar el ingreso con la foto.';
  }

  private waitForVideoElement(): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const tryResolve = () => {
        const video = this.cameraVideo?.nativeElement;
        if (video) {
          resolve(video);
          return;
        }
        if (++attempts > 30) {
          reject(new Error('Elemento de video no disponible'));
          return;
        }
        requestAnimationFrame(tryResolve);
      };
      requestAnimationFrame(tryResolve);
    });
  }

  private ensureSelectedProduct(): void {
    const products = this.activeProducts;
    if (!products.length) {
      this.selectedProductId = '';
      return;
    }

    const stillExists = products.some(product => product.id === this.selectedProductId);
    if (!stillExists) {
      this.selectedProductId = products[0].id;
    }
  }

  private refreshDetectionRow(): void {
    const product = this.activeProducts.find(item => item.id === this.selectedProductId);
    if (!product) {
      this.yoloDetections = [];
      return;
    }

    const previous = this.yoloDetections[0];
    this.yoloDetections = [
      new YoloDetection({
        productId: product.id,
        productName: product.name,
        currentStock: this.store.getStockForProduct(product.id),
        detectedQuantity: previous?.detectedQuantity ?? 0,
        validatedQuantity: previous?.validatedQuantity ?? 0
      })
    ];
  }

  private runDetection(image: File | Blob): void {
    if (!this.selectedProductId) {
      this.detectionError = 'Selecciona un producto antes de detectar.';
      return;
    }

    this.detecting = true;
    this.detectionError = null;

    const filename = image instanceof File ? image.name : 'capture.jpg';
    this.detectionApi.detectFromImage(image, filename).subscribe({
      next: response => {
        const detectedQty = Math.max(0, Number(response.total_count ?? 0));
        if (response.annotated_image_base64) {
          this.yoloImagePreview = `data:image/jpeg;base64,${response.annotated_image_base64}`;
        }

        if (this.yoloDetections.length) {
          this.yoloDetections = [
            this.yoloDetections[0].withDetectedQuantity(detectedQty)
          ];
        } else {
          this.refreshDetectionRow();
          if (this.yoloDetections.length) {
            this.yoloDetections = [
              this.yoloDetections[0].withDetectedQuantity(detectedQty)
            ];
          }
        }

        this.detecting = false;
      },
      error: err => {
        this.detectionError = this.formatDetectionError(err);
        this.detecting = false;
      }
    });
  }

  private formatDetectionError(error: unknown): string {
    if (error && typeof error === 'object') {
      const err = error as { error?: { message?: string }; message?: string; status?: number };
      if (err.error?.message) return err.error.message;
      if (err.message) return err.message;
      if (err.status === 0) {
        return 'No se pudo conectar con el servicio de detección. Verifica que Edge Vision y el backend estén activos.';
      }
    }
    return 'No se pudo completar la detección YOLO.';
  }
}
