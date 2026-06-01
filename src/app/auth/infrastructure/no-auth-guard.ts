import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { JwtTokenService } from './jwt-token';
import { AuthStore } from '../application/auth.store';

/**
 * Guard for preventing authenticated users from accessing auth pages (login, register).
 * @remarks
 * This guard redirects authenticated users to the dashboard if they try to access login or register pages.
 * It ensures that users who are already logged in cannot return to authentication pages.
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(JwtTokenService);
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (tokenService.hasToken() && !tokenService.isTokenExpired() && authStore.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
