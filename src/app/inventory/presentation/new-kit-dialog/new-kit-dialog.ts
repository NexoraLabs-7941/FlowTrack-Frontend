import { Component, inject, OnInit } from '@angular/core';
import { Kit, KitProduct } from '../../domain/model/kit.entity';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryStore } from '../../application/inventory.store';
interface NewKitItem {
  productId: string;
  name: string;
  currentStock: number;
  quantity: number;
  price: number;
  selected: boolean;
}

@Component({
  selector: 'app-new-kit-dialog',
    templateUrl: './new-kit-dialog.html',
  styleUrl: './new-kit-dialog.css',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ]
})

export class NewKitDialogComponent implements OnInit {
  protected readonly store = inject(InventoryStore);
  private dialogRef = inject(MatDialogRef<NewKitDialogComponent>);

  nombre: string = '';
  items: NewKitItem[] = [];
  saving: boolean = false;

  get loading(): boolean {
    return this.store.loading();
  }

  get error(): string | null {
    return this.store.error();
  }

  loadProductsWithStock(): void {
    const stockMap = new Map(this.store.stock().map(s => [s.productId, s.currentStock]));

    this.items = this.store.products()
      .filter(p => p.isActive === true)
      .map(product => {
        const currentStock = stockMap.get(product.id) || 0;
        return {
          productId: product.id,
          name: product.name,
          currentStock: currentStock,
          quantity: 0,
          price: 0,
          selected: false
        };
      });
  }

  ngOnInit(): void {
    this.loadProductsWithStock();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.nombre.trim()) {
      return;
    }

    const itemsToSave = this.items.filter(item => item.selected && item.quantity > 0 && item.price > 0);
    if (itemsToSave.length === 0) {
      return;
    }

    const kitProducts: KitProduct[] = itemsToSave.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const newKit = new Kit({
      id: '',
      name: this.nombre,
      price: 0, // Backend calculates totalPrice from items
      products: kitProducts
    });

    // El store se encarga de crear el kit
    this.store.addKit(newKit);
    this.dialogRef.close(newKit);
  }

  toggleSelection(item: NewKitItem): void {
    item.selected = !item.selected;
    if (!item.selected) {
      item.quantity = 0;
      item.price = 0;
    }
  }

  incrementQuantity(item: NewKitItem): void {
    if (!item.selected) {
      item.selected = true;
    }
    item.quantity++;
  }

  decrementQuantity(item: NewKitItem): void {
    if (item.quantity > 0) {
      item.quantity--;
      if (item.quantity === 0) {
        item.selected = false;
      }
    }
  }

}

