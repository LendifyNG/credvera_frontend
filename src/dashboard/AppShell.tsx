import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  BarChart3,
  Check,
  CheckCheck,
  FileText,
  Link2,
  PackageCheck,
  UserRound,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  CreditCard,
  House,
  Landmark,
  List,
  LogOut,
  Menu,
  PanelLeft,
  Search,
  Send,
  Settings,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { activeBusiness, errorMessage, useBusinesses, usePaymentLinks, useProfile, useSignedIn, useSignOut, type BusinessDto } from '../api';
import logoDark from '../assets/logo-dark.png';
import CommandBar from './CommandBar';
import { usableBusinesses, useActiveBusiness, useSession } from './data';
import NotificationBell from './Notifications';
import { Convert } from './money';
import { Notices } from './published';

// Demo data and tips saved by earlier versions of the dashboard; nothing reads them now.
for (const key of ['credvera.dashboard.v16', 'credvera.dash.tip']) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable: nothing was saved there either.
  }
}

// Fine speckled grain, like uncoated paper: noise cut to small flecks in a
// warm grey, tiled. Only the flecks are drawn, so the colour beneath stays.
const PAPER = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.53  0 0 0 0 0.47  0 0 0 2.2 -0.97'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

type Sub = { label: string; hint?: string; to?: string; action?: 'convert'; badge?: number };
/** `soon`: the page says it's on its way; the API for it isn't there yet. */
type Item = { label: string; icon: LucideIcon; to: string; end?: boolean; menu?: Sub[]; badge?: number; soon?: boolean };


/** The name of the page, for the top bar. */
function pageName(pathname: string) {
  if (pathname === '/business/app') return 'Home';
  if (pathname.startsWith('/business/app/payments')) return 'Transactions';
  if (pathname.startsWith('/business/app/approvals')) return 'Approvals';
  if (pathname.startsWith('/business/app/accounts')) return 'Accounts';
  if (pathname.startsWith('/business/app/pay')) return 'Payments';
  if (pathname.startsWith('/business/app/fx')) return 'FX';
  if (pathname.startsWith('/business/app/cards')) return 'Cards';
  if (pathname.startsWith('/business/app/invoices')) return 'Invoices';
  if (pathname.startsWith('/business/app/links')) return 'Payment links';
  if (pathname.startsWith('/business/app/customers')) return 'Customers';
  if (pathname.startsWith('/business/app/suppliers')) return 'Suppliers';
  if (pathname.startsWith('/business/app/team')) return 'Team';
  if (pathname.startsWith('/business/app/reports')) return 'Reports';
  if (pathname.startsWith('/business/app/settings')) return 'Settings';
  if (pathname.startsWith('/business/app/help')) return 'Help';
  const what = pathname.split('/soon/')[1];
  return what ? what[0]!.toUpperCase() + what.slice(1).replace(/-/g, ' ') : 'Dashboard';
}

/**
 * One sidebar row. Rows with more to them show it in a small menu beside the
 * sidebar on hover, rather than opening another page of options; on phones
 * the same options open under the row.
 */
