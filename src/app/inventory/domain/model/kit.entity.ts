import {BaseEntity} from '../../../shared/infrastructure/base-entity';

/**
 * Represents a Kit entity in the application.
 * @remarks
 * This class is used as a domain model for kits in inventory.
 * It implements the BaseEntity interface to ensure consistency across entities.
 * @see {@link BaseEntity}
 */

/**
 * Represents a product within a kit with its quantity and price.
 */
export interface KitProduct {
  productId: string;
  quantity: number;
  price: number;
}

export class Kit implements BaseEntity {
  /**
   * Creates a new Kit instance.
   * @param kit - An object containing the id, name, price (totalPrice) and products (items) of the kit.
   * @returns A new instance of Kit.
   */
  constructor(kit: {
    id: string;
    name: string;
    price: number; // Maps to totalPrice from backend
    products?: KitProduct[]; // Maps to items from backend
  }) {
    this._id = kit.id;
    this._name = kit.name;
    this._price = kit.price;
    this._products = kit.products || [];
  }

  /**
   * The unique identifier for the kit.
   */
  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  /**
   * The name of the kit.
   */
  private _name: string;
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }

  /**
   * The total price of the kit (calculated by backend from items).
   */
  private _price: number;
  get price(): number {
    return this._price;
  }
  set price(value: number) {
    this._price = value;
  }

  /**
   * The products (items) included in the kit with their quantities and prices.
   */
  private _products: KitProduct[];
  get products(): KitProduct[] {
    return this._products;
  }
  set products(value: KitProduct[]) {
    this._products = value;
  }

  /**
   * Calculates the total price from items if not provided by backend.
   * @returns The sum of (quantity * price) for all products.
   */
  calculateTotalPrice(): number {
    return this._products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  }
}
