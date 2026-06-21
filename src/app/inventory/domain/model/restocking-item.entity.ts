/**
 * Item of a restocking operation: which product and how many units to add.
 */
export class RestockingItem {
  constructor(params: { productId: string; quantityToAdd: number }) {
    this._productId = params.productId;
    this._quantityToAdd = params.quantityToAdd;
  }

  private _productId: string;
  get productId(): string { return this._productId; }
  set productId(value: string) { this._productId = value; }

  private _quantityToAdd: number;
  get quantityToAdd(): number { return this._quantityToAdd; }
  set quantityToAdd(value: number) { this._quantityToAdd = value; }
}
