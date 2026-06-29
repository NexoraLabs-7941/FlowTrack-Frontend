/**
 * Base interface for API resources.
 * @remarks
 * All API resource DTOs should extend this interface.
 */
export interface BaseResource {
  id?: string | number;
}

/**
 * Base interface for API responses.
 * @remarks
 * All API response DTOs should extend this interface.
 */
export interface BaseResponse {
  // e.g., status, message, timestamp, etc.
}

