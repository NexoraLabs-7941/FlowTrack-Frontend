import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface ProviderReportResource extends BaseResource {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  ruc: string;
  productCount?: number;
}

export interface StockReportResource extends BaseResource {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  lastUpdated: string;
  providerName?: string;
}

export interface ExpiringProductReportResource extends BaseResource {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  expirationDate: string;
  currentStock: number;
  lot?: string;
  providerName?: string;
}

export interface LowStockReportResource extends BaseResource {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  providerName?: string;
  stockDifference: number;
}

export interface ReportsResponse extends BaseResponse {
  providers?: ProviderReportResource[];
  stock?: StockReportResource[];
  expiringProducts?: ExpiringProductReportResource[];
  lowStock?: LowStockReportResource[];
}

