import {Injectable, signal} from '@angular/core';
import {Sale} from '../domain/model/sale.entity';
import {Product} from '../../inventory/domain/model/product.entity';
import {Batch} from '../../inventory/domain/model/batch.entity';
import {ProductsApi} from '../../inventory/infrastructure/products-api';
import {BatchApi} from '../../inventory/infrastructure/batch-api';
import {Kit} from '../../inventory/domain/model/kit.entity';
import {KitApi} from '../../inventory/infrastructure/kit-api';

@Injectable({
  providedIn: 'root'
})
export class SalesStore {
  private readonly salesSignal = signal<Sale[]>([]);
  private readonly productsSignal = signal<Product[]>([]);
  private readonly kitsSignal = signal<Kit[]>([]);
  private readonly batchesSignal = signal<Batch[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly sales = this.salesSignal.asReadonly();
  readonly products = this.productsSignal.asReadonly();
  readonly batches = this.batchesSignal.asReadonly();
  readonly kits = this.kitsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private productsApi: ProductsApi,
              private batchesApi: BatchApi,
              private kitsApi: KitApi
  ) {

    this.loadProducts();
    this.loadBatches();
    this.loadKits();
  }

  private loadProducts() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.productsApi.getProducts().subscribe({
      next: (data: Product[]) => {
        this.productsSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(`Error loading products: ${err.message}`);
        this.loadingSignal.set(false);
      }
    });
  }

  loadBatches() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.batchesApi.getBatches().subscribe({
      next: (data: Batch[]) => {
        this.batchesSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(`Error loading batches: ${err.message}`);
        this.loadingSignal.set(false);
      }
    });
  }

  private loadKits() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.kitsApi.getKits().subscribe({
      next: (data: Kit[]) => {
        this.kitsSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(`Error loading kits: ${err.message}`);
        this.loadingSignal.set(false);
      }
    });
  }

}
