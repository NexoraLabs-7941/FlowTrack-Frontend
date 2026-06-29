import { BaseResponse, BaseResource } from '../../shared/infrastructure/base-response';
import { NotificationData } from '../domain/model/notification-data';

/**
 * DTO for dashboard statistics from the API.
 */
export interface DashboardStatsResource {
  productsInInventory: number;
  monthlyIncome: number;
  salesThisMonth: number;
  productsWithAlerts: number;
}

/**
 * DTO for monthly income data from the API.
 */
export interface MonthlyIncomeResource {
  month: string;
  amount: number;
}

/**
 * DTO for product sales data from the API.
 */
export interface ProductSalesResource {
  productName: string;
  percentage: number;
}

/**
 * DTO for notification data from the API.
 */
export interface NotificationResource {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  message: string;
  data: NotificationData;
}

/**
 * DTO for dashboard response from the API.
 */
export interface DashboardResponse extends BaseResponse {
  stats: DashboardStatsResource;
  monthlyIncome: MonthlyIncomeResource[];
  productSales: ProductSalesResource[];
  notifications: NotificationResource[];
}

/**
 * DTO for dashboard resource from the API.
 */
export interface DashboardResource extends BaseResource {
  stats: DashboardStatsResource;
  monthlyIncome: MonthlyIncomeResource[];
  productSales: ProductSalesResource[];
  notifications: NotificationResource[];
}

