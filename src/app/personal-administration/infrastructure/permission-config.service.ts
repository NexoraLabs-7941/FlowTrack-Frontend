import { Injectable } from '@angular/core';
import { PermissionResource, PermissionWithMetadata } from './permission-response';

/**
 * Service that provides permission UI configuration and mapping.
 * Centralizes permission metadata (icons, colors, i18n keys) for UI display.
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionConfigService {
  
  /**
   * Permission UI metadata configuration.
   * Maps permission names to their display properties.
   */
  private readonly permissionMetadata: Record<string, Omit<PermissionWithMetadata, 'value' | 'description'>> = {
    'dashboard_access': {
      i18nKey: 'personalAdministration.permissionDashboard',
      icon: 'dashboard',
      color: '#3b82f6'
    },
    'inventory_access': {
      i18nKey: 'personalAdministration.permissionInventory',
      icon: 'inventory_2',
      color: '#10b981'
    },
    'sales_access': {
      i18nKey: 'personalAdministration.permissionSales',
      icon: 'point_of_sale',
      color: '#f59e0b'
    },
    'providers_access': {
      i18nKey: 'personalAdministration.permissionProviders',
      icon: 'local_shipping',
      color: '#8b5cf6'
    },
    'reports_access': {
      i18nKey: 'personalAdministration.permissionReports',
      icon: 'assessment',
      color: '#ef4444'
    },
    'user_management_access': {
      i18nKey: 'personalAdministration.permissionUserManagement',
      icon: 'people',
      color: '#06b6d4'
    }
  };

  /**
   * Enriches backend permissions with UI metadata.
   * Filters out permissions that don't have UI configuration.
   * 
   * @param permissions Permissions from backend
   * @returns Permissions enriched with UI metadata, sorted alphabetically
   */
  enrichPermissionsWithMetadata(permissions: PermissionResource[]): PermissionWithMetadata[] {
    return permissions
      .map(permission => {
        const metadata = this.permissionMetadata[permission.name];
        if (!metadata) {
          console.warn(`No UI metadata found for permission: ${permission.name}`);
          return null;
        }
        return {
          value: permission.name,
          description: permission.description,
          ...metadata
        } as PermissionWithMetadata;
      })
      .filter((perm): perm is PermissionWithMetadata => perm !== null)
      .sort((a, b) => a.value.localeCompare(b.value));
  }

  /**
   * Gets UI metadata for a specific permission name.
   * 
   * @param permissionName The permission name
   * @returns UI metadata or null if not found
   */
  getPermissionMetadata(permissionName: string): Omit<PermissionWithMetadata, 'value' | 'description'> | null {
    return this.permissionMetadata[permissionName] || null;
  }
}

