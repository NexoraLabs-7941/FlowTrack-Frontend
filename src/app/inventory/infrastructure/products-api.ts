import {Injectable} from '@angular/core';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {ProductsApiEndpoint} from './products-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {Product} from '../domain/model/product.entity';

@Injectable({providedIn: 'root'})
export class ProductsApi extends BaseApi {
  private readonly productsEndpoint: ProductsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.productsEndpoint = new ProductsApiEndpoint(http);
  }

  getProducts(){
    return this.productsEndpoint.getAll();
  }

  getProductById(id: number) {
    return this.productsEndpoint.getById(id);
  }

  createProduct(product: Product) {
    return this.productsEndpoint.create(product);
  }

  updateProduct(product: Product, id: number) {
    return this.productsEndpoint.update(product, id);
  }

  deleteProduct(id: number) {
    return this.productsEndpoint.delete(id);
  }
}
