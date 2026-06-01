import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../domain/model/user.entity';
import { LoginCredentials } from '../domain/model/login-credentials';
import { RegisterData } from '../domain/model/register-data';
import { AuthApi } from '../infrastructure/auth-api';
import { JwtTokenService } from '../infrastructure/jwt-token';

/**
 * Store for managing authentication state and operations.
 * @remarks
 * This service orchestrates authentication use cases and manages auth state.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly initializedSignal = signal<boolean>(false);
  private initializationPromise: Promise<void> | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly currentUser = computed(() => this.user());
  readonly currentUserName = computed(() => this.user()?.displayName || 'Usuario');
  readonly currentUserRoles = computed(() => this.user()?.roles || []);
  readonly isAdmin = computed(() => this.user()?.isAdmin() || false);

  constructor(
    private authApi: AuthApi,
    private tokenService: JwtTokenService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initializes authentication state from stored token.
   * Reads user ID, email and roles from JWT, then fetches permissions from backend.
   */
  private initializeAuth(): void {
    this.initializationPromise = new Promise<void>((resolve) => {
      if (this.tokenService.hasToken() && !this.tokenService.isTokenExpired()) {
        const decoded = this.tokenService.decodeToken();
        if (decoded) {
          const userId = String(decoded.sub);
          const email = decoded.email || '';
          const roles = this.normalizeRoles(decoded);

          this.userSignal.set(new User({
            id: userId,
            email: email,
            roles: roles,
            permissions: [],
            token: this.tokenService.getToken() || undefined
          }));

          this.loadUserPermissions(userId).then(() => {
          });

          this.initializedSignal.set(true);
          resolve();
        } else {
          this.initializedSignal.set(true);
          resolve();
        }
      } else {
        this.initializedSignal.set(true);
        resolve();
      }
    });
  }

  /**
   * Loads user permissions from backend and updates the user signal
   * <p>
   *     This method fetches the complete user data from the backend to get the latest permissions.
   *     Permissions are not included in JWT as they change frequently.
   * </p>
   * @param userId The user ID
   * @returns Promise that resolves when permissions are loaded
   */
  private loadUserPermissions(userId: string): Promise<void> {
    return new Promise((resolve) => {
      this.authApi.getUserById(userId).subscribe({
        next: (userData) => {
          const currentUser = this.userSignal();
          if (currentUser) {
            this.userSignal.set(new User({
              id: currentUser.id,
              email: currentUser.email,
              roles: currentUser.roles,
              permissions: userData.permissions || [],
              token: currentUser.token
            }));
          }
          resolve();
        },
        error: (err) => {
          console.warn('Failed to load user permissions:', err);
          resolve();
        }
      });
    });
  }

  /**
   * Waits for the authentication store to be fully initialized.
   * @returns A promise that resolves when initialization is complete.
   */
  waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    return Promise.resolve();
  }

  /**
   * Authenticates a user with the provided credentials.
   * <p>
   *     This method handles the sign-in process, stores the JWT token, loads user permissions,
   *     and navigates to the specified return URL after successful authentication.
   * </p>
   * @param credentials The login credentials
   * @param returnUrl Optional URL to redirect to after successful login
   */
  login(credentials: LoginCredentials, returnUrl: string = '/dashboard'): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authApi.signIn(credentials).subscribe({
      next: async (response) => {
        this.tokenService.setToken(response.token);

        const decoded = this.tokenService.decodeToken();
        if (decoded) {
          const userId = String(decoded.sub || response.id);
          const email = decoded.email || response.email;
          const roles = this.normalizeRoles(decoded);

          this.userSignal.set(new User({
            id: userId,
            email: email,
            roles: roles,
            permissions: [],
            token: response.token
          }));

          await this.loadUserPermissions(userId);
        } else {
          this.userSignal.set(new User({
            id: String(response.id),
            email: response.email,
            roles: [],
            permissions: [],
            token: response.token
          }));
        }

        this.loadingSignal.set(false);
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error durante el inicio de sesión'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Registers a new user with the provided data.
   * <p>
   *     This method handles the sign-up process, validates passwords match, stores the JWT token,
   *     loads user permissions, and automatically logs in the user after successful registration.
   * </p>
   * @param data The registration data
   */
  register(data: RegisterData): void {
    if (!data.passwordsMatch()) {
      this.errorSignal.set('Las contraseñas no coinciden');
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authApi.signUp(data).subscribe({
      next: async (response) => {
        this.tokenService.setToken(response.token);

        const decoded = this.tokenService.decodeToken();
        if (decoded) {
          const userId = String(decoded.sub || response.id);
          const email = decoded.email || response.email;
          const roles = this.normalizeRoles(decoded);

          this.userSignal.set(new User({
            id: userId,
            email: email,
            roles: roles,
            permissions: [],
            token: response.token
          }));

          await this.loadUserPermissions(userId);
        } else {
          this.userSignal.set(new User({
            id: String(response.id),
            email: response.email,
            roles: ['ROLE_ADMIN'],
            permissions: [],
            token: response.token
          }));
        }

        this.loadingSignal.set(false);
        this.router.navigate(['/dashboard']).catch(err => {
          console.error('Navigation error:', err);
        });
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error durante el registro'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Logs out the current user (client-side only).
   */
  logout(): void {
    this.tokenService.removeToken();
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Checks if the current user has a specific role.
   * @param role - The role to check.
   * @returns True if the user has the role.
   */
  hasRole(role: string): boolean {
    return this.user()?.hasRole(role) || false;
  }

  /**
   * Checks if the current user has any of the specified roles.
   * @param roles - Array of roles to check.
   * @returns True if the user has at least one of the roles.
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.currentUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Checks if the current user has a specific permission.
   * ROLE_ADMIN has access to everything (bypass permissions).
   * @param permission - The permission to check.
   * @returns True if the user has the permission or is admin.
   */
  hasPermission(permission: string): boolean {
    const user = this.user();
    if (!user) return false;
    
    if (user.isAdmin()) {
      return true;
    }
    
    return user.hasPermission(permission);
  }

  /**
   * Checks if the current user has any of the specified permissions.
   * ROLE_ADMIN has access to everything (bypass permissions).
   * @param permissions - Array of permissions to check.
   * @returns True if the user has at least one of the permissions or is admin.
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.user();
    if (!user) return false;
    
    if (user.isAdmin()) {
      return true;
    }
    
    return permissions.some(permission => user.hasPermission(permission));
  }

  /**
   * Clears the current error.
   */
  clearError(): void {
    this.errorSignal.set(null);
  }


  /**
   * Normalizes role claims returned by Spring/JWT backends.
   */
  private normalizeRoles(decoded: any, fallbackRoles: string[] = ['ROLE_ADMIN']): string[] {
    const rolesClaim = decoded?.roles ?? decoded?.authorities ?? decoded?.role ?? decoded?.scope;

    if (Array.isArray(rolesClaim) && rolesClaim.length > 0) {
      return rolesClaim.map(role => String(role));
    }

    if (typeof rolesClaim === 'string' && rolesClaim.trim().length > 0) {
      return rolesClaim.split(' ').map(role => role.trim()).filter(Boolean);
    }

    return fallbackRoles;
  }

  /**
   * Formats error messages for better user experience.
   * @param error - The error object.
   * @param fallback - The fallback message if error is not an Error instance.
   * @returns A formatted error message.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return 'Credenciales inválidas';
      }
      if (error.message.includes('Resource not found')) {
        return `${fallback}: No encontrado`;
      }
      return error.message;
    }
    return fallback;
  }
}
