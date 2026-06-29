import { BaseEntity } from '../../shared/infrastructure/base-entity';

/**
 * Represents a User entity in the personal administration context.
 * @remarks
 * This class encapsulates user information from the backend.
 * Backend returns: { id, email, roles[], permissions[] }
 */
export class User implements BaseEntity {
  /**
   * Creates a new User instance.
   * @param user - An object containing the user properties.
   * @returns A new instance of User.
   */
  constructor(user: {
    id: string;
    email: string;
    roles: string[];
    permissions?: string[];
  }) {
    this._id = user.id;
    this._email = user.email;
    this._roles = user.roles;
    this._permissions = user.permissions || [];
  }

  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  private _email: string;
  get email(): string {
    return this._email;
  }
  set email(value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email format');
    }
    this._email = value.toLowerCase().trim();
  }

  private _roles: string[];
  get roles(): string[] {
    return this._roles;
  }
  set roles(value: string[]) {
    this._roles = value;
  }

  private _permissions: string[];
  get permissions(): string[] {
    return this._permissions;
  }
  set permissions(value: string[]) {
    this._permissions = value;
  }

  /**
   * Gets display name derived from email.
   * @returns The part before @ in the email.
   */
  get displayName(): string {
    return this._email.split('@')[0];
  }

  /**
   * Gets the primary role (first role in array).
   * @returns The primary role.
   */
  get primaryRole(): string {
    return this._roles[0] || UserRole.USER;
  }

  /**
   * Gets the display name for the role in Spanish.
   * @returns Role display name.
   */
  get roleDisplayName(): string {
    if (this.hasRole(UserRole.ADMIN)) {
      return 'Administrador';
    }
    return 'Usuario';
  }

  /**
   * Checks if the user has a specific permission.
   * @param permission - The permission to check.
   * @returns True if the user has the permission.
   */
  hasPermission(permission: string): boolean {
    return this._permissions.includes(permission);
  }

  /**
   * Checks if the user has any of the specified permissions.
   * @param requiredPermissions - List of permissions to check.
   * @returns True if the user has at least one permission.
   */
  hasAnyPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.some(perm => this.hasPermission(perm));
  }

  /**
   * Checks if the user has a specific role.
   * @param role - The role to check.
   * @returns True if the user has the role.
   */
  hasRole(role: string): boolean {
    return this._roles.includes(role);
  }

  /**
   * Checks if the user has admin privileges.
   * @returns True if the user has ROLE_ADMIN.
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Validates email format.
   * @param email - The email to validate.
   * @returns True if valid, false otherwise.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Constants for user roles.
 * Matches backend Roles enum.
 */
export const UserRole = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

/**
 * Available permissions for module access control.
 */
export const Permission = {
  DASHBOARD_ACCESS: 'dashboard_access',
  INVENTORY_ACCESS: 'inventory_access',
  SALES_ACCESS: 'sales_access',
  PROVIDERS_ACCESS: 'providers_access',
  REPORTS_ACCESS: 'reports_access',
  USER_MANAGEMENT_ACCESS: 'user_management_access'
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];
