import {BaseEntity} from '../../../shared/infrastructure/base-entity';

/**
 * Represents a Product entity int the application.
 * @remarks
 * This class is used as a domain model for products in inventory
 * It implements the BaseEntity interface to ensure consistency across entities.
 * @see {@link BaseEntity}
 */
export class Product implements BaseEntity {
  /**
   * Creates a new Product instance.
   * @param product - An object containing the id, name, description, categoryId, providerId, minStock, unitPrice, isActive of the product.
   * @returns A new instance of Product.
   */
  constructor(product: {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    providerId: string;
    minStock: number;
    unitPrice: number;
    isActive: boolean;
  }) {
    this._id = product.id;
    this._name = product.name;
    this._description = product.description;
    this._categoryId = product.categoryId;
    this._providerId = product.providerId;
    this._minStock = product.minStock;
    this._unitPrice = product.unitPrice;
    this._isActive = product.isActive;
  }

  /**
   * The unique identifier for the product.
   */
  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  /**
   * The name of the product
   */
  private _name: string;
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }

  /**
   * The description of the product
   */
  private _description: string;
  get description(): string {
    return this._description;
  }
  set description(value: string) {
    this._description = value;
  }

  private _categoryId: string;
  get categoryId(): string {
    return this._categoryId;
  }
  set categoryId(value: string) {
    this._categoryId = value;
  }

  private _providerId: string;
  get providerId(): string {
    return this._providerId;
  }
  set providerId(value: string) {
    this._providerId = value;
  }

  private _minStock: number;
  get minStock(): number {
    return this._minStock;
  }
  set minStock(value: number) {
    this._minStock = value;
  }

  /**
   * The unit price of the product
   */
  private _unitPrice: number;
  get unitPrice(): number {
    return this._unitPrice;
  }
  set unitPrice(value: number) {
    this._unitPrice = value;
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }
  set isActive(value: boolean) {
    this._isActive = value;
  }
}
