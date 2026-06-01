/**
 * Permission resource from backend
 */
export interface PermissionResource {
  id: number;
  name: string;
  description: string;
}

/**
 * Permission with UI metadata for frontend display
 */
export interface PermissionWithMetadata {
  value: string;
  i18nKey: string;
  icon: string;
  color: string;
  description?: string;
}

