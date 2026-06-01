import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { JwtTokenService } from './jwt-token';
import { AuthStore } from '../application/auth.store';

/**
 * Permission to route mapping for fallback navigation.
 * Maps each permission to its corresponding route path.
 * Order matters: routes are checked in this order for fallback navigation.
 */
const PERMISSION_ROUTE_MAP: ReadonlyArray<{ permission: string; route: string }> = [
  { permission: 'dashboard_access', route: '/dashboard' },
  { permission: 'inventory_access', route: '/inventario' },
  { permission: 'sales_access', route: '/venta' },
  { permission: 'providers_access', route: '/proveedores' },
  { permission: 'reports_access', route: '/reportes' }
] as const;

const DEFAULT_FALLBACK_ROUTE = '/configuracion';

/**
 * Guard for protecting routes based on user permissions.
 * @remarks
 * This guard checks if the user has the required permissions to access the route.
 * ROLE_ADMIN has access to everything (bypass permissions).
 * ROLE_USER needs specific permissions.
 * If the user is not authenticated, they are redirected to the login page.
 * If the user doesn't have the required permissions, they are redirected to the first available module or settings.
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(JwtTokenService);
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (!tokenService.hasToken() || tokenService.isTokenExpired()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const requiredPermissions = route.data['permissions'] as string[];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  if (authStore.hasAnyPermission(requiredPermissions)) {
    return true;
  }

  const fallbackRoute = findFirstAvailableRoute(authStore);
  router.navigate([fallbackRoute]);
  return false;
};

/**
 * Finds the first available route based on user permissions.
 * Uses the permission-route mapping to determine the best fallback route.
 * 
 * @param authStore The authentication store
 * @returns The route path to redirect to
 */
function findFirstAvailableRoute(authStore: AuthStore): string {
  const availableRoute = PERMISSION_ROUTE_MAP.find(
    ({ permission }) => authStore.hasPermission(permission)
  );
  
  return availableRoute?.route ?? DEFAULT_FALLBACK_ROUTE;
}

