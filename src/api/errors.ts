/**
 * A failed API call, in one shape.
 *
 * `code` is the backend's stable error code (e.g. `INSUFFICIENT_FUNDS`), so
 * screens branch on it rather than on HTTP status or message wording. The
 * message is already written for the customer by the backend.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** The request never got an answer: offline, DNS, CORS, server down. */
  static network(): ApiError {
    return new ApiError(0, 'NETWORK_ERROR', 'We couldn’t reach Credvera. Check your connection and try again.');
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** Something safe to show a person, whatever was thrown. */
export function errorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  return 'Something went wrong. Please try again.';
}
