import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowDownLeft, Bell, Eye, FileSearch, FileWarning, LifeBuoy, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceTotals, isOverdue, markSeen, money, RATES, shortDate, useDash } from './store';
import { usePayments } from './data';

const DAY = 86400000;

type Note = {
  id: string;
  group: 'needs' | 'update';
  setting?: string; // the Settings → Notifications row that controls it
  icon: LucideIcon;
  tone: string;
  title: string;
  body?: string;
  when: string;
  to: string;
};

/** "2h ago", "Yesterday", "3 days ago", or a date; "in 3 days" for what's coming. */
function ago(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 0) {
    const days = Math.ceil(-d / DAY);
    return days <= 1 ? 'Tomorrow' : `In ${days} days`;
  }
  if (d < 3600000) return 'Just now';
  if (d < DAY) return `${Math.floor(d / 3600000)}h ago`;
  if (d < 2 * DAY) return 'Yesterday';
  if (d < 7 * DAY) return `${Math.floor(d / DAY)} days ago`;
  return shortDate(iso);
}

/** Everything worth telling the business about, built from what's happening now. */
export function useNotes() {
  const { invoices, checks, alerts, cases, documents, notify, seen } = useDash();
  const { payments } = usePayments();
  const notes = useMemo(() => {
    const out: Note[] = [];
    for (const i of invoices.filter(isOverdue)) {
      const late = Math.round((Date.now() - new Date(i.due).getTime()) / DAY);
      out.push({ id: `od-${i.id}`, group: 'needs', setting: 'overdue', icon: FileWarning, tone: 'bg-[#f6e7e0] text-[#9a3a17]', title: `${i.number} from ${i.customer} is ${late} ${late === 1 ? 'day' : 'days'} late`, body: money(invoiceTotals(i).total, i.currency), when: i.due, to: '/business/app/invoices?f=overdue' });
    }
    for (const k of checks.filter((x) => x.result === 'changed'))
      out.push({ id: `ck-${k.id}`, group: 'needs', icon: AlertTriangle, tone: 'bg-[#f6e7e0] text-[#9a3a17]', title: `${k.supplier} changed their bank details`, body: `On invoice ${k.invoice}. Check with them before you pay.`, when: k.checked, to: '/business/app/suppliers/checks' });
    for (const p of payments.filter((x) => x.kind === 'in' && !x.internal && x.status === 'received' && Date.now() - new Date(x.date).getTime() < 4 * DAY))
      out.push({ id: `in-${p.id}`, group: 'update', setting: 'in', icon: ArrowDownLeft, tone: 'bg-[#e3f1e0] text-[#1f6b33]', title: `${money(p.amount, p.currency)} from ${p.who}`, body: p.what.split(' · ')[0], when: p.date, to: `/business/app/payments?q=${encodeURIComponent(p.who)}` });
    for (const i of invoices.filter((x) => x.status === 'viewed' && !isOverdue(x)))
      out.push({ id: `vw-${i.id}`, group: 'update', icon: Eye, tone: 'bg-[#ece6f7] text-[#5a3d8f]', title: `${i.customer} opened ${i.number}`, body: `Due ${shortDate(i.due)}`, when: i.issued, to: '/business/app/invoices' });
    for (const a of alerts) {
      const hit = a.when === 'below' ? RATES[a.currency] < a.rate : RATES[a.currency] > a.rate;
      if (hit)
        out.push({ id: `ra-${a.id}`, group: 'update', setting: 'rates', icon: a.when === 'below' ? TrendingDown : TrendingUp, tone: 'bg-[#e3f1e0] text-[#1f6b33]', title: `1 ${a.currency} is ${a.when} ${money(a.rate)}`, body: `It’s ${money(RATES[a.currency])} now.`, when: new Date().toISOString(), to: '/business/app/fx' });
    }
    for (const c of cases.filter((x) => x.status === 'answered'))
      out.push({ id: `cs-${c.id}`, group: 'update', icon: LifeBuoy, tone: 'bg-[#efeee7] text-graphite/70', title: `We replied: ${c.subject}`, when: c.created, to: '/business/app/help' });
    if (documents === 'checking')
      out.push({ id: 'docs', group: 'update', icon: FileSearch, tone: 'bg-[#fbf0d6] text-[#8a5a00]', title: 'We’re checking your documents', body: 'Usually one or two working days.', when: new Date(Date.now() - 2 * DAY).toISOString(), to: '/business/app/settings/documents' });
    // Hidden if switched off for the app in Settings.
    return out
      .filter((n) => !n.setting || notify[n.setting]?.app !== false)
      .sort((a, b) => (a.group === b.group ? b.when.localeCompare(a.when) : a.group === 'needs' ? -1 : 1));
  }, [payments, invoices, checks, alerts, cases, documents, notify]);
  const unread = notes.filter((n) => !seen.includes(n.id));
  return { notes, unread, seen };
}

/** The bell in the top bar, and the list it opens. */
export default function NotificationBell() {
  const navigate = useNavigate();
  const { notes, unread, seen } = useNotes();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Closes on a click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', click);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', click);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  const go = (id: string, to: string) => {
    markSeen([id]);
    setOpen(false);
    navigate(to);
  };

  const section = (group: 'needs' | 'update', title: string) => {
    const list = notes.filter((n) => n.group === group);
    if (!list.length) return null;
    return (
      <div>
        <p className="px-4 pb-1 pt-3 text-[12.5px] font-medium text-graphite/45">{title}</p>
        <ul>
          {list.map((n) => {
            const isNew = !seen.includes(n.id);
            return (
              <li key={n.id}>
                <button type="button" onClick={() => go(n.id, n.to)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f5f4ef]">
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${n.tone}`}>
                    <n.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[14px] leading-snug ${isNew ? 'font-semibold' : 'font-medium text-graphite/75'}`}>{n.title}</span>
                    {n.body && <span className="mt-0.5 block truncate text-[12.5px] text-graphite/50">{n.body}</span>}
                    <span className="mt-1 block text-[12px] text-graphite/40">{ago(n.when)}</span>
                  </span>
                  {isNew && <span className="mt-2 size-2 shrink-0 rounded-full bg-[#e0a526]" aria-label="New" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread.length ? `${unread.length} new notifications` : 'Notifications'}
        className="relative grid size-9 place-items-center rounded-lg text-graphite/70 hover:bg-graphite/5"
      >
        <Bell className="size-5" strokeWidth={1.75} />
        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#e0a526] px-1 text-[10.5px] font-bold text-graphite ring-2 ring-[#f5f4ef]">{unread.length > 9 ? '9+' : unread.length}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-16px_rgba(20,28,23,0.35)] ring-1 ring-graphite/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[400px]"
          >
            <div className="flex items-center justify-between border-b border-graphite/10 px-4 py-3">
              <p className="text-[15px] font-semibold">Notifications</p>
              {unread.length > 0 && (
                <button type="button" onClick={() => markSeen(notes.map((n) => n.id))} className="text-[13px] font-semibold text-graphite/60 hover:text-graphite">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[min(70vh,560px)] overflow-y-auto pb-2">
              {section('needs', 'Needs you')}
              {section('update', 'Updates')}
              {notes.length === 0 && <p className="px-4 py-10 text-center text-[14px] text-graphite/50">You’re all caught up.</p>}
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/business/app/settings/notifications');
              }}
              className="block w-full border-t border-graphite/10 px-4 py-3 text-left text-[13.5px] font-semibold text-graphite/60 hover:bg-[#f5f4ef] hover:text-graphite"
            >
              Choose what you’re told about
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
