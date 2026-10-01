import { ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, ChevronDown, FileSearch, Info, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { AddMoney, CURRENCIES } from './money';
import { invoiceTotals, isOverdue, kindOf, money, RATES, settled, shortDate, useDash, type Payment } from './store';
import { useBalances, usePayments, useSession } from './data';

const DAY = 86400000;

/** Days since a date, counting today as 0. */
function daysAgo(iso: string) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - d.getTime()) / DAY);
}


/**
 * Money in and out in naira terms for a run of days. Conversions between the
 * business's own currencies are left out unless asked for, and then count on
 * both sides, since nothing came in or went out of the business.
 */
function sums(payments: Payment[], from: number, to: number, withConversions: boolean) {
  let inflow = 0;
  let outflow = 0;
  for (const p of payments) {
    const d = daysAgo(p.date);
    if (d < from || d > to || !settled(p)) continue;
    const ngn = p.amount * RATES[p.currency];
    if (p.internal) {
      if (withConversions) {
        inflow += ngn;
        outflow += ngn;
      }
    } else if (p.kind === 'in') inflow += ngn;
    else outflow += ngn;
  }
  return { inflow, outflow, net: inflow - outflow };
}

// Short naira amounts for the chips: ₦3.9M, ₦420k.
const short = (n: number) => {
  const a = Math.abs(n);
  return a >= 1e6 ? `₦${(a / 1e6).toFixed(1).replace(/\.0$/, '')}M` : a >= 1e3 ? `₦${Math.round(a / 1e3)}k` : `₦${Math.round(a)}`;
};

/**
 * "vs last week", as a quiet chip showing how much it moved. Green is good
 * news: more money in, or less money out.
 */
