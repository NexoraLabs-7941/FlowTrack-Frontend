import { TestBed } from '@angular/core/testing';
import { ProductsApi } from './products-api';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductsApi', () => {
  let service: ProductsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsApi]
    });
    service = TestBed.inject(ProductsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
