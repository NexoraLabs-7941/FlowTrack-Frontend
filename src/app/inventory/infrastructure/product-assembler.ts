import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Product} from '../domain/model/product.entity';
import {ProductResource, ProductResponse} from './product-response';

export class ProductAssembler implements BaseAssembler<Product, ProductResource, ProductResponse> {

  toEntityFromResource(resource: ProductResource): Product {
    return new Product({
      id: String(resource.id), // Convert id to string (API returns number)
      name: resource.name,
      description: resource.description,
      categoryId: resource.categoryId,
      providerId: resource.providerId,
      minStock: resource.minStock,
      unitPrice: resource.unitPrice,
      isActive: resource.isActive
    });
  }

  toEntitiesFromResponse(response: ProductResponse): Product[] {
    return response.products.map(product => this.toEntityFromResource(product as ProductResource));
  }

  toResourceFromEntity(entity: Product): ProductResource {
    // When creating, id might be empty string, API will assign it
    const resource: ProductResource = {
      name: entity.name,
      description: entity.description,
      categoryId: entity.categoryId,
      providerId: entity.providerId,
      minStock: entity.minStock,
      unitPrice: entity.unitPrice,
      isActive: entity.isActive
    } as ProductResource;

    // Only include id if it's not empty (for updates)
    if (entity.id && entity.id.trim() !== '') {
      resource.id = entity.id;
    }

    return resource;
  }
}
