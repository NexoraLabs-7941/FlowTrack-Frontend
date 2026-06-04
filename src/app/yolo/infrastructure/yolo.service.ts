import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface YoloCamera {
  id: string;
  name: string;
  streamUrl: string;
  status: 'Online' | 'Offline';
  location: string;
  fps: number;
  lastDetectionAt: string;
}

export interface YoloProductDetection {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  confidence: number;
  box: { left: number; top: number; width: number; height: number };
}

export interface YoloAudit {
  id: string;
  cameraId: string;
  createdAt: string;
  imageName: string;
  detections: YoloProductDetection[];
  status: 'Pendiente' | 'Validado';
}

export interface PeopleCounterRecord {
  id: string;
  cameraId: string;
  date: string;
  hour: string;
  entries: number;
  exits: number;
  currentInside: number;
}

export interface ProductResource {
  id: string;
  name: string;
  description?: string;
  minStock?: number;
  unitPrice?: number;
  isActive?: boolean;
}

export interface StockResource {
  id: string;
  productId: string;
  currentStock: number;
  lastUpdated: string;
}

export interface YoloDashboardData {
  cameras: YoloCamera[];
  products: ProductResource[];
  stock: StockResource[];
  audits: YoloAudit[];
  peopleCounters: PeopleCounterRecord[];
}

