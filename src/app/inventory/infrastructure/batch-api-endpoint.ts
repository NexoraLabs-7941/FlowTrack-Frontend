import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Batch} from '../domain/model/batch.entity';
import {BatchResource, BatchResponse} from './batch-response';
import {BatchAssembler} from './batch-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class BatchApiEndpoint extends BaseApiEndpoint<Batch, BatchResource, BatchResponse, BatchAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderBatchesEndpointPath}`, new BatchAssembler());
  }
}

