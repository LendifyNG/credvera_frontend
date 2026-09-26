import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Who the site is speaking to. Personal and business are two different
// accounts in the app, so the whole site follows the choice: menu, pages,
// buttons and footer.
//
// The home pages decide it (/ is personal, /business is business). Shared
// pages (pricing, security, company) keep the visitor's last choice.

export type Audience = 'personal' | 'business';

const KEY = 'credvera.audience';
export const homeOf = (a: Audience) => (a === 'business' ? '/business' : '/');

function stored(): Audience | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'business' || v === 'personal' ? v : null;
  } catch {
    return null;
  }
}

function fromPath(pathname: string): Audience | null {
  if (pathname === '/business' || pathname.startsWith('/business/')) return 'business';
  if (pathname === '/' || pathname.startsWith('/personal/')) return 'personal';
  return null;
}

type Ctx = { audience: Audience; switchTo: (a: Audience) => void };
const AudienceContext = createContext<Ctx>({ audience: 'personal', switchTo: () => {} });

export function AudienceProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [audience, setAudience] = useState<Audience>(() => fromPath(pathname) ?? stored() ?? 'personal');

  // Landing on a home page sets the audience.
  useEffect(() => {
    const a = fromPath(pathname);
    if (a) setAudience(a);
  }, [pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, audience);
    } catch {
      // Private browsing: the choice just isn't remembered.
    }
  }, [audience]);

  // On a home page, switching goes to the other home page; on a shared page
  // the page stays and its content changes.
  const switchTo = useCallback(
    (a: Audience) => {
      setAudience(a);
      if (fromPath(pathname)) navigate(homeOf(a));
    },
    [pathname, navigate],
  );

  return <AudienceContext.Provider value={{ audience, switchTo }}>{children}</AudienceContext.Provider>;
}

export const useAudience = () => useContext(AudienceContext);
