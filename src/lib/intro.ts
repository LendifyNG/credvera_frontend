import { createContext, useContext } from 'react';

/** `done` is true once the opening intro has finished (or was never shown). */
export const IntroContext = createContext({ done: true });

export function useIntroDone() {
  return useContext(IntroContext).done;
}

/**
 * The intro plays on every full load (including reloads) of the homepage, and
 * never for visitors who prefer reduced motion.
 */
export function shouldPlayIntro(pathname: string): boolean {
  if (pathname !== '/') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
