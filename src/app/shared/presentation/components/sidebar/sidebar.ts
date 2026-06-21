import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { AuthStore } from '../../../../auth/application/auth.store';

interface MenuItem {
  titleKey: string;
  icon: string;
  route: string;
  requiredPermission?: string; // If undefined, visible to all authenticated users
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LanguageSwitcher,
    TranslateModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
})
export class SidebarComponent {
  private translate = inject(TranslateService);
  protected authStore = inject(AuthStore);
  isExpanded = true;

  private allMenuItems: MenuItem[] = [
    {
      titleKey: 'sidebar.menu.home',
      icon: 'home',
      route: '/dashboard',
      requiredPermission: 'dashboard_access'
    },
    {
      titleKey: 'sidebar.menu.inventory',
      icon: 'inventory_2',
      route: '/inventario',
      requiredPermission: 'inventory_access'
    },
    {
      titleKey: 'sidebar.menu.providers',
      icon: 'people',
      route: '/proveedores',
      requiredPermission: 'providers_access'
    },
    {
      titleKey: 'sidebar.menu.sales',
      icon: 'shopping_cart',
      route: '/venta',
      requiredPermission: 'sales_access'
    },
    {
      titleKey: 'sidebar.menu.reports',
      icon: 'description',
      route: '/reportes',
      requiredPermission: 'reports_access'
    },
    {
      titleKey: 'sidebar.menu.yolo',
      icon: 'photo_camera',
      route: '/yolo'
    },
  ];

  /**
   * Computed property that filters menu items based on user permissions.
   * ROLE_ADMIN sees all items (has all permissions).
   * ROLE_USER sees only items for which they have permissions.
   */
  menuItems = computed(() => {
    return this.allMenuItems.filter(item => {
      // If no permission required, show to everyone
      if (!item.requiredPermission) {
        return true;
      }
      // Check if user has the required permission (or is admin)
      return this.authStore.hasPermission(item.requiredPermission);
    });
  });

  /**
   * Check if user can access personal administration.
   * ROLE_ADMIN has access, ROLE_USER needs user_management_access permission.
   */
  canAccessPersonalAdmin = computed(() => {
    return this.authStore.hasPermission('user_management_access');
  });

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  logout(): void {
    this.authStore.logout();
  }
}
