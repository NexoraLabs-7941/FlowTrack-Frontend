import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, UserRole } from '../domain/user.model';
import { UserApi } from '../infrastructure/user-api';
import { CreateUserRequest, UpdateUserRequest } from '../infrastructure/user-response';

/**
 * Store for managing user state and operations.
 * @remarks
 * This service orchestrates user use cases and manages user state.
 * Users can be created via staff management with specific roles.
 */
@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private readonly usersSignal = signal<User[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly users = this.usersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly hasUsers = computed(() => this.users().length > 0);
  readonly adminUsers = computed(() => this.users().filter(user => user.isAdmin()));
  readonly regularUsers = computed(() => this.users().filter(user => user.hasRole(UserRole.USER)));

  constructor(private userApi: UserApi) {
    this.loadUsers();
  }

  /**
   * Loads all users from the backend.
   */
  loadUsers(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.userApi.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.usersSignal.set(users);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error loading users'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new user (from staff management).
   * User is automatically authenticated and receives a token.
   * Users created by admin always get ROLE_USER.
   * @param email - The user's email.
   * @param password - The user's password.
   * @param permissions - The permissions to assign for module access.
   */
  createUser(email: string, password: string, permissions: string[]): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: CreateUserRequest = { email, password, permissions };

    this.userApi.createUser(request).subscribe({
      next: (result) => {
        // User created successfully with token (auto-login ready)
        // Refresh the list to get full user data with roles
        this.loadUsers();
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error creating user'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates a user (from staff management).
   * @param id - The user ID to update.
   * @param email - The new email (optional).
   * @param password - The new password (optional, only if changing).
   * @param permissions - The new permissions (optional).
   */
  updateUser(id: string, email?: string, password?: string, permissions?: string[]): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: UpdateUserRequest = {};
    if (email) request.email = email;
    if (password) request.password = password;
    if (permissions) request.permissions = permissions;

    this.userApi.updateUser(id, request).subscribe({
      next: (user: User) => {
        const currentUsers = this.users();
        const updatedUsers = currentUsers.map(u => u.id === id ? user : u);
        this.usersSignal.set(updatedUsers);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error updating user'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a user.
   * @param id - The user ID to delete.
   */
  deleteUser(id: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.userApi.deleteUser(id).subscribe({
      next: (success: boolean) => {
        if (success) {
          const currentUsers = this.users();
          const filteredUsers = currentUsers.filter(u => u.id !== id);
          this.usersSignal.set(filteredUsers);
        }
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error deleting user'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Refreshes user data.
   */
  refresh(): void {
    this.loadUsers();
  }

  /**
   * Formats error messages for better user experience.
   * @param error - The error object.
   * @param fallback - The fallback message if error is not an Error instance.
   * @returns A formatted error message.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
