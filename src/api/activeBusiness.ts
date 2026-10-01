import { useSyncExternalStore } from 'react';

/**
 * Which business the dashboard is acting for.
 *
 * The API client sends it as `X-Business-Id`, so wallets, history and
 * payments are the business's rather than the signed-in person's. Kept in
 * this browser so a reload returns to the same business.
 */

const KEY = 'credvera.business.active';

let activeId: string | null = read();
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export const activeBusiness = {
  get: () => activeId,

  set(id: string | null) {
    if (id === activeId) return;
    activeId = id;
    try {
      if (id) localStorage.setItem(KEY, id);
      else localStorage.removeItem(KEY);
    } catch {
      // Private browsing: remembered for this tab only.
    }
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useActiveBusinessId(): string | null {
  return useSyncExternalStore(activeBusiness.subscribe, activeBusiness.get);
}
