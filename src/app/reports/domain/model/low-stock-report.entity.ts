import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Represents a Low Stock Report entity.
 * @remarks
 * This class contains information about products with low stock levels.
 */
export class LowStockReport implements BaseEntity {
  constructor(product: {
    id: string;
    productId: string;
    productName: string;
    categoryName: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    providerName?: string;
    stockDifference: number;
  }) {
    this._id = product.id;
    this._productId = product.productId;
    this._productName = product.productName;
    this._categoryName = product.categoryName;
    this._currentStock = product.currentStock;
    this._minStock = product.minStock;
    this._unitPrice = product.unitPrice;
    this._providerName = product.providerName;
    this._stockDifference = product.stockDifference;
  }

  private _id: string;
  get id(): string { return this._id; }
  set id(value: string) { this._id = value; }

  private _productId: string;
  get productId(): string { return this._productId; }
  set productId(value: string) { this._productId = value; }

  private _productName: string;
  get productName(): string { return this._productName; }
  set productName(value: string) { this._productName = value; }

  private _categoryName: string;
  get categoryName(): string { return this._categoryName; }
  set categoryName(value: string) { this._categoryName = value; }

  private _currentStock: number;
  get currentStock(): number { return this._currentStock; }
  set currentStock(value: number) { this._currentStock = value; }

  private _minStock: number;
  get minStock(): number { return this._minStock; }
  set minStock(value: number) { this._minStock = value; }

  private _unitPrice: number;
  get unitPrice(): number { return this._unitPrice; }
  set unitPrice(value: number) { this._unitPrice = value; }

  private _providerName?: string;
  get providerName(): string | undefined { return this._providerName; }
  set providerName(value: string | undefined) { this._providerName = value; }

  private _stockDifference: number;
  get stockDifference(): number { return this._stockDifference; }
  set stockDifference(value: number) { this._stockDifference = value; }

  /**
   * Gets the stock status.
   * @returns 'critical' | 'low' | 'normal'
   */
  getStockStatus(): 'critical' | 'low' | 'normal' {
    if (this._currentStock === 0) return 'critical';
    if (this._currentStock < this._minStock) return 'low';
    return 'normal';
  }

  /**
   * Calculates the percentage of stock remaining compared to minimum.
   * @returns Percentage value (0-100+)
   */
  getStockPercentage(): number {
    if (this._minStock === 0) return 100;
    return Math.round((this._currentStock / this._minStock) * 100);
  }
}

