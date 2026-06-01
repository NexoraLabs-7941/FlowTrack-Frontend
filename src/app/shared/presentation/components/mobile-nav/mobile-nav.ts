import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStore } from '../../../../auth/application/auth.store';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

interface NavItem {
  titleKey: string;
  icon: string;
  route: string;
  ariaLabelKey: string;
}

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    LanguageSwitcher
  ],
  templateUrl: './mobile-nav.html',
  styleUrls: ['./mobile-nav.css']
})
export class MobileNavComponent {
  private translate = inject(TranslateService);
  protected authStore = inject(AuthStore);

  mainNavItems: NavItem[] = [
    {
      titleKey: 'sidebar.menu.home',
      icon: 'home',
      route: '/dashboard',
      ariaLabelKey: 'sidebar.menu.aria.home',
    },
    {
      titleKey: 'sidebar.menu.inventory',
      icon: 'inventory_2',
      route: '/inventario',
      ariaLabelKey: 'sidebar.menu.aria.inventory',
    },
    {
      titleKey: 'sidebar.menu.providers',
      icon: 'people',
      route: '/proveedores',
      ariaLabelKey: 'sidebar.menu.aria.providers',
    },
    {
      titleKey: 'sidebar.menu.sales',
      icon: 'shopping_cart',
      route: '/venta',
      ariaLabelKey: 'sidebar.menu.aria.sales',
    },
  ];

  additionalMenuItems: NavItem[] = [
    {
      titleKey: 'sidebar.menu.reports',
      icon: 'description',
      route: '/reportes',
      ariaLabelKey: 'sidebar.menu.aria.reports',
    },
    {
      titleKey: 'sidebar.menu.yolo',
      icon: 'photo_camera',
      route: '/yolo',
      ariaLabelKey: 'sidebar.menu.aria.yolo',
    },
  ];

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  logout(): void {
    this.authStore.logout();
  }
}

