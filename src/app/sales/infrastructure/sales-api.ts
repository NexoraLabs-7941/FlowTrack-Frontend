import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SalesApiEndpoint, CreateSaleRequest, SaleResponse} from './sales-api-endpoint';

// Re-export for use in other modules
export type {SaleResponse, CreateSaleRequest} from './sales-api-endpoint';

@Injectable({providedIn: 'root'})
export class SalesApi {
  private readonly salesEndpoint: SalesApiEndpoint;

  constructor(http: HttpClient) {
    this.salesEndpoint = new SalesApiEndpoint(http);
  }

  createSale(sale: CreateSaleRequest): Observable<SaleResponse> {
    return this.salesEndpoint.create(sale);
  }

  getAllSales(): Observable<SaleResponse[]> {
    return this.salesEndpoint.getAll();
  }
}

