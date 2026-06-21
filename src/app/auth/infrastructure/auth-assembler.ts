import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/model/user.entity';
import { UserResource, SignInResponse, SignUpResponse } from './auth-response';

/**
 * Assembler for transforming between User entities and UserResource DTOs.
 * @remarks
 * This class handles the conversion between domain entities and API resources.
 */
export class AuthAssembler implements BaseAssembler<User, UserResource, SignInResponse> {
  /**
   * Converts a UserResource DTO to a User entity.
   * @param resource - The user resource from the API.
   * @returns A User entity instance.
   */
  toEntityFromResource(resource: UserResource): User {
    return new User({
      id: String(resource.id),
      email: resource.email,
      roles: resource.roles,
      permissions: resource.permissions,
      token: resource.token
    });
  }

  /**
   * Converts a User entity to a UserResource DTO.
   * @param entity - The user entity.
   * @returns A UserResource DTO.
   */
  toResourceFromEntity(entity: User): UserResource {
    return {
      id: Number(entity.id),
      email: entity.email,
      roles: entity.roles,
      permissions: entity.permissions,
      token: entity.token
    };
  }

  /**
   * Converts multiple UserResource DTOs to User entities.
   * @param resources - Array of user resources from the API.
   * @returns Array of User entity instances.
   */
  toEntitiesFromResources(resources: UserResource[]): User[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts multiple User entities to UserResource DTOs.
   * @param entities - Array of user entities.
   * @returns Array of UserResource DTOs.
   */
  toResourcesFromEntities(entities: User[]): UserResource[] {
    return entities.map(entity => this.toResourceFromEntity(entity));
  }

  /**
   * Converts a sign-in response to User entity.
   * @param response - The sign-in response.
   * @returns User entity instance.
   */
  toEntityFromSignInResponse(response: SignInResponse): User {
    return new User({
      id: String(response.id),
      email: response.email,
      token: response.token
    });
  }

  /**
   * Converts a sign-up response to User entity.
   * @param response - The sign-up response.
   * @returns User entity instance.
   */
  toEntityFromSignUpResponse(response: SignUpResponse): User {
    return new User({
      id: String(response.id),
      email: response.email,
      token: response.token
    });
  }

  /**
   * Converts a response with multiple resources to User entities.
   * @param response - The response containing user resources.
   * @returns Array of User entity instances.
   */
  toEntitiesFromResponse(response: SignInResponse): User[] {
    return [this.toEntityFromSignInResponse(response)];
  }
}

