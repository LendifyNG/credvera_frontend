import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, Bell, CircleCheck, FileSearch, FileWarning, MessageSquareWarning, XCircle, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentLinks } from '../api';
import { useActiveBusiness, usePayments } from './data';
import { amount } from './requests';
import { money, shortDate } from './model';

const DAY = 86400000;

type Note = {
  id: string;
  group: 'needs' | 'update';
  icon: LucideIcon;
  tone: string;
  title: string;
  body?: string;
  when: string;
  to: string;
};

/** "2h ago", "Yesterday", "3 days ago", or a date. */
function ago(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 3600000) return 'Just now';
  if (d < DAY) return `${Math.floor(d / 3600000)}h ago`;
  if (d < 2 * DAY) return 'Yesterday';
  if (d < 7 * DAY) return `${Math.floor(d / DAY)} days ago`;
  return shortDate(iso);
}

// What's been read is a convenience for whoever is looking, kept in this
// browser; losing it only makes notes look new again.
const SEEN_KEY = 'credvera.notes.seen';
const listeners = new Set<() => void>();
let seen: string[] = readSeen();

function readSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function markSeen(ids: string[]) {
  // Kept short: only the latest few hundred matter.
  seen = [...new Set([...ids, ...seen])].slice(0, 300);
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // Read for this visit only.
  }
  listeners.forEach((l) => l());
}

const useSeen = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => seen,
  );

/** Everything worth telling the business about, built from what's happening now. */
function useNotes() {
  const business = useActiveBusiness();
  const links = usePaymentLinks();
  const { payments } = usePayments();
  const read = useSeen();

  const notes = useMemo(() => {
    const out: Note[] = [];
    const recent = (iso: string, days: number) => Date.now() - new Date(iso).getTime() < days * DAY;

    if (business?.status === 'more_info')
      out.push({ id: `biz-info-${business.id}`, group: 'needs', icon: MessageSquareWarning, tone: 'bg-[#f6e7e0] text-[#9a3a17]', title: 'We need something to finish your review', body: business.decisionNote ?? undefined, when: new Date().toISOString(), to: '/business/app/open' });
    for (const l of (links.data ?? []).filter((x) => x.status === 'expired'))
      out.push({ id: `ex-${l.reference}`, group: 'needs', icon: FileWarning, tone: 'bg-[#f6e7e0] text-[#9a3a17]', title: `${l.invoiceName} for ${l.recipient.name} expired unpaid`, body: amount(Number(l.amount), l.currency), when: l.expiresAt ?? l.createdAt, to: '/business/app/invoices' });
    for (const p of payments.filter((x) => x.status === 'failed' && recent(x.date, 7)))
      out.push({ id: `fail-${p.id}`, group: 'needs', icon: XCircle, tone: 'bg-[#f6e7e0] text-[#9a3a17]', title: `Your payment to ${p.who} didn’t go through`, body: p.note, when: p.date, to: `/business/app/payments?q=${encodeURIComponent(p.who)}` });

    for (const l of (links.data ?? []).filter((x) => x.status === 'paid' && x.paidAt && recent(x.paidAt, 7)))
      out.push({ id: `paid-${l.reference}`, group: 'update', icon: CircleCheck, tone: 'bg-[#e3f1e0] text-[#1f6b33]', title: `${l.recipient.name} paid ${l.invoiceName}`, body: amount(Number(l.paidAmount ?? l.amount), l.currency), when: l.paidAt!, to: '/business/app/invoices' });
    for (const p of payments.filter((x) => x.kind === 'in' && x.status === 'received' && x.what !== 'Payment link' && recent(x.date, 4)))
      out.push({ id: `in-${p.id}`, group: 'update', icon: ArrowDownLeft, tone: 'bg-[#e3f1e0] text-[#1f6b33]', title: `${money(p.amount, p.currency)} from ${p.who}`, body: p.what, when: p.date, to: `/business/app/payments?q=${encodeURIComponent(p.who)}` });
    if (business && (business.status === 'pending' || business.status === 'second_review'))
      out.push({ id: `biz-review-${business.id}`, group: 'update', icon: FileSearch, tone: 'bg-[#fbf0d6] text-[#8a5a00]', title: `We’re reviewing ${business.name}`, body: 'Usually one or two working days.', when: business.submittedAt ?? new Date().toISOString(), to: '/business/app/open' });

    return out.sort((a, b) => (a.group === b.group ? b.when.localeCompare(a.when) : a.group === 'needs' ? -1 : 1));
  }, [business, links.data, payments]);

  const unread = notes.filter((n) => !read.includes(n.id));
  return { notes, unread, read };
}

/** The bell in the top bar, and the list it opens. */
export default function NotificationBell() {
  const navigate = useNavigate();
  const { notes, unread, read } = useNotes();
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
            const isNew = !read.includes(n.id);
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
