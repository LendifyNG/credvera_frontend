import { ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, ChevronDown, Info, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { usePaymentLinks } from '../api';
import { AddMoney, CURRENCIES } from './money';
import { PromoCard } from './published';
import { byCurrency, valueOf } from './requests';
import { kindOf, money, settled, shortDate, type Payment } from './model';
import { useBalances, useNairaTotal, usePayments, useSession } from './data';

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
 * Naira in and out for a run of days. Other currencies are left out rather
 * than converted: there's no rate to convert them at that isn't a guess.
 */
function sums(payments: Payment[], from: number, to: number) {
  let inflow = 0;
  let outflow = 0;
  for (const p of payments) {
    const d = daysAgo(p.date);
    if (d < from || d > to || !settled(p) || p.currency !== 'NGN') continue;
    if (p.kind === 'in') inflow += p.amount;
    else outflow += p.amount;
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

const panel = 'rounded-2xl border border-graphite/10 bg-white';
const tile = 'rounded-xl bg-[#f5f4ef] p-5';

/**
 * Home: what money is available, what needs attention and what is happening
 * to payments in progress, set out in a few calm panels.
 */
export default function Today() {
  const navigate = useNavigate();
  const { convert } = useOutletContext<{ convert: () => void }>();
  const session = useSession();
  const { balances } = useBalances();
  const { payments } = usePayments();
  const links = usePaymentLinks();
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<'posted' | 'pending'>('posted');

  const moving = payments.filter((p) => p.status === 'pending');
  const failed = payments.filter((p) => p.status === 'failed' && daysAgo(p.date) < 7);
  const unpaid = (links.data ?? []).filter((l) => l.status === 'pending');
  const done30 = payments.filter((p) => settled(p) && daysAgo(p.date) < 30).length;
  const others = CURRENCIES.filter((c) => c.code !== 'NGN' && balances[c.code] > 0);
  const estimate = useNairaTotal();
  const allIn = others.length > 0 && estimate.priced;
  const week = useMemo(() => sums(payments, 0, 6), [payments]);
  const lastWeek = useMemo(() => sums(payments, 7, 13), [payments]);
  const rows = (tab === 'posted' ? payments.filter(settled) : payments.filter((p) => !settled(p))).slice(0, 6);

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
                  { label: 'Pay someone', hint: 'To any Nigerian bank', icon: ArrowUpRight, go: () => navigate('/business/app/pay') },
                  { label: 'Convert', hint: 'Between your currencies', icon: ArrowLeftRight, go: convert },
                  { label: 'Get paid', hint: 'Send an invoice with a link', icon: ArrowDownLeft, go: () => navigate('/business/app/invoices?new=1') },
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

      <PromoCard />

      {/* Cash and this week */}
      <section className={`${panel} relative mt-6 overflow-hidden`}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(rgba(20,28,23,0.07)_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="relative grid xl:grid-cols-[1fr_2fr]">
          <div className="border-b border-graphite/10 p-6 xl:border-b-0 xl:border-r">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Cash</h2>
              {allIn && <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12px] font-medium text-graphite/60">All currencies</span>}
            </div>
            <div className={`${tile} mt-5`}>
              <p className="text-[14px] font-medium text-graphite/70">{allIn ? 'Estimated total in NGN' : 'Naira balance'}</p>
              <p className="mt-2 font-ledger text-[clamp(1.9rem,3vw,2.4rem)] font-semibold leading-none tracking-[-0.03em] text-[#1f6b33]">{money(allIn ? estimate.total : balances.NGN)}</p>
              <p className="mt-5 flex gap-2 text-[13px] leading-relaxed text-graphite/55">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>
                  {allIn
                    ? `Your balances in naira at today’s reference rate: ${money(balances.NGN)} plus ${others.map((c) => money(balances[c.code], c.code)).join(', ')}.`
                    : others.length
                      ? `Plus ${others.map((c) => money(balances[c.code], c.code)).join(', ')}, kept in their own currencies.`
                      : 'Available to pay out now.'}
                </span>
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">This week</h2>
              <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12px] font-medium text-graphite/60">Last 7 days · naira</span>
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
        {/* Payments: what's moving, and what needs a look */}
        <section className={`${panel} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Payments</h2>
            <Link to="/business/app/pay" className="inline-flex h-9 items-center gap-2 rounded-lg border border-graphite/15 px-3 text-[14px] font-semibold hover:border-graphite/30">
              <Plus className="size-4" /> Pay someone
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 divide-x divide-graphite/10">
            {[
              { label: 'In progress', n: moving.length },
              { label: 'Done in 30 days', n: done30 },
            ].map((s, i) => (
              <Link key={s.label} to="/business/app/payments" className={`group block ${i ? 'pl-4' : 'pr-4'}`}>
                <p className="text-[12.5px] font-medium text-graphite/50">{s.label}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-ledger text-[26px] font-semibold">{s.n}</span>
                  <span className="text-[13px] text-graphite/55">{s.n === 1 ? 'payment' : 'payments'}</span>
                  <ArrowRight className="size-3.5 text-graphite/30 transition-transform group-hover:translate-x-0.5 group-hover:text-graphite" />
                </p>
              </Link>
            ))}
          </div>

          {unpaid.length > 0 && (
            <Link to="/business/app/invoices" className="mt-5 flex items-center gap-3 rounded-xl border border-[#ecdcae] bg-[#fbf5e6] px-4 py-3 text-[14px]">
              <span className="size-1.5 rounded-full bg-[#e0a526]" />
              <span className="flex-1">
                <span className="font-semibold">{unpaid.length === 1 ? 'One invoice is' : `${unpaid.length} invoices are`} waiting to be paid</span>{' '}
                <span className="text-graphite/60">· {byCurrency(unpaid.map((l) => ({ currency: l.currency, value: valueOf(l) })))} owed to you</span>
              </span>
              <ArrowRight className="size-4 text-graphite/40" />
            </Link>
          )}
          {failed.map((p) => (
            <Link key={p.id} to={`/business/app/payments?q=${encodeURIComponent(p.who)}`} className="mt-5 flex items-center gap-3 rounded-xl border border-[#f0d3c5] bg-[#fcf1ec] px-4 py-3 text-[14px]">
              <span className="size-1.5 rounded-full bg-[#c4542a]" />
              <span className="flex-1">
                <span className="font-semibold">{p.who}</span> <span className="text-graphite/60">didn’t go through{p.note ? `: ${p.note}` : ''}</span>
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
                  <span className="mt-2 flex justify-between text-[12.5px] text-graphite/50">
                    <span>With the bank</span>
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
                        {p.kind === 'in' ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                      </span>
                      <span className="font-medium">{p.who}</span>
                    </span>
                  </td>
                  <td className={`whitespace-nowrap py-3 pr-4 text-right font-ledger font-medium ${p.kind === 'in' ? 'text-[#1f6b33]' : ''}`}>
                    {p.kind === 'in' ? '+' : '−'}
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
