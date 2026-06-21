import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Product} from '../domain/model/product.entity';
import {ProductResource, ProductResponse} from './product-response';
import {ProductAssembler} from './product-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class ProductsApiEndpoint extends BaseApiEndpoint<Product, ProductResource, ProductResponse, ProductAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderProductsEndpointPath}`, new ProductAssembler());
  }
}
