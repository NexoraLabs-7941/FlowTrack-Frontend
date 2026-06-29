import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Resource for a kit item (product with quantity and price).
 */
export interface KitProductResource {
  productId: number;
  quantity: number;
  price: number;
}

/**
 * Resource for a kit from the backend API.
 * Backend returns: { id, name, items, totalPrice, createdAt, updatedAt }
 */
export interface KitResource extends BaseResource {
  id?: number;
  name: string;
  items?: KitProductResource[];
  totalPrice?: number; // Backend calculates this from items
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Resource for creating a kit.
 * Backend expects: { name, items }
 */
export interface CreateKitResource {
  name: string;
  items: KitProductResource[];
}

export interface KitResponse extends BaseResponse {
  kits?: KitResource[];
}

