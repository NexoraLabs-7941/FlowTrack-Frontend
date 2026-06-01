import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Provider} from '../../inventory/domain/model/provider.entity';
import {ProviderResource, ProviderResponse} from './provider-response';
import {ProviderAssembler} from './provider-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class ProvidersApiEndpoint extends BaseApiEndpoint<Provider, ProviderResource, ProviderResponse, ProviderAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderProvidersEndpointPath}`, new ProviderAssembler());
  }
}
