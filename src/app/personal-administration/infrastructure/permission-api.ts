import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PermissionApiEndpoint } from './permission-api-endpoint';
import { PermissionResource } from './permission-response';

/**
 * API service for permission operations
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionApi {
  private readonly endpoint: PermissionApiEndpoint;

  constructor(http: HttpClient) {
    this.endpoint = new PermissionApiEndpoint(http);
  }

  /**
   * Gets all available permissions
   * @returns Observable of PermissionResource array
   */
  getAllPermissions(): Observable<PermissionResource[]> {
    return this.endpoint.getAllPermissions();
  }
}

