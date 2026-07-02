import { Component, DestroyRef, ElementRef, OnInit, ChangeDetectorRef, ViewChild, computed, inject, signal } from '@angular/core';
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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
import Hls from 'hls.js';

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
  @ViewChild('videoFrame') private videoFrameRef?: ElementRef<HTMLElement>;
  @ViewChild('webcamVideo') private webcamVideoRef?: ElementRef<HTMLVideoElement>;

  private readonly yoloService = inject(YoloService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private afluenciaIntervalId: any = null;

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
  protected entries = signal<number>(0);
  protected exits = signal<number>(0);
  protected newCameraName = '';
  protected newCameraLocation = '';
  protected newCameraDeviceId = '';

  private readonly sanitizer = inject(DomSanitizer);

  protected selectedBrowserCameraId = '';
  protected browserCameras = signal<MediaDeviceInfo[]>([]);
  protected activeHlsUrl = signal<string | null>(null);
  protected mjpegStreamUrl = signal<SafeUrl | null>(null);
  protected activatingCamera = signal(false);
  protected deactivatingCamera = signal(false);
  protected localCameraError = '';
  protected isVideoPlaying = computed(() => !!this.activeHlsUrl() || !!this.mjpegStreamUrl());
  protected isFullscreen = signal(false);
  private hlsPlayer: any = null;
  private refreshInterval: any = null;

  protected cameraColumns = ['device', 'status', 'location', 'actions'];
  protected auditColumns = ['createdAt', 'camera', 'detections', 'status', 'actions'];

  protected onlineCameras = computed(() => this.cameras().filter(camera => camera.status === 'Online').length);
  protected currentPeopleInside = computed(() => Math.max(0, Number(this.entries() || 0)));
  protected capacityPercent = computed(() => Math.min(100, Math.round((this.currentPeopleInside() / 60) * 100)));
  protected capacityStatus = computed(() =>
    this.currentPeopleInside() >= 45 ? 'Alta' : this.currentPeopleInside() >= 30 ? 'Media' : 'Normal'
  );
  protected todayVisits = signal<number>(0);
  protected selectedCamera = computed<YoloCamera | undefined>(() =>
    this.cameras().find(camera => camera.id === this.selectedCameraId) || this.cameras()[0]
  );


  constructor() {
    this.destroyRef.onDestroy(() => {
      this.stopAfluenciaRefresh();
      this.stopHlsPlayback();
    });
  }

  ngOnInit(): void {
    this.loadData();
    const onDevicesChanged = () => void this.refreshBrowserCameras();
    navigator.mediaDevices?.addEventListener('devicechange', onDevicesChanged);
    const onFullscreenChange = () => this.isFullscreen.set(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    this.destroyRef.onDestroy(() => navigator.mediaDevices?.removeEventListener('devicechange', onDevicesChanged));
    this.destroyRef.onDestroy(() => document.removeEventListener('fullscreenchange', onFullscreenChange));
  }

  protected toggleVideoFullscreen(): void {
    const frame = this.videoFrameRef?.nativeElement;
    if (!frame) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void frame.requestFullscreen().catch(() => {
      this.showMessage('No se pudo activar pantalla completa.');
    });
  }

  protected loadData(): void {
    this.loading.set(true);
    this.yoloService.getDashboardData().subscribe({
      next: data => {
        // 🔥 CORRECCIÓN: Si data.cameras está vacío, le inyectamos tus cámaras base por defecto
        if (data.cameras && data.cameras.length > 0) {
          this.cameras.set(data.cameras);
        } else {
          this.cameras.set(this.yoloService['getDefaultCameras']());
        }

        this.products.set(data.products);
        this.stock.set(data.stock);
        this.audits.set(data.audits);
        this.peopleCounters.set(data.peopleCounters);

        if (!this.selectedCameraId || !this.cameras().some(c => c.id === this.selectedCameraId)) {
          this.selectedCameraId = this.cameras()[0]?.id || '';
        }
        this.startSelectedAfluenciaRefresh();
        this.selectedProductId = data.products[0]?.id || '';
        this.loading.set(false);
        void this.refreshBrowserCameras();
      },
      error: () => {
        this.loading.set(false);
        // 🔥 Contingencia: Incluso si da error el json-server, te montamos las cámaras para tu sustentación
        this.cameras.set(this.yoloService['getDefaultCameras']());
        this.selectedCameraId = this.cameras()[0]?.id || '';
        this.startSelectedAfluenciaRefresh();
        this.showMessage('Cargando cámaras en modo local de contingencia.');
        void this.refreshBrowserCameras();
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

      const newCameraStillExists = videoDevices.some(device => device.deviceId === this.newCameraDeviceId);
      if (!newCameraStillExists) {
        this.newCameraDeviceId = videoDevices[0]?.deviceId || '';
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
    const aforoCameraId = this.getAforoCameraId(camera);
    if (camera.streamUrl.includes('.m3u8')) return `Stream HLS Edge Vision - ID camara ${aforoCameraId}`;
    if (camera.streamUrl.startsWith('rtsp://')) return `${camera.streamUrl} - ID camara ${aforoCameraId}`;
    const device = this.browserCameras().find(item => item.deviceId === camera.streamUrl);
    return device ? `${this.getDeviceLabel(device)} - ID camara ${aforoCameraId}` : `Camara aforo #${aforoCameraId}`;
  }

  private getAforoCameraId(camera: YoloCamera): number {
    const device = this.findBrowserDeviceForCamera(camera);
    const detectedId = this.resolveAforoCameraId(device?.label || camera.name);
    if (detectedId !== null) return detectedId;
    if (camera.aforoCameraId !== undefined) return camera.aforoCameraId;
    const match = camera.id.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  protected resolveAforoCameraId(label: string): number | null {
    const normalized = label.toLowerCase();
    if (/iriun|irium/.test(normalized) && /#?\s*2\b/.test(normalized)) return 0;
    if (/iriun|irium/.test(normalized)) return 3;
    if (/laptop|integrated|built-?in|facetime|hd user facing|front/.test(normalized)) return 2;
    return null;
  }

  private findBrowserDeviceForCamera(camera: YoloCamera): MediaDeviceInfo | undefined {
    const directMatch = this.browserCameras().find(item => item.deviceId === camera.streamUrl);
    if (directMatch) return directMatch;

    const cameraName = this.normalizeCameraName(camera.name);
    return this.browserCameras().find(device => {
      const deviceLabel = this.normalizeCameraName(device.label);
      return !!deviceLabel && (cameraName.includes(deviceLabel) || deviceLabel.includes(cameraName));
    });
  }

  private getActivationCameraLabel(camera: YoloCamera): string {
    const device = this.findBrowserDeviceForCamera(camera);
    return device?.label || this.stripDisplayCameraPrefix(camera.name);
  }

  private normalizeCameraName(value: string): string {
    return this.stripDisplayCameraPrefix(value)
      .toLowerCase()
      .replace(/[^\w#]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private stripDisplayCameraPrefix(value: string): string {
    return value
      .replace(/^(laptop|celular)\s+[-—]\s+/i, '')
      .trim();
  }

  private syncBrowserCamerasToTable(): void {
    for (const device of this.browserCameras()) {
      if (this.yoloService.isCameraHidden({ id: device.deviceId, streamUrl: device.deviceId })) continue;
      if (this.cameras().some(camera => this.findBrowserDeviceForCamera(camera)?.deviceId === device.deviceId)) continue;

      const aforoCameraId = this.resolveAforoCameraId(device.label || this.getDeviceLabel(device));

      this.yoloService.addCamera({
        name: this.getDeviceLabel(device),
        streamUrl: device.deviceId,
        status: 'Online',
        location: this.getDeviceLocation(device),
        fps: 30,
        aforoCameraId: aforoCameraId !== null ? aforoCameraId : undefined
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

    let linked = this.cameras().find(camera => this.findBrowserDeviceForCamera(camera)?.deviceId === device.deviceId);
    if (!linked) {
      this.syncBrowserCamerasToTable();
      linked = this.cameras().find(camera => this.findBrowserDeviceForCamera(camera)?.deviceId === device.deviceId);
    }

    if (linked) {
      await this.activateCameraFromTable(linked);
      return;
    }

    await this.activateAforoStream(
      this.resolveAforoCameraId(device.label || this.getDeviceLabel(device)) ?? 0,
      device.label || this.getDeviceLabel(device)
    );
  }

  protected async activateLocalCamera(): Promise<void> {
    await this.previewSelectedBrowserCamera();
  }

  protected deactivateLocalCamera(): void {
    void this.deactivateActiveCamera();
  }

  protected isCameraStreaming(camera: YoloCamera): boolean {
    return this.selectedCameraId === camera.id && this.isVideoPlaying();
  }

  protected canTurnOffCamera(camera?: YoloCamera): boolean {
    return !!camera && (camera.status === 'Online' || this.isCameraStreaming(camera));
  }

  protected async deactivateCamera(camera: YoloCamera, event?: Event): Promise<void> {
    event?.stopPropagation();
    if (!this.canTurnOffCamera(camera)) return;
    await this.deactivateAforoStream(camera);
  }

  protected async deactivateActiveCamera(): Promise<void> {
    const camera = this.cameras().find(item => item.id === this.selectedCameraId);
    if (camera) {
      await this.deactivateAforoStream(camera);
      return;
    }
    await this.deactivateAforoStream();
  }

  private async deactivateAforoStream(camera?: YoloCamera): Promise<void> {
    this.deactivatingCamera.set(true);
    try {
      const response = await firstValueFrom(this.yoloService.deactivateAforoCamera());
      this.stopHlsPlayback();
      if (camera) {
        this.updateCameraStatus(camera, 'Offline', 0);
        this.showMessage(response.message || `Cámara apagada: ${camera.name}`);
      } else {
        this.cameras().forEach(item => {
          if (item.status === 'Online') {
            this.updateCameraStatus(item, 'Offline', 0);
          }
        });
        this.showMessage(response.message || 'Streaming detenido.');
      }
    } catch {
      this.stopHlsPlayback();
      if (camera) {
        this.updateCameraStatus(camera, 'Offline', 0);
      }
      this.showMessage('No se pudo apagar la cámara en el servidor. Se detuvo la vista local.');
    } finally {
      this.deactivatingCamera.set(false);
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

      this.showMessage('Inicializando Edge AI y YOLO, por favor espere...');
      this.startAfluenciaRefresh(idCamara);

      /*
      // =============================================================================================
      // CÓDIGO MJPEG (SISTEMA NUEVO): Descomenta estas líneas si necesitas volver al Edge principal
      // =============================================================================================
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(response.stream_url);
      this.mjpegStreamUrl.set(safeUrl);
      this.activeHlsUrl.set(response.stream_url); // Para que isVideoPlaying() devuelva true
      this.showMessage(response.message || `Cámara activa: ${cameraLabel}`);
      */

      // HLS: Usar playHlsStreamWithRetry para HLS antiguo
      this.playHlsStreamWithRetry(response.stream_url)
        .then(() => this.showMessage(response.message || `Cámara activa: ${cameraLabel}`))
        .catch(err => {
          this.showMessage('No se pudo establecer el stream HLS');
          this.localCameraError = String(err);
          this.activeHlsUrl.set(null);
        });
    } catch {
      this.localCameraError = 'No se pudo activar la cámara. Revisa credenciales o estado del servidor.';
      this.mjpegStreamUrl.set(null);
      this.activeHlsUrl.set(null);
      this.showMessage(this.localCameraError);
    } finally {
      this.activatingCamera.set(false);
    }
  }

  protected refreshAfluencia(idCamara: number): void {
    this.yoloService.getAfluenciaCount(idCamara).subscribe({
      next: count => this.applyAfluenciaCount(count),
      error: () => this.applyAfluenciaCount(0)
    });
  }

  protected refreshSelectedAfluencia(): void {
    this.startSelectedAfluenciaRefresh();
  }

  private startSelectedAfluenciaRefresh(): void {
    const camera = this.selectedCamera();
    if (!camera) {
      this.stopAfluenciaRefresh();
      this.applyAfluenciaCount(0);
      return;
    }

    this.startAfluenciaRefresh(this.getAforoCameraId(camera));
  }

  private startAfluenciaRefresh(idCamara: number): void {
    this.stopAfluenciaRefresh();
    this.refreshAfluencia(idCamara);
    this.refreshTodayVisits(idCamara);
    this.afluenciaIntervalId = setInterval(() => {
      this.refreshAfluencia(idCamara);
      this.refreshTodayVisits(idCamara);
    }, 2500);
  }

  private refreshTodayVisits(idCamara: number): void {
    this.yoloService.getTraficoDiarioHoy(`camara_${idCamara}`).subscribe({
      next: total => this.todayVisits.set(total),
      error: () => this.todayVisits.set(0)
    });
  }


  private stopAfluenciaRefresh(): void {
    if (!this.afluenciaIntervalId) return;
    clearInterval(this.afluenciaIntervalId);
    this.afluenciaIntervalId = null;
  }

  private applyAfluenciaCount(count: number): void {
    this.entries.set(Math.max(0, Number(count) || 0));
    this.exits.set(0);
    this.cdr.detectChanges();
  }

  private stopHlsPlayback(): void {
    this.hlsPlayer = null;
    this.activeHlsUrl.set(null);
    this.mjpegStreamUrl.set(null);
  }

  protected async addCamera(): Promise<void> {
    this.showNewCameraForm.set(!this.showNewCameraForm());
    if (this.showNewCameraForm()) {
      await this.refreshBrowserCameras();
      this.newCameraDeviceId ||= this.selectedBrowserCameraId || this.browserCameras()[0]?.deviceId || '';
    }
  }

  protected saveNewCamera(): void {
    const device = this.browserCameras().find(item => item.deviceId === this.newCameraDeviceId);
    if (!device) {
      this.showMessage('Selecciona una cámara disponible para vincular.');
      return;
    }

    const aforoCameraId = this.resolveAforoCameraId(device.label || this.getDeviceLabel(device));
    const name = this.newCameraName.trim() || this.getDeviceLabel(device);
    const location = this.newCameraLocation.trim() || this.getDeviceLocation(device);
    const cameraPayload: Omit<YoloCamera, 'id' | 'lastDetectionAt'> = {
      name,
      location,
      streamUrl: device.deviceId,
      status: 'Online',
      fps: 30,
      aforoCameraId: aforoCameraId ?? undefined
    };

    const existing = this.cameras().find(camera => this.findBrowserDeviceForCamera(camera)?.deviceId === device.deviceId);
    if (existing) {
      const updated: YoloCamera = {
        ...existing,
        ...cameraPayload,
        lastDetectionAt: new Date().toISOString()
      };
      this.yoloService.updateCamera(updated).subscribe(camera => {
        this.cameras.update(items => items.map(item => item.id === camera.id ? camera : item));
        this.selectedCameraId = camera.id;
        this.resetNewCameraForm();
        this.showMessage('Cámara vinculada nuevamente.');
      });
      return;
    }

    this.yoloService.addCamera(cameraPayload).subscribe(camera => {
      this.cameras.update(items => [camera, ...items.filter(item => item.id !== camera.id)]);
      this.selectedCameraId = camera.id;
      this.resetNewCameraForm();
      this.showMessage('Nueva cámara vinculada.');
    });
  }

  protected cancelNewCamera(): void {
    this.resetNewCameraForm();
  }

  private resetNewCameraForm(): void {
    this.newCameraName = '';
    this.newCameraLocation = '';
    this.newCameraDeviceId = this.selectedBrowserCameraId || this.browserCameras()[0]?.deviceId || '';
    this.showNewCameraForm.set(false);
  }

  protected deleteCamera(camera: YoloCamera, event?: Event): void {
    event?.stopPropagation();
    if (!confirm(`¿Eliminar cámara "${camera.name}"?`)) return;

    this.yoloService.deleteCamera(camera).subscribe(() => {
      this.cameras.update(items => items.filter(item => item.id !== camera.id));
      if (this.selectedCameraId === camera.id) {
        this.stopAfluenciaRefresh();
        this.stopHlsPlayback();
        this.selectedCameraId = this.cameras()[0]?.id || '';
        this.startSelectedAfluenciaRefresh();
      }
      this.showMessage('Cámara eliminada del listado.');
    });
  }

  protected async activateCameraFromTable(camera: YoloCamera, event?: Event): Promise<void> {
    event?.stopPropagation();
    this.selectedCameraId = camera.id;
    this.imagePreview = null;
    this.startAfluenciaRefresh(this.getAforoCameraId(camera));
    await this.startStreamForCamera(camera);
  }

  private async startStreamForCamera(camera: YoloCamera): Promise<void> {
    const device = this.findBrowserDeviceForCamera(camera);
    const cameraLabel = this.getActivationCameraLabel(camera);
    const idCamara = this.resolveAforoCameraId(cameraLabel) ?? this.getAforoCameraId(camera);
    if (device) {
      this.selectedBrowserCameraId = device.deviceId;
    } else if (this.isBrowserDeviceCamera(camera)) {
      this.selectedBrowserCameraId = camera.streamUrl;
    }
    await this.activateAforoStream(idCamara, cameraLabel);
    const streamUrl = this.activeHlsUrl();
    if (!streamUrl) return;
    this.updateCameraStatus({
      ...camera,
      streamUrl: device?.deviceId || camera.streamUrl,
      aforoCameraId: idCamara
    }, 'Online', camera.fps || 30);
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
      entries: Number(this.entries() || 0), // 👈 Modificado con ()
      exits: Number(this.exits() || 0),     // 👈 Modificado con ()
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
    if (!audit.detections?.length) return 'Sin detecciones';
    const total = audit.detections.reduce((sum, det) => sum + (det.quantity || 0), 0);
    const kinds = new Set(audit.detections.map(det => det.productName)).size;
    return `${total} prods. (${kinds} tipos)`;
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 2600 });
  }

// =============================================================================================
// CÓDIGO HLS (SISTEMA ANTIGUO): Descomenta estas funciones si necesitas volver al Edge original
// =============================================================================================
// Para usar este código, recuerda importar 'Hls' de 'hls.js', declarar la variable 'private hlsPlayer: any = null;' y
// descomentar la etiqueta <video> en yolo.html. También deberás llamar a 'playHlsStreamWithRetry(response.stream_url)' 
// dentro de 'activateCameraFromTable()' en vez de setear 'mjpegStreamUrl'.

private async playHlsStreamWithRetry(url: string, maxRetries = 20, delayMs = 1500): Promise < void> {
  let lastError: unknown;
  for(let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    await this.playHlsStream(url);
    return;
  } catch (error) {
    lastError = error;
    this.stopHlsPlayback();
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
throw lastError ?? new Error('Error al cargar el stream HLS');
}

private async playHlsStream(url: string): Promise < void> {
  this.stopHlsPlayback();
  this.activeHlsUrl.set(url);
  this.cdr.detectChanges();
  const video = await this.waitForVideoElement();

  video.muted = true;
  video.playsInline = true;

  if(Hls.isSupported()) {
  this.hlsPlayer = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90
  });
  this.hlsPlayer.loadSource(url);
  this.hlsPlayer.attachMedia(video);
  return new Promise((resolve, reject) => {
    this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().then(resolve).catch(reject);
    });
    this.hlsPlayer.on(Hls.Events.ERROR, (event: any, data: any) => {
      if (data.fatal) reject(new Error('Fatal HLS error'));
    });
  });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = url;
  return new Promise((resolve, reject) => {
    video.addEventListener('loadedmetadata', () => {
      video.play().then(resolve).catch(reject);
    }, { once: true });
    video.addEventListener('error', () => reject(new Error('Native HLS error')), { once: true });
  });
}
throw new Error('HLS not supported in this browser.');
}

private waitForVideoElement(): Promise < HTMLVideoElement > {
  return new Promise(resolve => {
    const check = () => {
      const el = this.webcamVideoRef?.nativeElement;
      if (el) {
        resolve(el);
        return;
      }
      this.cdr.detectChanges();
      requestAnimationFrame(check);
    };
    check();
  });
}
}
