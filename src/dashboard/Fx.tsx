import { motion } from 'framer-motion';
import { ArrowDown, ArrowLeftRight, ArrowUp, Bell, BellRing, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { errorMessage, useCancelFxAlert, useCreateFxAlert, useFxAlerts, useFxHistory, useFxRates, type FxAlertDto, type FxRateDto } from '../api';
import { useActiveBusiness, useBalances } from './data';
import { money, type Currency } from './model';
import { CURRENCIES } from './money';
import { field, label } from './pay/shared';
import { ComingSoon } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const panel = 'rounded-2xl border border-graphite/10 bg-white';

// Reference rates: mid-market, published once a day. To watch, not prices to
// deal at, so the page says so rather than promising a rate.
const naira = (v: string | number, dp = 2) => `₦${Number(v).toLocaleString('en-NG', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const dpOf = (rate: string | number) => (Number(rate) < 20 ? 4 : 2);
const lagos = (iso: string, withTime = true) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Africa/Lagos' });

// Flags for the currencies the rates may include; anything else shows its code.
const FLAGS: Record<string, string> = { USD: 'us', GBP: 'gb', EUR: 'eu', CNY: 'cn', CAD: 'ca', ZAR: 'za', GHS: 'gh', KES: 'ke', JPY: 'jp', AED: 'ae', CHF: 'ch', INR: 'in', XOF: 'sn' };

function Flag({ code }: { code: string }) {
  const flag = FLAGS[code];
  return flag ? (
    <img src={`https://flagcdn.com/w80/${flag}.png`} alt="" className="size-7 rounded-full object-cover ring-1 ring-graphite/10" />
  ) : (
    <span className="grid size-7 place-items-center rounded-full bg-[#efeee7] text-[10px] font-semibold ring-1 ring-graphite/10">{code.slice(0, 2)}</span>
  );
}

/** Thirty days of one rate as a thin line; hover a day to read it. */
function RateChart({ r }: { r: FxRateDto }) {
  const history = useFxHistory(r.currency, 30);
  const data = useMemo(() => (history.data?.points ?? []).map((p) => ({ at: p.asOf, rate: Number(p.rate) })), [history.data]);
  const [hover, setHover] = useState<number | null>(null);
  const dp = dpOf(r.rate);

  if (data.length < 2) {
    return (
      <div>
        <p className="h-5 text-[12.5px] text-graphite/50">30 days</p>
        <div className="mt-1 grid h-[90px] place-items-center rounded-lg bg-[#f5f4ef] px-4 text-center text-[12.5px] text-graphite/50">
          {history.isLoading ? <Loader2 className="size-4 animate-spin text-graphite/40" /> : 'The line builds a day at a time. Come back tomorrow.'}
        </div>
      </div>
    );
  }

  const W = 320;
  const H = 90;
  const min = Math.min(...data.map((d) => d.rate));
  const max = Math.max(...data.map((d) => d.rate));
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - 6 - ((v - min) / (max - min || 1)) * (H - 16);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.rate).toFixed(1)}`).join(' ');
  // Up means the currency costs more naira than a month ago.
  const up = data.at(-1)!.rate >= data[0]!.rate;
  return (
    <div>
      <p className="h-5 text-[12.5px] text-graphite/50">{hover !== null ? `${lagos(data[hover]!.at, false)} · ${naira(data[hover]!.rate, dp)}` : '30 days'}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label={`${r.currency} against the naira over 30 days`}>
        <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={up ? '#7fde80' : '#e0906b'} fillOpacity="0.14" />
        <path d={line} fill="none" stroke={up ? '#1f6b33' : '#b5532b'} strokeWidth="1.6" />
        {data.map((_, i) => (
          <rect key={i} x={x(i) - W / data.length / 2} y="0" width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <circle cx={x(hover)} cy={y(data[hover]!.rate)} r="3.5" fill="#141c17" />}
      </svg>
    </div>
  );
}

/** The change since the publication before: the naira price went up or down. */
function Change({ change }: { change: number | null }) {
  if (change === null) return <span className="text-[12px] text-graphite/40">No change yet</span>;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium ${change >= 0 ? 'bg-[#e3f1e0] text-[#1f6b33]' : 'bg-[#f6e7e0] text-[#9a3a17]'}`}
      title={change >= 0 ? 'Costs more naira than the day before' : 'Costs fewer naira than the day before'}
    >
      {change >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {Math.abs(change).toFixed(1)}% today
    </span>
  );
}

