import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';
import { DashboardStore } from '../../../../dashboard/application/dashboard.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    TranslateModule
  ],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css']
})
export class TopbarComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  protected dashboardStore = inject(DashboardStore);

  pageTitle = '';

  constructor() {
    this.updatePageTitle();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route)
      )
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    if (url.includes('/dashboard')) {
      this.pageTitle = 'dashboard.title';
    } else if (url.includes('/inventario')) {
      this.pageTitle = 'inventory.header';
    } else if (url.includes('/proveedores')) {
      this.pageTitle = 'providers-view.providers';
    } else if (url.includes('/venta')) {
      this.pageTitle = 'sales.title';
    } else if (url.includes('/reportes')) {
      this.pageTitle = 'reports.title';
    } else if (url.includes('/yolo')) {
      this.pageTitle = 'yolo.title';
    } else if (url.includes('/configuracion')) {
      this.pageTitle = 'settings.title';
    } else if (url.includes('/perfil')) {
      this.pageTitle = 'personal.title';
    } else {
      this.pageTitle = 'app.title';
    }
  }

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  getNotificationCount(): number {
    return this.dashboardStore.notifications().length;
  }

  getNotifications() {
    return this.dashboardStore.notifications();
  }

  getNotificationMessage(notification: any): string {
    return this.translate.instant(`dashboard.notificationMessages.${notification.title}`, notification.data);
  }
}