function NavRow({ item, onConvert, inDrawer }: { item: Item; onConvert: () => void; inDrawer: boolean }) {
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number }>({ top: 0, left: 0 });
  // Lit only when you're on one of its own options (Transactions has the list itself).
  const activeSub = item.menu?.some((m) => m.to && `${pathname}${search}` === m.to);
  const row = (active: boolean) =>
    `flex items-center justify-between gap-3 rounded-lg px-3 py-[7px] text-[14.5px] transition-colors ${
      active ? 'bg-white/[0.1] text-white' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
    }`;
  const label = (
    <span className="flex items-center gap-3">
      <item.icon className="size-[18px]" strokeWidth={1.75} />
      {item.label}
    </span>
  );
  const badge = (n?: number) => (n ? <span className="rounded-md bg-[#f5c451] px-1.5 text-[11px] font-semibold text-graphite">{n}</span> : null);
  const soon = item.soon ? <span className="rounded-md bg-white/10 px-1.5 text-[11px] font-medium text-white/50">Soon</span> : null;

  const subLink = (m: Sub) =>
    m.action === 'convert' ? (
      <button key={m.label} type="button" onClick={onConvert} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f5f4ef]">
        <span className="block text-[14px] font-medium text-graphite">{m.label}</span>
        {m.hint && <span className="block text-[12.5px] text-graphite/50">{m.hint}</span>}
      </button>
    ) : (
      <NavLink key={m.label} to={m.to!} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-[#f5f4ef]">
        <span>
          <span className="block text-[14px] font-medium text-graphite">{m.label}</span>
          {m.hint && <span className="block text-[12.5px] text-graphite/50">{m.hint}</span>}
        </span>
        {badge(m.badge)}
      </NavLink>
    );

  if (!item.menu) {
    return (
      <NavLink to={item.to} end={item.end} className={({ isActive }) => row(isActive)}>
        {label}
        {badge(item.badge)}
        {soon}
      </NavLink>
    );
  }

  if (inDrawer) {
    return (
      <div>
        <button type="button" onClick={() => setOpen((o) => !o)} className={`${row(!!activeSub)} w-full`} aria-expanded={open}>
          {label}
          <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <div className="mt-1 space-y-0.5 rounded-lg bg-white p-1.5">{item.menu.map(subLink)}</div>}
      </div>
    );
  }

  // The menu floats beside the row (fixed, so a scrolling sidebar can't clip it).
  const place = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // Low on the screen, it opens upwards from the row's bottom edge.
    setPos(r.top > window.innerHeight - 300 ? { bottom: window.innerHeight - r.bottom, left: r.right } : { top: r.top, left: r.right });
  };

  return (
    <div className="group relative" onMouseEnter={place} onFocus={place}>
      <NavLink to={item.to} className={() => row(!!activeSub)}>
        {label}
        <span className="flex items-center gap-2">
          {badge(item.badge)}
          {soon}
          <ChevronRight className="size-4 text-white/35" />
        </span>
      </NavLink>
      {/* The hover menu, bridged by padding so the pointer can cross to it */}
      <div style={pos} className="invisible fixed z-50 pl-3 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="w-64 rounded-xl bg-white p-1.5 shadow-[0_20px_40px_-16px_rgba(20,28,23,0.35)] ring-1 ring-graphite/10">
          <p className="px-3 pb-1 pt-2 text-[12.5px] font-medium text-graphite/45">{item.label}</p>
          {item.menu.map(subLink)}
        </div>
      </div>
    </div>
  );
}

