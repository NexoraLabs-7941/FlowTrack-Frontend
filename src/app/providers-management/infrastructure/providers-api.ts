import {Injectable} from '@angular/core';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {ProvidersApiEndpoint} from './providers-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {Provider} from '../../inventory/domain/model/provider.entity';

@Injectable({providedIn: 'root'})
export class ProvidersApi extends BaseApi {
  private readonly providersEndpoint: ProvidersApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.providersEndpoint = new ProvidersApiEndpoint(http);
  }

  getProviders() {
    return this.providersEndpoint.getAll();
  }

  getProviderById(id: number) {
    return this.providersEndpoint.getById(id);
  }

  deleteProvider(id: number) {
    return this.providersEndpoint.delete(id);
  }

  updateProviderById(body: Provider, id: number) {
    return this.providersEndpoint.update(body, id);
  }

  createProvider(body: Provider) {
    return this.providersEndpoint.create(body);
  }

}