function Change({ now, before, upIsGood = true }: { now: number; before: number; upIsGood?: boolean }) {
  const diff = now - before;
  if (Math.abs(diff) < 1) return <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12px] text-graphite/60">No change</span>;
  const good = diff > 0 === upIsGood;
  return (
    <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${good ? 'bg-[#e3f1e0] text-[#1f6b33]' : 'bg-[#f6e7e0] text-[#9a3a17]'}`}>
      {diff > 0 ? '+' : '−'}
      {short(diff)}
    </span>
  );
}

/** Two short bars: last week beside this week. */
function Compare({ before, now, tone }: { before: number; now: number; tone: string }) {
  const max = Math.max(before, now, 1);
  const labels = ['Last week', 'This week'];
  return (
    <div className="flex items-end gap-2">
      {[before, now].map((v, i) => (
        <div key={i} className="flex-1">
          <div className="flex h-9 items-end">
            <div className="w-full rounded-sm" style={{ height: `${Math.max(6, (v / max) * 100)}%`, backgroundColor: i ? tone : '#d9d7ce' }} />
          </div>
          <p className="mt-1.5 text-[11px] text-graphite/45">{labels[i]}</p>
        </div>
      ))}
    </div>
  );
}


const STAGES = ['Sent', 'With the receiving bank', 'Delivered'];

const panel = 'rounded-2xl border border-graphite/10 bg-white';
const tile = 'rounded-xl bg-[#f5f4ef] p-5';

/**
 * Home: what money is available, what needs attention and what is happening
 * to payments in progress, set out in a few calm panels.
 */
export default function Today() {
  const navigate = useNavigate();
  const { convert } = useOutletContext<{ convert: () => void }>();
  const { documents, invoices } = useDash();
  const session = useSession();
  const { balances } = useBalances();
  const { payments } = usePayments();
  const [adding, setAdding] = useState(false);
  const [withConversions, setWithConversions] = useState(false);
  const [tab, setTab] = useState<'posted' | 'pending'>('posted');
  const [tip, setTip] = useState(() => {
    try {
      return localStorage.getItem('credvera.dash.tip') !== 'hidden';
    } catch {
      return true;
    }
  });

  const total = CURRENCIES.reduce((a, c) => a + balances[c.code] * RATES[c.code], 0);
  const waiting = payments.filter((p) => p.status === 'waiting');
  const moving = payments.filter((p) => p.status === 'in transit');
  const sentBack = payments.filter((p) => p.status === 'sent back');
  const lateInvoices = invoices.filter(isOverdue);
  const waitingTotal = waiting.reduce((a, p) => a + p.amount * RATES[p.currency], 0);
  const paid30 = payments.filter((p) => settled(p) && !p.internal && daysAgo(p.date) < 30).length;
  const week = useMemo(() => sums(payments, 0, 6, withConversions), [payments, withConversions]);
  const lastWeek = useMemo(() => sums(payments, 7, 13, withConversions), [payments, withConversions]);
  const rows = (tab === 'posted' ? payments.filter(settled) : payments.filter((p) => !settled(p))).slice(0, 6);

  const hideTip = () => {
    setTip(false);
    try {
      localStorage.setItem('credvera.dash.tip', 'hidden');
    } catch {
      // Stays hidden for this visit.
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Welcome back, {session?.person}</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Here’s where your money stands today.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Move money: its options on hover */}
          <div className="group relative">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold hover:border-graphite/30">
              Move money <ChevronDown className="size-4 text-graphite/50" />
            </button>
            <div className="invisible absolute right-0 top-full z-20 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="w-60 rounded-xl bg-white p-1.5 shadow-[0_20px_40px_-16px_rgba(20,28,23,0.35)] ring-1 ring-graphite/10">
                {[
                  { label: 'Pay someone', hint: 'In naira, or abroad', icon: ArrowUpRight, go: () => navigate('/business/app/pay') },
                  { label: 'Convert', hint: 'Between your currencies', icon: ArrowLeftRight, go: convert },
                  { label: 'Get paid', hint: 'See money coming in', icon: ArrowDownLeft, go: () => navigate('/business/app/payments?f=in') },
                ].map((m) => (
                  <button key={m.label} type="button" onClick={m.go} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#f5f4ef]">
                    <m.icon className="size-4 text-graphite/60" />
                    <span>
                      <span className="block text-[14px] font-medium">{m.label}</span>
                      <span className="block text-[12.5px] text-graphite/50">{m.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setAdding(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-[14px] font-semibold text-graphite hover:brightness-95">
            <Plus className="size-4" /> Add money
          </button>
        </div>
      </div>

      {/* Only while it matters */}
      {documents === 'checking' && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#ecdcae] bg-[#fbf5e6] px-4 py-3 text-[14px]">
          <FileSearch className="size-4 shrink-0 text-[#8a5a00]" />
          <p>
            <span className="font-semibold">We’re checking your documents.</span> <span className="text-graphite/60">Usually one or two working days; everything works meanwhile.</span>
          </p>
        </div>
      )}

      {/* Cash and this week */}
      <section className={`${panel} relative mt-6 overflow-hidden`}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(rgba(20,28,23,0.07)_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="relative grid xl:grid-cols-[1fr_2fr]">
          <div className="border-b border-graphite/10 p-6 xl:border-b-0 xl:border-r">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Cash</h2>
              <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12px] font-medium text-graphite/60">All currencies</span>
            </div>
            <div className={`${tile} mt-5`}>
              <p className="text-[14px] font-medium text-graphite/70">Estimated total in NGN</p>
              <p className="mt-2 font-ledger text-[clamp(1.9rem,3vw,2.4rem)] font-semibold leading-none tracking-[-0.03em] text-[#1f6b33]">{money(total)}</p>
              <p className="mt-5 flex gap-2 text-[13px] leading-relaxed text-graphite/55">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>
                  Your four balances in naira at today’s rate.
                  {waiting.length ? ` ${money(waitingTotal)} waiting for approval leaves when it’s approved.` : ''}
                </span>
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">This week</h2>
              <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12px] font-medium text-graphite/60">Last 7 days</span>
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-[13px] text-graphite/60">
                <button
                  type="button"
                  role="switch"
                  aria-checked={withConversions}
                  onClick={() => setWithConversions((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${withConversions ? 'bg-graphite' : 'bg-graphite/20'}`}
                >
                  <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${withConversions ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
                Include conversions
              </label>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Money in', icon: ArrowDownLeft, now: week.inflow, before: lastWeek.inflow, tone: '#7fde80', colour: 'text-[#1f6b33]' },
                { label: 'Money out', icon: ArrowUpRight, now: week.outflow, before: lastWeek.outflow, tone: '#e0906b', colour: '' },
              ].map((t) => (
                <div key={t.label} className={tile}>
                  <p className="flex items-center gap-2 text-[14px] font-medium text-graphite/70">
                    <span className="grid size-6 place-items-center rounded-full bg-white">
                      <t.icon className="size-3.5" />
                    </span>
                    {t.label}
                  </p>
                  <p className={`mt-5 font-ledger text-[22px] font-semibold tracking-[-0.02em] ${t.colour}`}>{money(t.now)}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12.5px] text-graphite/50">
                    <Change now={t.now} before={t.before} upIsGood={t.label === 'Money in'} /> vs last week
                  </p>
                  <div className="mt-4">
                    <Compare before={t.before} now={t.now} tone={t.tone} />
                  </div>
                </div>
              ))}
              <div className={`${tile} sm:col-span-2`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-graphite/70">Net cash movement</p>
                    <p className="text-[12.5px] text-graphite/45">Money in minus money out. Not profit.</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-ledger text-[22px] font-semibold tracking-[-0.02em] ${week.net >= 0 ? 'text-[#1f6b33]' : ''}`}>
                      {week.net >= 0 ? '+' : '−'}
                      {money(Math.abs(week.net))}
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-2 text-[12.5px] text-graphite/50">
                      <Change now={week.net} before={lastWeek.net} /> vs last week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Payments: what's waiting and what's moving */}
        <section className={`${panel} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Payments</h2>
            <Link to="/business/app/pay" className="inline-flex h-9 items-center gap-2 rounded-lg border border-graphite/15 px-3 text-[14px] font-semibold hover:border-graphite/30">
              <Plus className="size-4" /> Pay someone
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-3 divide-x divide-graphite/10">
            {[
              { label: 'To approve', n: waiting.length, to: '/business/app/approvals', alert: waiting.length > 0 },
              { label: 'In progress', n: moving.length, to: '/business/app/payments' },
              { label: 'Paid in 30 days', n: paid30, to: '/business/app/payments' },
            ].map((s, i) => (
              <Link key={s.label} to={s.to} className={`group block ${i ? 'pl-4' : 'pr-4'} ${i === 1 ? 'pr-4' : ''}`}>
                <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-graphite/50">
                  {s.alert && <span className="size-1.5 rounded-full bg-[#e0a526]" />}
                  {s.label}
                </p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-ledger text-[26px] font-semibold">{s.n}</span>
                  <span className="text-[13px] text-graphite/55">{s.n === 1 ? 'payment' : 'payments'}</span>
                  <ArrowRight className="size-3.5 text-graphite/30 transition-transform group-hover:translate-x-0.5 group-hover:text-graphite" />
                </p>
              </Link>
            ))}
          </div>

          {lateInvoices.length > 0 && (
            <Link to="/business/app/invoices?f=overdue" className="mt-5 flex items-center gap-3 rounded-xl border border-[#f0d3c5] bg-[#fcf1ec] px-4 py-3 text-[14px]">
              <span className="size-1.5 rounded-full bg-[#c4542a]" />
              <span className="flex-1">
                <span className="font-semibold">
                  {lateInvoices.length === 1 ? 'One invoice is' : `${lateInvoices.length} invoices are`} overdue
                </span>{' '}
                <span className="text-graphite/60">· {money(lateInvoices.reduce((a, i) => a + invoiceTotals(i).total * RATES[i.currency], 0))} owed to you</span>
              </span>
              <ArrowRight className="size-4 text-graphite/40" />
            </Link>
          )}
          {sentBack.map((p) => (
            <Link key={p.id} to={`/business/app/payments?q=${encodeURIComponent(p.who)}`} className="mt-5 flex items-center gap-3 rounded-xl border border-[#f0d3c5] bg-[#fcf1ec] px-4 py-3 text-[14px]">
              <span className="size-1.5 rounded-full bg-[#c4542a]" />
              <span className="flex-1">
                <span className="font-semibold">{p.who}</span> <span className="text-graphite/60">was sent back{p.note ? `: ${p.note}` : ''}</span>
              </span>
              <ArrowRight className="size-4 text-graphite/40" />
            </Link>
          ))}

          <div className="mt-6 border-t border-graphite/10 pt-2">
            {moving.length ? (
              moving.slice(0, 2).map((p) => (
                <Link key={p.id} to={`/business/app/payments?q=${encodeURIComponent(p.who)}`} className="block border-b border-graphite/[0.06] py-4 last:border-0">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="min-w-0 truncate text-[14.5px] font-medium">{p.who}</span>
                    <span className="shrink-0 font-ledger text-[14px] font-semibold">{money(p.amount, p.currency)}</span>
                  </span>
                  <span className="mt-3 flex gap-1.5" aria-label={`Stage: ${STAGES[1]}`}>
                    {STAGES.map((s, i) => (
                      <span key={s} className={`h-1 flex-1 rounded-full ${i < 2 ? 'bg-[#1f6b33]' : 'bg-graphite/10'}`} />
                    ))}
                  </span>
                  <span className="mt-2 flex justify-between text-[12.5px] text-graphite/50">
                    <span>{STAGES[1]}</span>
                    <span>Sent {shortDate(p.date)}</span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-5 text-[14px] text-graphite/50">Nothing on its way right now.</p>
            )}
          </div>
        </section>

        {/* Accounts */}
        <section className={`${panel} flex flex-col p-6`}>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Accounts</h2>
          <ul className="mt-4 flex-1 divide-y divide-graphite/[0.08]">
            {CURRENCIES.map((c) => (
              <li key={c.code} className="flex items-center gap-3 py-3.5">
                <img src={`https://flagcdn.com/w80/${c.flag}.png`} alt="" className="size-8 rounded-full object-cover ring-1 ring-graphite/10" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-medium">{c.name}</span>
                  <span className="block text-[12.5px] text-graphite/50">{c.code} account</span>
                </span>
                <span className="font-ledger text-[15px] font-semibold">{money(balances[c.code], c.code)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setAdding(true)} className="inline-flex h-9 items-center rounded-lg border border-graphite/15 px-3 text-[14px] font-semibold hover:border-graphite/30">
              Add money
            </button>
            <button type="button" onClick={convert} className="inline-flex h-9 items-center rounded-lg px-3 text-[14px] font-semibold text-graphite/70 hover:bg-graphite/5">
              Convert
            </button>
          </div>
        </section>
      </div>

      {/* One tip, with a photo, until it's dismissed */}
      {tip && (
        <section className="mt-6 flex items-center gap-5 overflow-hidden rounded-2xl border border-graphite/10 bg-[#efeee7] pr-4">
          <img src="/video/port-night.jpg" alt="Containers at a port at night" className="hidden h-24 w-36 object-cover sm:block" />
          <p className="flex-1 py-4 pl-5 text-[15px] leading-snug sm:pl-0">
            <span className="font-semibold">Paying a supplier abroad?</span> <span className="text-graphite/65">Send it from your dollar, pound or euro balance, and follow it until it lands.</span>
          </p>
          <Link to="/business/app/pay" className="hidden h-9 shrink-0 items-center rounded-lg bg-white px-3 text-[14px] font-semibold ring-1 ring-graphite/10 hover:ring-graphite/30 sm:inline-flex">
            Pay a supplier
          </Link>
          <button type="button" onClick={hideTip} aria-label="Hide this tip" className="shrink-0 p-1 text-graphite/40 hover:text-graphite">
            <X className="size-4" />
          </button>
        </section>
      )}

      {/* Recent transactions */}
      <section className={`${panel} mt-6 p-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Recent transactions</h2>
          <div className="flex rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium">
            {(['posted', 'pending'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-3 py-1 capitalize ${tab === t ? 'bg-white shadow-sm' : 'text-graphite/55'}`}>
                {t}
              </button>
            ))}
          </div>
          <Link to="/business/app/payments" className="ml-auto text-[14px] font-semibold text-graphite/60 hover:text-graphite">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                <th className="py-2.5 pr-4 font-medium">Date</th>
                <th className="py-2.5 pr-4 font-medium">To or from</th>
                <th className="py-2.5 pr-4 text-right font-medium">Amount</th>
                <th className="py-2.5 pr-4 font-medium">Type</th>
                <th className="py-2.5 font-medium">Account</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-graphite/[0.06] last:border-0">
                  <td className="whitespace-nowrap py-3 pr-4 text-graphite/60">{shortDate(p.date)}</td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-graphite/15">
                        {p.internal ? <ArrowLeftRight className="size-3.5" /> : p.kind === 'in' ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                      </span>
                      <span className="font-medium">{p.who}</span>
                    </span>
                  </td>
                  <td className={`whitespace-nowrap py-3 pr-4 text-right font-ledger font-medium ${p.kind === 'in' && !p.internal ? 'text-[#1f6b33]' : ''}`}>
                    {p.internal ? '' : p.kind === 'in' ? '+' : '−'}
                    {money(p.amount, p.currency)}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-graphite/65">
                    {kindOf(p)}
                    {tab === 'pending' && <span className="ml-2 rounded-md bg-[#efeee7] px-1.5 py-0.5 text-[11.5px] capitalize text-graphite/60">{p.status}</span>}
                  </td>
                  <td className="whitespace-nowrap py-3 text-graphite/65">{CURRENCIES.find((c) => c.code === p.currency)!.name}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-graphite/50">
                    Nothing {tab} right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddMoney open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
