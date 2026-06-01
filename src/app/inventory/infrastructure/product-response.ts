import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface ProductResource extends BaseResource {
  id: string | number; // API returns number, but we convert to string in assembler
  name: string;
  description: string;
  categoryId: string;
  providerId: string;
  minStock: number;
  unitPrice: number;
  isActive: boolean;
}

export interface ProductResponse extends BaseResponse {
  products: ProductResource[];
}
