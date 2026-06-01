import {Component, inject, computed, ViewChild, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DashboardStore } from '../../../application/dashboard.store';
import { AuthStore } from '../../../../auth/application/auth.store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardNotification } from '../../../domain/model/notification.entity';

/**
 * Dashboard component displaying statistics and charts.
 * @remarks
 * This component shows the main dashboard with KPIs and visualizations.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    BaseChartDirective,
    TranslateModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  protected readonly dashboardStore = inject(DashboardStore);
  protected readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  protected expandedNotification: number | null = null;
  protected expandedSidebarNotification: number | null = null;

  private readonly authInitialized = signal(false);

  readonly currentUserName = computed(() => {
    if (!this.authInitialized()) return 'Cargando...';
    return this.authStore.currentUserName();
  });

  async ngOnInit() {
    await this.authStore.waitForInitialization();
    this.authInitialized.set(true);
  }
  public barChartType: ChartType = 'bar';
  public barChartData = computed<ChartData<'bar'>>(() => {
    const data = this.dashboardStore.monthlyIncome();
    return {
      labels: data.map(d => d.month),
      datasets: [{
        data: data.map(d => d.amount),
        backgroundColor: '#F97316',
        borderRadius: 8,
        barThickness: 30
      }]
    };
  });

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const data = this.dashboardStore.productSales();
    return {
      labels: data.map(d => d.productName),
      datasets: [{
        data: data.map(d => d.percentage),
        backgroundColor: ['#FCD34D', '#F97316', '#FBBF24'],
        borderWidth: 0
      }]
    };
  });

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  /**
   * Toggles the expanded state of a notification in the dropdown.
   * @param index - The index of the notification to toggle.
   */
  protected toggleNotification(index: number): void {
    this.expandedNotification = this.expandedNotification === index ? null : index;
  }

  /**
   * Toggles the expanded state of a notification in the sidebar.
   * @param index - The index of the notification to toggle.
   */
  protected toggleSidebarNotification(index: number): void {
    this.expandedSidebarNotification = this.expandedSidebarNotification === index ? null : index;
  }

  /**
   * Gets the translated message for a notification.
   * @param notification - The notification entity.
   * @returns The translated message with interpolated values.
   */
  protected getNotificationMessage(notification: DashboardNotification): string {
    return this.translate.instant(`dashboard.notificationMessages.${notification.title}`, notification.data);
  }

  /**
   * Gets the color for a product in the chart legend.
   * @param productName - The name of the product.
   * @param index - The index of the product in the array.
   * @returns The color hex code for the product.
   */
  protected getProductColor(productName: string, index: number): string {
    const colors = ['#FCD34D', '#F97316', '#FBBF24', '#F59E0B', '#D97706', '#B45309'];
    return colors[index % colors.length];
  }
}
