import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Dashboard } from '../domain/model/dashboard.entity';
import { DashboardStats } from '../domain/model/dashboard-stats.entity';
import { MonthlyIncome } from '../domain/model/monthly-income.entity';
import { ProductSales } from '../domain/model/product-sales.entity';
import { DashboardNotification } from '../domain/model/notification.entity';
import { DashboardResource, DashboardResponse, MonthlyIncomeResource, ProductSalesResource, NotificationResource } from './dashboard-response';

/**
 * Assembler for transforming between Dashboard entities and DashboardResource DTOs.
 * @remarks
 * This class handles the conversion between domain entities and API resources.
 */
export class DashboardAssembler implements BaseAssembler<Dashboard, DashboardResource, DashboardResponse> {
  /**
   * Converts DashboardResource DTO to Dashboard entity.
   * @param resource - The dashboard resource from the API.
   * @returns A Dashboard entity instance.
   */
  toDashboardFromResource(resource: DashboardResource): Dashboard {
    return new Dashboard({
      id: 'dashboard-1',
      stats: this.toDashboardStatsFromResource(resource),
      monthlyIncome: this.toMonthlyIncomeFromResources(resource.monthlyIncome),
      productSales: this.toProductSalesFromResources(resource.productSales),
      notifications: this.toNotificationsFromResources(resource.notifications)
    });
  }

  /**
   * Converts DashboardResource DTO to DashboardStats entity.
   * @param resource - The dashboard resource from the API.
   * @returns A DashboardStats entity instance.
   */
  toDashboardStatsFromResource(resource: DashboardResource): DashboardStats {
    return new DashboardStats({
      productsInInventory: resource.stats.productsInInventory,
      monthlyIncome: resource.stats.monthlyIncome,
      salesThisMonth: resource.stats.salesThisMonth,
      productsWithAlerts: resource.stats.productsWithAlerts
    });
  }

  /**
   * Converts MonthlyIncomeResource DTOs to MonthlyIncome entities.
   * @param resources - Array of monthly income resources from the API.
   * @returns Array of MonthlyIncome entity instances.
   */
  toMonthlyIncomeFromResources(resources: MonthlyIncomeResource[]): MonthlyIncome[] {
    return resources.map(resource => new MonthlyIncome(resource));
  }

  /**
   * Converts ProductSalesResource DTOs to ProductSales entities.
   * @param resources - Array of product sales resources from the API.
   * @returns Array of ProductSales entity instances.
   */
  toProductSalesFromResources(resources: ProductSalesResource[]): ProductSales[] {
    return resources.map(resource => new ProductSales(resource));
  }

  /**
   * Converts NotificationResource DTOs to DashboardNotification entities.
   * @param resources - Array of notification resources from the API.
   * @returns Array of DashboardNotification entity instances.
   */
  toNotificationsFromResources(resources: NotificationResource[]): DashboardNotification[] {
    return resources.map(resource => new DashboardNotification({
      id: resource.id,
      type: resource.type === 'success' ? 'info' : resource.type, 
      title: resource.title,
      message: resource.message,
      data: resource.data
    }));
  }

  toEntityFromResource(resource: DashboardResource): Dashboard {
    return this.toDashboardFromResource(resource);
  }

  toResourceFromEntity(entity: Dashboard): DashboardResource {
    return {
      stats: {
        productsInInventory: entity.stats.productsInInventory,
        monthlyIncome: entity.stats.monthlyIncome,
        salesThisMonth: entity.stats.salesThisMonth,
        productsWithAlerts: entity.stats.productsWithAlerts
      },
      monthlyIncome: entity.monthlyIncome.map(item => ({
        month: item.month,
        amount: item.amount
      })),
      productSales: entity.productSales.map(item => ({
        productName: item.productName,
        percentage: item.percentage
      })),
      notifications: entity.notifications.map(item => ({
        id: item.id,
        type: item.type === 'info' ? 'success' : item.type,
        title: item.title,
        message: item.message,
        data: item.data
      }))
    };
  }

  toEntitiesFromResources(resources: DashboardResource[]): Dashboard[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  toResourcesFromEntities(entities: Dashboard[]): DashboardResource[] {
    return entities.map(entity => this.toResourceFromEntity(entity));
  }

  toEntitiesFromResponse(response: DashboardResponse): Dashboard[] {
    return [this.toEntityFromResource(response)];
  }
}
