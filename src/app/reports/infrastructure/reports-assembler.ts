import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ProviderReport } from '../domain/model/provider-report.entity';
import { StockReport } from '../domain/model/stock-report.entity';
import { ExpiringProductReport } from '../domain/model/expiring-product-report.entity';
import { LowStockReport } from '../domain/model/low-stock-report.entity';
import {
  ProviderReportResource,
  StockReportResource,
  ExpiringProductReportResource,
  LowStockReportResource,
  ReportsResponse
} from './reports-response';
import { BaseEntity } from '../../shared/infrastructure/base-entity';
import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export class ReportsAssembler implements BaseAssembler<BaseEntity, BaseResource, ReportsResponse> {
  /**
   * Converts a ProviderReportResource to a ProviderReport entity.
   */
  toProviderReportFromResource(resource: ProviderReportResource): ProviderReport {
    return new ProviderReport({
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      phoneNumber: resource.phoneNumber,
      email: resource.email,
      ruc: resource.ruc,
      productCount: resource.productCount
    });
  }

  /**
   * Converts an array of ProviderReportResource to ProviderReport entities.
   */
  toProviderReportsFromResources(resources: ProviderReportResource[]): ProviderReport[] {
    return resources.map(resource => this.toProviderReportFromResource(resource));
  }

  /**
   * Converts a StockReportResource to a StockReport entity.
   */
  toStockReportFromResource(resource: StockReportResource): StockReport {
    return new StockReport({
      id: resource.id,
      productId: resource.productId,
      productName: resource.productName,
      categoryName: resource.categoryName,
      currentStock: resource.currentStock,
      minStock: resource.minStock,
      unitPrice: resource.unitPrice,
      lastUpdated: resource.lastUpdated,
      providerName: resource.providerName
    });
  }

  /**
   * Converts an array of StockReportResource to StockReport entities.
   */
  toStockReportsFromResources(resources: StockReportResource[]): StockReport[] {
    return resources.map(resource => this.toStockReportFromResource(resource));
  }

  /**
   * Converts an ExpiringProductReportResource to an ExpiringProductReport entity.
   */
  toExpiringProductReportFromResource(resource: ExpiringProductReportResource): ExpiringProductReport {
    return new ExpiringProductReport({
      id: resource.id,
      productId: resource.productId,
      productName: resource.productName,
      categoryName: resource.categoryName,
      expirationDate: resource.expirationDate,
      currentStock: resource.currentStock,
      lot: resource.lot,
      providerName: resource.providerName
    });
  }

  /**
   * Converts an array of ExpiringProductReportResource to ExpiringProductReport entities.
   */
  toExpiringProductReportsFromResources(resources: ExpiringProductReportResource[]): ExpiringProductReport[] {
    return resources.map(resource => this.toExpiringProductReportFromResource(resource));
  }

  /**
   * Converts a LowStockReportResource to a LowStockReport entity.
   */
  toLowStockReportFromResource(resource: LowStockReportResource): LowStockReport {
    return new LowStockReport({
      id: resource.id,
      productId: resource.productId,
      productName: resource.productName,
      categoryName: resource.categoryName,
      currentStock: resource.currentStock,
      minStock: resource.minStock,
      unitPrice: resource.unitPrice,
      providerName: resource.providerName,
      stockDifference: resource.stockDifference
    });
  }

  /**
   * Converts an array of LowStockReportResource to LowStockReport entities.
   */
  toLowStockReportsFromResources(resources: LowStockReportResource[]): LowStockReport[] {
    return resources.map(resource => this.toLowStockReportFromResource(resource));
  }

  // Required by BaseAssembler interface
  toEntityFromResource(resource: BaseResource): BaseEntity {
    // This method is required by the interface but not used in this context
    // as we have specific methods for each report type
    return resource as BaseEntity;
  }

  toResourceFromEntity(entity: BaseEntity): BaseResource {
    // This method is required by the interface but not used in this context
    return entity as BaseResource;
  }

  toEntitiesFromResponse(response: ReportsResponse): BaseEntity[] {
    // This method is required by the interface but not used in this context
    // as we generate reports from multiple data sources in the store
    return [];
  }
}

