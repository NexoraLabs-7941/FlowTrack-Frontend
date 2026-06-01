import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Represents a Stock Report entity.
 * @remarks
 * This class contains stock information for reports.
 */
export class StockReport implements BaseEntity {
  constructor(stock: {
    id: string;
    productId: string;
    productName: string;
    categoryName: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    lastUpdated: string;
    providerName?: string;
  }) {
    this._id = stock.id;
    this._productId = stock.productId;
    this._productName = stock.productName;
    this._categoryName = stock.categoryName;
    this._currentStock = stock.currentStock;
    this._minStock = stock.minStock;
    this._unitPrice = stock.unitPrice;
    this._lastUpdated = stock.lastUpdated;
    this._providerName = stock.providerName;
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

  private _lastUpdated: string;
  get lastUpdated(): string { return this._lastUpdated; }
  set lastUpdated(value: string) { this._lastUpdated = value; }

  private _providerName?: string;
  get providerName(): string | undefined { return this._providerName; }
  set providerName(value: string | undefined) { this._providerName = value; }

  get totalValue(): number {
    return this._currentStock * this._unitPrice;
  }

  get isLowStock(): boolean {
    return this._currentStock <= this._minStock;
  }

  get stockStatus(): 'normal' | 'low' | 'critical' {
    if (this._currentStock === 0) return 'critical';
    if (this._currentStock <= this._minStock) return 'low';
    return 'normal';
  }
}

