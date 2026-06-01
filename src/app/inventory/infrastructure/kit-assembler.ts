import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Kit, KitProduct} from '../domain/model/kit.entity';
import {KitResource, KitResponse, KitProductResource} from './kit-response';

export class KitAssembler implements BaseAssembler<Kit, KitResource, KitResponse> {

  /**
   * Converts a KitResource from backend to a Kit entity.
   * @param resource - The kit resource from the API.
   * @returns A Kit entity instance.
   */
  toEntityFromResource(resource: KitResource): Kit {
    const items = resource.items || [];
    return new Kit({
      id: String(resource.id || ''),
      name: resource.name,
      price: resource.totalPrice || 0, // Backend uses totalPrice
      products: items.map(p => ({
        productId: String(p.productId),
        quantity: p.quantity,
        price: p.price || 0
      } as KitProduct))
    });
  }

  /**
   * Converts API response to Kit entities.
   * @param response - The API response.
   * @returns Array of Kit entities.
   */
  toEntitiesFromResponse(response: KitResponse): Kit[] {
    // Backend returns an array directly
    if (Array.isArray(response)) {
      return (response as KitResource[]).map(kit => this.toEntityFromResource(kit));
    }
    // Or might return object with 'kits'
    if (response.kits) {
      return response.kits.map(kit => this.toEntityFromResource(kit as KitResource));
    }
    return [];
  }

  /**
   * Converts a Kit entity to a KitResource for creating/updating.
   * Backend expects: { name, items } - totalPrice is calculated by backend.
   * @param entity - The kit entity.
   * @returns A KitResource for the API.
   */
  toResourceFromEntity(entity: Kit): KitResource {
    return {
      name: entity.name,
      items: entity.products?.map(p => ({
        productId: Number(p.productId),
        quantity: p.quantity,
        price: p.price || 0
      } as KitProductResource)) || []
    } as KitResource;
  }
}

