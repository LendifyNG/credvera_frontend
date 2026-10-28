import { useEffect } from 'react';
import { LAST_ACTIVE_KEY } from '../api/session';

/** How long the dashboard stays signed in with nobody using it. */
const IDLE_MINUTES = 15;
const KEY = LAST_ACTIVE_KEY;

const now = () => Date.now();
const read = () => {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
};
const write = (t: number) => {
  try {
    localStorage.setItem(KEY, String(t));
  } catch {
    /* storage blocked: the in-page timer still works */
  }
};

/**
 * Signs out after 15 minutes with no mouse, keyboard, touch or scrolling.
 * The last activity is kept across tabs and browser restarts, so a business
 * account left open on a shared computer doesn't stay open for the next
 * person, and a laptop woken from sleep checks the clock rather than a timer
 * that was paused.
 */
export function useIdleSignOut(active: boolean, signOut: () => void) {
  useEffect(() => {
    if (!active) return;
    const limit = IDLE_MINUTES * 60_000;
    const last = read();
    if (last && now() - last > limit) {
      signOut();
      return;
    }
    write(now());

    let lastWrite = now();
    const touch = () => {
      // At most every few seconds: mousemove fires constantly.
      if (now() - lastWrite > 5_000) {
        lastWrite = now();
        write(lastWrite);
      }
    };
    const check = () => {
      if (now() - Math.max(read(), lastWrite) > limit) signOut();
    };
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    document.addEventListener('visibilitychange', check);
    const timer = window.setInterval(check, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener('visibilitychange', check);
      window.clearInterval(timer);
    };
  }, [active, signOut]);
}
