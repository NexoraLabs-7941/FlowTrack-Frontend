import { Injectable, signal, computed } from '@angular/core';
import { DashboardStats } from '../domain/model/dashboard-stats.entity';
import { MonthlyIncome } from '../domain/model/monthly-income.entity';
import { ProductSales } from '../domain/model/product-sales.entity';
import { DashboardNotification } from '../domain/model/notification.entity';
import { DashboardApi } from '../infrastructure/dashboard-api';
import { Dashboard } from '../domain/model/dashboard.entity';

/**
 * Store for managing dashboard state and operations.
 * @remarks
 * This service orchestrates dashboard use cases and manages dashboard state.
 * Uses a single API call to get all dashboard data from the backend.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private readonly statsSignal = signal<DashboardStats | null>(null);
  private readonly monthlyIncomeSignal = signal<MonthlyIncome[]>([]);
  private readonly productSalesSignal = signal<ProductSales[]>([]);
  private readonly notificationsSignal = signal<DashboardNotification[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly stats = this.statsSignal.asReadonly();
  readonly monthlyIncome = this.monthlyIncomeSignal.asReadonly();
  readonly productSales = this.productSalesSignal.asReadonly();
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly hasData = computed(() => this.stats() !== null);

  constructor(private dashboardApi: DashboardApi) {
    this.loadDashboardData();
  }

  /**
   * Loads all dashboard data from a single API call.
   */
  loadDashboardData(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.dashboardApi.getDashboard().subscribe({
      next: (dashboard: Dashboard) => {
        this.statsSignal.set(dashboard.stats);
        this.monthlyIncomeSignal.set(dashboard.monthlyIncome);
        this.productSalesSignal.set(dashboard.productSales);
        this.notificationsSignal.set(dashboard.notifications);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error loading dashboard'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Refreshes dashboard data.
   */
  refresh(): void {
    this.loadDashboardData();
  }

  /**
   * Formats error messages for better user experience.
   * @param error - The error object.
   * @param fallback - The fallback message if error is not an Error instance.
   * @returns A formatted error message.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
