import { Injectable } from '@angular/core';

/**
 * Decoded JWT token structure
 */
export interface DecodedToken {
  sub: string;
  email?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

/**
 * Service for managing JWT tokens.
 * @remarks
 * This service handles storage and retrieval of JWT access tokens using localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {
  private readonly TOKEN_KEY = 'access_token';

  /**
   * Stores the JWT token in localStorage.
   * @param token - The JWT token to store.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Retrieves the JWT token from localStorage.
   * @returns The JWT token or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Removes the JWT token from localStorage.
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Checks if a token exists.
   * @returns True if token exists, false otherwise.
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Decodes the JWT token payload.
   * @returns The decoded token payload or null if invalid.
   */
  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      if (!payload) return null;

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + (4 - normalizedPayload.length % 4) % 4,
        '='
      );

      return JSON.parse(atob(paddedPayload)) as DecodedToken;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Checks if the token is expired.
   * @returns True if expired, false otherwise.
   */
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate < new Date();
  }
}
