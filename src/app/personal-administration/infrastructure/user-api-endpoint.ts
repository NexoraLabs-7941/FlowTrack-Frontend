import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../domain/user.model';
import { UserResource, UserListResponse, CreateUserRequest, UpdateUserRequest, AuthenticatedUserResource } from './user-response';
import { UserAssembler } from './user-assembler';
import { environment } from '../../../environments/environment';

/**
 * API endpoint definitions for user operations.
 * @remarks
 * This service defines the specific API endpoints for user management operations.
 * Backend returns: UserResource { id, email, roles[] } directly without wrapper.
 */
@Injectable({
  providedIn: 'root'
})
export class UserApiEndpoint {
  private readonly baseUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;

  constructor(private http: HttpClient, private assembler: UserAssembler) {}

  /**
   * Gets all users.
   * Backend returns array of UserResource directly.
   * @returns Observable of User entities.
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<UserListResponse>(this.baseUrl).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Gets a user by ID.
   * Backend returns UserResource directly.
   * @param id - The user ID.
   * @returns Observable of User entity.
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<UserResource>(`${this.baseUrl}/${id}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource))
    );
  }

  /**
   * Creates a new user (from staff management).
   * Backend returns AuthenticatedUserResource with token (auto-login).
   * @param data - The user data with email, password and roles.
   * @returns Observable of created User entity with token.
   */
  createUser(data: CreateUserRequest): Observable<{ user: User; token: string }> {
    return this.http.post<AuthenticatedUserResource>(this.baseUrl, data).pipe(
      map(response => {
        const user = this.assembler.toEntityFromResource({
          id: response.id,
          email: response.email,
          roles: [], 
          permissions: []
        });
        return { user, token: response.token };
      })
    );
  }

  /**
   * Updates a user (from staff management).
   * @param id - The user ID to update.
   * @param data - The user data with email, password (optional) and permissions.
   * @returns Observable of updated User entity.
   */
  updateUser(id: string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<UserResource>(`${this.baseUrl}/${id}`, data).pipe(
      map(resource => this.assembler.toEntityFromResource(resource))
    );
  }

  /**
   * Deletes a user.
   * Backend returns 204 No Content on success.
   * @param id - The user ID.
   * @returns Observable of boolean indicating success.
   */
  deleteUser(id: string): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/${id}`, { observe: 'response' }).pipe(
      map(response => response.status === 204 || response.status === 200),
      catchError(() => of(false))
    );
  }
}
