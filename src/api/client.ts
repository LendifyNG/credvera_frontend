import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ApiError } from './errors';
import { activeBusiness } from './activeBusiness';
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
    /** Which user action this request is, for reusing its Idempotency-Key on a retry. */
    _action?: string;
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

  // Acting for a business: the API scopes money to it, and checks it's ours.
  const businessId = activeBusiness.get();
  if (businessId) config.headers['X-Business-Id'] = businessId;

  // Payments refuse a POST without one, so a retried click can't pay twice.
  // The same action sent again (a retry after a timeout or a dropped
  // connection) reuses its key until it gets a definite answer, so the API
  // sees one payment, not two. A replay after a token refresh keeps it too.
  const method = config.method?.toLowerCase();
  if ((method === 'post' || method === 'put' || method === 'patch') && !config.headers['Idempotency-Key']) {
    const action = actionOf(config.method!, config.url, businessId, config.data);
    config._action = action ?? undefined;
    config.headers['Idempotency-Key'] = action ? keyFor(action) : crypto.randomUUID();
  }

  return config;
});

// ── Incoming: one error shape, one refresh, one sign-out rule ────────────────

instance.interceptors.response.use(
  (response) => {
    settle(response.config._action);
    return response;
  },
  async (error: unknown) => {
    const apiError = toApiError(error);
    const config = axios.isAxiosError(error) ? error.config : undefined;

    // A definite refusal frees the key, so a corrected retry is a new action.
    // No answer, or a server fault, keeps it: the payment may have gone.
    if (apiError.status >= 400 && apiError.status < 500 && apiError.code !== 'TOKEN_EXPIRED') settle(config?._action);

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

// ── Idempotency keys per action ──────────────────────────────────────────────

const KEY_LIFETIME_MS = 15 * 60_000;
const actionKeys = new Map<string, { key: string; at: number }>();

/** The same method, address, business and body is the same action. Uploads aren't keyed. */
function actionOf(method: string, url: string | undefined, businessId: string | null, data: unknown): string | null {
  if (typeof FormData !== 'undefined' && data instanceof FormData) return null;
  return [method.toLowerCase(), url ?? '', businessId ?? '', typeof data === 'string' ? data : JSON.stringify(data ?? null)].join('\u0000');
}

function keyFor(action: string): string {
  const now = Date.now();
  for (const [a, k] of actionKeys) if (now - k.at > KEY_LIFETIME_MS) actionKeys.delete(a);
  const existing = actionKeys.get(action);
  if (existing) return existing.key;
  const key = crypto.randomUUID();
  actionKeys.set(action, { key, at: now });
  return key;
}

function settle(action: string | undefined) {
  if (action) actionKeys.delete(action);
}

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
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(instance.put(url, body, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(instance.delete(url, config)),
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
