import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface CreateSaleRequest {
  staffUserId: number;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
  kits: Array<{
    kitId: number;
    quantity: number;
  }>;
}

export interface SaleDetail {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleResponse {
  id: number;
  totalAmount: number;
  createdAt: string;
  details: SaleDetail[];
}

export class SalesApiEndpoint {
  private readonly endpointUrl: string;

  constructor(private http: HttpClient) {
    this.endpointUrl = `${environment.platformProviderApiBaseUrl}/sales`;
  }

  create(sale: CreateSaleRequest): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.endpointUrl, sale);
  }

  getAll(): Observable<SaleResponse[]> {
    return this.http.get<SaleResponse[]>(this.endpointUrl);
  }
}

