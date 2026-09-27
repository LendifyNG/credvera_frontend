/**
 * The site plays its motion for everyone. Many phones report "reduce motion"
 * whenever battery or power saving is on, which left visitors with a still
 * site: no videos, nothing moving. Components ask this instead of the
 * browser, so the choice lives in one place.
 */
export function useReducedMotion() {
  return false;
}
