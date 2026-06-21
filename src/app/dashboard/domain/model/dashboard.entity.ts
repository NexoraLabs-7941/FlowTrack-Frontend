import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { DashboardStats } from './dashboard-stats.entity';
import { MonthlyIncome } from './monthly-income.entity';
import { ProductSales } from './product-sales.entity';
import { DashboardNotification } from './notification.entity';

/**
 * Represents a Dashboard entity in the domain.
 * @remarks
 * This class encapsulates all dashboard data including statistics, charts data, and notifications.
 */
export class Dashboard implements BaseEntity {
  /**
   * Creates a new Dashboard instance.
   * @param dashboard - An object containing all dashboard data.
   * @returns A new instance of Dashboard.
   */
  constructor(dashboard: {
    id: string;
    stats: DashboardStats;
    monthlyIncome: MonthlyIncome[];
    productSales: ProductSales[];
    notifications: DashboardNotification[];
  }) {
    this._id = dashboard.id;
    this._stats = dashboard.stats;
    this._monthlyIncome = dashboard.monthlyIncome;
    this._productSales = dashboard.productSales;
    this._notifications = dashboard.notifications;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  private _stats: DashboardStats;
  get stats(): DashboardStats {
    return this._stats;
  }
  set stats(value: DashboardStats) {
    this._stats = value;
  }

  private _monthlyIncome: MonthlyIncome[];
  get monthlyIncome(): MonthlyIncome[] {
    return this._monthlyIncome;
  }
  set monthlyIncome(value: MonthlyIncome[]) {
    this._monthlyIncome = value;
  }

  private _productSales: ProductSales[];
  get productSales(): ProductSales[] {
    return this._productSales;
  }
  set productSales(value: ProductSales[]) {
    this._productSales = value;
  }

  private _notifications: DashboardNotification[];
  get notifications(): DashboardNotification[] {
    return this._notifications;
  }
  set notifications(value: DashboardNotification[]) {
    this._notifications = value;
  }
}
