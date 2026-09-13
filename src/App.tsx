import Lenis from 'lenis';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import IntroOverlay from './components/intro/IntroOverlay';
import SiteFooter from './components/layout/SiteFooter';
import SiteNavbar from './components/layout/SiteNavbar';
import { IntroContext, shouldPlayIntro } from './lib/intro';
import AboutPage from './pages/AboutPage';
import BusinessPaymentsPage from './pages/BusinessPaymentsPage';
import ContactPage from './pages/ContactPage';
import CrossBorderPage from './pages/CrossBorderPage';
import FaqPage from './pages/FaqPage';
import HomePage from './pages/HomePage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';
import PayHomePage from './pages/PayHomePage';
import PricingPage from './pages/PricingPage';
import SecurityPage from './pages/SecurityPage';
import StudyAbroadPage from './pages/StudyAbroadPage';
import SupplierPaymentsPage from './pages/SupplierPaymentsPage';

const titles: Record<string, string> = {
  '/': 'Credvera — Business & cross-border payments for Nigerian businesses',
  '/business-payments': 'Business payments | Credvera',
  '/cross-border': 'Cross-border payments | Credvera',
  '/study-abroad': 'Study abroad | Credvera',
  '/supplier-payments': 'Supplier payments | Credvera',
  '/pay-home': 'Pay Home | Credvera',
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

  // Start every new page at the top, with its own browser-tab title.
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    document.title = titles[pathname] ?? 'Page not found | Credvera';
  }, [pathname]);

  return (
    <IntroContext.Provider value={{ done: introDone }}>
      {introActive && <IntroOverlay onReveal={handleIntroReveal} onFinish={handleIntroFinish} />}
      <SiteNavbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/business-payments" element={<BusinessPaymentsPage />} />
          <Route path="/cross-border" element={<CrossBorderPage />} />
          <Route path="/study-abroad" element={<StudyAbroadPage />} />
          <Route path="/supplier-payments" element={<SupplierPaymentsPage />} />
          <Route path="/pay-home" element={<PayHomePage />} />
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
  );
}
