import { useSyncExternalStore } from 'react';

/**
 * Where the sign-in tokens live.
 *
 * The access token is kept in memory only, so it never touches storage. The
 * refresh token is kept in localStorage so a reload keeps you signed in; the
 * backend makes each one single-use and ends the session if one is replayed.
 * TODO(credvera): move the refresh token to an httpOnly cookie once the API
 * issues one, which takes it out of reach of page scripts entirely.
 */

const REFRESH_KEY = 'credvera.session.refresh';

export type Tokens = { accessToken: string; refreshToken: string };

let accessToken: string | null = null;
let refreshToken: string | null = readStored();
const listeners = new Set<() => void>();

function readStored(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export const session = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  isSignedIn: () => refreshToken !== null,

  set(tokens: Tokens) {
    const wasSignedIn = refreshToken !== null;
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    try {
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    } catch {
      // Private browsing: signed in for this tab only.
    }
    // A rotation mid-session is not a sign-in, so nothing needs to re-render.
    if (!wasSignedIn) notify();
  },

  clear() {
    const wasSignedIn = refreshToken !== null;
    accessToken = null;
    refreshToken = null;
    try {
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      // Nothing stored to remove.
    }
    if (wasSignedIn) notify();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Re-renders when someone signs in or out, including from another request's failure. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(session.subscribe, session.isSignedIn);
}
