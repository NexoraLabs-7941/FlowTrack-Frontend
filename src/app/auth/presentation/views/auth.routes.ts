import { Routes } from '@angular/router';
import { noAuthGuard } from '../../infrastructure/no-auth-guard';

/**
 * Lazy-loaded login component.
 */
const loginComponent = () =>
  import('./login/login').then(m => m.LoginComponent);

/**
 * Lazy-loaded register component.
 */
const registerComponent = () =>
  import('./register/register').then(m => m.RegisterComponent);

/**
 * Authentication routes configuration.
 * @remarks
 * These routes handle user authentication flows including login and registration.
 * Protected by noAuthGuard to prevent authenticated users from accessing these pages.
 */
export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: loginComponent,
    canActivate: [noAuthGuard],
    title: 'Login - FlowTrack'
  },
  {
    path: 'register',
    loadComponent: registerComponent,
    canActivate: [noAuthGuard],
    title: 'Register - FlowTrack'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/404',
    pathMatch: 'full'
  }
];

