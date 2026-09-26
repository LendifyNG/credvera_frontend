import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, CheckCheck, LayoutList, LogOut, Menu, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import CommandBar from './CommandBar';
import { signOut, useDash } from './store';

const nav = [
  { to: '/business/app', label: 'Today', icon: LayoutList, end: true },
  { to: '/business/app/payments', label: 'Payments', icon: ArrowUpDown },
  { to: '/business/app/approvals', label: 'Approvals', icon: CheckCheck },
];

/** The signed-in dashboard: a quiet sidebar, the command bar on top, the page in the middle. */
export default function AppShell() {
  const { session, payments } = useDash();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [bar, setBar] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const waiting = payments.filter((p) => p.status === 'waiting').length;

  // ⌘K, Ctrl+K or / opens the command bar from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement).tagName);
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault();
        setBar(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setDrawer(false), [pathname]);

  if (!session) return <Navigate to="/business/app/sign-in" replace />;

  const side = (
    <div className="flex h-full flex-col bg-graphite p-5 text-white">
      <div className="flex items-center justify-between">
        <img src={logo} alt="Credvera" className="h-6 w-auto" />
        <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="text-white/50 lg:hidden">
          <X className="size-5" />
        </button>
      </div>
      <div className="mt-8 rounded-lg bg-white/[0.06] px-3 py-3 ring-1 ring-white/10">
        <p className="text-[14px] font-semibold">{session.business}</p>
        <p className="text-[12px] text-white/50">Business account</p>
      </div>
      <nav className="mt-8 space-y-1" aria-label="Dashboard">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${isActive ? 'bg-white text-graphite' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'}`
            }
          >
            <span className="flex items-center gap-3">
              <n.icon className="size-4" />
              {n.label}
            </span>
            {n.label === 'Approvals' && waiting > 0 && <span className="rounded-full bg-[#f5c451] px-2 py-0.5 text-[11px] font-semibold text-graphite">{waiting}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-lg p-3 text-[12.5px] leading-relaxed text-white/45">
        Press <kbd className="rounded bg-white/10 px-1 font-ledger text-white/70">⌘K</kbd> anywhere and type what you need.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ledger text-graphite lg:pl-64">
      {/* Sidebar: fixed on large screens, a drawer on phones */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{side}</aside>
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 bg-graphite/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)}>
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.3 }} className="h-full w-72" onClick={(e) => e.stopPropagation()}>
              {side}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-graphite/10 bg-ledger/90 px-4 py-3 backdrop-blur sm:px-8">
        <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-md ring-1 ring-graphite/15 lg:hidden">
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setBar(true)}
          className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg bg-white px-4 text-left text-[15px] text-graphite/45 ring-1 ring-graphite/10 transition-shadow hover:ring-graphite/25 sm:max-w-xl"
        >
          <Search className="size-4" />
          <span className="min-w-0 flex-1 truncate">
            <span className="sm:hidden">Type what you need</span>
            <span className="hidden sm:inline">Type what you need, like “pay Kemi 650k”</span>
          </span>
          <kbd className="hidden rounded bg-graphite/5 px-1.5 py-0.5 font-ledger text-[11px] sm:block">⌘K</kbd>
        </button>
        <div className="relative ml-auto">
          <button type="button" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white">
            <span className="grid size-9 place-items-center rounded-full bg-graphite text-[14px] font-semibold text-white">{session.person[0]}</span>
            <span className="hidden text-left sm:block">
              <span className="block text-[14px] font-semibold leading-tight">{session.person}</span>
              <span className="block text-[12px] text-graphite/50">{session.role}</span>
            </span>
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div role="menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white p-1 shadow-xl ring-1 ring-graphite/10">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    signOut();
                    navigate('/business/app/sign-in', { replace: true });
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[14px] hover:bg-ledger"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-8 lg:py-10">
        <Outlet />
      </main>

      <CommandBar open={bar} onClose={() => setBar(false)} />
    </div>
  );
}
