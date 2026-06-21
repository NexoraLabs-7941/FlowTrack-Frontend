import { Injectable, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProviderReport } from '../domain/model/provider-report.entity';
import { StockReport } from '../domain/model/stock-report.entity';
import { ExpiringProductReport } from '../domain/model/expiring-product-report.entity';
import { LowStockReport } from '../domain/model/low-stock-report.entity';
import { ProductsApi } from '../../inventory/infrastructure/products-api';
import { ProvidersApi } from '../../providers-management/infrastructure/providers-api';
import { CategoryApi, CategoryResource } from '../../inventory/infrastructure/category-api';
import { BatchApi } from '../../inventory/infrastructure/batch-api';
import { SalesApi } from '../../sales/infrastructure/sales-api';
import { SaleResponse } from '../../sales/infrastructure/sales-api-endpoint';
import { Product } from '../../inventory/domain/model/product.entity';
import { Provider } from '../../inventory/domain/model/provider.entity';
import { Category } from '../../inventory/domain/model/category.entity';
import { Batch } from '../../inventory/domain/model/batch.entity';

/**
 * Store for managing reports state and operations.
 * @remarks
 * This service orchestrates reports use cases and manages reports state.
 * Stock is calculated from batches (no separate stock API).
 */
@Injectable({
  providedIn: 'root'
})
export class ReportsStore {
  private readonly providersReportSignal = signal<ProviderReport[]>([]);
  private readonly stockReportSignal = signal<StockReport[]>([]);
  private readonly expiringProductsReportSignal = signal<ExpiringProductReport[]>([]);
  private readonly lowStockReportSignal = signal<LowStockReport[]>([]);
  private readonly salesReportSignal = signal<SaleResponse[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly providersReport = this.providersReportSignal.asReadonly();
  readonly stockReport = this.stockReportSignal.asReadonly();
  readonly expiringProductsReport = this.expiringProductsReportSignal.asReadonly();
  readonly lowStockReport = this.lowStockReportSignal.asReadonly();
  readonly salesReport = this.salesReportSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly hasProvidersReport = computed(() => this.providersReport().length > 0);
  readonly hasStockReport = computed(() => this.stockReport().length > 0);
  readonly hasExpiringProductsReport = computed(() => this.expiringProductsReport().length > 0);
  readonly hasLowStockReport = computed(() => this.lowStockReport().length > 0);
  readonly hasSalesReport = computed(() => this.salesReport().length > 0);

  constructor(
    private productsApi: ProductsApi,
    private providersApi: ProvidersApi,
    private categoryApi: CategoryApi,
    private batchApi: BatchApi,
    private salesApi: SalesApi
  ) {}

  /**
   * Loads all reports data.
   */
  loadReportsData(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Load all necessary data in parallel using forkJoin
    forkJoin({
      products: this.productsApi.getProducts(),
      providers: this.providersApi.getProviders(),
      categories: this.categoryApi.getAll(),
      batches: this.batchApi.getBatches(),
      sales: this.salesApi.getAllSales()
    }).subscribe({
      next: ({ products, providers, categories, batches, sales }) => {
        // Convert CategoryResource[] to Category[]
        const categoryEntities = (categories as CategoryResource[]).map(
          cat => new Category({ id: String(cat.id), name: cat.name })
        );

        this.generateReports(
          products as Product[],
          providers as Provider[],
          categoryEntities,
          batches as Batch[]
        );

        // Set sales report
        this.salesReportSignal.set(sales as SaleResponse[]);

        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error loading reports data'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Generates all reports from the loaded data.
   */
  private generateReports(
    products: Product[],
    providers: Provider[],
    categories: Category[],
    batches: Batch[]
  ): void {
    // Generate providers report
    this.generateProvidersReport(products, providers, categories);

    // Generate stock report (using batches for stock calculation)
    this.generateStockReport(products, batches, providers, categories);

    // Generate expiring products report (using batches for expiration dates)
    this.generateExpiringProductsReport(products, batches, providers, categories);

    // Generate low stock report (using batches for stock calculation)
    this.generateLowStockReport(products, batches, providers, categories);
  }

  /**
   * Generates the providers report.
   */
  private generateProvidersReport(products: Product[], providers: Provider[], categories: Category[]): void {
    const productsByProvider = new Map<string, string[]>();
    const categoriesByProvider = new Map<string, Set<string>>();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    products.forEach(product => {
      const providerProducts = productsByProvider.get(product.providerId) || [];
      providerProducts.push(product.name);
      productsByProvider.set(product.providerId, providerProducts);

      // Track categories for each provider
      const providerCategories = categoriesByProvider.get(product.providerId) || new Set<string>();
      const categoryName = categoryMap.get(product.categoryId);
      if (categoryName) {
        providerCategories.add(categoryName);
      }
      categoriesByProvider.set(product.providerId, providerCategories);
    });

    const providersReport = providers.map(provider => {
      const providerProducts = productsByProvider.get(provider.id) || [];
      const providerCategorySet = categoriesByProvider.get(provider.id) || new Set<string>();
      return new ProviderReport({
        id: provider.id,
        firstName: provider.firstName,
        lastName: provider.lastName,
        phoneNumber: provider.phoneNumber,
        email: provider.email,
        ruc: provider.ruc,
        productCount: providerProducts.length,
        productNames: providerProducts,
        categoryNames: Array.from(providerCategorySet)
      });
    });

    this.providersReportSignal.set(providersReport);
  }

  /**
   * Generates the stock report.
   */
  private generateStockReport(
    products: Product[],
    batches: Batch[],
    providers: Provider[],
    categories: Category[]
  ): void {
    const providerMap = new Map(providers.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Calculate stock from batches: sum all quantities by product
    const stockByProduct = new Map<string, number>();
    const lastUpdatedByProduct = new Map<string, string>();

    batches.forEach(batch => {
      const currentStock = stockByProduct.get(batch.productId) || 0;
      stockByProduct.set(batch.productId, currentStock + batch.quantity);

      // Track the most recent reception date as lastUpdated
      const existingDate = lastUpdatedByProduct.get(batch.productId);
      if (!existingDate || new Date(batch.receptionDate) > new Date(existingDate)) {
        lastUpdatedByProduct.set(batch.productId, batch.receptionDate);
      }
    });

    const stockReport = products
      .filter(product => product.isActive)
      .map(product => {
        const currentStock = stockByProduct.get(product.id) || 0;
        const lastUpdated = lastUpdatedByProduct.get(product.id) || new Date().toISOString().split('T')[0];

        return new StockReport({
          id: `stock-${product.id}`,
          productId: product.id,
          productName: product.name,
          categoryName: categoryMap.get(product.categoryId) || '-',
          currentStock: currentStock,
          minStock: product.minStock,
          unitPrice: product.unitPrice,
          lastUpdated: lastUpdated.split('T')[0], // Format to YYYY-MM-DD
          providerName: providerMap.get(product.providerId)
        });
      });

    this.stockReportSignal.set(stockReport);
  }

  /**
   * Generates the expiring products report.
   */
  private generateExpiringProductsReport(
    products: Product[],
    batches: Batch[],
    providers: Provider[],
    categories: Category[]
  ): void {
    const providerMap = new Map(providers.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Calculate stock from batches: sum all quantities by product
    const stockByProduct = new Map<string, number>();
    batches.forEach(batch => {
      const currentStock = stockByProduct.get(batch.productId) || 0;
      stockByProduct.set(batch.productId, currentStock + batch.quantity);
    });

    // Get all batches with expiration dates, grouped by product
    const batchesByProduct = new Map<string, Batch[]>();
    batches.forEach(batch => {
      if (!batch.expirationDate || batch.expirationDate.trim() === '') {
        return; // Skip batches without expiration dates
      }

      const expirationDate = new Date(batch.expirationDate);
      if (isNaN(expirationDate.getTime())) {
        return; // Skip invalid dates
      }

      const productBatches = batchesByProduct.get(batch.productId) || [];
      productBatches.push(batch);
      batchesByProduct.set(batch.productId, productBatches);
    });

    // Get all products with expiration dates from batches
    const expiringProducts = products
      .filter(product => {
        const productBatches = batchesByProduct.get(product.id);
        return productBatches && productBatches.length > 0;
      })
      .map(product => {
        const productBatches = batchesByProduct.get(product.id)!;
        // Use the batch with the earliest expiration date
        const earliestBatch = productBatches.reduce((earliest, current) => {
          const earliestDate = new Date(earliest.expirationDate);
          const currentDate = new Date(current.expirationDate);
          return currentDate < earliestDate ? current : earliest;
        });

        const currentStock = stockByProduct.get(product.id) || 0;

        return new ExpiringProductReport({
          id: `expiring-${product.id}-${earliestBatch.id}`,
          productId: product.id,
          productName: product.name,
          categoryName: categoryMap.get(product.categoryId) || '-',
          expirationDate: earliestBatch.expirationDate,
          currentStock: currentStock,
          lot: `L-${earliestBatch.id}`,
          providerName: providerMap.get(product.providerId)
        });
      })
      .sort((a, b) => {
        const dateA = new Date(a.expirationDate).getTime();
        const dateB = new Date(b.expirationDate).getTime();
        return dateA - dateB;
      });

    this.expiringProductsReportSignal.set(expiringProducts);
  }

  /**
   * Generates the low stock report.
   */
  private generateLowStockReport(
    products: Product[],
    batches: Batch[],
    providers: Provider[],
    categories: Category[]
  ): void {
    const providerMap = new Map(providers.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Calculate stock from batches: sum all quantities by product
    const stockByProduct = new Map<string, number>();
    batches.forEach(batch => {
      const currentStock = stockByProduct.get(batch.productId) || 0;
      stockByProduct.set(batch.productId, currentStock + batch.quantity);
    });

    const lowStockProducts = products
      .filter(product => {
        const currentStock = stockByProduct.get(product.id) || 0;
        return currentStock <= product.minStock && product.isActive;
      })
      .map(product => {
        const currentStock = stockByProduct.get(product.id) || 0;

        return new LowStockReport({
          id: `low-stock-${product.id}`,
          productId: product.id,
          productName: product.name,
          categoryName: categoryMap.get(product.categoryId) || '-',
          currentStock: currentStock,
          minStock: product.minStock,
          unitPrice: product.unitPrice,
          providerName: providerMap.get(product.providerId),
          stockDifference: product.minStock - currentStock
        });
      })
      .sort((a, b) => {
        // Sort by stock difference (most critical first)
        return b.stockDifference - a.stockDifference;
      });

    this.lowStockReportSignal.set(lowStockProducts);
  }

  /**
   * Refreshes reports data.
   */
  refresh(): void {
    this.loadReportsData();
  }

  /**
   * Formats error messages for display.
   */
  private formatError(error: any, defaultMessage: string): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return defaultMessage;
  }
}
