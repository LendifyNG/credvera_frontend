import { ArrowLeftRight, Bell, BellRing, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { errorMessage, useCancelFxAlert, useCreateFxAlert, useFxAlerts, useFxHistory, useFxRates, type FxAlertDto, type FxRateDto } from '../api';
import { useActiveBusiness } from './data';
import { field, label, panel, primary } from './pay/shared';

const naira = (v: string | number, dp = 2) => `₦${Number(v).toLocaleString('en-NG', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const lagos = (iso: string, withTime = true) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Africa/Lagos' });
const RANGES = [
  [30, '30 days'],
  [90, '90 days'],
  [365, '1 year'],
] as const;

/**
 * FX: reference rates in naira, how they've moved, and alerts when a rate
 * reaches a number. Mid-market rates to watch, not prices to deal at.
 */
export default function Fx() {
  const business = useActiveBusiness();
  const rates = useFxRates();
  const [selected, setSelected] = useState('USD');
  const data = rates.data;
  const current = data?.rates.find((r) => r.currency === selected) ?? data?.rates[0];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{business?.name}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">FX</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-graphite/55">
        What each currency costs in naira today, how it’s moved, and an email when it reaches your number. These are mid-market reference rates, published once a day: a bank or provider will quote you a different price.
      </p>

      {rates.isLoading ? (
        <Loader2 className="mx-auto mt-14 size-5 animate-spin text-graphite/40" aria-label="Loading" />
      ) : rates.error ? (
        <p className="mt-10 text-center text-[14px] text-[#a3261b]">{errorMessage(rates.error)}</p>
      ) : !data?.rates.length ? (
        <p className={`${panel} mt-6 px-6 py-12 text-center text-[14.5px] text-graphite/55`}>No rates yet. They’re fetched within a few minutes of the server starting; check back shortly.</p>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.rates.map((r) => (
              <RateCard key={r.currency} r={r} active={r.currency === current?.currency} onSelect={() => setSelected(r.currency)} />
            ))}
          </section>

          {current && (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Detail r={current} />
              <div className="space-y-6">
                <Converter r={current} />
                <Alerts rates={data.rates} selected={current.currency} />
              </div>
            </div>
          )}

          <p className="mt-6 text-[12.5px] text-graphite/45">
            Rates published {data.asOf ? lagos(data.asOf) : '—'} (Lagos time).{' '}
            <a href={data.attribution.url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2 hover:text-graphite">
              {data.attribution.name}
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}

/** A change since the publication before, in words a reader can't misread: the naira price went up or down. */
function Change({ change }: { change: number | null }) {
  if (change === null) return <span className="text-[12.5px] text-graphite/40">No change yet</span>;
  if (change === 0) return <span className="text-[12.5px] text-graphite/55">Unchanged</span>;
  const Icon = change > 0 ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] text-graphite/65" title={change > 0 ? 'Costs more naira than the day before' : 'Costs fewer naira than the day before'}>
      <Icon className="size-3.5" aria-hidden /> {change > 0 ? '+' : '−'}
      {Math.abs(change).toFixed(2)}%
    </span>
  );
}

function RateCard({ r, active, onSelect }: { r: FxRateDto; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`rounded-xl border bg-white px-4 py-3 text-left transition-colors ${active ? 'border-graphite ring-1 ring-graphite' : 'border-graphite/10 hover:border-graphite/30'}`}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-semibold">{r.currency}</span>
        <Change change={r.change} />
      </span>
      <span className="mt-1 block font-ledger text-[18px] font-semibold tracking-[-0.02em]">{naira(r.rate, Number(r.rate) < 20 ? 4 : 2)}</span>
      <span className="block truncate text-[12px] text-graphite/45">{r.name}</span>
    </button>
  );
}

function Detail({ r }: { r: FxRateDto }) {
  const [days, setDays] = useState<number>(30);
  const history = useFxHistory(r.currency, days);
  const points = useMemo(() => (history.data?.points ?? []).map((p) => ({ at: new Date(p.asOf).getTime(), rate: Number(p.rate) })), [history.data]);
  const dp = r.rate && Number(r.rate) < 20 ? 4 : 2;

  return (
    <section className={`${panel} h-fit p-6`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-graphite/55">One {r.currency} ({r.name}) costs</p>
          <p className="font-ledger text-[34px] font-semibold tracking-[-0.03em]">{naira(r.rate, dp)}</p>
          <p className="text-[13px] text-graphite/50">
            <Change change={r.change} />
            {r.previous && <span> · {naira(r.previous, dp)} the day before</span>}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-[#efeee7] p-1 text-[13px] font-medium" role="group" aria-label="Period">
          {RANGES.map(([d, l]) => (
            <button key={d} type="button" onClick={() => setDays(d)} aria-pressed={days === d} className={`rounded-md px-2.5 py-1 ${days === d ? 'bg-white shadow-sm' : 'text-graphite/60'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {points.length >= 2 ? (
          <RateChart points={points} currency={r.currency} dp={dp} />
        ) : (
          <div className="grid h-56 place-items-center rounded-xl bg-[#f5f4ef] px-6 text-center text-[14px] text-graphite/55">
            {history.isLoading ? <Loader2 className="size-5 animate-spin text-graphite/40" /> : `The history builds a day at a time: the first ${r.currency} rate was recorded ${history.data?.since ? lagos(history.data.since, false) : 'today'}. Come back tomorrow for a line.`}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * One rate over time: a 2px line in ink, recessive grid, a crosshair and a
 * tooltip on hover or focus, and a table of the same numbers for screen readers.
 */
function RateChart({ points, currency, dp }: { points: { at: number; rate: number }[]; currency: string; dp: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e!.contentRect.width))));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const H = 224;
  const pad = { top: 12, right: 64, bottom: 24, left: 4 };
  const w = width - pad.left - pad.right;
  const h = H - pad.top - pad.bottom;
  const lo = Math.min(...points.map((p) => p.rate));
  const hi = Math.max(...points.map((p) => p.rate));
  const span = hi - lo || hi * 0.01;
  const yMin = lo - span * 0.15;
  const yMax = hi + span * 0.15;
  const t0 = points[0]!.at;
  const t1 = points.at(-1)!.at;
  const x = (t: number) => pad.left + ((t - t0) / (t1 - t0 || 1)) * w;
  const y = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * h;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.at).toFixed(1)},${y(p.rate).toFixed(1)}`).join(' ');
  const ticks = [yMin + (yMax - yMin) * 0.2, yMin + (yMax - yMin) * 0.5, yMin + (yMax - yMin) * 0.8];
  const h0 = hover === null ? null : points[hover]!;

  const pick = (clientX: number) => {
    const rect = box.current!.getBoundingClientRect();
    const t = t0 + ((clientX - rect.left - pad.left) / w) * (t1 - t0);
    let best = 0;
    points.forEach((p, i) => (Math.abs(p.at - t) < Math.abs(points[best]!.at - t) ? (best = i) : null));
    setHover(best);
  };

  return (
    <div ref={box} className="relative">
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={`${currency} in naira, ${points.length} published rates from ${lagos(new Date(t0).toISOString(), false)} to ${lagos(new Date(t1).toISOString(), false)}`}
        tabIndex={0}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setHover((i) => Math.max(0, (i ?? points.length) - 1));
          if (e.key === 'ArrowRight') setHover((i) => Math.min(points.length - 1, (i ?? -1) + 1));
        }}
        onBlur={() => setHover(null)}
        className="block touch-none outline-none focus-visible:ring-2 focus-visible:ring-graphite/30"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.left} x2={pad.left + w} y1={y(v)} y2={y(v)} stroke="#141c17" strokeOpacity={0.07} />
            <text x={pad.left + w + 8} y={y(v) + 4} fontSize={11} fill="#141c17" fillOpacity={0.45}>
              {naira(v, dp)}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#141c17" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {h0 && (
          <g>
            <line x1={x(h0.at)} x2={x(h0.at)} y1={pad.top} y2={pad.top + h} stroke="#141c17" strokeOpacity={0.25} />
            <circle cx={x(h0.at)} cy={y(h0.rate)} r={4.5} fill="#141c17" stroke="#fff" strokeWidth={2} />
          </g>
        )}
        <text x={pad.left} y={H - 6} fontSize={11} fill="#141c17" fillOpacity={0.45}>
          {lagos(new Date(t0).toISOString(), false)}
        </text>
        <text x={pad.left + w} y={H - 6} fontSize={11} fill="#141c17" fillOpacity={0.45} textAnchor="end">
          {lagos(new Date(t1).toISOString(), false)}
        </text>
      </svg>
      {h0 && (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-graphite/10 bg-white px-3 py-2 text-[12.5px] shadow-[0_8px_24px_-12px_rgba(20,28,23,0.35)]"
          style={{ left: Math.min(Math.max(x(h0.at) - 70, 0), width - 150) }}
        >
          <span className="block text-graphite/55">{lagos(new Date(h0.at).toISOString(), false)}</span>
          <span className="block font-ledger font-semibold">{naira(h0.rate, dp)}</span>
        </div>
      )}
      <table className="sr-only">
        <caption>{currency} in naira</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.at}>
              <th scope="row">{lagos(new Date(p.at).toISOString(), false)}</th>
              <td>{naira(p.rate, dp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A quick sum at the reference rate, either way round. */
function Converter({ r }: { r: FxRateDto }) {
  const [amount, setAmount] = useState('1000');
  const [toNaira, setToNaira] = useState(true);
  const n = Number(amount.replace(/,/g, '')) || 0;
  const rate = Number(r.rate);
  const result = toNaira ? n * rate : n / rate;

  return (
    <section className={`${panel} p-5`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold">Work it out</h2>
        <button type="button" onClick={() => setToNaira((v) => !v)} aria-label={toNaira ? `Work out naira to ${r.currency} instead` : `Work out ${r.currency} to naira instead`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-graphite/60 hover:text-graphite">
          <ArrowLeftRight className="size-3.5" /> Swap
        </button>
      </div>
      <p className="mt-1 text-[13px] text-graphite/55">{toNaira ? `${r.currency} into naira` : `Naira into ${r.currency}`}</p>
      <label className="mt-3 block">
        <span className={label}>{toNaira ? r.currency : 'Naira'}</span>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))} className={`${field} font-ledger`} />
      </label>
      <p className="mt-3 font-ledger text-[22px] font-semibold tracking-[-0.02em]">
        {toNaira ? naira(result) : `${r.currency} ${result.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </p>
      <p className="text-[12.5px] text-graphite/50">At today’s reference rate. What you’d actually pay or get will differ.</p>
    </section>
  );
}

