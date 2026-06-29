/**
 * Represents dashboard statistics entity.
 * @remarks
 * This class encapsulates the main statistics displayed on the dashboard.
 */
export class DashboardStats {
  /**
   * Creates a new DashboardStats instance.
   * @param stats - An object containing dashboard statistics.
   * @returns A new instance of DashboardStats.
   */
  constructor(stats: {
    productsInInventory: number;
    monthlyIncome: number;
    salesThisMonth: number;
    productsWithAlerts: number;
  }) {
    this._productsInInventory = stats.productsInInventory;
    this._monthlyIncome = stats.monthlyIncome;
    this._salesThisMonth = stats.salesThisMonth;
    this._productsWithAlerts = stats.productsWithAlerts;
  }

  private _productsInInventory: number;
  get productsInInventory(): number {
    return this._productsInInventory;
  }

  private _monthlyIncome: number;
  get monthlyIncome(): number {
    return this._monthlyIncome;
  }

  private _salesThisMonth: number;
  get salesThisMonth(): number {
    return this._salesThisMonth;
  }

  private _productsWithAlerts: number;
  get productsWithAlerts(): number {
    return this._productsWithAlerts;
  }
}

