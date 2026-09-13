import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { links, nav, navLinks } from '../../lib/site';
import ButtonLink from '../ui/ButtonLink';

const ease = [0.16, 1, 0.3, 1] as const;

export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close any open menu when the route changes.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const solid = scrolled || mobileOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={`relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-4 transition-all duration-500 sm:px-6 ${
          solid ? 'bg-secondary/80 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <Link to="/" aria-label="Credvera home" className="shrink-0">
          <img src={logo} alt="Credvera" className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setOpenMenu(null)} aria-label="Main">
          {nav.map((item) =>
            'items' in item ? (
              <div key={item.label} className="relative" onMouseEnter={() => setOpenMenu(item.label)}>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                  aria-expanded={openMenu === item.label}
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className={`size-4 transition-transform duration-300 ${openMenu === item.label ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openMenu === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.25, ease }}
                      className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3"
                    >
                      <div className="rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
                        {item.items.map((sub) => (
                          <Link key={sub.to} to={sub.to} className="block rounded-xl px-4 py-3 transition-colors hover:bg-mist">
                            <span className="block text-sm font-semibold text-ink">{sub.label}</span>
                            <span className="block text-sm text-ink/60">{sub.description}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-white/80 hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink to={links.openAccount}>Open an account</ButtonLink>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full text-white lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex flex-col overflow-y-auto bg-secondary px-6 pb-10 pt-28 lg:hidden"
          >
            <motion.ul
              className="flex flex-col gap-1"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
              {navLinks.map((item) => (
                <motion.li
                  key={item.to}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, ease }}
                >
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block border-b border-white/10 py-4 text-2xl font-semibold tracking-tight ${isActive ? 'text-primary' : 'text-white'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-auto pt-10">
              <ButtonLink to={links.openAccount} className="w-full">
                Open an account
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
