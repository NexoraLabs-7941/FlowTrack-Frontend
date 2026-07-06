import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Product} from '../domain/model/product.entity';
import {ProductResource, ProductResponse} from './product-response';
import {ProductAssembler} from './product-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {catchError, map, Observable} from 'rxjs';

export class ProductsApiEndpoint extends BaseApiEndpoint<Product, ProductResource, ProductResponse, ProductAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderProductsEndpointPath}`, new ProductAssembler());
  }

  getByBarcode(barcode: string): Observable<Product> {
    return this.http.get<ProductResource>(`${this.endpointUrl}/barcode/${encodeURIComponent(barcode)}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to fetch product by barcode'))
    );
  }
}
