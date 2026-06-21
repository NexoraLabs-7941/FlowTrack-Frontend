import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface BatchResource extends BaseResource {
  id: number;
  productId: number;
  quantity: number;
  expirationDate: string; // ISO 8601 format
  receptionDate: string; // ISO 8601 format
}

export interface BatchResponse extends BaseResponse {
  batches: BatchResource[];
}

