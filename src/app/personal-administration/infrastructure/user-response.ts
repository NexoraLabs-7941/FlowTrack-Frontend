import { BaseResource } from '../../shared/infrastructure/base-response';

/**
 * DTOs for user API responses and resources.
 * @remarks
 * This file defines the data transfer objects for user-related API communications.
 * Backend returns users with: { id, email, roles[] }
 */

/**
 * Resource DTO for user data from backend.
 * Backend UserResource: { id: Long, email: String, roles: List<String>, permissions: List<String> }
 */
export interface UserResource extends BaseResource {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
}

/**
 * Response DTO for authenticated user (with token).
 * Used when creating a user (auto-login).
 */
export interface AuthenticatedUserResource {
  id: number;
  email: string;
  token: string;
}

/**
 * Response DTO for user API calls.
 * Backend returns the UserResource directly, no wrapper.
 */
export interface UserResponse extends UserResource {}

/**
 * Response DTO for user list API calls.
 * Backend returns array of UserResource directly.
 */
export type UserListResponse = UserResource[];

/**
 * Request DTO for creating a user from staff management.
 * Users created by admin always get ROLE_USER.
 * Permissions control access to specific modules.
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  permissions: string[];
}

/**
 * Request DTO for updating a user from staff management.
 * All fields are optional - only provided fields will be updated.
 */
export interface UpdateUserRequest {
  email?: string;
  password?: string;
  permissions?: string[];
}
