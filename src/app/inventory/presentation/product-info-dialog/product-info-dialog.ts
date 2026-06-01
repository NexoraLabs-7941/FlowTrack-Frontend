import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';

export interface ProductInfoData {
  title: string;
  category?: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  lastReception?: string;   // 'YYYY-MM-DD'
  lot?: string;
  provider?: string;
  expirationDate?: string;  // 'YYYY-MM-DD'
}

@Component({
  selector: 'app-product-info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslatePipe],
  templateUrl: './product-info-dialog.html',
  styleUrls: ['./product-info-dialog.css'],
})
export class ProductInfoDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductInfoData) {}
}
