import { Component } from '@angular/core';
import {SalesTables} from '../../../../sales/presentation/components/sales-tables/sales-tables';

@Component({
  selector: 'app-sales',
  imports: [
    SalesTables
  ],
  templateUrl: './sales.html',
  styleUrl: './sales.css'
})
export class SalesComponent {

}