function Alerts({ rates, selected }: { rates: FxRateDto[]; selected: string }) {
  const alerts = useFxAlerts();
  const create = useCreateFxAlert();
  const cancel = useCancelFxAlert();
  const [currency, setCurrency] = useState(selected);
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [target, setTarget] = useState('');
  useEffect(() => setCurrency(selected), [selected]);
  const now = rates.find((r) => r.currency === currency);
  const n = Number(target.replace(/,/g, ''));
  const already = !!now && n > 0 && (direction === 'above' ? Number(now.rate) >= n : Number(now.rate) <= n);

  const active = (alerts.data ?? []).filter((a) => a.status === 'active');
  const fired = (alerts.data ?? []).filter((a) => a.status === 'triggered').slice(0, 5);

  return (
    <section className={`${panel} p-5`}>
      <h2 className="flex items-center gap-2 text-[16px] font-semibold">
        <Bell className="size-4 text-graphite/50" /> Rate alerts
      </h2>
      <p className="mt-0.5 text-[13px] text-graphite/55">An email the day a rate reaches your number. Each alert goes off once.</p>
      <form
        className="mt-3 space-y-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!(n > 0) || already) return;
          create.mutate({ currency, direction, target: String(n) }, { onSuccess: () => setTarget('') });
        }}
      >
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Currency" className={field}>
            {rates.map((r) => (
              <option key={r.currency} value={r.currency}>
                {r.currency}
              </option>
            ))}
          </select>
          <select value={direction} onChange={(e) => setDirection(e.target.value as 'above' | 'below')} aria-label="When" className={field}>
            <option value="above">Rises to</option>
            <option value="below">Falls to</option>
          </select>
        </div>
        <label className="block">
          <span className="sr-only">Naira per one {currency}</span>
          <input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d.,]/g, ''))} placeholder={now ? `₦ per ${currency} (today ${naira(now.rate)})` : '₦'} className={`${field} font-ledger`} />
        </label>
        {already && <p className="text-[13px] text-graphite/60">It’s already {direction === 'above' ? 'at or above' : 'at or below'} that today.</p>}
        {create.error && <p className="text-[13px] text-[#a3261b]">{errorMessage(create.error)}</p>}
        <button type="submit" disabled={!(n > 0) || already || create.isPending} className={`${primary} w-full`}>
          {create.isPending && <Loader2 className="size-4 animate-spin" />} Set alert
        </button>
      </form>

      {(active.length > 0 || fired.length > 0) && (
        <ul className="mt-4 divide-y divide-graphite/[0.07] text-[14px]">
          {active.map((a) => (
            <AlertRow key={a.id} a={a} onCancel={() => cancel.mutate(a.id)} busy={cancel.isPending} />
          ))}
          {fired.map((a) => (
            <AlertRow key={a.id} a={a} />
          ))}
        </ul>
      )}
      {cancel.error && <p className="mt-2 text-[13px] text-[#a3261b]">{errorMessage(cancel.error)}</p>}
    </section>
  );
}

function AlertRow({ a, onCancel, busy }: { a: FxAlertDto; onCancel?: () => void; busy?: boolean }) {
  const fired = a.status === 'triggered';
  return (
    <li className="flex items-center gap-3 py-2.5">
      {fired ? <BellRing className="size-4 shrink-0 text-graphite/70" /> : <Bell className="size-4 shrink-0 text-graphite/35" />}
      <span className="min-w-0 flex-1">
        <span className="block">
          {a.currency} {a.direction === 'above' ? 'rises to' : 'falls to'} <span className="font-ledger font-semibold">{naira(a.target)}</span>
        </span>
        <span className="block text-[12.5px] text-graphite/50">
          {fired ? `Went off ${lagos(a.triggeredAt!, false)} at ${naira(a.triggeredRate!)}` : `Set at ${naira(a.rateWhenSet)}${a.yours ? '' : ' by someone on the team'}`}
        </span>
      </span>
      {onCancel && (
        <button type="button" disabled={busy} onClick={onCancel} className="text-[13px] font-semibold text-graphite/55 underline-offset-4 hover:text-graphite hover:underline">
          Cancel
        </button>
      )}
    </li>
  );
}
