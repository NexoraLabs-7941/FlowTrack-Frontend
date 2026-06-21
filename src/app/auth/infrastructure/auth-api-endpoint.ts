import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { User } from '../domain/model/user.entity';
import { LoginCredentials } from '../domain/model/login-credentials';
import { RegisterData } from '../domain/model/register-data';
import { UserResource, SignInResponse, SignUpResponse } from './auth-response';
import { AuthAssembler } from './auth-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable, of, switchMap } from 'rxjs';

export class AuthApiEndpoint extends BaseApiEndpoint<User, UserResource, SignInResponse, AuthAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}`, new AuthAssembler());
  }

  /**
   * Authenticates a user against the deployed backend.
   * Uses the real backend endpoint: /authentication/sign-in.
   */
  signIn(credentials: LoginCredentials): Observable<SignInResponse> {
    return this.http.post<any>(
      `${this.endpointUrl}${environment.platformProviderAuthSignInEndpointPath}`,
      {
        email: credentials.email,
        password: credentials.password
      }
    ).pipe(
      map(response => this.normalizeAuthResponse(response, credentials.email))
    );
  }

  /**
   * Registers a new user against the deployed backend.
   * If the backend returns a token, it uses it directly. If it only creates the user,
   * it immediately signs in with the same credentials to recover the real JWT.
   */
  signUp(data: RegisterData): Observable<SignUpResponse> {
    const payload = {
      email: data.email,
      password: data.password
    };

    return this.http.post<any>(
      `${this.endpointUrl}${environment.platformProviderAuthSignUpEndpointPath}`,
      payload
    ).pipe(
      switchMap(response => {
        const token = this.extractToken(response);
        if (token) {
          return of(this.normalizeAuthResponse(response, data.email));
        }

        return this.signIn(new LoginCredentials({
          email: data.email,
          password: data.password
        }));
      })
    );
  }

  /**
   * Gets user information by ID.
   */
  getUserById(userId: string): Observable<UserResource> {
    return this.http.get<UserResource>(
      `${this.endpointUrl}${environment.platformProviderUsersEndpointPath}/${userId}`
    );
  }

  private normalizeAuthResponse(response: any, fallbackEmail: string): SignInResponse {
    const token = this.extractToken(response);
    const user = response?.user || response?.resource || response?.data || response;
    const decoded = token ? this.decodeJwtPayload(token) : null;

    return {
      id: Number(user?.id ?? user?.userId ?? decoded?.sub ?? decoded?.id ?? 0),
      email: String(user?.email ?? decoded?.email ?? decoded?.sub ?? fallbackEmail),
      token: token || ''
    };
  }

  private extractToken(response: any): string {
    return String(
      response?.token ??
      response?.accessToken ??
      response?.access_token ??
      response?.jwt ??
      response?.bearerToken ??
      response?.user?.token ??
      response?.data?.token ??
      ''
    );
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }
}
