import { motion } from 'framer-motion';
import { useReducedMotion } from '../lib/motion';
import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { money, shortDate, useDash } from './store';

const ease = [0.16, 1, 0.3, 1] as const;

const greeting = () => {
  const h = Number(new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', hour12: false }));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// Thirty days of naira in and out for the example business, for the cash line.
// TODO(credvera): from the API, per day.
const days = Array.from({ length: 30 }, (_, i) => ({
  in: 320000 + ((i * 7919) % 11) * 95000 + (i % 6 === 0 ? 620000 : 0),
  out: 250000 + ((i * 104729) % 9) * 88000 + (i % 7 === 3 ? 540000 : 0),
}));

/** The cash line: money in above, money out below, one day per step. Hover a day to read it. */
function CashLine() {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = 180;
  const max = Math.max(...days.map((d) => Math.max(d.in, d.out)));
  const x = (i: number) => (i / (days.length - 1)) * W;
  const yIn = (v: number) => H / 2 - (v / max) * (H / 2 - 8);
  const yOut = (v: number) => H / 2 + (v / max) * (H / 2 - 8);
  const path = (f: (d: (typeof days)[number]) => number, y: (v: number) => number) => days.map((d, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(f(d)).toFixed(1)}`).join(' ');
  const h = hover !== null ? days[hover] : null;
  const date = (i: number) => {
    const t = new Date();
    t.setDate(t.getDate() - (days.length - 1 - i));
    return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-graphite/10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold">The last 30 days</p>
        <p className="font-ledger text-[13px] text-graphite/55">
          {h ? (
            <>
              {date(hover!)} · <span className="text-[#1f6b33]">+{money(h.in)}</span> · −{money(h.out)}
            </>
          ) : (
            'Hover a day'
          )}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label="Money in and out over the last 30 days">
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="#141c17" strokeOpacity="0.15" />
        <path d={`${path((d) => d.in, yIn)} L ${W} ${H / 2} L 0 ${H / 2} Z`} fill="#7fde80" fillOpacity="0.18" />
        <path d={path((d) => d.in, yIn)} fill="none" stroke="#1f6b33" strokeWidth="1.8" />
        <path d={`${path((d) => d.out, yOut)} L ${W} ${H / 2} L 0 ${H / 2} Z`} fill="#141c17" fillOpacity="0.06" />
        <path d={path((d) => d.out, yOut)} fill="none" stroke="#141c17" strokeOpacity="0.55" strokeWidth="1.5" />
        {days.map((_, i) => (
          <rect key={i} x={x(i) - W / days.length / 2} y="0" width={W / days.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#141c17" strokeOpacity="0.3" strokeDasharray="3 3" />}
      </svg>
      <div className="mt-3 flex gap-5 text-[12.5px] text-graphite/55">
        <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-[#1f6b33]" /> Money in</span>
        <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-graphite/55" /> Money out</span>
      </div>
    </div>
  );
}

/** Today: a written brief of what happened and what needs you, then the numbers behind it. */
export default function Today() {
  const reduce = useReducedMotion();
  const { session, balances, payments } = useDash();
  const waiting = payments.filter((p) => p.status === 'waiting');
  const yesterday = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const key = y.toDateString();
    return payments.filter((p) => p.kind === 'in' && p.currency === 'NGN' && new Date(p.date).toDateString() === key).reduce((a, p) => a + p.amount, 0);
  }, [payments]);

  const link = 'font-semibold text-graphite underline decoration-graphite/25 underline-offset-[6px] transition-colors hover:decoration-graphite';

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[14px] text-graphite/55">
        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {/* The brief */}
      <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <h1 className="mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[1] tracking-[-0.04em]">
          {greeting()}, {session?.business.replace(/ Ltd$/, '')}.
        </h1>
        <p className="mt-6 max-w-4xl text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[1.5] tracking-[-0.01em] text-graphite/60">
          {yesterday > 0 ? (
            <>
              <Link to="/business/app/payments?f=in" className={link}>
                {money(yesterday)}
              </Link>{' '}
              came in yesterday.{' '}
            </>
          ) : (
            <>Nothing came in yesterday. </>
          )}
          {waiting.length > 0 ? (
            <>
              <Link to="/business/app/approvals" className={link}>
                {waiting.length === 1 ? 'One payment is' : `${waiting.length} payments are`} waiting
              </Link>{' '}
              for a second approval, the largest {money(Math.max(...waiting.map((w) => w.amount)))} to {waiting.sort((a, b) => b.amount - a.amount)[0]!.who}.{' '}
            </>
          ) : (
            <>Nothing is waiting for approval. </>
          )}
          Your naira balance is <span className="font-semibold text-graphite">{money(balances.NGN)}</span>, with{' '}
          <span className="font-semibold text-graphite">{money(balances.USD, 'USD')}</span> held in dollars.
        </p>
      </motion.div>

      {/* Needs you, and the balances */}
      <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl bg-white p-6 ring-1 ring-graphite/10">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold">Needs you</p>
            <Link to="/business/app/approvals" className="text-[13px] font-semibold text-graphite/55 hover:text-graphite">
              All approvals
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-graphite/[0.08]">
            {waiting.length === 0 && <li className="py-6 text-[14px] text-graphite/50">You’re all caught up.</li>}
            {waiting.slice(0, 4).map((p) => (
              <li key={p.id}>
                <Link to="/business/app/approvals" className="group flex items-center justify-between gap-4 py-4">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium">{p.who}</span>
                    <span className="block text-[13px] text-graphite/50">Asked by {p.requestedBy} · {p.reason}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-ledger text-[14px] tabular-nums">{money(p.amount, p.currency)}</span>
                    <ArrowRight className="size-4 text-graphite/30 transition-transform group-hover:translate-x-1 group-hover:text-graphite" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="grid gap-px overflow-hidden rounded-2xl bg-graphite/10 ring-1 ring-graphite/10 sm:grid-cols-2">
          {(['NGN', 'USD', 'GBP', 'EUR'] as const).map((c) => (
            <div key={c} className="bg-white p-5">
              <p className="text-[13px] font-medium text-graphite/50">{{ NGN: 'Naira', USD: 'US dollar', GBP: 'British pound', EUR: 'Euro' }[c]}</p>
              <p className="mt-2 font-ledger text-[clamp(1.2rem,2vw,1.5rem)] font-medium tabular-nums">{money(balances[c], c)}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <CashLine />
        <section className="rounded-2xl bg-white p-6 ring-1 ring-graphite/10">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold">Latest</p>
            <Link to="/business/app/payments" className="text-[13px] font-semibold text-graphite/55 hover:text-graphite">
              All payments
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-graphite/[0.08]">
            {payments
              .filter((p) => p.status !== 'waiting')
              .slice(0, 5)
              .map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{p.who}</span>
                    <span className="block text-[12.5px] text-graphite/45">{shortDate(p.date)}</span>
                  </span>
                  <span className={`shrink-0 font-ledger text-[13px] tabular-nums ${p.kind === 'in' ? 'text-[#1f6b33]' : ''}`}>
                    {p.kind === 'in' ? '+' : '−'}
                    {money(p.amount, p.currency)}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