/** The signed-in dashboard: a calm sidebar, a top bar with search, the page in the middle. */
export default function AppShell() {
  const signedIn = useSignedIn();
  const session = useSession();
  const profile = useProfile();
  const signOut = useSignOut();
  const businesses = useBusinesses();
  const active = useActiveBusiness();
  const usable = usableBusinesses(businesses.data);
  const links = usePaymentLinks();
  const { pathname } = useLocation();
  const [bar, setBar] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [converting, setConverting] = useState(false);
  // Invoices whose link ran out unpaid: worth chasing.
  const expiredInvoices = (links.data ?? []).filter((l) => l.status === 'expired').length;

  // ⌘K, Ctrl+K or / opens search from anywhere.
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

  useEffect(() => {
    setDrawer(false);
    setMenu(false);
    setSwitcher(false);
  }, [pathname]);

  // Act for a business this person actually runs: the one used last, else the first.
  useEffect(() => {
    if (businesses.data && !usable.some((b) => b.id === activeBusiness.get())) activeBusiness.set(usable[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses.data]);

  if (!signedIn) return <Navigate to="/business/app/sign-in" replace />;

  // No business sent for review yet: the application is the only place to go.
  if (businesses.data && usable.length === 0) return <Navigate to="/business/app/open" replace />;

  // Signed in, but the profile or the business isn't here yet (or couldn't be
  // fetched). Nothing renders until the business is chosen, so no request can
  // go out without it and fetch the person's personal money instead.
  if (!session || !active) {
    const error = profile.error ?? businesses.error;
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f4ef] px-6 text-center text-graphite">
        {error ? (
          <div>
            <p className="text-[16px] font-semibold">We couldn’t load your dashboard</p>
            <p className="mt-1 text-[14px] text-graphite/55">{errorMessage(error)}</p>
            <button
              type="button"
              onClick={() => {
                profile.refetch();
                businesses.refetch();
              }}
              className="mt-5 h-10 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="text-[14px] text-graphite/50">Opening your dashboard…</p>
        )}
      </div>
    );
  }

  // Signing out flips the session, and the guard above takes over from there.
  const out = () => signOut.mutate();

  const initials = session.business
    .replace(/\b(Ltd|Limited|Plc)\b\.?/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const groups: { label?: string; items: Item[] }[] = [
    {
      items: [
        { to: '/business/app', label: 'Home', icon: House, end: true },
        { to: '/business/app/payments', label: 'Transactions', icon: List },
      ],
    },
    {
      label: 'Money',
      items: [
        { to: '/business/app/accounts', label: 'Accounts', icon: Landmark },
        {
          to: '/business/app/pay',
          label: 'Payments',
          icon: Send,
          menu: [
            { label: 'Pay someone', hint: 'In naira, to any Nigerian bank', to: '/business/app/pay' },
            { label: 'Bulk payments', hint: 'Coming soon · many people from one file', to: '/business/app/pay/bulk' },
            { label: 'Scheduled payments', hint: 'Coming soon · payments that repeat', to: '/business/app/pay/scheduled' },
            { label: 'Bills', hint: 'Electricity, airtime and data', to: '/business/app/pay/bills' },
          ],
        },
        { to: '/business/app/approvals', label: 'Approvals', icon: CheckCheck, soon: true },
        { to: '/business/app/fx', label: 'FX', icon: ArrowLeftRight, soon: true },
        { to: '/business/app/cards', label: 'Cards', icon: CreditCard, soon: true },
      ],
    },
    {
      label: 'Get paid',
      items: [
        { to: '/business/app/invoices', label: 'Invoices', icon: FileText, badge: expiredInvoices },
        { to: '/business/app/links', label: 'Payment links', icon: Link2 },
        { to: '/business/app/customers', label: 'Customers', icon: UserRound },
      ],
    },
    {
      label: 'Trade',
      items: [
        { to: '/business/app/suppliers', label: 'Suppliers', icon: PackageCheck },
      ],
    },
    {
      label: 'Business',
      items: [
        { to: '/business/app/team', label: 'Team', icon: Users, soon: true },
        {
          to: '/business/app/reports',
          label: 'Reports',
          icon: BarChart3,
          menu: [
            { label: 'Statements', to: '/business/app/reports' },
            { label: 'Cash flow', to: '/business/app/reports/cash-flow' },
            { label: 'Reconciliation', hint: 'Match payments to your books', to: '/business/app/reports/reconciliation' },
            { label: 'Order profit calculator', to: '/business/app/reports/profit' },
          ],
        },
        {
          to: '/business/app/settings',
          label: 'Settings',
          icon: Settings,
          menu: [
            { label: 'Business details', to: '/business/app/settings' },
            { label: 'Security', hint: 'Where you’re signed in', to: '/business/app/settings/security' },
            { label: 'Notifications', to: '/business/app/settings/notifications' },
            { label: 'Documents', hint: 'Your company’s checks', to: '/business/app/settings/documents' },
          ],
        },
      ],
    },
  ];

  const side = (inDrawer: boolean) => (
    <div className="flex h-full flex-col bg-graphite px-3 py-4 text-white">
      {/* Business switcher */}
      <div className="relative">
        <button type="button" onClick={() => setSwitcher((s) => !s)} aria-expanded={switcher} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/[0.06]">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-[13px] font-bold text-graphite">{initials}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{session.business}</span>
            <span className="block text-[12px] text-white/50">{active.status === 'approved' ? 'Business account' : 'Under review'}</span>
          </span>
          <ChevronsUpDown className="size-4 text-white/45" />
        </button>
        <AnimatePresence>
          {switcher && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-full z-50 mt-1 rounded-xl bg-white p-1.5 text-graphite shadow-xl ring-1 ring-graphite/10">
              <p className="px-3 pb-1 pt-2 text-[12.5px] text-graphite/45">Your businesses</p>
              {usable.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    activeBusiness.set(b.id);
                    setSwitcher(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[14px] hover:bg-[#f5f4ef]"
                >
                  <span className="truncate">{b.name}</span>
                  {b.id === active.id && <Check className="size-4 shrink-0" />}
                </button>
              ))}
              <NavLink to="/business/app/open?another=1" className="block rounded-lg px-3 py-2 text-[14px] text-graphite/60 hover:bg-[#f5f4ef]">
                Open another business account
              </NavLink>
              <p className="mt-1 border-t border-graphite/10 px-3 pb-1 pt-2 text-[12.5px] text-graphite/45">
                Signed in as {session.person} · {session.role}
              </p>
              <button type="button" onClick={out} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[14px] hover:bg-[#f5f4ef]">
                <LogOut className="size-4" /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {inDrawer && (
          <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute -right-1 -top-1 p-2 text-white/50">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="-mx-1 mt-5 flex-1 space-y-4 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Dashboard">
        {groups.map((g, i) => (
          <div key={i}>
            {g.label && <p className="mb-1.5 px-3 text-[12.5px] font-medium text-white/40">{g.label}</p>}
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavRow key={it.label} item={it} inDrawer={inDrawer} onConvert={() => setConverting(true)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-white/10 pt-3">
        <NavRow item={{ to: '/business/app/help', label: 'Help', icon: CircleHelp }} inDrawer={inDrawer} onConvert={() => {}} />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#f5f4ef] text-graphite ${collapsed ? '' : 'lg:pl-64'}`}>
      {/* Paper grain over the page background, drawn in code; the sidebar and panels sit above it */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-100" style={{ backgroundImage: PAPER, backgroundSize: '220px 220px' }} />

      {/* Sidebar: fixed on large screens, a drawer on phones */}
      {!collapsed && <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{side(false)}</aside>}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 bg-graphite/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)}>
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.3 }} className="h-full w-72 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onClick={(e) => e.stopPropagation()}>
              {side(true)}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-graphite/10 bg-[#f5f4ef]/90 px-4 backdrop-blur sm:px-6">
        <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-lg text-graphite/70 hover:bg-graphite/5 lg:hidden">
          <Menu className="size-5" />
        </button>
        <button type="button" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Show the sidebar' : 'Hide the sidebar'} className="hidden size-9 place-items-center rounded-lg text-graphite/60 hover:bg-graphite/5 lg:grid">
          <PanelLeft className="size-5" strokeWidth={1.75} />
        </button>
        {collapsed && <img src={logoDark} alt="Credvera" className="hidden h-6 w-auto lg:block" />}
        <p className="shrink-0 whitespace-nowrap text-[15px] font-semibold">{pageName(pathname)}</p>

        <button
          type="button"
          onClick={() => setBar(true)}
          className="mx-auto hidden h-10 w-full max-w-md items-center gap-3 rounded-full bg-white px-4 text-left text-[14px] text-graphite/45 ring-1 ring-graphite/10 transition-shadow hover:ring-graphite/25 md:flex"
        >
          <Search className="size-4" />
          <span className="flex-1 truncate">Search payments, people and more</span>
          <kbd className="rounded-md bg-graphite/5 px-1.5 py-0.5 text-[11px]">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button type="button" onClick={() => setBar(true)} aria-label="Search" className="grid size-9 place-items-center rounded-lg text-graphite/70 hover:bg-graphite/5 md:hidden">
            <Search className="size-5" />
          </button>
          <NotificationBell />
          <div className="relative">
            <button type="button" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-graphite/5">
              <span className="grid size-8 place-items-center rounded-full bg-[#e6c9a8] text-[13px] font-semibold text-graphite">{session.person[0]}</span>
              <span className="hidden text-[14px] font-semibold sm:block">{session.person}</span>
              <ChevronDown className="hidden size-4 text-graphite/50 sm:block" />
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div role="menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-graphite/10">
                  <p className="px-3 pb-1 pt-2 text-[12.5px] text-graphite/45">{session.role}</p>
                  <button type="button" role="menuitem" onClick={out} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[14px] hover:bg-[#f5f4ef]">
                    <LogOut className="size-4" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="relative z-[1] px-4 py-8 sm:px-8 lg:py-10">
        <ReviewBanner business={active} />
        <Notices />
        <Outlet context={{ convert: () => setConverting(true) }} />
      </main>

      <CommandBar open={bar} onClose={() => setBar(false)} />
      <Convert open={converting} onClose={() => setConverting(false)} />
    </div>
  );
}

/**
 * While a business is being reviewed: what works already, and what doesn't
 * yet. Gone once it's approved.
 */
function ReviewBanner({ business }: { business: BusinessDto }) {
  if (business.closedAt) {
    return (
      <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center gap-3 rounded-xl border border-graphite/15 bg-[#efeee7] px-4 py-3 text-[14px]">
        <span className="size-1.5 rounded-full bg-graphite/50" />
        <p className="flex-1">
          <span className="font-semibold">{business.name}’s account is closed.</span> <span className="text-graphite/60">Its history and statements stay here for you to see.</span>
        </p>
      </div>
    );
  }
  if (business.status === 'approved') return null;

  const asked = business.status === 'more_info';

  return (
    <div className={`mx-auto mb-6 flex max-w-6xl flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-[14px] ${asked ? 'border-[#f0d3c5] bg-[#fcf1ec]' : 'border-[#ecdcae] bg-[#fbf5e6]'}`}>
      <span className={`size-1.5 rounded-full ${asked ? 'bg-[#c4542a]' : 'bg-[#e0a526]'}`} />
      <p className="flex-1">
        {asked ? (
          <>
            <span className="font-semibold">We need something from you</span> <span className="text-graphite/60">to finish reviewing {business.name}.</span>
          </>
        ) : (
          <>
            <span className="font-semibold">We’re reviewing {business.name}.</span>{' '}
            <span className="text-graphite/60">Customers can pay you now; sending money opens once it’s approved.</span>
          </>
        )}
      </p>
      {asked && (
        <Link to="/business/app/open" className="font-semibold text-graphite underline-offset-4 hover:underline">
          See what we need
        </Link>
      )}
    </div>
  );
}
