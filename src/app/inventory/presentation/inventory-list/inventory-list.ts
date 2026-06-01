import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RestockingDialogComponent } from '../restocking-dialog/restocking-dialog';
import { NewKitDialogComponent } from '../new-kit-dialog/new-kit-dialog';
import { Kit } from '../../domain/model/kit.entity';
import { ProductInfoDialogComponent, ProductInfoData } from '../product-info-dialog/product-info-dialog';
import { NewProductDialogComponent } from '../new-product-dialog/new-product-dialog';
import { NewCategoryDialogComponent } from '../new-category-dialog/new-category-dialog';
import { InventoryStore } from '../../application/inventory.store';

type ProductRow = {
  id: string,
  name: string,
  unitPrice: number,
  minStock: number,
  currentStock: number,
  categoryName?: string;
  categoryId?: string;
  providerName?: string;
  providerId?: string;
  lastReception?: string;  // ISO 'YYYY-MM-DD'
  lot?: string;
  expirationDate?: string;
};

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatCardModule,
    MatPaginatorModule
  ],
})
export class InventoryListComponent {
  protected readonly store = inject(InventoryStore);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedProvider = signal<string>('');
  selectedStatus = signal<string>('');

  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);

  get activeFilters(): Array<{type: string, value: string, label: string}> {
    const filters: Array<{type: string, value: string, label: string}> = [];

    if (this.selectedCategory()) {
      const category = this.categories.find(c => c.id === this.selectedCategory());
      if (category) {
        filters.push({ type: 'category', value: this.selectedCategory(), label: category.name });
      }
    }

    if (this.selectedProvider()) {
      filters.push({ type: 'provider', value: this.selectedProvider(), label: this.getProviderName(this.selectedProvider()) });
    }

    if (this.selectedStatus()) {
      const statusKey = this.selectedStatus() === 'normal' ? 'normalStock' : this.selectedStatus();
      const statusLabel = this.t(`inventory.${statusKey}`);
      filters.push({ type: 'status', value: this.selectedStatus(), label: statusLabel });
    }

    return filters;
  }

  get activeFiltersCount(): number {
    return this.activeFilters.length;
  }

  get categories() {
    return this.store.categories();
  }

  get providers() {
    return this.store.providers();
  }

  getProviderName(providerId: string): string {
    const provider = this.store.providers().find(p => p.id === providerId);
    return provider ? `${provider.firstName} ${provider.lastName}` : '-';
  }

  get productsRow(): ProductRow[] {
    const batches = this.store.batches();
    const products = this.store.products();
    const categories = this.store.categories();

    // Calculate stock by product: sum all quantities from batches
    const stockByProduct = new Map<string, number>();
    batches.forEach(batch => {
      const currentStock = stockByProduct.get(batch.productId) || 0;
      stockByProduct.set(batch.productId, currentStock + batch.quantity);
    });

    // Get latest batch info by product (most recent reception date)
    const latestBatchByProduct = new Map<string, { lot: string; receptionDate: string; expirationDate: string }>();
    batches.forEach(batch => {
      const existing = latestBatchByProduct.get(batch.productId);
      const batchReceptionDate = new Date(batch.receptionDate);

      if (!existing || batchReceptionDate > new Date(existing.receptionDate)) {
        // Use batch id as lot identifier (or you could generate a lot code)
        latestBatchByProduct.set(batch.productId, {
          lot: `L-${batch.id}`, // Format lot as L-{batchId}
          receptionDate: batch.receptionDate,
          expirationDate: batch.expirationDate
        });
      }
    });

    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const allProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      unitPrice: p.unitPrice,
      minStock: p.minStock,
      currentStock: stockByProduct.get(p.id) ?? 0,
      categoryName: categoryMap.get(p.categoryId) ?? '-',
      categoryId: p.categoryId,
      providerId: p.providerId,
      providerName: this.getProviderName(p.providerId),
      lot: latestBatchByProduct.get(p.id)?.lot ?? '-',
      lastReception: latestBatchByProduct.get(p.id)?.receptionDate ?? undefined,
      expirationDate: latestBatchByProduct.get(p.id)?.expirationDate ?? undefined
    }));

    let filtered = allProducts;

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search)
      );
    }

    const category = this.selectedCategory();
    if (category) {
      filtered = filtered.filter(p => p.categoryId === category);
    }

    const provider = this.selectedProvider();
    if (provider) {
      filtered = filtered.filter(p => p.providerId === provider);
    }

    const status = this.selectedStatus();
    if (status) {
      if (status === 'outOfStock') {
        filtered = filtered.filter(p => p.currentStock === 0);
      } else if (status === 'lowStock') {
        filtered = filtered.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock);
      } else if (status === 'normal') {
        filtered = filtered.filter(p => p.currentStock > p.minStock);
      }
    }

    return filtered;
  }

  get paginatedProducts(): ProductRow[] {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.productsRow.slice(start, end);
  }

  get totalProducts(): number {
    return this.productsRow.length;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSearchChange(value: string): void {
    this.pageIndex.set(0);
    this.searchTerm.set(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
  }

  onProviderChange(value: string): void {
    this.selectedProvider.set(value);
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
  }

  removeFilter(type: string): void {
    if (type === 'category') {
      this.selectedCategory.set('');
    } else if (type === 'provider') {
      this.selectedProvider.set('');
    } else if (type === 'status') {
      this.selectedStatus.set('');
    }
  }

  clearFilters(): void {
    this.selectedCategory.set('');
    this.selectedProvider.set('');
    this.selectedStatus.set('');
  }

  onCategorySelected(value: string): void {
    this.selectedCategory.set(value);
    this.pageIndex.set(0);
  }

  onProviderSelected(value: string): void {
    this.selectedProvider.set(value);
    this.pageIndex.set(0);
  }

  onStatusSelected(value: string): void {
    this.selectedStatus.set(value);
    this.pageIndex.set(0);
  }

  get kits(): Kit[] {
    // All kits from backend are considered active (no isEnabled field)
    return this.store.kits();
  }

  getProductName(productId: string): string {
    const product = this.store.products().find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  }

  getKitTotalPrice(kit: Kit): number {
    return kit.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }

  getProductSubtotal(product: any): number {
    return product.price * product.quantity;
  }

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  openRestockingDialog(): void {
    const dialogRef = this.dialog.open(RestockingDialogComponent, {
      width: '520px',
      maxWidth: '90vw',
      panelClass: 'restocking-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Batch is already created in the dialog, just refresh the data
        this.store.refresh();
      }
    });
  }


  openNewKitDialog(): void {
    const dialogRef = this.dialog.open(NewKitDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      panelClass: 'new-kit-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  calculateKitTotal(kit: Kit): number {
    return kit.products.reduce((sum, product) => sum + product.quantity, 0);
  }

  trackByProductId(_: number, p: ProductRow) { return p.id; }

  openProductInfo(p: ProductRow) {
    const data: ProductInfoData = {
      title: p.name,
      category: p.categoryName,
      currentStock: p.currentStock,
      minStock: p.minStock,
      unitPrice: p.unitPrice,
      lastReception: p.lastReception,
      lot: p.lot,
      provider: p.providerName,
      expirationDate: p.expirationDate
    };

    this.dialog.open(ProductInfoDialogComponent, {
      width: '520px',
      maxWidth: '90vw',
      panelClass: 'product-info-dialog',
      data
    });
  }

  openNewCategoryDialog(): void {
    const dialogRef = this.dialog.open(NewCategoryDialogComponent, {
      width: '520px',
      maxWidth: '90vw',
      panelClass: 'new-category-dialog',
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        // Categories are already refreshed in the store when created
      }
    });
  }

  openNewProductDialog(): void {
    const dialogRef = this.dialog.open(NewProductDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      panelClass: 'new-product-dialog',
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) console.log('Producto creado exitosamente');
    });
  }

  editProduct(product: ProductRow): void {
    // TODO: Implementar edición de producto
    console.log('Editar producto:', product);
  }

  deleteProduct(product: ProductRow): void {
    // TODO: Implementar eliminación de producto con confirmación
    if (confirm(this.t('inventory.confirmDelete').replace('{name}', product.name))) {
      console.log('Eliminar producto:', product);
    }
  }
}

