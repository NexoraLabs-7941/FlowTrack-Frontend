export class YoloDetection {
  constructor(params: {
    productId: string;
    productName: string;
    currentStock: number;
    detectedQuantity: number;
    validatedQuantity: number;
  }) {
    this._productId = params.productId;
    this._productName = params.productName;
    this._currentStock = params.currentStock;
    this._detectedQuantity = params.detectedQuantity;
    this._validatedQuantity = params.validatedQuantity;
  }

  private _productId: string;
  get productId(): string { return this._productId; }

  private _productName: string;
  get productName(): string { return this._productName; }

  private _currentStock: number;
  get currentStock(): number { return this._currentStock; }

  private _detectedQuantity: number;
  get detectedQuantity(): number { return this._detectedQuantity; }

  private _validatedQuantity: number;
  get validatedQuantity(): number { return this._validatedQuantity; }

  get total(): number {
    return this._currentStock + this._validatedQuantity;
  }

  withValidatedQuantity(qty: number): YoloDetection {
    return new YoloDetection({
      productId: this._productId,
      productName: this._productName,
      currentStock: this._currentStock,
      detectedQuantity: this._detectedQuantity,
      validatedQuantity: qty
    });
  }

  withDetectedQuantity(qty: number): YoloDetection {
    return new YoloDetection({
      productId: this._productId,
      productName: this._productName,
      currentStock: this._currentStock,
      detectedQuantity: qty,
      validatedQuantity: qty
    });
  }

  toRestockingItem(): { productId: string; quantityToAdd: number } {
    return {
      productId: this._productId,
      quantityToAdd: this._validatedQuantity
    };
  }
}
