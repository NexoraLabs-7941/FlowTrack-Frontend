import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../domain/user.model';
import { UserApiEndpoint } from './user-api-endpoint';
import { CreateUserRequest, UpdateUserRequest } from './user-response';

/**
 * API service for user operations.
 * @remarks
 * This service orchestrates user-related API calls.
 * Users can be created via /api/v1/users (staff management) with specific roles.
 */
@Injectable({
  providedIn: 'root'
})
export class UserApi {
  constructor(private endpoint: UserApiEndpoint) {}

  /**
   * Gets all users.
   * @returns Observable of User entities.
   */
  getAllUsers(): Observable<User[]> {
    return this.endpoint.getAllUsers();
  }

  /**
   * Gets a user by ID.
   * @param id - The user ID.
   * @returns Observable of User entity.
   */
  getUserById(id: string): Observable<User> {
    return this.endpoint.getUserById(id);
  }

  /**
   * Creates a new user (from staff management).
   * Returns user with token for auto-login.
   * @param data - The user data with email, password and roles.
   * @returns Observable of created User entity with token.
   */
  createUser(data: CreateUserRequest): Observable<{ user: User; token: string }> {
    return this.endpoint.createUser(data);
  }

  /**
   * Updates a user (from staff management).
   * @param id - The user ID to update.
   * @param data - The user data with email, password (optional) and permissions.
   * @returns Observable of updated User entity.
   */
  updateUser(id: string, data: UpdateUserRequest): Observable<User> {
    return this.endpoint.updateUser(id, data);
  }

  /**
   * Deletes a user.
   * @param id - The user ID.
   * @returns Observable of boolean indicating success.
   */
  deleteUser(id: string): Observable<boolean> {
    return this.endpoint.deleteUser(id);
  }
}
