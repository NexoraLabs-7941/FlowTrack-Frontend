import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Batch} from '../domain/model/batch.entity';
import {BatchResource, BatchResponse} from './batch-response';

export class BatchAssembler implements BaseAssembler<Batch, BatchResource, BatchResponse> {

  toEntityFromResource(resource: BatchResource): Batch {
    return new Batch({
      id: String(resource.id), // Convert id to string (API returns number)
      productId: String(resource.productId), // Convert productId to string
      quantity: resource.quantity,
      expirationDate: resource.expirationDate,
      receptionDate: resource.receptionDate
    });
  }

  toEntitiesFromResponse(response: BatchResponse): Batch[] {
    return response.batches.map(batch => this.toEntityFromResource(batch as BatchResource));
  }

  toResourceFromEntity(entity: Batch): BatchResource {
    // When creating, id might be empty string, API will assign it
    const resource: BatchResource = {
      productId: Number(entity.productId),
      quantity: entity.quantity,
      expirationDate: entity.expirationDate,
      receptionDate: entity.receptionDate
    } as BatchResource;

    // Only include id if it's not empty (for updates)
    if (entity.id && entity.id.trim() !== '') {
      resource.id = Number(entity.id);
    }

    return resource;
  }
}

