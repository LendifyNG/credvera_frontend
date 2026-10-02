import { motion } from 'framer-motion';
import { Check, Download, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
import { CURRENCIES } from './money';
import { usePaymentLinks } from '../api';
import { kindOf, money, reference, settled, shortDate, type Currency, type Payment } from './model';
import { useBalances, usePayInAccount, usePayments, useSession } from './data';
import { OfficialStatements } from './service';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors focus:border-graphite/50';
const label = 'mb-1.5 block text-[13px] font-medium text-graphite/60';
const secondary = 'inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30';

/** A signed amount for the account's own currency: in adds, out takes away. */
const signedIn = (p: Payment, c: Currency) => (p.currency !== c ? 0 : p.kind === 'in' ? p.amount : -p.amount);

function download(name: string, rows: (string | number)[][]) {
  const q = (v: string | number) => (typeof v === 'number' ? v.toFixed(2) : `"${v.replace(/"/g, '""')}"`);
  const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(q).join(',')).join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Statements ---------- */

const PERIODS = [
  ['7', 'Last 7 days'],
  ['30', 'Last 30 days'],
  ['month', 'This month'],
  ['90', 'Last 90 days'],
] as const;

function Statements() {
  const { payments } = usePayments();
  const { balances } = useBalances();
  const session = useSession();
  const [currency, setCurrency] = useState<Currency>('NGN');
  const payIn = usePayInAccount(currency);
  const [period, setPeriod] = useState<(typeof PERIODS)[number][0]>('30');
  const from = useMemo(() => {
    if (period === 'month') {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    }
    return new Date().setHours(0, 0, 0, 0) - (Number(period) - 1) * DAY;
  }, [period]);

  // Settled movements in this account, oldest first, with a running balance
  // worked back from today's.
  const rows = useMemo(() => {
    const moves = payments.filter((p) => p.currency === currency && settled(p));
    const after = moves.filter((p) => new Date(p.date).getTime() >= from);
    const opening = balances[currency] - after.reduce((a, p) => a + signedIn(p, currency), 0);
    let run = opening;
    const lines = [...after]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => {
        run += signedIn(p, currency);
        return { p, balance: run };
      });
    return { opening, lines, closing: balances[currency] };
  }, [payments, balances, currency, from]);

  const name = CURRENCIES.find((c) => c.code === currency)!.name;
  const csv = () =>
    download(`credvera-${currency.toLowerCase()}-statement.csv`, [
      ['Date', 'Details', 'Money in', 'Money out', 'Balance'],
      ['', 'Opening balance', '', '', rows.opening],
      ...rows.lines.map(({ p, balance }) => {
        const v = signedIn(p, currency);
        return [new Date(p.date).toISOString().slice(0, 10), `${p.who} · ${p.what}`, v > 0 ? v : '', v < 0 ? -v : '', balance];
      }),
      ['', 'Closing balance', '', '', rows.closing],
    ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <section className={`${panel} h-fit space-y-4 p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Statement</h2>
        <label className="block">
          <span className={label}>Account</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={field}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Period</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)} className={field}>
            {PERIODS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={csv} className={secondary}>
            <Download className="size-4" /> Spreadsheet
          </button>
          <button type="button" onClick={() => window.print()} className={secondary}>
            <Printer className="size-4" /> Print
          </button>
        </div>
      </section>

      {/* The statement itself, on paper */}
      <article className="rounded-sm bg-white p-8 text-[13.5px] shadow-[0_1px_2px_rgba(20,28,23,0.08),0_12px_32px_-16px_rgba(20,28,23,0.25)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <img src={logoDark} alt="Credvera" className="h-5 w-auto opacity-80" />
            <p className="mt-4 text-[15px] font-semibold">{payIn.account?.accountName ?? session?.business}</p>
            <p className="text-graphite/55">
              {name} account{payIn.ready && payIn.account ? ` ${payIn.account.accountNumber} · ${payIn.account.bankName}` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-semibold tracking-[-0.02em]">Statement</p>
            <p className="text-graphite/55">
              {shortDate(new Date(from).toISOString())} to {shortDate(new Date().toISOString())}
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-[#f5f4ef] p-4">
          <div>
            <p className="text-[12px] text-graphite/50">Opening balance</p>
            <p className="font-ledger font-semibold">{money(rows.opening, currency)}</p>
          </div>
          <div>
            <p className="text-[12px] text-graphite/50">Money in, out</p>
            <p className="font-ledger font-semibold">
              {rows.lines.filter((l) => signedIn(l.p, currency) > 0).length} · {rows.lines.filter((l) => signedIn(l.p, currency) < 0).length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-graphite/50">Closing balance</p>
            <p className="font-ledger font-semibold">{money(rows.closing, currency)}</p>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-graphite/15 text-left text-[12px] text-graphite/45">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Details</th>
                <th className="pb-2 text-right font-medium">In</th>
                <th className="pb-2 text-right font-medium">Out</th>
                <th className="pb-2 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.lines.map(({ p, balance }) => (
                <tr key={p.id} className="border-b border-graphite/[0.06]">
                  <td className="whitespace-nowrap py-2 pr-3 text-graphite/60">{shortDate(p.date)}</td>
                  <td className="py-2 pr-3">
                    {p.who} <span className="text-graphite/45">· {kindOf(p)}</span>
                  </td>
                  <td className="whitespace-nowrap py-2 text-right font-ledger text-[#1f6b33]">{signedIn(p, currency) > 0 ? money(signedIn(p, currency), currency) : ''}</td>
                  <td className="whitespace-nowrap py-2 text-right font-ledger">{signedIn(p, currency) < 0 ? money(-signedIn(p, currency), currency) : ''}</td>
                  <td className="whitespace-nowrap py-2 text-right font-ledger">{money(balance, currency)}</td>
                </tr>
              ))}
              {rows.lines.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-graphite/50">
                    Nothing moved in this account in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

/* ---------- Cash flow ---------- */

function CashFlow() {
  const { payments } = usePayments();
  const [hover, setHover] = useState<number | null>(null);
  const WEEKS = 8;
  // Weeks ending today, in naira. Other currencies are left out, not converted.
  const weeks = useMemo(() => {
    const end = new Date().setHours(23, 59, 59, 999);
    return Array.from({ length: WEEKS }, (_, i) => {
      const to = end - (WEEKS - 1 - i) * 7 * DAY;
      const from = to - 7 * DAY;
      let inflow = 0;
      let outflow = 0;
      for (const p of payments) {
        const t = new Date(p.date).getTime();
        if (!settled(p) || p.currency !== 'NGN' || t <= from || t > to) continue;
        if (p.kind === 'in') inflow += p.amount;
        else outflow += p.amount;
      }
      return { from, inflow, outflow };
    });
  }, [payments]);
  const byType = (kind: 'in' | 'out') => {
    const m = new Map<string, number>();
    const since = Date.now() - WEEKS * 7 * DAY;
    for (const p of payments) {
      if (!settled(p) || p.currency !== 'NGN' || p.kind !== kind || new Date(p.date).getTime() < since) continue;
      m.set(kindOf(p), (m.get(kindOf(p)) ?? 0) + p.amount);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const max = Math.max(1, ...weeks.flatMap((w) => [w.inflow, w.outflow]));
  const totalIn = weeks.reduce((a, w) => a + w.inflow, 0);
  const totalOut = weeks.reduce((a, w) => a + w.outflow, 0);
  const h = hover !== null ? weeks[hover]! : null;

  return (
    <div className="space-y-6">
      <section className={`${panel} p-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Cash flow, last 8 weeks</h2>
            <p className="text-[13.5px] text-graphite/55">Naira in and out. Cash movement, not profit; other currencies aren’t added in.</p>
          </div>
          <p className="text-[13px] text-graphite/55">
            {h ? (
              <>
                Week of {shortDate(new Date(h.from + DAY).toISOString())} · <span className="text-[#1f6b33]">+{money(h.inflow)}</span> · −{money(h.outflow)}
              </>
            ) : (
              <>
                <span className="text-[#1f6b33]">+{money(totalIn)}</span> in · −{money(totalOut)} out
              </>
            )}
          </p>
        </div>
        <div className="mt-6 flex h-48 items-end gap-3" onMouseLeave={() => setHover(null)} role="img" aria-label="Money in and out by week">
          {weeks.map((w, i) => (
            <div key={i} className="flex h-full flex-1 cursor-default flex-col justify-end gap-1" onMouseEnter={() => setHover(i)}>
              <div className="flex flex-1 items-end justify-center gap-1">
                <div className="w-1/3 rounded-t-sm bg-[#7fde80] transition-opacity" style={{ height: `${(w.inflow / max) * 100}%`, opacity: hover === null || hover === i ? 1 : 0.4 }} />
                <div className="w-1/3 rounded-t-sm bg-graphite/70 transition-opacity" style={{ height: `${(w.outflow / max) * 100}%`, opacity: hover === null || hover === i ? 1 : 0.4 }} />
              </div>
              <p className="text-center text-[11px] text-graphite/45">{new Date(w.from + DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-5 text-[12.5px] text-graphite/55">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-[#7fde80]" /> Money in
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-graphite/70" /> Money out
          </span>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {(['in', 'out'] as const).map((k) => {
          const rows = byType(k);
          const total = rows.reduce((a, r) => a + r[1], 0) || 1;
          return (
            <section key={k} className={`${panel} p-6`}>
              <h3 className="text-[16px] font-semibold">{k === 'in' ? 'Where money came from' : 'Where money went'}</h3>
              <ul className="mt-4 space-y-3">
                {rows.map(([name, v]) => (
                  <li key={name}>
                    <div className="flex justify-between text-[14px]">
                      <span>{name}</span>
                      <span className="font-ledger font-medium">{money(v)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#efeee7]">
                      <div className={`h-full rounded-full ${k === 'in' ? 'bg-[#1f6b33]' : 'bg-graphite/70'}`} style={{ width: `${(v / total) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Reconciliation ---------- */

function Reconciliation() {
  const links = usePaymentLinks();
  const { payments } = usePayments();
  const incoming = payments.filter((p) => p.kind === 'in' && p.status === 'received');
  // An invoice paid through its link is credited under the invoice's own
  // reference, so the match is exact rather than guessed from names or amounts.
  const byReference = useMemo(() => new Map((links.data ?? []).map((l) => [l.reference, l])), [links.data]);
  const matchOf = (p: Payment) => (p.ref ? byReference.get(p.ref) : undefined);
  const matched = incoming.filter(matchOf).length;
  const pct = incoming.length ? Math.round((matched / incoming.length) * 100) : 100;

  const csv = () =>
    download('credvera-reconciliation.csv', [
      ['Date', 'From', 'Amount', 'Currency', 'Reference', 'Invoice'],
      ...incoming.map((p) => {
        const inv = matchOf(p);
        return [new Date(p.date).toISOString().slice(0, 10), p.who, p.amount, p.currency, reference(p), inv ? `${inv.invoiceName} (${inv.recipient.name})` : 'Not an invoice payment'];
      }),
    ]);

  return (
    <div className="space-y-6">
      <section className={`${panel} flex flex-wrap items-center gap-6 p-6`}>
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#efeee7" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1f6b33" strokeWidth="4" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[13px] font-semibold">{pct}%</span>
        </div>
        <div className="flex-1">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
            {matched} of {incoming.length} payments came through an invoice
          </h2>
          <p className="text-[14px] text-graphite/55">Each payment you received, with the invoice it paid. Transfers straight to your account show their reference instead. Your accountant can take the file as it is.</p>
        </div>
        <button type="button" onClick={csv} className={secondary}>
          <Download className="size-4" /> Export for your accountant
        </button>
      </section>

      <section className={`${panel} overflow-x-auto`}>
        <table className="w-full min-w-[680px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
              <th className="py-3 pl-5 pr-4 font-medium">Date</th>
              <th className="py-3 pr-4 font-medium">From</th>
              <th className="py-3 pr-4 text-right font-medium">Amount</th>
              <th className="py-3 pr-5 font-medium">Matched to</th>
            </tr>
          </thead>
          <tbody>
            {incoming.map((p) => {
              const m = matchOf(p);
              return (
                <tr key={p.id} className="border-b border-graphite/[0.06] last:border-0">
                  <td className="whitespace-nowrap py-3.5 pl-5 pr-4 text-graphite/60">{shortDate(p.date)}</td>
                  <td className="py-3.5 pr-4 font-medium">{p.who}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium text-[#1f6b33]">+{money(p.amount, p.currency)}</td>
                  <td className="py-3.5 pr-5">
                    {m ? (
                      <span className="inline-flex items-center gap-1.5 text-[13.5px]">
                        <Check className="size-4 text-[#1f6b33]" /> {m.invoiceName} · {m.recipient.name}
                      </span>
                    ) : (
                      <span className="text-[13px] text-graphite/50">Transfer · ref {reference(p)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {incoming.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-graphite/50">
                  No money received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/* ---------- Order profit calculator ---------- */

function Profit() {
  const [currency, setCurrency] = useState<Exclude<Currency, 'NGN'>>('USD');
  // Starts empty: the numbers are the business's own, and so is the rate.
  const [cost, setCost] = useState('');
  const [qty, setQty] = useState('');
  const [shipping, setShipping] = useState('');
  const [duty, setDuty] = useState('');
  const [other, setOther] = useState('');
  const [price, setPrice] = useState('');
  const [rate, setRate] = useState('');

  const n = (v: string) => Number(v.replace(/[^\d.]/g, '')) || 0;
  const goods = n(cost) * n(rate);
  const dutyAmt = goods * (n(duty) / 100);
  const landed = goods + dutyAmt + n(shipping) + n(other);
  const revenue = n(price) * n(qty);
  const profit = revenue - landed;
  const margin = revenue ? (profit / revenue) * 100 : 0;
  // The rate at which revenue only just covers the landed cost.
  const breakEven = n(cost) ? (revenue - n(shipping) - n(other)) / (n(cost) * (1 + n(duty) / 100)) : 0;
  const perUnit = n(qty) ? landed / n(qty) : 0;

  const input = (v: string, set: (s: string) => void, lbl: string, prefix?: string, suffix?: string) => (
    <label className="block">
      <span className={label}>{lbl}</span>
      <span className="flex h-11 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 focus-within:border-graphite/50">
        {prefix && <span className="text-graphite/45">{prefix}</span>}
        <input inputMode="decimal" value={v} onChange={(e) => set(e.target.value)} className="w-full bg-transparent font-ledger outline-none" />
        {suffix && <span className="text-graphite/45">{suffix}</span>}
      </span>
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Order profit calculator</h2>
        <p className="mt-1 text-[14px] text-graphite/55">What an import order really earns once the rate, shipping and duty are counted.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Supplier is paid in</span>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as Exclude<Currency, 'NGN'>);
              }}
              className={field}
            >
              {CURRENCIES.filter((c) => c.code !== 'NGN').map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {input(cost, setCost, 'Supplier’s price, whole order', currency)}
          {input(rate, setRate, `Rate, ₦ per 1 ${currency}`, '₦')}
          {input(qty, setQty, 'Units in the order', undefined, 'units')}
          {input(shipping, setShipping, 'Shipping and clearing', '₦')}
          {input(duty, setDuty, 'Customs duty', undefined, '%')}
          {input(other, setOther, 'Other costs', '₦')}
          {input(price, setPrice, 'You sell each unit for', '₦')}
        </div>
      </section>

      <section className={`${panel} h-fit p-6`}>
        <p className="text-[13px] font-medium text-graphite/55">Profit on this order</p>
        <p className={`mt-1 font-ledger text-[32px] font-semibold tracking-[-0.03em] ${profit >= 0 ? 'text-[#1f6b33]' : 'text-[#9a3a17]'}`}>
          {profit >= 0 ? '' : '−'}
          {money(Math.abs(profit))}
        </p>
        <p className="text-[14px] text-graphite/60">{margin.toFixed(1)}% of what you sell it for</p>

        <dl className="mt-6 divide-y divide-graphite/[0.07] text-[14px]">
          {[
            ['Goods, in naira', money(goods)],
            ['Customs duty', money(dutyAmt)],
            ['Shipping and other costs', money(n(shipping) + n(other))],
            ['Landed cost', money(landed)],
            ['Landed cost per unit', money(perUnit)],
            ['Sales', money(revenue)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5">
              <dt className="text-graphite/60">{k}</dt>
              <dd className="font-ledger font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className={`mt-5 rounded-xl px-4 py-3.5 text-[14px] ${breakEven > n(rate) ? 'bg-[#eef8ea] text-[#1f6b33]' : 'bg-[#fcf0ea] text-[#9a3a17]'}`}>
          {breakEven > 0 ? (
            <>
              This order stops making money if 1 {currency} costs more than <span className="font-ledger font-semibold">{money(breakEven)}</span>.
              {n(rate) > 0 && (breakEven > n(rate) ? ` That’s ${(((breakEven - n(rate)) / n(rate)) * 100).toFixed(1)}% above the rate you entered.` : ' The rate you entered is already past it.')}
            </>
          ) : (
            'At these costs, the order loses money at any rate.'
          )}
        </div>
      </section>
    </div>
  );
}

const SECTIONS = [
  { to: '/business/app/reports', label: 'Statements', end: true },
  { to: '/business/app/reports/cash-flow', label: 'Cash flow' },
  { to: '/business/app/reports/reconciliation', label: 'Reconciliation' },
  { to: '/business/app/reports/profit', label: 'Order profit' },
];

/** Reports: statements, cash flow, reconciliation, and what an order really earns. */
export default function Reports() {
  const { section } = useParams();
  const session = useSession();
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Reports</h1>
      <p className="mt-1 text-[15px] text-graphite/55">The numbers behind the business, ready for you or your accountant.</p>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite/10" aria-label="Reports">
        {SECTIONS.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            end={s.end}
            className={({ isActive }) => `-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[14.5px] font-medium transition-colors ${isActive ? 'border-graphite text-graphite' : 'border-transparent text-graphite/50 hover:text-graphite'}`}
          >
            {s.label}
          </NavLink>
        ))}
      </nav>
      <motion.div key={section ?? 'statements'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
        {section === 'cash-flow' ? <CashFlow /> : section === 'reconciliation' ? <Reconciliation /> : section === 'profit' ? <Profit /> : (
          <>
            <Statements />
            <OfficialStatements />
          </>
        )}
      </motion.div>
    </div>
  );
}
