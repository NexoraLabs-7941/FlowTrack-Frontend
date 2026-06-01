import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { JwtTokenService } from './jwt-token';
import { AuthStore } from '../application/auth.store';

/**
 * Guard for protecting routes that require authentication.
 * @remarks
 * This guard checks if the user has a valid JWT token and is authenticated in the store.
 * If the user is not authenticated, they are redirected to the login page with a returnUrl parameter.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const tokenService = inject(JwtTokenService);
  const router = inject(Router);
  const authStore = inject(AuthStore);

  await authStore.waitForInitialization();

  if (tokenService.hasToken() && !tokenService.isTokenExpired() && authStore.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