@Injectable({ providedIn: 'root' })
export class YoloService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.platformProviderApiBaseUrl;
  private readonly localKeys = {
    cameras: 'flowtrack_yolo_cameras',
    audits: 'flowtrack_yolo_audits',
    people: 'flowtrack_yolo_people'
  };

  getDashboardData(): Observable<YoloDashboardData> {
    return forkJoin({
      cameras: this.getCollection<YoloCamera>('yoloCameras', this.mergeLegacyLocalCameras()),
      products: this.getCollection<ProductResource>('products', []),
      stock: this.getCollection<StockResource>('stock', []),
      audits: this.getCollection<YoloAudit>('yoloAudits', this.getLocalAudits()),
      peopleCounters: this.getCollection<PeopleCounterRecord>('peopleCounters', this.getLocalPeopleCounters())
    });
  }

  addCamera(camera: Omit<YoloCamera, 'id' | 'lastDetectionAt'>): Observable<YoloCamera> {
    const newCamera: YoloCamera = {
      ...camera,
      id: `cam-${Date.now()}`,
      lastDetectionAt: new Date().toISOString()
    };
    return this.http.post<YoloCamera>(`${this.baseUrl}/yoloCameras`, newCamera).pipe(
      catchError(() => of(this.saveLocalCamera(newCamera)))
    );
  }

  updateCamera(camera: YoloCamera): Observable<YoloCamera> {
    return this.http.put<YoloCamera>(`${this.baseUrl}/yoloCameras/${camera.id}`, camera).pipe(
      catchError(() => of(this.saveLocalCamera(camera)))
    );
  }

  deleteCamera(cameraId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/yoloCameras/${cameraId}`).pipe(
      catchError(() => of(void 0)),
      map(() => {
        this.removeCameraFromLocal(cameraId);
      })
    );
  }

  saveAudit(audit: YoloAudit): Observable<YoloAudit> {
    return this.http.post<YoloAudit>(`${this.baseUrl}/yoloAudits`, audit).pipe(
      catchError(() => of(this.saveLocalAudit(audit)))
    );
  }

  validateAudit(audit: YoloAudit, stock: StockResource[]): Observable<YoloAudit> {
    const validatedAudit: YoloAudit = { ...audit, status: 'Validado' };
    const updateRequests = audit.detections
      .map(detection => {
        const stockItem = stock.find(item => item.productId === detection.productId);
        if (!stockItem) return null;
        const updatedStock: StockResource = {
          ...stockItem,
          currentStock: Number(stockItem.currentStock || 0) + Number(detection.quantity || 0),
          lastUpdated: new Date().toISOString().slice(0, 10)
        };
        return this.http.put<StockResource>(`${this.baseUrl}/stock/${stockItem.id}`, updatedStock).pipe(
          catchError(() => of(updatedStock))
        );
      })
      .filter(Boolean) as Observable<StockResource>[];

    const persistAudit$ = this.http.put<YoloAudit>(`${this.baseUrl}/yoloAudits/${audit.id}`, validatedAudit).pipe(
      catchError(() => of(this.saveLocalAudit(validatedAudit)))
    );

    if (!updateRequests.length) return persistAudit$;

    return forkJoin(updateRequests).pipe(switchMap(() => persistAudit$));
  }

  savePeopleCounter(record: PeopleCounterRecord): Observable<PeopleCounterRecord> {
    return this.http.post<PeopleCounterRecord>(`${this.baseUrl}/peopleCounters`, record).pipe(
      catchError(() => of(this.saveLocalPeopleCounter(record)))
    );
  }

  exportCsv(filename: string, rows: Record<string, unknown>[]): void {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(header => this.escapeCsv(row[header])).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private getCollection<T>(path: string, fallback: T[]): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${path}`).pipe(
      map(items => Array.isArray(items) ? items : fallback),
      catchError(() => of(fallback))
    );
  }

  private getDefaultCameras(): YoloCamera[] {
    const saved = this.getPersistedCameras();
    if (saved !== null) return saved;
    return [
      {
        id: 'cam-01',
        name: 'Cámara Pasillo 1',
        streamUrl: 'rtsp://192.168.1.101:554/live',
        status: 'Online',
        location: 'Almacén Norte',
        fps: 30,
        lastDetectionAt: new Date().toISOString()
      },
      {
        id: 'cam-04',
        name: 'Cámara C4',
        streamUrl: 'rtsp://192.168.1.105:554/live',
        status: 'Offline',
        location: 'Pasillo Central',
        fps: 0,
        lastDetectionAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  private saveLocalCamera(camera: YoloCamera): YoloCamera {
    const cameras = this.getDefaultCameras();
    const exists = cameras.some(item => item.id === camera.id);
    const updated = exists ? cameras.map(item => item.id === camera.id ? camera : item) : [...cameras, camera];
    this.persistCameras(updated);
    return camera;
  }

  private removeCameraFromLocal(cameraId: string): void {
    const cameras = this.getDefaultCameras().filter(item => item.id !== cameraId);
    this.persistCameras(cameras);
    const legacyKey = 'flowtrack_local_cameras';
    const legacy = this.readLocal<YoloCamera[]>(legacyKey, []).filter(item => item.id !== cameraId);
    localStorage.setItem(legacyKey, JSON.stringify(legacy));
  }

  private getPersistedCameras(): YoloCamera[] | null {
    try {
      const value = localStorage.getItem(this.localKeys.cameras);
      if (value === null) return null;
      const parsed = JSON.parse(value) as YoloCamera[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private persistCameras(cameras: YoloCamera[]): void {
    localStorage.setItem(this.localKeys.cameras, JSON.stringify(cameras));
  }

  mergeLegacyLocalCameras(): YoloCamera[] {
    const legacyKey = 'flowtrack_local_cameras';
    const legacy = this.readLocal<YoloCamera[]>(legacyKey, []);
    const current = this.getDefaultCameras();
    const merged = [...current];
    for (const camera of legacy) {
      if (!merged.some(item => item.streamUrl === camera.streamUrl)) {
        merged.push(camera);
      }
    }
    const deduped = this.dedupeCameras(merged);
    if (legacy.length || deduped.length !== current.length) {
      this.persistCameras(deduped);
    }
    localStorage.removeItem(legacyKey);
    return deduped;
  }

  private dedupeCameras(cameras: YoloCamera[]): YoloCamera[] {
    const seen = new Set<string>();
    return cameras.filter(camera => {
      const key = camera.streamUrl || camera.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private getLocalAudits(): YoloAudit[] {
    return this.readLocal<YoloAudit[]>(this.localKeys.audits, []);
  }

  private saveLocalAudit(audit: YoloAudit): YoloAudit {
    const audits = this.getLocalAudits();
    const exists = audits.some(item => item.id === audit.id);
    const updated = exists ? audits.map(item => item.id === audit.id ? audit : item) : [audit, ...audits];
    localStorage.setItem(this.localKeys.audits, JSON.stringify(updated));
    return audit;
  }

  private getLocalPeopleCounters(): PeopleCounterRecord[] {
    return this.readLocal<PeopleCounterRecord[]>(this.localKeys.people, []);
  }

  private saveLocalPeopleCounter(record: PeopleCounterRecord): PeopleCounterRecord {
    const records = [record, ...this.getLocalPeopleCounters()].slice(0, 20);
    localStorage.setItem(this.localKeys.people, JSON.stringify(records));
    return record;
  }

  private readLocal<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) as T : fallback;
    } catch {
      return fallback;
    }
  }

  private escapeCsv(value: unknown): string {
    const text = String(value ?? '').replace(/"/g, '""');
    return `"${text}"`;
  }
}
