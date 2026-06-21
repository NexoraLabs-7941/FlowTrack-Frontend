/**
 * Represents product sales data for charts.
 * @remarks
 * This class encapsulates product sales information for visualization.
 */
export class ProductSales {
  /**
   * Creates a new ProductSales instance.
   * @param data - An object containing product name and percentage.
   * @returns A new instance of ProductSales.
   */
  constructor(data: {
    productName: string;
    percentage: number;
  }) {
    this._productName = data.productName;
    this._percentage = data.percentage;
  }

  private _productName: string;
  get productName(): string {
    return this._productName;
  }

  private _percentage: number;
  get percentage(): number {
    return this._percentage;
  }
}

