import Lenis from 'lenis';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import IntroOverlay from './components/intro/IntroOverlay';
import SiteFooter from './components/layout/SiteFooter';
import SiteNavbar from './components/layout/SiteNavbar';
import { IntroContext, shouldPlayIntro } from './lib/intro';
import { AudienceProvider } from './lib/audience';
import AboutPage from './pages/AboutPage';
import BusinessHomePage from './pages/BusinessHomePage';
import PersonalHomePage from './pages/PersonalHomePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AbroadPage from './pages/personal/AbroadPage';
import EverydayPage from './pages/personal/EverydayPage';
import PassportPage from './pages/personal/PassportPage';
import SavePage from './pages/personal/SavePage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';
import PricingPage from './pages/PricingPage';
import SecurityPage from './pages/SecurityPage';

const titles: Record<string, string> = {
  '/': 'Credvera — Get paid from abroad, pay bills and save',
  '/business': 'Credvera for business — Payments, invoices, FX and supplier payments',
  '/personal/abroad': 'Get paid from abroad | Credvera',
  '/personal/everyday': 'Everyday money | Credvera',
  '/personal/save': 'Save and split | Credvera',
  '/personal/passport': 'Earnings Passport | Credvera',
  '/blog': 'Blog | Credvera',
  '/pricing': 'Pricing | Credvera',
  '/security': 'Security | Credvera',
  '/about': 'About | Credvera',
  '/faq': 'FAQ | Credvera',
  '/contact': 'Contact | Credvera',
  '/privacy': 'Privacy policy | Credvera',
  '/terms': 'Terms of use | Credvera',
};

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const { pathname } = useLocation();
  const [introActive, setIntroActive] = useState(() => shouldPlayIntro(pathname));
  const [introDone, setIntroDone] = useState(!introActive);

  const handleIntroReveal = useCallback(() => setIntroDone(true), []);
  const handleIntroFinish = useCallback(() => setIntroActive(false), []);

  // Smooth scrolling, skipped for visitors who prefer reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lock scrolling while the intro plays.
  useEffect(() => {
    if (!introActive) return;
    const root = document.documentElement;
    const lenis = lenisRef.current;
    root.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      root.style.overflow = '';
      lenis?.start();
    };
  }, [introActive]);

  const { hash } = useLocation();

  // Start every new page at the top, with its own browser-tab title.
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    document.title = titles[pathname] ?? (pathname.startsWith('/blog/') ? 'Blog | Credvera' : 'Page not found | Credvera');
  }, [pathname]);

  // Menu links like /business#fx go to that section of the page.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.querySelector(hash);
      if (!el) return;
      if (lenisRef.current) lenisRef.current.scrollTo(el as HTMLElement, { offset: -88 });
      else el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [pathname, hash]);

  return (
    <AudienceProvider>
    <IntroContext.Provider value={{ done: introDone }}>
      {introActive && <IntroOverlay onReveal={handleIntroReveal} onFinish={handleIntroFinish} />}
      <SiteNavbar />
      <main>
        <Routes>
          <Route path="/" element={<PersonalHomePage />} />
          <Route path="/business" element={<BusinessHomePage />} />
          <Route path="/personal/abroad" element={<AbroadPage />} />
          <Route path="/personal/everyday" element={<EverydayPage />} />
          <Route path="/personal/save" element={<SavePage />} />
          <Route path="/personal/passport" element={<PassportPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          {/* Earlier product pages, now sections of the two home pages. */}
          <Route path="/business-payments" element={<Navigate to="/business#payments" replace />} />
          <Route path="/cross-border" element={<Navigate to="/business#fx" replace />} />
          <Route path="/supplier-payments" element={<Navigate to="/business#suppliers" replace />} />
          <Route path="/study-abroad" element={<Navigate to="/" replace />} />
          <Route path="/pay-home" element={<Navigate to="/personal/abroad" replace />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </IntroContext.Provider>
    </AudienceProvider>
  );
}
