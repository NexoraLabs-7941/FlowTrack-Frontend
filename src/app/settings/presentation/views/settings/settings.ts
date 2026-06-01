import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { AuthStore } from '../../../../auth/application/auth.store';

/**
 * Settings/Configuration component.
 * Provides general application settings and preferences.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    TranslateModule,
    LanguageSwitcher
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  protected translate = inject(TranslateService);
  protected authStore = inject(AuthStore);

  protected currentUser = this.authStore.currentUser;

  ngOnInit(): void {
    // Component initialization
  }

  protected t(key: string): string {
    return this.translate.instant(key);
  }
}

