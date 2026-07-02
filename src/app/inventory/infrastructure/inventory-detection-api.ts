import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryDetectionResponse {
  status: string;
  total_count: number;
  detections: Record<string, number>;
  confidence: number;
  annotated_image_base64?: string;
}

export interface RestockDetectionRecord {
  id: number;
  lote: string;
  receptionDate: string;
  expirationDate: string;
  imageUrl: string;
  detectedQuantity: number;
  verifiedQuantity: number;
  productId: number;
  batchId: number;
  createdAt: string;
}

export interface SaveRestockRecordPayload {
  image: File | Blob;
  lote: string;
  receptionDate: string;
  expirationDate: string;
  productId: string;
  detectedQuantity: number;
  verifiedQuantity: number;
  filename?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryDetectionApi {
  private readonly http = inject(HttpClient);

  private authHeaders(): { Authorization: string } | undefined {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  detectFromImage(image: File | Blob, filename = 'capture.jpg'): Observable<InventoryDetectionResponse> {
    const formData = new FormData();
    formData.append('image', image, filename);

    return this.http.post<InventoryDetectionResponse>(
      `${environment.aforoApiBaseUrl}${environment.restockDetectionEndpointPath}`,
      formData,
      { headers: this.authHeaders() }
    );
  }

  saveRestockRecord(payload: SaveRestockRecordPayload): Observable<RestockDetectionRecord> {
    const formData = new FormData();
    const filename = payload.filename ?? (payload.image instanceof File ? payload.image.name : 'capture.jpg');
    formData.append('image', payload.image, filename);
    formData.append('lote', payload.lote);
    formData.append('receptionDate', payload.receptionDate);
    formData.append('expirationDate', payload.expirationDate);
    formData.append('productId', payload.productId);
    formData.append('detectedQuantity', String(payload.detectedQuantity));
    formData.append('verifiedQuantity', String(payload.verifiedQuantity));

    return this.http.post<RestockDetectionRecord>(
      `${environment.aforoApiBaseUrl}${environment.restockDetectionRecordsSavePath}`,
      formData,
      { headers: this.authHeaders() }
    );
  }

  getRestockRecords(): Observable<RestockDetectionRecord[]> {
    return this.http.get<RestockDetectionRecord[]>(
      `${environment.aforoApiBaseUrl}${environment.restockDetectionRecordsListPath}`,
      { headers: this.authHeaders() }
    );
  }
}
