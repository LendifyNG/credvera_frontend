import Lenis from 'lenis';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import IntroOverlay from './components/intro/IntroOverlay';
import SiteFooter from './components/layout/SiteFooter';
import SiteNavbar from './components/layout/SiteNavbar';
import { IntroContext, shouldPlayIntro } from './lib/intro';
import { AudienceProvider } from './lib/audience';
import AboutPage from './pages/AboutPage';
import BizAboutPage from './pages/business/BizAboutPage';
import BizBlogPage from './pages/business/BizBlogPage';
import BizCardsPage from './pages/business/CardsPage';
import BizContactPage from './pages/business/BizContactPage';
import BizFaqPage from './pages/business/BizFaqPage';
import BizLegalPage from './pages/business/BizLegalPage';
import BizFxPage from './pages/business/FxPage';
import BizPaymentsPage from './pages/business/PaymentsPage';
import BizPostPage from './pages/business/BizPostPage';
import BizPricingPage from './pages/business/BizPricingPage';
import BizSecurityPage from './pages/business/BizSecurityPage';
import BizSuppliersPage from './pages/business/SuppliersPage';
import BusinessHomePage from './pages/BusinessHomePage';
import PayPage from './pages/PayPage';
import Accounts from './dashboard/Accounts';
import AppShell from './dashboard/AppShell';
import Approvals from './dashboard/Approvals';
import Customers from './dashboard/Customers';
import Help from './dashboard/Help';
import Invoices from './dashboard/Invoices';
import Links from './dashboard/Links';
import OpenAccount from './dashboard/OpenAccount';
import PayHub from './dashboard/PayHub';
import Payments from './dashboard/Payments';
import OfficialStatement from './dashboard/OfficialStatement';
import Reports from './dashboard/Reports';
import Suppliers from './dashboard/Suppliers';
import Settings from './dashboard/Settings';
import SignIn from './dashboard/SignIn';
import Soon, { SoonPage } from './dashboard/Soon';
import Today from './dashboard/Today';
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
  '/business/payments': 'Payments and invoices | Credvera Business',
  '/business/fx': 'FX and currencies | Credvera Business',
  '/business/suppliers': 'Pay suppliers abroad | Credvera Business',
  '/business/cards': 'Business cards | Credvera Business',
  '/business/pricing': 'Pricing | Credvera Business',
  '/business/security': 'Security | Credvera Business',
  '/business/about': 'About | Credvera Business',
  '/business/faq': 'FAQ | Credvera Business',
  '/business/contact': 'Contact | Credvera Business',
  '/business/blog': 'Field notes | Credvera Business',
  '/business/privacy': 'Privacy notice | Credvera Business',
  '/business/terms': 'Terms of use | Credvera Business',
  '/business/app': 'Home | Credvera Business',
  '/business/app/payments': 'Transactions | Credvera Business',
  '/business/app/accounts': 'Accounts | Credvera Business',
  '/business/app/pay': 'Payments | Credvera Business',
  '/business/app/pay/bulk': 'Bulk payments | Credvera Business',
  '/business/app/pay/scheduled': 'Scheduled payments | Credvera Business',
  '/business/app/pay/bills': 'Bills | Credvera Business',
  '/business/app/fx': 'FX | Credvera Business',
  '/business/app/cards': 'Cards | Credvera Business',
  '/business/app/invoices': 'Invoices | Credvera Business',
  '/business/app/links': 'Payment links | Credvera Business',
  '/business/app/customers': 'Customers | Credvera Business',
  '/business/app/suppliers': 'Suppliers | Credvera Business',
  '/business/app/team': 'Team | Credvera Business',
  '/business/app/reports': 'Reports | Credvera Business',
  '/business/app/settings': 'Settings | Credvera Business',
  '/business/app/help': 'Help | Credvera Business',
  '/business/app/settings/security': 'Security | Credvera Business',
  '/business/app/settings/notifications': 'Notifications | Credvera Business',
  '/business/app/settings/documents': 'Documents | Credvera Business',
  '/business/app/reports/cash-flow': 'Cash flow | Credvera Business',
  '/business/app/reports/reconciliation': 'Reconciliation | Credvera Business',
  '/business/app/reports/profit': 'Order profit | Credvera Business',
  '/business/app/team/roles': 'Roles and approvals | Credvera Business',
  '/business/app/fx/convert': 'Convert | Credvera Business',
  '/business/app/fx/alerts': 'Rate alerts | Credvera Business',
  '/business/app/approvals': 'Approvals | Credvera Business',
  '/business/app/sign-in': 'Sign in | Credvera Business',
  '/business/app/open': 'Open a business account | Credvera Business',
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
  // The business dashboard has its own frame, without the website's menu and footer.
  // The dashboard and the public pay page stand alone, without the site's chrome.
  const inApp = pathname.startsWith('/business/app') || pathname.startsWith('/pay/');
  const [introActive, setIntroActive] = useState(() => shouldPlayIntro(pathname));
  const [introDone, setIntroDone] = useState(!introActive);

  const handleIntroReveal = useCallback(() => setIntroDone(true), []);
  const handleIntroFinish = useCallback(() => setIntroActive(false), []);

  // Smooth scrolling on the website (on touch screens the phone's own
  // scrolling is kept). Not in the dashboard: Lenis takes over the mouse
  // wheel for the whole window, so the sidebar and drawers, which scroll on
  // their own, would stop scrolling.
  useEffect(() => {
    if (inApp) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [inApp]);

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
    document.title = titles[pathname] ?? (pathname.startsWith('/business/blog/') ? 'Field notes | Credvera Business' : pathname.startsWith('/business/app/statements/') ? 'Official statement | Credvera Business' : pathname.startsWith('/business/app') ? 'Credvera Business' : pathname.startsWith('/blog/') ? 'Blog | Credvera' : pathname.startsWith('/pay/') ? 'Pay | Credvera' : 'Page not found | Credvera');
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
      {!inApp && <SiteNavbar />}
      <main>
        <Routes>
          {/* Where a payment link lands */}
          <Route path="/pay/:slug" element={<PayPage />} />

          {/* The business dashboard */}
          <Route path="/business/app/sign-in" element={<SignIn />} />
          <Route path="/business/app/open" element={<OpenAccount />} />
          <Route path="/business/app/statements/:id" element={<OfficialStatement />} />
          <Route path="/business/app" element={<AppShell />}>
            <Route index element={<Today />} />
            <Route path="payments" element={<Payments />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="pay" element={<PayHub />} />
            <Route path="pay/:section" element={<PayHub />} />
            <Route path="fx" element={<SoonPage what="fx" />} />
            <Route path="fx/:section" element={<SoonPage what="fx" />} />
            <Route path="cards" element={<SoonPage what="cards" />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="links" element={<Links />} />
            <Route path="customers" element={<Customers />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/*" element={<Navigate to="/business/app/suppliers" replace />} />
            <Route path="team" element={<SoonPage what="team" />} />
            <Route path="team/:section" element={<SoonPage what="team" />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:section" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/:section" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route path="soon/:what" element={<Soon />} />
          </Route>

          <Route path="/" element={<PersonalHomePage />} />
          <Route path="/business" element={<BusinessHomePage />} />
          <Route path="/business/payments" element={<BizPaymentsPage />} />
          <Route path="/business/fx" element={<BizFxPage />} />
          <Route path="/business/suppliers" element={<BizSuppliersPage />} />
          <Route path="/business/cards" element={<BizCardsPage />} />
          <Route path="/business/pricing" element={<BizPricingPage />} />
          <Route path="/business/security" element={<BizSecurityPage />} />
          <Route path="/business/about" element={<BizAboutPage />} />
          <Route path="/business/faq" element={<BizFaqPage />} />
          <Route path="/business/contact" element={<BizContactPage />} />
          <Route path="/business/blog" element={<BizBlogPage />} />
          <Route path="/business/blog/:slug" element={<BizPostPage />} />
          <Route path="/business/privacy" element={<BizLegalPage kind="privacy" />} />
          <Route path="/business/terms" element={<BizLegalPage kind="terms" />} />
          <Route path="/personal/abroad" element={<AbroadPage />} />
          <Route path="/personal/everyday" element={<EverydayPage />} />
          <Route path="/personal/save" element={<SavePage />} />
          <Route path="/personal/passport" element={<PassportPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          {/* Earlier product pages, now sections of the two home pages. */}
          <Route path="/business-payments" element={<Navigate to="/business/payments" replace />} />
          <Route path="/cross-border" element={<Navigate to="/business/fx" replace />} />
          <Route path="/supplier-payments" element={<Navigate to="/business/suppliers" replace />} />
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
      {!inApp && <SiteFooter />}
    </IntroContext.Provider>
    </AudienceProvider>
  );
}
