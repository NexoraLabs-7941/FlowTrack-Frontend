import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtTokenService } from './jwt-token';

/**
 * HTTP Interceptor for adding JWT token to protected backend requests.
 * It skips the real authentication endpoints so sign-in/sign-up do not send stale tokens.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(JwtTokenService);
  const token = tokenService.getToken();

  const isAuthRequest =
    req.url.includes('/authentication/sign-in') ||
    req.url.includes('/authentication/sign-up') ||
    req.url.includes('/login') ||
    req.url.includes('/register');

  if (isAuthRequest) {
    return next(req);
  }

  if (token && !tokenService.isTokenExpired()) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
