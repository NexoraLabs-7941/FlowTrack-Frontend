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

@Injectable({ providedIn: 'root' })
export class InventoryDetectionApi {
  private readonly http = inject(HttpClient);

  detectFromImage(image: File | Blob, filename = 'capture.jpg'): Observable<InventoryDetectionResponse> {
    const formData = new FormData();
    formData.append('image', image, filename);

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return this.http.post<InventoryDetectionResponse>(
      `${environment.aforoApiBaseUrl}${environment.restockDetectionEndpointPath}`,
      formData,
      { headers }
    );
  }
}
