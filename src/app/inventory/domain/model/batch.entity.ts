import {BaseEntity} from '../../../shared/infrastructure/base-entity';

/**
 * Represents a Batch entity in the application.
 * @remarks
 * This class represents a batch of products with quantity, expiration and reception dates.
 * It implements the BaseEntity interface to ensure consistency across entities.
 * @see {@link BaseEntity}
 */
export class Batch implements BaseEntity {
  /**
   * Creates a new Batch instance.
   * @param batch - An object containing the id, productId, quantity, expirationDate, and receptionDate of the batch.
   * @returns A new instance of Batch.
   */
  constructor(batch: {
    id: string;
    productId: string;
    quantity: number;
    expirationDate: string;
    receptionDate: string;
  }) {
    this._id = batch.id;
    this._productId = batch.productId;
    this._quantity = batch.quantity;
    this._expirationDate = batch.expirationDate;
    this._receptionDate = batch.receptionDate;
  }

  /**
   * The unique identifier for the batch.
   */
  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  /**
   * The product ID associated with this batch.
   */
  private _productId: string;
  get productId(): string {
    return this._productId;
  }
  set productId(value: string) {
    this._productId = value;
  }

  /**
   * The quantity of products in this batch.
   */
  private _quantity: number;
  get quantity(): number {
    return this._quantity;
  }
  set quantity(value: number) {
    this._quantity = value;
  }

  /**
   * The expiration date of the batch (ISO 8601 format).
   */
  private _expirationDate: string;
  get expirationDate(): string {
    return this._expirationDate;
  }
  set expirationDate(value: string) {
    this._expirationDate = value;
  }

  /**
   * The reception date of the batch (ISO 8601 format).
   */
  private _receptionDate: string;
  get receptionDate(): string {
    return this._receptionDate;
  }
  set receptionDate(value: string) {
    this._receptionDate = value;
  }

  /**
   * Checks if the batch has expired.
   * @returns true if the batch has expired, false otherwise.
   */
  isExpired(): boolean {
    if (!this._expirationDate) return false;
    const expirationDate = new Date(this._expirationDate);
    return expirationDate < new Date();
  }

  /**
   * Gets the number of days until expiration.
   * @returns The number of days until expiration, or negative if expired.
   */
  getDaysUntilExpiration(): number {
    if (!this._expirationDate) return Infinity;
    const expirationDate = new Date(this._expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

