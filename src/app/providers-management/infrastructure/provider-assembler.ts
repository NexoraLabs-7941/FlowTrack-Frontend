import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Provider} from '../../inventory/domain/model/provider.entity';
import {ProviderResource, ProviderResponse} from './provider-response';

export class ProviderAssembler implements BaseAssembler<Provider, ProviderResource, ProviderResponse> {

  toEntityFromResource(resource: ProviderResource): Provider {
    return new Provider({
      id: String(resource.id ?? ''), // Convert id to string (API returns number)
      firstName: resource.firstName,
      lastName: resource.lastName,
      phoneNumber: resource.phone,
      email: resource.email,
      ruc: resource.ruc
    } as any);
  }

  toEntitiesFromResponse(response: ProviderResponse): Provider[] {
    return response.providers.map(provider => this.toEntityFromResource(provider as ProviderResource));
  }

  toResourceFromEntity(entity: Provider): ProviderResource {
    return {
      id: entity.id ?? '',
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber,
      email: entity.email,
      ruc: entity.ruc
    } as ProviderResource;
  }
}
