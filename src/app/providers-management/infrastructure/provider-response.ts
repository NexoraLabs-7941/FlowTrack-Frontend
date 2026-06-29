import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';


export interface ProviderResource extends BaseResource {
  id: number | string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  ruc: string;
}

export interface ProviderResponse extends BaseResponse{
  providers: ProviderResource[];
}
