import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ApiError } from './errors';
import { session, type Tokens } from './session';

/**
 * The one HTTP client. Every API call in the app goes through `http` below,
 * so auth headers, token refresh, the response envelope and error shape are
 * handled here once and nowhere else.
 */

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Public routes (sign-in, refresh) are sent without an access token. */
    skipAuth?: boolean;
    /** Marks the single retry after a token refresh, so a request never loops. */
    _retried?: boolean;
  }
}

/**
 * e.g. `https://api.credvera.com/api` for a deployed copy. Unset, it is `/api`
 * on the app's own origin, which the dev server proxies to the backend.
 */
const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) || '/api').replace(/\/+$/, '');

/** Every backend response is wrapped in this envelope. */
type Envelope<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, unknown> } };

/** Codes that mean the session is over, and signing in again is the only fix. */
const SESSION_ENDED = new Set([
  'TOKEN_INVALID',
  'TOKEN_REVOKED',
  'TOKEN_REUSE_DETECTED',
  'ACCOUNT_NOT_FOUND',
  'ACCOUNT_SUSPENDED',
  'UNAUTHORIZED',
]);

const instance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { Accept: 'application/json' },
});

// ── Outgoing: attach the access token ────────────────────────────────────────

instance.interceptors.request.use(async (config) => {
  if (config.skipAuth) return config;

  // After a reload only the refresh token survives; get an access token first.
  if (!session.getAccessToken()) await refreshSession();

  config.headers.Authorization = `Bearer ${session.getAccessToken()}`;
  return config;
});

// ── Incoming: one error shape, one refresh, one sign-out rule ────────────────

instance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = toApiError(error);
    const config = axios.isAxiosError(error) ? error.config : undefined;

    // An expired access token is refreshed once and the request replayed, so
    // no caller ever deals with token lifetimes.
    if (apiError.code === 'TOKEN_EXPIRED' && config && !config.skipAuth && !config._retried) {
      await refreshSession();
      return instance({ ...config, _retried: true });
    }

    if (!config?.skipAuth && SESSION_ENDED.has(apiError.code)) session.clear();

    throw apiError;
  },
);

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<Envelope>(error)) {
    // No response at all: offline, DNS, CORS, server down.
    if (!error.response) return ApiError.network();

    const body = error.response.data;
    const failure = body && body.success === false ? body.error : undefined;

    return new ApiError(
      error.response.status,
      failure?.code ?? 'INTERNAL_ERROR',
      failure?.message ?? 'Something went wrong on our end. Please try again.',
      failure?.details,
    );
  }

  return new ApiError(0, 'UNKNOWN_ERROR', 'Something went wrong. Please try again.');
}

// ── Public surface ───────────────────────────────────────────────────────────

async function unwrap<T>(pending: Promise<AxiosResponse<Envelope<T>>>): Promise<T> {
  const { data, status } = await pending;
  if (!data.success) throw new ApiError(status, data.error.code, data.error.message, data.error.details);
  return data.data;
}

/** Typed calls that resolve to the envelope's `data`, or reject with an `ApiError`. */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(instance.get(url, config)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(instance.post(url, body, config)),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(instance.patch(url, body, config)),
};

// ── Refresh ──────────────────────────────────────────────────────────────────

let refreshing: Promise<void> | null = null;

/**
 * Swaps the refresh token for a new pair.
 *
 * Shared by every request that needs it at the same moment: refresh tokens are
 * single-use, so two parallel refreshes would look like a stolen token to the
 * backend and end the session.
 */
function refreshSession(): Promise<void> {
  refreshing ??= (async () => {
    const refreshToken = session.getRefreshToken();
    if (!refreshToken) throw new ApiError(401, 'UNAUTHORIZED', 'Please sign in.');

    try {
      session.set(await http.post<Tokens>('/auth/refresh', { refreshToken }, { skipAuth: true }));
    } catch (error) {
      // Offline is not signed out: keep the session so the next try can work.
      if (!(error instanceof ApiError && error.code === 'NETWORK_ERROR')) session.clear();
      throw error;
    }
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}
