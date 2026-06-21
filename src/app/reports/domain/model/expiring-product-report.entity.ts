import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Represents an Expiring Product Report entity.
 * @remarks
 * This class contains information about products that are expiring soon.
 */
export class ExpiringProductReport implements BaseEntity {
  constructor(product: {
    id: string;
    productId: string;
    productName: string;
    categoryName: string;
    expirationDate: string;
    currentStock: number;
    lot?: string;
    providerName?: string;
  }) {
    this._id = product.id;
    this._productId = product.productId;
    this._productName = product.productName;
    this._categoryName = product.categoryName;
    this._expirationDate = product.expirationDate;
    this._currentStock = product.currentStock;
    this._lot = product.lot;
    this._providerName = product.providerName;
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

  private _expirationDate: string;
  get expirationDate(): string { return this._expirationDate; }
  set expirationDate(value: string) { this._expirationDate = value; }

  private _currentStock: number;
  get currentStock(): number { return this._currentStock; }
  set currentStock(value: number) { this._currentStock = value; }

  private _lot?: string;
  get lot(): string | undefined { return this._lot; }
  set lot(value: string | undefined) { this._lot = value; }

  private _providerName?: string;
  get providerName(): string | undefined { return this._providerName; }
  set providerName(value: string | undefined) { this._providerName = value; }

  /**
   * Calculates the number of days until expiration.
   * @returns The number of days until expiration (negative if already expired).
   */
  getDaysUntilExpiration(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(this._expirationDate);
    expiration.setHours(0, 0, 0, 0);
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if the product is expired.
   * @returns True if expired, false otherwise.
   */
  isExpired(): boolean {
    return this.getDaysUntilExpiration() < 0;
  }

  /**
   * Checks if the product is expiring soon (within 7 days).
   * @returns True if expiring soon, false otherwise.
   */
  isExpiringSoon(): boolean {
    const days = this.getDaysUntilExpiration();
    return days >= 0 && days <= 7;
  }

  /**
   * Gets the expiration status.
   * @returns 'expired' | 'critical' | 'warning' | 'normal'
   */
  getExpirationStatus(): 'expired' | 'critical' | 'warning' | 'normal' {
    const days = this.getDaysUntilExpiration();
    if (days < 0) return 'expired';
    if (days <= 3) return 'critical';
    if (days <= 7) return 'warning';
    return 'normal';
  }
}

