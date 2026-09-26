import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addPayment, APPROVAL_OVER, money, recipients, shortDate, TRANSFER_FEE, useDash, type Payment } from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const filters = [
  ['all', 'All'],
  ['in', 'Money in'],
  ['out', 'Money out'],
  ['waiting', 'Waiting'],
] as const;

const statusStyle: Record<Payment['status'], string> = {
  paid: 'bg-graphite/5 text-graphite/60',
  received: 'bg-primary/25 text-[#1f5c30]',
  waiting: 'bg-[#fbeed5] text-[#8a5a12]',
  'sent back': 'bg-[#fde2dd] text-[#9a3b2e]',
  'in transit': 'bg-[#e8ecf5] text-[#35507f]',
};

/** A new naira payment, from a saved recipient or a new name. */
function NewPayment({ to, amount, onClose }: { to?: string; amount?: number; onClose: (done?: Payment) => void }) {
  const [who, setWho] = useState(to ?? '');
  const [value, setValue] = useState(amount ? String(amount) : '');
  const [reason, setReason] = useState('');
  const [pin, setPin] = useState(false);
  const n = Number(value.replace(/\D/g, '')) || 0;
  const match = recipients.find((r) => r.name.toLowerCase() === who.trim().toLowerCase());
  const needsApproval = n >= APPROVAL_OVER;
  const ready = who.trim().length > 1 && n > 0 && reason.trim().length > 1;

  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose()}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="New payment"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-7 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold tracking-tight">New payment</p>
          <button type="button" onClick={() => onClose()} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>

        <label className="mt-8 block">
          <span className="text-[13px] font-medium text-graphite/55">To</span>
          <input list="saved" value={who} onChange={(e) => setWho(e.target.value)} placeholder="A saved name, or someone new" className="w-full border-b-2 border-graphite/15 bg-transparent py-2.5 text-[17px] outline-none focus:border-graphite" />
          <datalist id="saved">
            {recipients.map((r) => (
              <option key={r.id} value={r.name} />
            ))}
          </datalist>
          <span className="mt-1.5 block text-[12.5px] text-graphite/50">{match ? match.detail : who ? 'New recipient · you’ll add their bank details next' : 'Saved: ' + recipients.slice(0, 3).map((r) => r.name).join(', ')}</span>
        </label>

        <label className="mt-6 block">
          <span className="text-[13px] font-medium text-graphite/55">Amount</span>
          <div className="flex items-baseline gap-2 border-b-2 border-graphite/15 focus-within:border-graphite">
            <span className="text-2xl font-medium text-graphite/40">₦</span>
            <input inputMode="numeric" value={n ? n.toLocaleString('en-NG') : ''} onChange={(e) => setValue(e.target.value)} placeholder="0" className="w-full bg-transparent py-2 font-ledger text-3xl tabular-nums outline-none" />
          </div>
        </label>

        <label className="mt-6 block">
          <span className="text-[13px] font-medium text-graphite/55">What it’s for</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Salary, September" className="w-full border-b-2 border-graphite/15 bg-transparent py-2.5 text-[17px] outline-none focus:border-graphite" />
        </label>

        <dl className="mt-8 space-y-2 rounded-xl bg-ledger p-4 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-graphite/55">Fee</dt>
            <dd className="font-ledger">{money(TRANSFER_FEE)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-graphite/55">Total</dt>
            <dd className="font-ledger font-medium">{money(n + TRANSFER_FEE)}</dd>
          </div>
        </dl>
        <AnimatePresence>
          {needsApproval && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 rounded-lg bg-[#fbeed5] px-4 py-3 text-[13.5px] text-[#8a5a12]">
              Over {money(APPROVAL_OVER)}, so it waits for someone else to approve it before it goes.
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="button"
          disabled={!ready}
          onClick={() => setPin(true)}
          className="mt-auto h-12 rounded-md bg-graphite text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/20 disabled:text-graphite/45"
        >
          {needsApproval ? 'Send for approval' : `Pay ${n ? money(n) : ''}`}
        </button>
      </motion.aside>

      <PinPrompt
        open={pin}
        title={needsApproval ? 'Send for approval' : `Pay ${money(n)}`}
        detail={`To ${who.trim()} · ${reason.trim()}`}
        onClose={() => setPin(false)}
        onConfirm={() => {
          setPin(false);
          onClose(addPayment({ who: who.trim(), what: `${reason.trim()} · ${match?.detail.split(' · ')[0] ?? 'Bank transfer'}`, amount: n, reason: reason.trim() }));
        }}
      />
    </motion.div>
  );
}

/** Every payment in one list, and a new payment a click (or a sentence) away. */
export default function Payments() {
  const { payments } = useDash();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [f, setF] = useState(params.get('f') ?? 'all');
  const [done, setDone] = useState<Payment | null>(null);
  const creating = params.get('new') === '1';

  useEffect(() => {
    setQ(params.get('q') ?? '');
    setF(params.get('f') ?? 'all');
  }, [params]);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setDone(null), 4000);
    return () => clearTimeout(t);
  }, [done]);

  const shown = useMemo(
    () =>
      payments.filter((p) => {
        if (f === 'in' && p.kind !== 'in') return false;
        if (f === 'out' && p.kind !== 'out') return false;
        if (f === 'waiting' && p.status !== 'waiting') return false;
        return !q || `${p.who} ${p.what} ${p.amount}`.toLowerCase().includes(q.toLowerCase());
      }),
    [payments, f, q],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.04em]">Payments</h1>
        <button type="button" onClick={() => setParams({ new: '1' })} className="inline-flex h-11 items-center gap-2 rounded-md bg-graphite px-4 text-[15px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> New payment
        </button>
      </div>

      <AnimatePresence>
        {done && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex items-center gap-2 rounded-lg bg-primary/25 px-4 py-3 text-[14px] font-medium text-[#1f5c30]">
            <Check className="size-4" />
            {done.status === 'waiting' ? `Sent for approval: ${money(done.amount)} to ${done.who}.` : `Paid ${money(done.amount)} to ${done.who}.`}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {filters.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setF(k)} className={`rounded-md px-3 py-1.5 text-[14px] font-medium transition-colors ${f === k ? 'bg-graphite text-white' : 'text-graphite/60 hover:bg-white'}`}>
              {l}
            </button>
          ))}
        </div>
        <label className="flex w-full items-center gap-2 border-b border-graphite/20 pb-1.5 sm:w-72">
          <Search className="size-4 text-graphite/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a name or amount" aria-label="Search payments" className="w-full bg-transparent text-[15px] outline-none placeholder:text-graphite/35" />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="text-[13px] font-medium text-graphite/50">
              <th className="py-3 pr-4 font-medium">Date</th>
              <th className="py-3 pr-4 font-medium">Who</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-t border-graphite/[0.08]">
                <td className="py-4 pr-4 font-ledger text-[13px] text-graphite/50">{shortDate(p.date)}</td>
                <td className="py-4 pr-4">
                  <span className="block text-[15px] font-medium">{p.who}</span>
                  <span className="block text-[13px] text-graphite/50">{p.what}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${statusStyle[p.status]}`}>{p.status}</span>
                </td>
                <td className={`py-4 text-right font-ledger text-[15px] tabular-nums ${p.kind === 'in' ? 'text-[#1f6b33]' : ''}`}>
                  {p.kind === 'in' ? '+' : '−'}
                  {money(p.amount, p.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="py-12 text-center text-graphite/50">Nothing matches.</p>}
      </div>

      <AnimatePresence>
        {creating && (
          <NewPayment
            key="new"
            to={params.get('to') ?? undefined}
            amount={params.get('amount') ? Number(params.get('amount')) : undefined}
            onClose={(p) => {
              setParams({});
              if (p) setDone(p);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
