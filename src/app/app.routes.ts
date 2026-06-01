import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { DashboardComponent } from './dashboard/presentation/views/dashboard/dashboard';
import { InventoryListComponent } from './inventory/presentation/inventory-list/inventory-list';
import { PersonalAdministrationComponent } from './personal-administration/presentation/personal-administration/personal-administration';
import { ProviderComponent } from './shared/presentation/views/provider/provider';
import { SalesComponent } from './shared/presentation/views/sales/sales';
import { NotFound } from './shared/presentation/views/not-found/not-found';
import { ReportsComponent } from './reports/presentation/views/reports/reports';
import { SettingsComponent } from './settings/presentation/views/settings/settings';
import { YoloComponent } from './yolo/presentation/yolo';
import { authGuard } from './auth/infrastructure/auth-guard';
import { permissionGuard } from './auth/infrastructure/permission-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/presentation/views/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '404',
    component: NotFound
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['dashboard_access'] }
      },
      {
        path: 'inventory',
        component: InventoryListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['inventory_access'] }
      },
      {
        path: 'inventario',
        component: InventoryListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['inventory_access'] }
      },
      {
        path: 'reportes',
        component: ReportsComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['reports_access'] }
      },
      {
        path: 'configuracion',
        component: SettingsComponent
      },
      {
        path: 'proveedores',
        component: ProviderComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['providers_access'] }
      },
      {
        path: 'venta',
        component: SalesComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['sales_access'] }
      },
      {
        path: 'perfil',
        component: PersonalAdministrationComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['user_management_access'] }
      },
      {
        path: 'yolo',
        component: YoloComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full'
  }
];
