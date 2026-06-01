import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/user.model';
import { UserResource, UserListResponse } from './user-response';

/**
 * Assembler for transforming between User entities and UserResource DTOs.
 * @remarks
 * This service handles the conversion between domain entities and API resources.
 * Backend returns: { id, email, roles[] }
 */
@Injectable({
  providedIn: 'root'
})
export class UserAssembler implements BaseAssembler<User, UserResource, UserListResponse> {
  /**
   * Converts a UserResource to a User entity.
   * @param resource - The UserResource to convert.
   * @returns A User entity.
   */
  toEntityFromResource(resource: UserResource): User {
    return new User({
      id: String(resource.id || ''),
      email: resource.email,
      roles: resource.roles || ['ROLE_USER'],
      permissions: resource.permissions || []
    });
  }

  /**
   * Converts a User entity to a UserResource.
   * @param entity - The User entity to convert.
   * @returns A UserResource.
   */
  toResourceFromEntity(entity: User): UserResource {
    return {
      id: Number(entity.id) || 0,
      email: entity.email,
      roles: entity.roles,
      permissions: entity.permissions || []
    };
  }

  /**
   * Converts an array of UserResources to User entities.
   * @param resources - The UserResource array to convert.
   * @returns An array of User entities.
   */
  toEntitiesFromResources(resources: UserResource[]): User[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts an array of User entities to UserResources.
   * @param entities - The User array to convert.
   * @returns An array of UserResources.
   */
  toResourcesFromEntities(entities: User[]): UserResource[] {
    return entities.map(entity => this.toResourceFromEntity(entity));
  }

  /**
   * Converts API response (array) to User entities.
   * Backend returns array of UserResource directly.
   * @param response - The array response from API.
   * @returns An array of User entities.
   */
  toEntitiesFromResponse(response: UserListResponse): User[] {
    if (Array.isArray(response)) {
      return this.toEntitiesFromResources(response);
    }
    return [];
  }
}
