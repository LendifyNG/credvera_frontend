import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Check, Copy, Download, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { CURRENCIES } from './money';
import {
  kindOf,
  money,
  RATES,
  reference,
  settled,
  shortDate,
  STATUS,
  TRANSFER_FEE,
  useDash,
  type Currency,
  type Payment,
} from './store';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;

const TABS = [
  ['all', 'All'],
  ['in', 'Money in'],
  ['out', 'Money out'],
  ['pending', 'Pending'],
] as const;
const PERIODS = [
  ['7', 'Last 7 days'],
  ['30', 'Last 30 days'],
  ['90', 'Last 90 days'],
  ['all', 'All time'],
] as const;
const TYPES = ['Transfer', 'Transfer in', 'Invoice', 'Payment link', 'Bill', 'Card payment', 'Payment abroad', 'Salary', 'Conversion'];

function Icon({ p, size = 'size-7' }: { p: Payment; size?: string }) {
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-full border border-graphite/15`}>
      {p.internal ? <ArrowLeftRight className="size-3.5" /> : p.kind === 'in' ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
    </span>
  );
}

const signed = (p: Payment) => `${p.internal ? '' : p.kind === 'in' ? '+' : '−'}${money(p.amount, p.currency)}`;

/** A payment's story so far, step by step. */
function steps(p: Payment): { label: string; state: 'done' | 'now' | 'next'; note?: string }[] {
  if (p.internal) return [{ label: 'Converted at today’s rate', state: 'done' }];
  if (p.kind === 'in') return [{ label: `Received from ${p.who}`, state: 'done' }];
  if (p.status === 'failed') return [{ label: 'Tried', state: 'done' }, { label: 'Declined', state: 'now', note: p.note }];
  if (p.status === 'pending')
    return [
      { label: 'Sent', state: 'done' },
      { label: 'Processing', state: 'now', note: 'Usually a few minutes' },
      { label: /^card/i.test(p.what) ? 'Settled' : 'Arrived', state: 'next' },
    ];
  if (p.status === 'in transit')
    return [
      { label: 'Sent', state: 'done' },
      { label: 'With the receiving bank', state: 'now', note: 'Usually one or two working days' },
      { label: 'Delivered', state: 'next' },
    ];
  if (p.requestedBy) {
    const asked = { label: `Asked for by ${p.requestedBy}`, state: 'done' as const, note: p.reason };
    if (p.status === 'waiting') return [asked, { label: 'Waiting for a second approval', state: 'now' }, { label: 'Paid', state: 'next' }];
    if (p.status === 'sent back') return [asked, { label: 'Sent back', state: 'now', note: p.note }];
    return [asked, { label: 'Approved', state: 'done' }, { label: 'Paid', state: 'done' }];
  }
  return [
    { label: 'Created', state: 'done' },
    { label: 'Paid', state: 'done' },
  ];
}

/** One transaction in full, in a panel from the right. */
function Detail({ p, onClose }: { p: Payment; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const ref = reference(p);
  const rows: [string, string][] = [
    ['Reference', ref],
    ['Date', new Date(p.date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
    ['Account', CURRENCIES.find((c) => c.code === p.currency)!.name],
    ['Type', kindOf(p)],
    ['Details', p.what],
    ...(p.kind === 'out' && p.currency === 'NGN' && !p.internal ? ([['Fee', money(TRANSFER_FEE)]] as [string, string][]) : []),
  ];
  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`${p.who}, ${signed(p)}`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
          <p className="text-[15px] font-semibold">Transaction</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 pt-7">
          <div className="flex items-center gap-3">
            <Icon p={p} size="size-10" />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold">{p.who}</p>
              <p className="text-[13px] text-graphite/50">{kindOf(p)}</p>
            </div>
          </div>
          <p className={`mt-6 font-ledger text-[34px] font-semibold leading-none tracking-[-0.03em] ${p.kind === 'in' && !p.internal ? 'text-[#1f6b33]' : ''}`}>{signed(p)}</p>
          {p.currency !== 'NGN' && <p className="mt-2 text-[13px] text-graphite/50">About {money(p.amount * RATES[p.currency])} at today’s rate</p>}
          <span className={`mt-4 inline-block rounded-md px-2 py-0.5 text-[12.5px] font-medium ${p.internal ? STATUS.paid.tone : STATUS[p.status].tone}`}>
            {p.internal ? 'Converted' : STATUS[p.status].label}
          </span>
        </div>

        {/* What happened, in order */}
        <ol className="mx-6 mt-7 space-y-4 border-l border-graphite/15 pl-5">
          {steps(p).map((s) => (
            <li key={s.label} className="relative">
              <span
                className={`absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-white ${s.state === 'done' ? 'bg-[#1f6b33]' : s.state === 'now' ? 'bg-[#e0a526]' : 'bg-graphite/15'}`}
              />
              <p className={`text-[14.5px] ${s.state === 'next' ? 'text-graphite/40' : 'font-medium'}`}>{s.label}</p>
              {s.note && <p className="text-[13px] text-graphite/50">{s.note}</p>}
            </li>
          ))}
        </ol>

        <dl className="mx-6 mt-8 divide-y divide-graphite/[0.08] border-y border-graphite/10">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-3 text-[14px]">
              <dt className="shrink-0 text-graphite/50">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex gap-2 px-6 py-6">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(ref).catch(() => {});
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-graphite/15 text-[14px] font-semibold hover:border-graphite/30"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy reference'}
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-graphite text-[14px] font-semibold text-white hover:bg-black">
            <Download className="size-4" /> Receipt
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/** Downloads what's shown as a spreadsheet file. */
function exportCsv(rows: Payment[]) {
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    ['Date', 'Reference', 'To or from', 'Details', 'Type', 'Account', 'Amount', 'Status'].join(','),
    ...rows.map((p) =>
      [new Date(p.date).toISOString().slice(0, 10), reference(p), q(p.who), q(p.what), kindOf(p), p.currency, (p.kind === 'in' ? '' : '-') + p.amount.toFixed(2), p.internal ? 'Converted' : STATUS[p.status].label].join(','),
    ),
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `credvera-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const PAGE = 25;

/** Every transaction, filtered and searchable, each one a click from its full story. */
export default function Payments() {
  const { payments, session } = useDash();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [tab, setTab] = useState(params.get('f') ?? 'all');
  const [account, setAccount] = useState<'all' | Currency>((params.get('a') as Currency | null) ?? 'all');
  const [type, setType] = useState('all');
  const [period, setPeriod] = useState('30');
  const [open, setOpen] = useState<Payment | null>(null);
  const [shownCount, setShownCount] = useState(PAGE);
  const creating = params.get('new') === '1';

  useEffect(() => {
    setQ(params.get('q') ?? '');
    setTab(params.get('f') ?? 'all');
    if (params.get('a')) setAccount(params.get('a') as Currency);
  }, [params]);

  const shown = useMemo(() => {
    const since = period === 'all' ? 0 : Date.now() - Number(period) * DAY;
    return payments.filter((p) => {
      if (new Date(p.date).getTime() < since) return false;
      if (tab === 'in' && (p.kind !== 'in' || p.internal)) return false;
      if (tab === 'out' && (p.kind !== 'out' || p.internal)) return false;
      if (tab === 'pending' && settled(p)) return false;
      if (account !== 'all' && p.currency !== account) return false;
      if (type !== 'all' && kindOf(p) !== type) return false;
      return !q || `${p.who} ${p.what} ${p.amount} ${reference(p)}`.toLowerCase().includes(q.toLowerCase());
    });
  }, [payments, tab, account, type, period, q]);

  // The totals for exactly what's shown, in naira, conversions left out.
  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const p of shown) {
      if (p.internal || !settled(p)) continue;
      if (p.kind === 'in') inflow += p.amount * RATES[p.currency];
      else outflow += p.amount * RATES[p.currency];
    }
    return { inflow, outflow };
  }, [shown]);

  // Older links opened a payment here; it has its own page now.
  if (creating) {
    const q = new URLSearchParams();
    if (params.get('to')) q.set('to', params.get('to')!);
    if (params.get('amount')) q.set('amount', params.get('amount')!);
    return <Navigate to={`/business/app/pay${q.size ? `?${q}` : ''}`} replace />;
  }

  const select = 'h-9 rounded-lg border border-graphite/15 bg-white px-2.5 text-[13.5px] font-medium outline-none hover:border-graphite/30';

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Transactions</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Every payment in and out, with its full story.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => exportCsv(shown)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold hover:border-graphite/30">
            <Download className="size-4" /> Export
          </button>
          <Link to="/business/app/pay" className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
            <Plus className="size-4" /> Pay someone
          </Link>
        </div>
      </div>

      {/* Totals for what's shown */}
      <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-graphite/10">
        {[
          { label: 'Money in', value: `+${money(totals.inflow)}`, tone: 'text-[#1f6b33]' },
          { label: 'Money out', value: `−${money(totals.outflow)}`, tone: '' },
          { label: 'Net cash movement', value: `${totals.inflow - totals.outflow >= 0 ? '+' : '−'}${money(Math.abs(totals.inflow - totals.outflow))}`, tone: '' },
        ].map((t, i) => (
          <div key={t.label} className={`px-6 py-5 ${i ? 'border-t border-graphite/10 sm:border-t-0' : ''}`}>
            <p className="text-[13px] font-medium text-graphite/55">{t.label}</p>
            <p className={`mt-1 font-ledger text-[22px] font-semibold tracking-[-0.02em] ${t.tone}`}>{t.value}</p>
          </div>
        ))}
      </section>
      <p className="mt-2 text-[12.5px] text-graphite/45">For what’s shown below, in naira at today’s rate. Conversions between your currencies aren’t counted.</p>

      <section className="mt-6 rounded-2xl border border-graphite/10 bg-white">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-graphite/10 p-4">
          <div className="flex rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium">
            {TABS.map(([k, l]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-md px-3 py-1 ${tab === k ? 'bg-white shadow-sm' : 'text-graphite/55 hover:text-graphite'}`}>
                {l}
              </button>
            ))}
          </div>
          <select value={account} onChange={(e) => setAccount(e.target.value as 'all' | Currency)} className={select} aria-label="Account">
            <option value="all">All accounts</option>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className={select} aria-label="Type">
            <option value="all">All types</option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className={select} aria-label="Period">
            {PERIODS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <label className="ml-auto flex h-9 w-full items-center gap-2 rounded-lg border border-graphite/15 px-3 focus-within:border-graphite/40 sm:w-64">
            <Search className="size-4 text-graphite/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, amount or reference" aria-label="Search transactions" className="w-full bg-transparent text-[14px] outline-none placeholder:text-graphite/35" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                <th className="py-3 pl-5 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">To or from</th>
                <th className="py-3 pr-4 text-right font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Type</th>
                <th className="hidden py-3 pr-4 font-medium xl:table-cell">Account</th>
                <th className="py-3 pr-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.slice(0, shownCount).map((p) => (
                <tr
                  key={p.id}
                  tabIndex={0}
                  onClick={() => setOpen(p)}
                  onKeyDown={(e) => e.key === 'Enter' && setOpen(p)}
                  className="cursor-pointer border-b border-graphite/[0.06] outline-none transition-colors last:border-0 hover:bg-[#faf9f5] focus-visible:bg-[#faf9f5]"
                >
                  <td className="whitespace-nowrap py-3.5 pl-5 pr-4 text-graphite/60">{shortDate(p.date)}</td>
                  <td className="py-3.5 pr-4">
                    <span className="flex items-center gap-3">
                      <Icon p={p} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{p.who}</span>
                        <span className="block truncate text-[12.5px] text-graphite/45">{p.what}</span>
                      </span>
                    </span>
                  </td>
                  <td className={`whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium ${p.kind === 'in' && !p.internal ? 'text-[#1f6b33]' : ''}`}>{signed(p)}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-graphite/65">{kindOf(p)}</td>
                  <td className="hidden whitespace-nowrap py-3.5 pr-4 text-graphite/65 xl:table-cell">{CURRENCIES.find((c) => c.code === p.currency)!.name}</td>
                  <td className="whitespace-nowrap py-3.5 pr-5">
                    <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${p.internal ? STATUS.paid.tone : STATUS[p.status].tone}`}>{p.internal ? 'Converted' : STATUS[p.status].short}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-[15px] font-medium">Nothing matches</p>
              <p className="mt-1 text-[14px] text-graphite/50">Try another period, or clear the search.</p>
            </div>
          )}
        </div>
        {shown.length > shownCount && (
          <div className="border-t border-graphite/10 p-4 text-center">
            <button type="button" onClick={() => setShownCount((n) => n + PAGE)} className="text-[14px] font-semibold text-graphite/70 hover:text-graphite">
              Show more ({shown.length - shownCount} left)
            </button>
          </div>
        )}
      </section>

      <AnimatePresence>
        {open && <Detail key={open.id} p={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}
