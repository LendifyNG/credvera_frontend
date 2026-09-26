import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipients } from './store';

const ease = [0.16, 1, 0.3, 1] as const;

type Action = { label: string; hint: string; go: string };

/** "650k", "₦650,000", "1.2m" → 650000 / 1200000. */
function parseAmount(s: string) {
  const m = s.replace(/[₦,\s]/g, '').match(/^(\d+(?:\.\d+)?)([km])?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]!) * (m[2]?.toLowerCase() === 'm' ? 1_000_000 : m[2]?.toLowerCase() === 'k' ? 1000 : 1);
  return Math.round(n);
}

/** Turns what's typed into things the dashboard can do. */
function understand(q: string): Action[] {
  const text = q.trim();
  const out: Action[] = [];
  const pay = text.match(/^(?:pay|send)\s+(.+?)(?:\s+([₦\d][\d,.]*\s?[km]?))?$/i);
  if (pay) {
    const who = pay[1]!.replace(/\s+(?:₦?[\d,.]+[km]?)$/i, '').trim();
    const amount = pay[2] ? parseAmount(pay[2]) : null;
    const match = recipients.find((r) => r.name.toLowerCase().startsWith(who.toLowerCase()));
    const name = match?.name ?? who.replace(/\b\w/g, (c) => c.toUpperCase());
    const params = new URLSearchParams({ new: '1', to: name, ...(amount ? { amount: String(amount) } : {}) });
    out.push({ label: `Pay ${name}${amount ? ` ₦${amount.toLocaleString('en-NG')}` : ''}`, hint: 'Opens a payment, ready to confirm', go: `/business/app/payments?${params}` });
  }
  if (/^(appro|wait|pend)/i.test(text)) out.push({ label: 'See what’s waiting for approval', hint: 'Approvals', go: '/business/app/approvals' });
  const find = text.match(/^(?:find|search|show)\s+(.+)$/i);
  if (find) out.push({ label: `Find “${find[1]}” in payments`, hint: 'Payments', go: `/business/app/payments?q=${encodeURIComponent(find[1]!)}` });
  if (/^(money in|received|in$)/i.test(text)) out.push({ label: 'Money that came in', hint: 'Payments', go: '/business/app/payments?f=in' });
  if (/^(today|brief|home)/i.test(text)) out.push({ label: 'Today’s brief', hint: 'Today', go: '/business/app' });
  return out;
}

const examples: Action[] = [
  { label: 'Pay Kemi Adeyemi 650k', hint: 'Try typing “pay …”', go: '/business/app/payments?new=1&to=Kemi%20Adeyemi&amount=650000' },
  { label: 'See what’s waiting for approval', hint: 'Approvals', go: '/business/app/approvals' },
  { label: 'Find Lekki in payments', hint: 'Payments', go: '/business/app/payments?q=Lekki' },
  { label: 'Today’s brief', hint: 'Today', go: '/business/app' },
];

/** The dashboard's command bar: type what you need, press Enter. Opens with ⌘K, Ctrl+K or /. */
export default function CommandBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const actions = useMemo(() => (q.trim() ? understand(q) : examples), [q]);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setSel(0);
    const t = window.setTimeout(() => input.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => setSel(0), [q]);

  const run = (a?: Action) => {
    if (!a) return;
    navigate(a.go);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] bg-graphite/30 px-4 pt-[14vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command bar"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white text-graphite shadow-2xl ring-1 ring-graphite/10"
          >
            <div className="flex items-center gap-3 border-b border-graphite/10 px-5">
              <Search className="size-5 text-graphite/40" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSel((s) => Math.min(actions.length - 1, s + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSel((s) => Math.max(0, s - 1));
                  } else if (e.key === 'Enter') run(actions[sel]);
                  else if (e.key === 'Escape') onClose();
                }}
                placeholder="Pay Kemi 650k, find Lekki, approvals…"
                aria-label="What do you need?"
                className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-graphite/35"
              />
              <kbd className="rounded bg-graphite/5 px-1.5 py-0.5 font-ledger text-[11px] text-graphite/50">Esc</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {actions.length === 0 && (
                <li className="px-4 py-6 text-[14px] text-graphite/50">
                  Try “pay” and a name, “find” and a word, or “approvals”.
                </li>
              )}
              {actions.map((a, i) => (
                <li key={a.label}>
                  <button
                    type="button"
                    onMouseEnter={() => setSel(i)}
                    onClick={() => run(a)}
                    className={`flex w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left ${i === sel ? 'bg-graphite text-white' : ''}`}
                  >
                    <span>
                      <span className="block text-[15px] font-medium">{a.label}</span>
                      <span className={`block text-[12.5px] ${i === sel ? 'text-white/55' : 'text-graphite/45'}`}>{a.hint}</span>
                    </span>
                    {i === sel ? <CornerDownLeft className="size-4 text-primary" /> : <ArrowRight className="size-4 text-graphite/25" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
