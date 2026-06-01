import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardApiEndpoint } from './dashboard-api-endpoint';
import { Dashboard } from '../domain/model/dashboard.entity';

/**
 * Service for handling dashboard API calls.
 * @remarks
 * This service manages communication with the dashboard backend.
 * Uses a single endpoint that returns all dashboard data.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApi {
  private readonly endpoint: DashboardApiEndpoint;

  constructor(private http: HttpClient) {
    this.endpoint = new DashboardApiEndpoint(this.http);
  }

  /**
   * Gets the complete dashboard data from the backend.
   * @returns An Observable of Dashboard with stats, charts, and notifications.
   */
  getDashboard(): Observable<Dashboard> {
    return this.endpoint.getDashboard();
  }
}
