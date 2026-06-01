import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  PeopleCounterRecord,
  ProductResource,
  StockResource,
  YoloAudit,
  YoloCamera,
  YoloProductDetection,
  YoloService
} from '../infrastructure/yolo.service';

@Component({
  selector: 'app-yolo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './yolo.html',
  styleUrl: './yolo.css'
})
export class YoloComponent implements OnInit {
  private readonly yoloService = inject(YoloService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(false);
  protected cameras = signal<YoloCamera[]>([]);
  protected products = signal<ProductResource[]>([]);
  protected stock = signal<StockResource[]>([]);
  protected audits = signal<YoloAudit[]>([]);
  protected peopleCounters = signal<PeopleCounterRecord[]>([]);

  protected selectedCameraId = 'cam-01';
  protected selectedProductId = '';
  protected validatedQuantity = 1;
  protected imagePreview: string | null = null;
  protected imageName = 'CAM_04_MAIN_ENTRANCE';
  protected lastAudit: YoloAudit | null = null;
  protected entries = 18;
  protected exits = 11;
  protected newCameraName = '';
  protected newCameraLocation = '';

  protected cameraColumns = ['device', 'status', 'location', 'actions'];
  protected auditColumns = ['createdAt', 'camera', 'detections', 'status', 'actions'];

  protected onlineCameras = computed(() => this.cameras().filter(camera => camera.status === 'Online').length);
  protected currentPeopleInside = computed(() => Math.max(0, Number(this.entries || 0) - Number(this.exits || 0)));
  protected capacityPercent = computed(() => Math.min(100, Math.round((this.currentPeopleInside() / 60) * 100)));
  protected todayVisits = computed(() => {
    const recordsTotal = this.peopleCounters().reduce((sum, item) => sum + Number(item.entries || 0), 0);
    return 1284 + recordsTotal;
  });
  protected capacityStatus = computed(() => this.currentPeopleInside() >= 45 ? 'Alta' : this.currentPeopleInside() >= 30 ? 'Media' : 'Normal');
  protected selectedCamera = computed(() => this.cameras().find(camera => camera.id === this.selectedCameraId) || this.cameras()[0]);

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.yoloService.getDashboardData().subscribe({
      next: data => {
        this.cameras.set(data.cameras);
        this.products.set(data.products);
        this.stock.set(data.stock);
        this.audits.set(data.audits);
        this.peopleCounters.set(data.peopleCounters);
        this.selectedCameraId = data.cameras[0]?.id || 'cam-01';
        this.selectedProductId = data.products[0]?.id || '';
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showMessage('No se pudo cargar YOLO. Verifica json-server.');
      }
    });
  }

  protected addCamera(): void {
    const name = this.newCameraName.trim() || `Cámara ${this.cameras().length + 1}`;
    const location = this.newCameraLocation.trim() || 'Nueva ubicación';
    this.yoloService.addCamera({
      name,
      location,
      streamUrl: `rtsp://192.168.1.${110 + this.cameras().length}:554/live`,
      status: 'Online',
      fps: 30
    }).subscribe(camera => {
      this.cameras.update(items => [...items, camera]);
      this.selectedCameraId = camera.id;
      this.newCameraName = '';
      this.newCameraLocation = '';
      this.showMessage('Nueva cámara agregada.');
    });
  }

  protected testConnection(camera: YoloCamera): void {
    const updated: YoloCamera = { ...camera, status: 'Online', fps: 30, lastDetectionAt: new Date().toISOString() };
    this.yoloService.updateCamera(updated).subscribe(saved => {
      this.cameras.update(items => items.map(item => item.id === saved.id ? saved : item));
      this.showMessage(`Conexión activa: ${saved.name}`);
    });
  }

