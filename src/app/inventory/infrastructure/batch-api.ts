import {Injectable} from '@angular/core';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {BatchApiEndpoint} from './batch-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {Batch} from '../domain/model/batch.entity';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class BatchApi extends BaseApi {
  private readonly batchEndpoint: BatchApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.batchEndpoint = new BatchApiEndpoint(http);
  }

  getBatches(): Observable<Batch[]> {
    return this.batchEndpoint.getAll();
  }

  getBatchById(id: number): Observable<Batch> {
    return this.batchEndpoint.getById(id);
  }

  getBatchesByProductId(productId: string): Observable<Batch[]> {
    // Note: This might need a custom implementation if the API doesn't support filtering
    // For now, we'll filter on the client side after fetching all batches
    return this.batchEndpoint.getAll();
  }

  createBatch(batch: Batch): Observable<Batch> {
    return this.batchEndpoint.create(batch);
  }
}