function Rates({ rates }: { rates: FxRateDto[] }) {
  const { balances } = useBalances();
  const held = CURRENCIES.filter((c) => c.code !== 'NGN')
    .map((c) => ({ ...c, rate: rates.find((r) => r.currency === c.code) }))
    .filter((c): c is typeof c & { rate: FxRateDto } => !!c.rate);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {rates.map((r) => (
          <section key={r.currency} className={`${panel} p-6`}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <Flag code={r.currency} />
                <span className="truncate text-[15px] font-semibold">{r.name}</span>
              </span>
              <Change change={r.change} />
            </div>
            <p className="mt-5 text-[13px] text-graphite/55">1 {r.currency} =</p>
            <p className="font-ledger text-[28px] font-semibold leading-tight tracking-[-0.02em]">{naira(r.rate, dpOf(r.rate))}</p>
            <div className="mt-4">
              <RateChart r={r} />
            </div>
          </section>
        ))}
      </div>

      {held.length > 0 && (
        <section className={`${panel} p-6`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">What your money is worth in naira</h2>
            <p className="text-[13px] text-graphite/50">At today’s reference rate</p>
          </div>
          <ul className="mt-3 divide-y divide-graphite/[0.07]">
            {held.map((c) => (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-[14.5px]">
                <span className="font-medium">{c.name}</span>
                <span className="font-ledger text-graphite/60">{money(balances[c.code], c.code)}</span>
                <span className="w-40 text-right font-ledger font-semibold">{money(balances[c.code] * Number(c.rate.rate))}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-graphite/50">A mid-market rate, to plan with. A bank or provider will quote you its own price.</p>
        </section>
      )}
    </div>
  );
}

function Convert({ rates }: { rates: FxRateDto[] }) {
  const { balances } = useBalances();
  const [code, setCode] = useState(rates.find((r) => r.currency === 'USD')?.currency ?? rates[0]!.currency);
  const [toNaira, setToNaira] = useState(true);
  const [amount, setAmount] = useState('1000');
  const r = rates.find((x) => x.currency === code) ?? rates[0]!;
  const n = Number(amount.replace(/,/g, '')) || 0;
  const result = toNaira ? n * Number(r.rate) : n / Number(r.rate);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={`${panel} p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Convert</h2>
            <p className="mt-1 text-[14px] text-graphite/55">Work out a sum at today’s reference rate, either way round.</p>
          </div>
          <button type="button" onClick={() => setToNaira((v) => !v)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-graphite/60 hover:text-graphite">
            <ArrowLeftRight className="size-3.5" /> Swap
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-[8rem_1fr]">
          <label className="block">
            <span className={label}>Currency</span>
            <select value={code} onChange={(e) => setCode(e.target.value)} className={field}>
              {rates.map((x) => (
                <option key={x.currency}>{x.currency}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>{toNaira ? `Amount in ${r.currency}` : 'Amount in naira'}</span>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))} className={`${field} font-ledger`} />
          </label>
        </div>
        <div className="mt-5 rounded-xl bg-[#f5f4ef] px-5 py-4">
          <p className="text-[13px] text-graphite/55">{toNaira ? 'In naira' : `In ${r.currency}`}</p>
          <p className="font-ledger text-[26px] font-semibold tracking-[-0.02em]">
            {toNaira ? naira(result) : `${r.currency} ${result.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12.5px] text-graphite/50">1 {r.currency} = {naira(r.rate, dpOf(r.rate))}</p>
        </div>
        <ComingSoon title="Move money between your balances" className="mt-6 py-8">
          Converting from one of your accounts to another, at a rate held while you confirm.
        </ComingSoon>
      </section>
      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Your balances</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {CURRENCIES.map((c) => (
            <li key={c.code} className="flex items-center gap-3 py-3">
              <img src={`https://flagcdn.com/w80/${c.flag}.png`} alt="" className="size-7 rounded-full object-cover ring-1 ring-graphite/10" />
              <span className="flex-1 text-[14.5px] font-medium">{c.name}</span>
              <span className="font-ledger text-[14.5px] font-semibold">{money(balances[c.code as Currency], c.code)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-graphite/50">A conversion shows in Transactions, but it never counts as money in or money out: it stays inside your business.</p>
      </section>
    </div>
  );
}

function Alerts({ rates }: { rates: FxRateDto[] }) {
  const alerts = useFxAlerts();
  const create = useCreateFxAlert();
  const cancel = useCancelFxAlert();
  const [c, setC] = useState(rates.find((r) => r.currency === 'USD')?.currency ?? rates[0]!.currency);
  const [when, setWhen] = useState<'above' | 'below'>('below');
  const [text, setText] = useState('');
  const rate = Number(text.replace(/[^\d.]/g, '')) || 0;
  const today = rates.find((r) => r.currency === c);
  const already = !!today && rate > 0 && (when === 'above' ? Number(today.rate) >= rate : Number(today.rate) <= rate);
  const select = 'h-11 rounded-lg border border-graphite/15 bg-white px-3 text-[15px] font-medium outline-none';

  const active = (alerts.data ?? []).filter((a) => a.status === 'active');
  const fired = (alerts.data ?? []).filter((a) => a.status === 'triggered').slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={`${panel} p-6`}>
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Rate alerts</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Tell us the rate you’re waiting for. We’ll email you the day it’s reached. Each alert goes off once.</p>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rate || already) return;
            create.mutate({ currency: c, direction: when, target: String(rate) }, { onSuccess: () => setText('') });
          }}
        >
          <p className="flex flex-wrap items-center gap-2 text-[15px]">
            <span>Tell me when 1</span>
            <select value={c} onChange={(e) => setC(e.target.value)} className={select} aria-label="Currency">
              {rates.map((x) => (
                <option key={x.currency}>{x.currency}</option>
              ))}
            </select>
            <span>goes</span>
            <select value={when} onChange={(e) => setWhen(e.target.value as 'above' | 'below')} className={select} aria-label="Above or below">
              <option value="above">above</option>
              <option value="below">below</option>
            </select>
            <span className="flex h-11 w-40 items-center gap-1.5 rounded-lg border border-graphite/15 bg-white px-3 focus-within:border-graphite/50">
              <span className="text-graphite/45">₦</span>
              <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder={today ? Number(today.rate).toLocaleString('en-NG', { maximumFractionDigits: 2 }) : ''} className="w-full bg-transparent font-ledger outline-none" aria-label="Rate" />
            </span>
          </p>
          {today && (
            <p className="mt-3 text-[13px] text-graphite/50">
              Today: 1 {c} = {naira(today.rate, dpOf(today.rate))}
            </p>
          )}
          {already && <p className="mt-1 text-[13px] text-graphite/65">It’s already {when === 'above' ? 'at or above' : 'at or below'} that today.</p>}
          {create.error && <p className="mt-2 text-[13px] text-[#a3261b]">{errorMessage(create.error)}</p>}
          <button type="submit" disabled={!rate || already || create.isPending} className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-graphite px-5 text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
            {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Set alert
          </button>
        </form>
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Your alerts</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {active.map((a) => (
            <AlertRow key={a.id} a={a} today={rates.find((r) => r.currency === a.currency)} onCancel={() => cancel.mutate(a.id)} busy={cancel.isPending} />
          ))}
          {fired.map((a) => (
            <AlertRow key={a.id} a={a} />
          ))}
          {alerts.isLoading && (
            <li className="py-8 text-center">
              <Loader2 className="mx-auto size-4 animate-spin text-graphite/40" />
            </li>
          )}
          {!alerts.isLoading && active.length + fired.length === 0 && <li className="py-8 text-center text-[14px] text-graphite/50">No alerts yet.</li>}
        </ul>
        {cancel.error && <p className="mt-2 text-[13px] text-[#a3261b]">{errorMessage(cancel.error)}</p>}
      </section>
    </div>
  );
}

function AlertRow({ a, today, onCancel, busy }: { a: FxAlertDto; today?: FxRateDto; onCancel?: () => void; busy?: boolean }) {
  const fired = a.status === 'triggered';
  const gap = today ? ((Number(a.target) - Number(today.rate)) / Number(today.rate)) * 100 : null;
  return (
    <li className="flex items-center gap-3 py-3.5">
      <span className={`grid size-8 place-items-center rounded-full ${fired ? 'bg-[#e3f1e0]' : 'bg-[#efeee7]'}`}>{fired ? <BellRing className="size-4 text-[#1f6b33]" /> : <Bell className="size-4 text-graphite/60" />}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium">
          1 {a.currency} {a.direction} {naira(a.target, dpOf(a.target))}
        </span>
        <span className="block text-[12.5px] text-graphite/50">
          {fired
            ? `Went off ${lagos(a.triggeredAt!, false)} at ${naira(a.triggeredRate!, dpOf(a.triggeredRate!))}`
            : `${gap === null ? '' : `${Math.abs(gap).toFixed(1)}% ${gap >= 0 ? 'above' : 'below'} today’s rate`}${a.yours ? '' : ' · set by someone on the team'}`}
        </span>
      </span>
      {onCancel && (
        <button type="button" disabled={busy} onClick={onCancel} aria-label="Delete alert" className="grid size-9 place-items-center rounded-lg text-graphite/50 hover:bg-[#f6e7e0] hover:text-[#9a3a17] disabled:opacity-40">
          <Trash2 className="size-4" />
        </button>
      )}
    </li>
  );
}

const SECTIONS = [
  { to: '/business/app/fx', label: 'Today’s rates', end: true },
  { to: '/business/app/fx/convert', label: 'Convert' },
  { to: '/business/app/fx/alerts', label: 'Rate alerts' },
];

/** FX: today's rates, working out a sum, and alerts for the rate you want. */
export default function Fx() {
  const { section } = useParams();
  const business = useActiveBusiness();
  const rates = useFxRates();
  const data = rates.data;

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-[13px] font-medium text-graphite/50">{business?.name}</p>
        <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">FX</h1>
        <p className="mt-1 text-[15px] text-graphite/55">Rates against the naira{data?.asOf ? `, published ${lagos(data.asOf)}` : ''}. Mid-market, once a day.</p>
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
        {rates.isLoading ? (
          <Loader2 className="mx-auto mt-8 size-5 animate-spin text-graphite/40" aria-label="Loading" />
        ) : rates.error ? (
          <p className="mt-4 text-center text-[14px] text-[#a3261b]">{errorMessage(rates.error)}</p>
        ) : !data?.rates.length ? (
          <p className={`${panel} px-6 py-12 text-center text-[14.5px] text-graphite/55`}>No rates yet. They’re fetched within a few minutes of the server starting; check back shortly.</p>
        ) : section === 'convert' ? (
          <Convert rates={data.rates} />
        ) : section === 'alerts' ? (
          <Alerts rates={data.rates} />
        ) : (
          <Rates rates={data.rates} />
        )}
      </motion.div>
      {data?.rates.length ? (
        <p className="mt-6 text-[12.5px] text-graphite/45">
          Reference rates from{' '}
          <a href={data.attribution.url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2 hover:text-graphite">
            {data.attribution.name}
          </a>
          , Lagos time.
        </p>
      ) : null}
    </div>
  );
}
