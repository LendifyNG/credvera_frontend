import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Bell, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ConvertForm, CURRENCIES } from './money';
import { addAlert, CHANGE_TODAY, money, RATES, RATES_UPDATED, rateHistory, removeAlert, useDash, type Currency } from './store';

const ease = [0.16, 1, 0.3, 1] as const;
type Foreign = Exclude<Currency, 'NGN'>;
const FOREIGN = CURRENCIES.filter((c) => c.code !== 'NGN') as { code: Foreign; name: string; flag: string }[];
const panel = 'rounded-2xl border border-graphite/10 bg-white';

/** Thirty days of one rate as a thin line; hover a day to read it. */
function RateChart({ c }: { c: Foreign }) {
  const data = useMemo(() => rateHistory(c), [c]);
  const [hover, setHover] = useState<number | null>(null);
  const W = 320;
  const H = 90;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - 6 - ((v - min) / (max - min || 1)) * (H - 16);
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const up = CHANGE_TODAY[c] >= 0;
  const date = (i: number) => new Date(Date.now() - (data.length - 1 - i) * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <div>
      <p className="h-5 text-[12.5px] text-graphite/50">{hover !== null ? `${date(hover)} · ${money(data[hover]!)}` : '30 days'}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label={`${c} against the naira over 30 days`}>
        <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={up ? '#7fde80' : '#e0906b'} fillOpacity="0.14" />
        <path d={line} fill="none" stroke={up ? '#1f6b33' : '#b5532b'} strokeWidth="1.6" />
        {data.map((_, i) => (
          <rect key={i} x={x(i) - W / data.length / 2} y="0" width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <circle cx={x(hover)} cy={y(data[hover]!)} r="3.5" fill="#141c17" />}
      </svg>
    </div>
  );
}

function Rates() {
  const { balances } = useDash();
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {FOREIGN.map((c) => {
          const ch = CHANGE_TODAY[c.code];
          return (
            <section key={c.code} className={`${panel} p-6`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <img src={`https://flagcdn.com/w80/${c.flag}.png`} alt="" className="size-7 rounded-full object-cover ring-1 ring-graphite/10" />
                  <span className="whitespace-nowrap text-[15px] font-semibold">{c.name}</span>
                </span>
                <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium ${ch >= 0 ? 'bg-[#e3f1e0] text-[#1f6b33]' : 'bg-[#f6e7e0] text-[#9a3a17]'}`}>
                  {ch >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                  {Math.abs(ch).toFixed(1)}% today
                </span>
              </div>
              <p className="mt-5 text-[13px] text-graphite/55">1 {c.code} =</p>
              <p className="font-ledger text-[28px] font-semibold leading-tight tracking-[-0.02em]">{money(RATES[c.code])}</p>
              <div className="mt-4">
                <RateChart c={c.code} />
              </div>
            </section>
          );
        })}
      </div>

      <section className={`${panel} p-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">What your money is worth in naira</h2>
          <p className="text-[13px] text-graphite/50">At today’s rate, updated {RATES_UPDATED}</p>
        </div>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {FOREIGN.map((c) => (
            <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-[14.5px]">
              <span className="font-medium">{c.name}</span>
              <span className="font-ledger text-graphite/60">{money(balances[c.code], c.code)}</span>
              <span className="w-40 text-right font-ledger font-semibold">{money(balances[c.code] * RATES[c.code])}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-graphite/50">No markup: the rate you see is the rate you get.</p>
      </section>
    </div>
  );
}

function Convert() {
  const { balances } = useDash();
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={`${panel} p-6`}>
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Convert</h2>
        <p className="mb-6 mt-1 text-[14px] text-graphite/55">Between your own balances, at today’s rate. It lands straight away.</p>
        <ConvertForm balances={balances} />
      </section>
      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Your balances</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {CURRENCIES.map((c) => (
            <li key={c.code} className="flex items-center gap-3 py-3">
              <img src={`https://flagcdn.com/w80/${c.flag}.png`} alt="" className="size-7 rounded-full object-cover ring-1 ring-graphite/10" />
              <span className="flex-1 text-[14.5px] font-medium">{c.name}</span>
              <span className="font-ledger text-[14.5px] font-semibold">{money(balances[c.code], c.code)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-graphite/50">A conversion shows in Transactions, but it never counts as money in or money out: it stays inside your business.</p>
      </section>
    </div>
  );
}

function Alerts() {
  const { alerts } = useDash();
  const [c, setC] = useState<Foreign>('USD');
  const [when, setWhen] = useState<'above' | 'below'>('below');
  const [text, setText] = useState('');
  const rate = Number(text.replace(/[^\d.]/g, '')) || 0;
  const select = 'h-11 rounded-lg border border-graphite/15 bg-white px-3 text-[15px] font-medium outline-none';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={`${panel} p-6`}>
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Rate alerts</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Tell us the rate you’re waiting for. We’ll let you know by email and in the app the moment it’s reached.</p>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rate) return;
            // TODO(credvera): the alert is watched and sent by the API.
            addAlert({ currency: c, when, rate });
            setText('');
          }}
        >
          <p className="flex flex-wrap items-center gap-2 text-[15px]">
            <span>Tell me when 1</span>
            <select value={c} onChange={(e) => setC(e.target.value as Foreign)} className={select} aria-label="Currency">
              {FOREIGN.map((x) => (
                <option key={x.code}>{x.code}</option>
              ))}
            </select>
            <span>goes</span>
            <select value={when} onChange={(e) => setWhen(e.target.value as 'above' | 'below')} className={select} aria-label="Above or below">
              <option value="above">above</option>
              <option value="below">below</option>
            </select>
            <span className="flex h-11 w-40 items-center gap-1.5 rounded-lg border border-graphite/15 bg-white px-3 focus-within:border-graphite/50">
              <span className="text-graphite/45">₦</span>
              <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder={RATES[c].toLocaleString('en-NG')} className="w-full bg-transparent font-ledger outline-none" aria-label="Rate" />
            </span>
          </p>
          <p className="mt-3 text-[13px] text-graphite/50">Today: 1 {c} = {money(RATES[c])}</p>
          <button type="submit" disabled={!rate} className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-graphite px-5 text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
            <Bell className="size-4" /> Set alert
          </button>
        </form>
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Your alerts</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {alerts.map((a) => {
            const gap = ((a.rate - RATES[a.currency]) / RATES[a.currency]) * 100;
            return (
              <li key={a.id} className="flex items-center gap-3 py-3.5">
                <span className="grid size-8 place-items-center rounded-full bg-[#efeee7]">
                  <Bell className="size-4 text-graphite/60" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-medium">
                    1 {a.currency} {a.when} {money(a.rate)}
                  </span>
                  <span className="block text-[12.5px] text-graphite/50">{Math.abs(gap).toFixed(1)}% {gap >= 0 ? 'above' : 'below'} today’s rate</span>
                </span>
                <button type="button" onClick={() => removeAlert(a.id)} aria-label="Delete alert" className="grid size-9 place-items-center rounded-lg text-graphite/50 hover:bg-[#f6e7e0] hover:text-[#9a3a17]">
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
          {alerts.length === 0 && <li className="py-8 text-center text-[14px] text-graphite/50">No alerts yet.</li>}
        </ul>
      </section>
    </div>
  );
}

const SECTIONS = [
  { to: '/business/app/fx', label: 'Today’s rates', end: true },
  { to: '/business/app/fx/convert', label: 'Convert' },
  { to: '/business/app/fx/alerts', label: 'Rate alerts' },
];

/** FX: today's rates, converting between your balances, and alerts for the rate you want. */
export default function Fx() {
  const { section } = useParams();
  const { session } = useDash();
  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
        <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">FX</h1>
        <p className="mt-1 text-[15px] text-graphite/55">Rates against the naira, updated {RATES_UPDATED} today. No markup.</p>
      </div>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite/10" aria-label="FX">
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
      <motion.div key={section ?? 'rates'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
        {section === 'convert' ? <Convert /> : section === 'alerts' ? <Alerts /> : <Rates />}
      </motion.div>
    </div>
  );
}
