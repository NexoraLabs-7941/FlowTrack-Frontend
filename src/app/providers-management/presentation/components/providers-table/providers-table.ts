import {Component, inject} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {TranslatePipe} from '@ngx-translate/core';
import {ProvidersApi} from '../../../infrastructure/providers-api';
import {Provider} from '../../../../inventory/domain/model/provider.entity';
import {MatIconModule} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {ProviderFormDialog} from '../provider-form-dialog/provider-form-dialog';
import {ProvidersStore} from '../../../application/providers.store';

@Component({
  selector: 'app-providers-table',
  imports: [
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    TranslatePipe,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatIconModule,
    MatIconButton
  ],
  templateUrl: './providers-table.html',
  styleUrl: './providers-table.css'
})
export class ProvidersTable {
  protected readonly store = inject(ProvidersStore);
  private readonly providersApi = inject(ProvidersApi);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['firstName', 'phoneNumber', 'email', 'ruc', 'actions'];

  onEdit(p: Provider) {
    const ref = this.dialog.open(ProviderFormDialog, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'provider-form-dialog',
      data: p,
      disableClose: true
    });

    ref.afterClosed().subscribe((updated?: Provider) => {
      if (!updated) return;
      this.store.updateProvider(updated);
    });
  }

  onDelete(provider: Provider) {
    if (confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      this.providersApi.deleteProvider(+(provider.id)).subscribe(() => {
        this.store.removeProvider(provider.id);
      });
    }
  }

}

