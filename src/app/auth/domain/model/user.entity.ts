import {BaseEntity} from '../../../shared/infrastructure/base-entity';

/**
 * Represents a User entity in the application.
 * @remarks
 * This class is used as a domain model for authenticated users.
 * It implements the BaseEntity interface to ensure consistency across entities.
 * @see {@link BaseEntity}
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
    roles?: string[];
    permissions?: string[];
    token?: string;
  }) {
    this._id = user.id;
    this._email = user.email;
    this._roles = user.roles || ['ROLE_ADMIN'];
    this._permissions = user.permissions || [];
    this._token = user.token;
  }

  /**
   * The unique identifier for the user.
   */
  private _id: string;
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  /**
   * The email of the user.
   */
  private _email: string;
  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  /**
   * The roles of the user in the system.
   */
  private _roles: string[];
  get roles(): string[] {
    return this._roles;
  }

  set roles(value: string[]) {
    this._roles = value;
  }

  /**
   * The permissions of the user in the system.
   */
  private _permissions: string[];
  get permissions(): string[] {
    return this._permissions;
  }

  set permissions(value: string[]) {
    this._permissions = value;
  }

  /**
   * Check if user has a specific permission.
   * @param permission - The permission to check.
   * @returns True if user has the permission.
   */
  hasPermission(permission: string): boolean {
    return this._permissions.includes(permission);
  }

  /**
   * Check if user has a specific role.
   * @param role - The role to check.
   * @returns True if user has the role.
   */
  hasRole(role: string): boolean {
    return this._roles.includes(role);
  }

  /**
   * Check if user is an admin.
   * @returns True if user has ROLE_ADMIN.
   */
  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  /**
   * Get display name derived from email.
   * @returns The part of email before @.
   */
  get displayName(): string {
    if (!this._email) {
      return 'Usuario';
    }
    return this._email.split('@')[0];
  }

  /**
   * The authentication token for the user.
   */
  private _token?: string;
  get token(): string | undefined {
    return this._token;
  }

  set token(value: string | undefined) {
    this._token = value;
  }
}
