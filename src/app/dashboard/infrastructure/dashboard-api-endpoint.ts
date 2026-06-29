import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Dashboard } from '../domain/model/dashboard.entity';
import { DashboardResource, DashboardResponse } from './dashboard-response';
import { DashboardAssembler } from './dashboard-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class DashboardApiEndpoint extends BaseApiEndpoint<Dashboard, DashboardResource, DashboardResponse, DashboardAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderDashboardEndpointPath}`, new DashboardAssembler());
  }

  /**
   * Gets the complete dashboard data from the backend.
   * Single API call that returns all dashboard information.
   * @returns An Observable of Dashboard.
   */
  getDashboard(): Observable<Dashboard> {
    return this.http.get<DashboardResponse>(this.endpointUrl).pipe(
      map(response => this.assembler.toDashboardFromResource(response))
    );
  }
}
