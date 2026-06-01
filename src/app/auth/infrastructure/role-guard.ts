import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { JwtTokenService } from './jwt-token';
import { AuthStore } from '../application/auth.store';

/**
 * Guard for protecting routes based on user roles.
 * @remarks
 * This guard checks if the user has any of the required roles to access the route.
 * If the user is not authenticated, they are redirected to the login page.
 * If the user doesn't have any of the required roles, they are redirected to the dashboard.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(JwtTokenService);
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (!tokenService.hasToken() || tokenService.isTokenExpired()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const requiredRoles = route.data['roles'] as string[];
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  if (authStore.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required role, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};