  protected restartCamera(camera: YoloCamera): void {
    const updated: YoloCamera = { ...camera, status: 'Online', fps: 24, lastDetectionAt: new Date().toISOString() };
    this.yoloService.updateCamera(updated).subscribe(saved => {
      this.cameras.update(items => items.map(item => item.id === saved.id ? saved : item));
      this.showMessage(`Cámara reiniciada: ${saved.name}`);
    });
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = String(reader.result);
      this.runYoloAssistant();
    };
    reader.readAsDataURL(file);
  }

  protected runYoloAssistant(): void {
    const products = this.products();
    if (!products.length) {
      this.showMessage('Primero registra productos en el inventario.');
      return;
    }

    const selectedProduct = products.find(item => item.id === this.selectedProductId) || products[0];
    this.selectedProductId = selectedProduct.id;
    const secondaryProduct = products.find(item => item.id !== selectedProduct.id) || selectedProduct;

    const detections: YoloProductDetection[] = [
      {
        id: `det-${Date.now()}-1`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: Number(this.validatedQuantity || 1),
        confidence: 0.91,
        box: { left: 23, top: 31, width: 11, height: 28 }
      },
      {
        id: `det-${Date.now()}-2`,
        productId: secondaryProduct.id,
        productName: secondaryProduct.name,
        quantity: 1,
        confidence: 0.84,
        box: { left: 62, top: 43, width: 14, height: 34 }
      }
    ];

    this.lastAudit = {
      id: `audit-${Date.now()}`,
      cameraId: this.selectedCameraId,
      createdAt: new Date().toISOString(),
      imageName: this.imageName,
      detections,
      status: 'Pendiente'
    };
    this.showMessage('YOLO generó detecciones. Valida antes de actualizar stock.');
  }

  protected updateDetectionQuantity(detection: YoloProductDetection, quantity: number): void {
    if (!this.lastAudit) return;
    this.lastAudit = {
      ...this.lastAudit,
      detections: this.lastAudit.detections.map(item =>
        item.id === detection.id ? { ...item, quantity: Number(quantity || 0) } : item
      )
    };
  }

  protected saveAuditDraft(): void {
    if (!this.lastAudit) return;
    this.yoloService.saveAudit(this.lastAudit).subscribe(saved => {
      this.audits.update(items => [saved, ...items.filter(item => item.id !== saved.id)]);
      this.showMessage('Auditoría YOLO guardada como pendiente.');
    });
  }

  protected validateAudit(audit = this.lastAudit): void {
    if (!audit) return;
    this.yoloService.validateAudit(audit, this.stock()).subscribe(saved => {
      this.audits.update(items => [saved, ...items.filter(item => item.id !== saved.id)]);
      if (this.lastAudit?.id === saved.id) this.lastAudit = saved;
      this.loadData();
      this.showMessage('Conteo validado y stock actualizado.');
    });
  }

  protected registerPeopleCounter(): void {
    const now = new Date();
    const record: PeopleCounterRecord = {
      id: `people-${Date.now()}`,
      cameraId: this.selectedCameraId,
      date: now.toISOString().slice(0, 10),
      hour: now.toTimeString().slice(0, 5),
      entries: Number(this.entries || 0),
      exits: Number(this.exits || 0),
      currentInside: this.currentPeopleInside()
    };
    this.yoloService.savePeopleCounter(record).subscribe(saved => {
      this.peopleCounters.update(items => [saved, ...items].slice(0, 20));
      this.showMessage('Conteo de afluencia registrado.');
    });
  }

  protected exportYoloReport(): void {
    const rows = this.audits().flatMap(audit => audit.detections.map(detection => ({
      fecha: audit.createdAt,
      camara: this.getCameraName(audit.cameraId),
      producto: detection.productName,
      cantidad: detection.quantity,
      confianza: `${Math.round(detection.confidence * 100)}%`,
      estado: audit.status
    })));
    this.yoloService.exportCsv('flowtrack_yolo_auditorias', rows);
  }

  protected exportPeopleReport(): void {
    this.yoloService.exportCsv('flowtrack_yolo_afluencia', this.peopleCounters() as unknown as Record<string, unknown>[]);
  }

  protected getCameraName(cameraId: string): string {
    return this.cameras().find(camera => camera.id === cameraId)?.name || cameraId;
  }

  protected getDetectionSummary(audit: YoloAudit): string {
    return audit.detections.map(item => `${item.productName} (${item.quantity})`).join(', ');
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 2600 });
  }
}
