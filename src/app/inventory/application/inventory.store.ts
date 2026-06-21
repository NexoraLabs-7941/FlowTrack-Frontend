import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../domain/model/product.entity';
import { Category } from '../domain/model/category.entity';
import { Provider } from '../domain/model/provider.entity';
import { Kit } from '../domain/model/kit.entity';
import { Batch } from '../domain/model/batch.entity';
import { ProductsApi } from '../infrastructure/products-api';
import { CategoryApi } from '../infrastructure/category-api';
import { ProvidersApi } from '../../providers-management/infrastructure/providers-api';
import { KitApi } from '../infrastructure/kit-api';
import { BatchApi } from '../infrastructure/batch-api';
import { YoloDetection } from '../domain/model/YoloDetection';

export interface StockInfo {
  productId: string;
  currentStock: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryStore {
  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);
  private readonly providersSignal = signal<Provider[]>([]);
  private readonly kitsSignal = signal<Kit[]>([]);
  private readonly batchesSignal = signal<Batch[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly providers = this.providersSignal.asReadonly();
  readonly kits = this.kitsSignal.asReadonly();
  readonly batches = this.batchesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly stock = computed<StockInfo[]>(() => {
    const batches = this.batches();
    const stockMap = new Map<string, { quantity: number; lastDate: string }>();

    batches.forEach(batch => {
      const productId = String(batch.productId);
      const existing = stockMap.get(productId);
      const batchDate = batch.receptionDate || new Date().toISOString();

      if (existing) {
        existing.quantity += batch.quantity;
        if (batchDate > existing.lastDate) {
          existing.lastDate = batchDate;
        }
      } else {
        stockMap.set(productId, {
          quantity: batch.quantity,
          lastDate: batchDate
        });
      }
    });

    return Array.from(stockMap.entries()).map(([productId, data]) => ({
      productId,
      currentStock: data.quantity,
      lastUpdated: data.lastDate.split('T')[0]
    }));
  });

  readonly hasProducts = computed(() => this.products().length > 0);
  readonly hasCategories = computed(() => this.categories().length > 0);
  readonly hasProviders = computed(() => this.providers().length > 0);
  readonly hasStock = computed(() => this.stock().length > 0);
  readonly hasKits = computed(() => this.kits().length > 0);
  readonly hasBatches = computed(() => this.batches().length > 0);

  constructor(
    private productsApi: ProductsApi,
    private categoriesApi: CategoryApi,
    private providersApi: ProvidersApi,
    private kitApi: KitApi,
    private batchApi: BatchApi
  ) {
    this.loadInventoryData();
  }

  private loadInventoryData(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.productsApi.getProducts().subscribe({
      next: (products: Product[]) => {
        this.productsSignal.set(products);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error loading products'));
      }
    });

    this.categoriesApi.getAll().subscribe({
      next: (categories: any[]) => {
        const categoryEntities = categories.map(cat => new Category({
          id: String(cat.id),
          name: cat.name
        }));
        this.categoriesSignal.set(categoryEntities);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error loading categories'));
      }
    });

    this.providersApi.getProviders().subscribe({
      next: (providers: Provider[]) => {
        this.providersSignal.set(providers);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error loading providers'));
      }
    });

    this.kitApi.getKits().subscribe({
      next: (kits: Kit[]) => {
        this.kitsSignal.set(kits);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error loading kits'));
      }
    });

    this.batchApi.getBatches().subscribe({
      next: (batches: Batch[]) => {
        this.batchesSignal.set(batches);
        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error loading batches'));
        this.loadingSignal.set(false);
      }
    });
  }

  addProduct(product: Product): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.productsApi.createProduct(product).subscribe({
      next: (newProduct: Product) => {
        this.productsSignal.set([...this.productsSignal(), newProduct]);
        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error creating product'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateProduct(product: Product): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.productsApi.updateProduct(product, Number(product.id)).subscribe({
      next: (updatedProduct: Product) => {
        const current = this.productsSignal();
        const index = current.findIndex(p => p.id === updatedProduct.id);
        if (index > -1) {
          const updated = [...current];
          updated[index] = updatedProduct;
          this.productsSignal.set(updated);
        }
        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error updating product'));
        this.loadingSignal.set(false);
      }
    });
  }

  removeProduct(productId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.productsApi.deleteProduct(Number(productId)).subscribe({
      next: () => {
        this.productsSignal.set(this.productsSignal().filter(p => p.id !== productId));
        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error deleting product'));
        this.loadingSignal.set(false);
      }
    });
  }

  addCategory(categoryData: { name: string; description: string }): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.categoriesApi.createCategory(categoryData.name, categoryData.description).subscribe({
      next: (createdCategory: any) => {
        const categoryEntity = new Category({
          id: String(createdCategory.id),
          name: createdCategory.name
        });
        this.categoriesSignal.set([...this.categoriesSignal(), categoryEntity]);
        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error creating category'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateCategory(category: Category): void {
    const current = this.categoriesSignal();
    const index = current.findIndex(c => c.id === category.id);
    if (index > -1) {
      const updated = [...current];
      updated[index] = category;
      this.categoriesSignal.set(updated);
    }
  }

  removeCategory(categoryId: string): void {
    this.categoriesSignal.set(this.categoriesSignal().filter(c => c.id !== categoryId));
  }

  addKit(kit: Kit): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.kitApi.createKit(kit).subscribe({
      next: (createdKit: Kit) => {
        this.kitsSignal.set([...this.kitsSignal(), createdKit]);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error creating kit'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateKit(kit: Kit): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.kitApi.updateKit(kit, Number(kit.id)).subscribe({
      next: (updatedKit: Kit) => {
        const current = this.kitsSignal();
        const index = current.findIndex(k => k.id === updatedKit.id);
        if (index > -1) {
          const updated = [...current];
          updated[index] = updatedKit;
          this.kitsSignal.set(updated);
        }
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error updating kit'));
        this.loadingSignal.set(false);
      }
    });
  }

  removeKit(kitId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.kitApi.deleteKit(Number(kitId)).subscribe({
      next: () => {
        this.kitsSignal.set(this.kitsSignal().filter(k => k.id !== kitId));
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error deleting kit'));
        this.loadingSignal.set(false);
      }
    });
  }

  addBatch(batch: Batch): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.batchApi.createBatch(batch).subscribe({
      next: (createdBatch: Batch) => {
        this.batchesSignal.set([...this.batchesSignal(), createdBatch]);
        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error creating batch'));
        this.loadingSignal.set(false);
      }
    });
  }

  getStockForProduct(productId: string): number {
    return this.stock().find(s => s.productId === productId)?.currentStock || 0;
  }

  getBatchesForProduct(productId: string): Batch[] {
    return this.batches().filter(b => String(b.productId) === productId);
  }

  simulateYoloDetection(productIds: string[]): YoloDetection[] {
    return productIds
      .filter(id => !!id)
      .map(productId => {
        const product = this.products().find(p => p.id === productId);
        const currentStock = this.getStockForProduct(productId);
        const detectedQty = Math.floor(Math.random() * 20) + 1;
        return new YoloDetection({
          productId,
          productName: product?.name ?? 'Desconocido',
          currentStock,
          detectedQuantity: detectedQty,
          validatedQuantity: detectedQty
        });
      });
  }

  refresh(): void {
    this.loadInventoryData();
  }

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
