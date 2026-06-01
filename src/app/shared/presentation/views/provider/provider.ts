import {Component} from '@angular/core';
import {ProvidersTable} from '../../../../providers-management/presentation/components/providers-table/providers-table';
import {
  ProvidersToolbar
} from '../../../../providers-management/presentation/components/providers-toolbar/providers-toolbar';

@Component({
  selector: 'app-provider',
  imports: [
    ProvidersTable,
    ProvidersToolbar
  ],
  templateUrl: './provider.html',
  styleUrl: './provider.css'
})
export class ProviderComponent {

}
