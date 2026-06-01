import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermissionResource } from './permission-response';

/**
 * API endpoint for permission operations
 */
export class PermissionApiEndpoint {
  private readonly endpointUrl: string;

  constructor(private http: HttpClient) {
    this.endpointUrl = environment.platformProviderApiBaseUrl;
  }

  /**
   * Gets all available permissions from the backend
   * @returns Observable of PermissionResource array
   */
  getAllPermissions(): Observable<PermissionResource[]> {
    return this.http.get<PermissionResource[]>(
      `${this.endpointUrl}/permissions`
    );
  }
}

