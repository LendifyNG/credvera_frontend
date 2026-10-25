// Which browser this is, for sign-in. A PIN only works where the password has
// been used before, so a password sign-in registers this browser with the API
// and later PIN sign-ins send the same id. The id is random, made once and
// kept in this browser; clearing site data means signing in with the password
// again.

const KEY = 'credvera.deviceId';

function deviceId(): string {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && /^[A-Za-z0-9_-]{16,128}$/.test(saved)) return saved;
    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Storage blocked (private mode): a new id each time, so PIN needs the password first here.
    return crypto.randomUUID();
  }
}

/** "Chrome on Mac", for the account's devices list and the new sign-in email. */
function deviceName(): string {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} on ${os}` : browser;
}

export const deviceHeaders = () => ({ 'X-Device-Id': deviceId(), 'X-Device-Name': deviceName(), 'X-Device-Platform': 'web' });
