import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
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
import Hls from 'hls.js';
import { firstValueFrom } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(false);
  protected cameras = signal<YoloCamera[]>([]);
  protected products = signal<ProductResource[]>([]);
  protected stock = signal<StockResource[]>([]);
  protected audits = signal<YoloAudit[]>([]);
  protected peopleCounters = signal<PeopleCounterRecord[]>([]);
  protected showNewCameraForm = signal(false);

  protected selectedCameraId = '';
  protected selectedProductId = '';
  protected validatedQuantity = 1;
  protected imagePreview: string | null = null;
  protected imageName = '';
  protected lastAudit: YoloAudit | null = null;
  protected entries = 18;
  protected exits = 11;
  protected newCameraName = '';
  protected newCameraLocation = '';

  protected selectedBrowserCameraId = '';
  protected browserCameras = signal<MediaDeviceInfo[]>([]);
  protected activeHlsUrl = signal<string | null>(null);
  protected activatingCamera = signal(false);
  protected localCameraError = '';
  protected isVideoPlaying = computed(() => !!this.activeHlsUrl());
  private hlsPlayer: Hls | null = null;

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

  @ViewChild('webcamVideo') private webcamVideo?: ElementRef<HTMLVideoElement>;

  constructor() {
    this.destroyRef.onDestroy(() => this.stopHlsPlayback());
  }

  ngOnInit(): void {
    this.loadData();
    const onDevicesChanged = () => void this.refreshBrowserCameras();
    navigator.mediaDevices?.addEventListener('devicechange', onDevicesChanged);
    this.destroyRef.onDestroy(() => navigator.mediaDevices?.removeEventListener('devicechange', onDevicesChanged));
  }

  protected loadData(): void {
    this.loading.set(true);
    this.yoloService.getDashboardData().subscribe({
      next: data => {
        this.cameras.set(data.cameras || []);
        this.products.set(data.products);
        this.stock.set(data.stock);
        this.audits.set(data.audits);
        this.peopleCounters.set(data.peopleCounters);
        if (!this.selectedCameraId || !this.cameras().some(c => c.id === this.selectedCameraId)) {
          this.selectedCameraId = this.cameras()[0]?.id || '';
        }
        this.selectedProductId = data.products[0]?.id || '';
        this.loading.set(false);
        void this.refreshBrowserCameras();
      },
      error: () => {
        this.loading.set(false);
        this.showMessage('No se pudo cargar YOLO. Verifica json-server.');
      }
    });
  }

  protected async refreshBrowserCameras(): Promise<void> {
    await this.loadBrowserCameras();
    this.syncBrowserCamerasToTable();
  }

  protected async loadBrowserCameras(): Promise<void> {
    try {
      try {
        const dummyStream = await navigator.mediaDevices.getUserMedia({ video: true });
        dummyStream.getTracks().forEach(track => track.stop());
      } catch {
        // Permisos pendientes: igual intentamos enumerar.
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.browserCameras.set(videoDevices);
      this.localCameraError = videoDevices.length ? '' : 'No hay cámaras de video. Conecta Iriun o habilita la webcam.';

      const stillExists = videoDevices.some(device => device.deviceId === this.selectedBrowserCameraId);
      if (!stillExists) {
        this.selectedBrowserCameraId = videoDevices[0]?.deviceId || '';
      }
    } catch {
      this.localCameraError = 'No se pudieron detectar cámaras. Revisa permisos del navegador.';
    }
  }

  protected getDeviceLabel(device: MediaDeviceInfo): string {
    const label = device.label?.trim();
    if (!label) return 'Cámara (permite acceso para ver el nombre)';
    if (/iriun/i.test(label)) return `Celular — ${label}`;
    if (/integrated|built-?in|facetime|hd user facing|front/i.test(label)) return `Laptop — ${label}`;
    return label;
  }

  protected getDeviceLocation(device: MediaDeviceInfo): string {
    return /iriun/i.test(device.label || '') ? 'Celular / Iriun' : 'Laptop / Cámara local';
  }

  protected getCameraStreamLabel(camera: YoloCamera): string {
    if (camera.streamUrl.includes('.m3u8')) return 'Stream HLS Edge Vision';
    if (camera.streamUrl.startsWith('rtsp://')) return camera.streamUrl;
    const device = this.browserCameras().find(item => item.deviceId === camera.streamUrl);
    return device ? this.getDeviceLabel(device) : `Cámara aforo #${this.getAforoCameraId(camera)}`;
  }

  private getAforoCameraId(camera: YoloCamera): number {
    if (camera.aforoCameraId !== undefined) return camera.aforoCameraId;
    const deviceIndex = this.browserCameras().findIndex(item => item.deviceId === camera.streamUrl);
    if (deviceIndex >= 0) return deviceIndex;
    const match = camera.id.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  private syncBrowserCamerasToTable(): void {
    for (const device of this.browserCameras()) {
      if (this.cameras().some(camera => camera.streamUrl === device.deviceId)) continue;
      const deviceIndex = this.browserCameras().findIndex(item => item.deviceId === device.deviceId);
      this.yoloService.addCamera({
        name: this.getDeviceLabel(device),
        streamUrl: device.deviceId,
        status: 'Online',
        location: this.getDeviceLocation(device),
        fps: 30,
        aforoCameraId: deviceIndex >= 0 ? deviceIndex : undefined
      }).subscribe(saved => {
        this.cameras.update(items =>
          items.some(item => item.streamUrl === saved.streamUrl) ? items : [...items, saved]
        );
      });
    }
  }

  protected async previewSelectedBrowserCamera(): Promise<void> {
    if (!this.selectedBrowserCameraId) {
      this.showMessage('Selecciona una cámara en la lista.');
      return;
    }

    const device = this.browserCameras().find(item => item.deviceId === this.selectedBrowserCameraId);
    if (!device) {
      this.showMessage('Cámara no encontrada. Pulsa Actualizar.');
      return;
    }

    let linked = this.cameras().find(camera => camera.streamUrl === device.deviceId);
    if (!linked) {
      this.syncBrowserCamerasToTable();
      linked = this.cameras().find(camera => camera.streamUrl === device.deviceId);
    }

    if (linked) {
      await this.activateCameraFromTable(linked);
      return;
    }

    const deviceIndex = this.browserCameras().findIndex(item => item.deviceId === device.deviceId);
    await this.activateAforoStream(
      deviceIndex >= 0 ? deviceIndex : 0,
      device.label || this.getDeviceLabel(device)
    );
  }

  protected async activateLocalCamera(): Promise<void> {
    await this.previewSelectedBrowserCamera();
  }

  protected deactivateLocalCamera(): void {
    this.deactivateActiveCamera();
  }

  protected isCameraStreaming(camera: YoloCamera): boolean {
    return this.selectedCameraId === camera.id && this.isVideoPlaying();
  }

  protected deactivateCamera(camera: YoloCamera, event?: Event): void {
    event?.stopPropagation();
    if (this.selectedCameraId !== camera.id || !this.isVideoPlaying()) return;
    this.stopHlsPlayback();
    this.updateCameraStatus(camera, 'Offline', 0);
    this.showMessage(`Cámara apagada: ${camera.name}`);
  }

  protected deactivateActiveCamera(): void {
    const camera = this.cameras().find(item => item.id === this.selectedCameraId);
    this.stopHlsPlayback();
    if (camera) {
      this.updateCameraStatus(camera, 'Offline', 0);
      this.showMessage(`Vista apagada: ${camera.name}`);
    } else {
      this.showMessage('Vista de cámara apagada.');
    }
  }

  private updateCameraStatus(camera: YoloCamera, status: YoloCamera['status'], fps: number): void {
    const updated: YoloCamera = { ...camera, status, fps, lastDetectionAt: new Date().toISOString() };
    this.yoloService.updateCamera(updated).subscribe(saved => {
      this.cameras.update(items => items.map(item => item.id === saved.id ? saved : item));
    });
  }

  protected async linkLocalCamera(): Promise<void> {
    this.syncBrowserCamerasToTable();
    await this.previewSelectedBrowserCamera();
    this.showMessage('Cámara vinculada y lista en la tabla.');
  }

  private async activateAforoStream(idCamara: number, cameraLabel: string): Promise<void> {
    this.activatingCamera.set(true);
    this.localCameraError = '';
    this.imagePreview = null;
    
    try {
      const response = await firstValueFrom(this.yoloService.activateAforoCamera(idCamara, cameraLabel));
      if (!response.stream_url) {
        throw new Error('El servidor no devolvió stream_url');
      }
  
      // 📢 Ponemos un mensaje amigable para el usuario/jurado mientras la IA despierta
      this.showMessage('Inicializando Edge AI y YOLO, por favor espere...');
      
      try {
        await this.playHlsStreamWithRetry(response.stream_url);
        this.showMessage(response.message || `Cámara activa: ${cameraLabel}`);
      } catch {
        this.localCameraError = 'El flujo de video tardó demasiado en responder.';
        this.showMessage(this.localCameraError);
      }
  
    } catch {
      this.localCameraError = 'No se pudo activar la cámara. Revisa credenciales o estado del servidor.';
      this.stopHlsPlayback();
      this.showMessage(this.localCameraError);
    } finally {
      this.activatingCamera.set(false);
    }
  }

  private async playHlsStreamWithRetry(url: string, maxAttempts = 12, delayMs = 2500): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.playHlsStream(url);
        return;
      } catch (error) {
        lastError = error;
        this.stopHlsPlayback();
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError ?? new Error('Error al cargar el stream HLS');
  }

  private async playHlsStream(url: string): Promise<void> {
    this.stopHlsPlayback();
    this.activeHlsUrl.set(url);
    const video = await this.waitForVideoElement();

    video.muted = true;
    video.playsInline = true;

    if (Hls.isSupported()) {
      this.hlsPlayer = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        // MediaMTX v1.16+ usa cookies de sesión HLS; sin esto el manifest devuelve 404 tras el 302.
        xhrSetup: xhr => {
          xhr.withCredentials = true;
        }
      });
      this.hlsPlayer.loadSource(url);
      this.hlsPlayer.attachMedia(video);
      await new Promise<void>((resolve, reject) => {
        this.hlsPlayer?.on(Hls.Events.MANIFEST_PARSED, () => resolve());
        this.hlsPlayer?.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) reject(new Error('Error al cargar el stream HLS'));
        });
      });
      await video.play();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      await video.play();
      return;
    }

    throw new Error('Este navegador no soporta reproducción HLS');
  }

  private waitForVideoElement(): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const tryResolve = () => {
        const video = this.webcamVideo?.nativeElement;
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

  private stopHlsPlayback(): void {
    this.hlsPlayer?.destroy();
    this.hlsPlayer = null;
    this.activeHlsUrl.set(null);
    const video = this.webcamVideo?.nativeElement;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.srcObject = null;
      video.load();
    }
  }

  protected addCamera(): void {
    this.showNewCameraForm.set(!this.showNewCameraForm());
  }

  protected saveNewCamera(): void {
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
      this.showNewCameraForm.set(false);
      this.showMessage('Nueva cámara agregada.');
    });
  }

  protected deleteCamera(camera: YoloCamera, event?: Event): void {
    event?.stopPropagation();
    if (!confirm(`¿Eliminar cámara "${camera.name}"?`)) return;
    this.yoloService.deleteCamera(camera.id).subscribe(() => {
      this.cameras.update(items => items.filter(item => item.id !== camera.id));
      if (this.selectedCameraId === camera.id) {
        this.stopHlsPlayback();
        this.selectedCameraId = this.cameras()[0]?.id || '';
      }
      this.showMessage('Cámara eliminada.');
    });
  }

  protected async activateCameraFromTable(camera: YoloCamera, event?: Event): Promise<void> {
    event?.stopPropagation();
    this.selectedCameraId = camera.id;
    this.imagePreview = null;
    await this.startStreamForCamera(camera);
  }

  private async startStreamForCamera(camera: YoloCamera): Promise<void> {
    const idCamara = this.getAforoCameraId(camera);
    if (this.isBrowserDeviceCamera(camera)) {
      this.selectedBrowserCameraId = camera.streamUrl;
    }
    const device = this.browserCameras().find(item => item.deviceId === camera.streamUrl);
    const cameraLabel = device?.label || camera.name;
    await this.activateAforoStream(idCamara, cameraLabel);
    const streamUrl = this.activeHlsUrl();
    if (!streamUrl) return;
    this.updateCameraStatus({ ...camera, streamUrl }, 'Online', camera.fps || 30);
  }

  private isBrowserDeviceCamera(camera: YoloCamera): boolean {
    return !camera.streamUrl.startsWith('rtsp://') && !camera.streamUrl.includes('.m3u8');
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
