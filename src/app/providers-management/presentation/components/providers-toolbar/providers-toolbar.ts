import {Component, inject} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';

import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton, MatFabButton} from '@angular/material/button';
import {ProviderFormDialog} from '../provider-form-dialog/provider-form-dialog';
import {MatDialog} from '@angular/material/dialog';
import {Provider} from '../../../../inventory/domain/model/provider.entity';
import {ProvidersStore} from '../../../application/providers.store';

@Component({
  selector: 'app-providers-toolbar',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatIconModule,
    TranslatePipe,
    MatFabButton
  ],
  templateUrl: './providers-toolbar.html',
  styleUrl: './providers-toolbar.css'
})
export class ProvidersToolbar {
  protected readonly store = inject(ProvidersStore);
  private readonly dialog = inject(MatDialog);

  searchTerm = '';

  onCreate() {
    const ref = this.dialog.open(ProviderFormDialog, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'provider-form-dialog',
      disableClose: true,
      data: {}
    });

    ref.afterClosed().subscribe((created?: Provider) => {
      if (!created) return;
      this.store.addProvider(created);
    });
  }
}
