import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const HOLD_S = 30;

// Example account details in each place's own format, for the example
// business. The receiving bank's name is shown in the app.
const places = [
  {
    code: 'USD',
    flag: 'us',
    name: 'United States',
    note: 'Customers in the US pay you by ACH or wire, like any American business.',
    fields: [
      ['Account name', 'Adeola Foods Ltd'],
      ['Account number', '8310 2291 44'],
      ['Routing number (ACH)', '026 073 150'],
    ],
  },
  {
    code: 'GBP',
    flag: 'gb',
    name: 'United Kingdom',
    note: 'Customers in the UK pay you by Faster Payments, like any British business.',
    fields: [
      ['Account name', 'Adeola Foods Ltd'],
      ['Sort code', '04-00-75'],
      ['Account number', '2938 4756'],
    ],
  },
  {
    code: 'EUR',
    flag: 'eu',
    name: 'Euro countries',
    note: 'Customers across the euro area pay you by SEPA transfer.',
    fields: [
      ['Account name', 'Adeola Foods Ltd'],
      ['IBAN', 'DE12 1001 1001 2627 4613 58'],
    ],
  },
] as const;

// Today's example rates (our rate, market rate), the same across the site.
// TODO(credvera): live rates once the rates API is connected.
const rates: Record<string, [number, number]> = { USD: [1535, 1535], GBP: [2065, 2065], EUR: [1790, 1790] };
const symbol: Record<string, string> = { USD: '$', GBP: '£', EUR: '€' };
const startBalances: Record<string, number> = { NGN: 3420750, USD: 18240, GBP: 2150, EUR: 3400 };

const fmt = (n: number, d = 2) => n.toLocaleString('en-NG', { minimumFractionDigits: d, maximumFractionDigits: d });

function Balance({ code, value }: { code: string; value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => `${code === 'NGN' ? '₦' : symbol[code]}${fmt(v)}`);
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.2, ease });
    return () => c.stop();
  }, [mv, value]);
  return <motion.span className="font-ledger tabular-nums">{text}</motion.span>;
}

/** FX for a business: account details in each customer's own format, and a desk to convert at a held rate. */
export default function FxDesk() {
  const reduce = useReducedMotion();
  const [place, setPlace] = useState(0);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState<'USD' | 'GBP' | 'EUR'>('USD');
  const [amount, setAmount] = useState(5000);
  const [balances, setBalances] = useState(startBalances);
  const [quoteId, setQuoteId] = useState(0); // a new quote restarts the hold
  const [left, setLeft] = useState(HOLD_S);
  const [done, setDone] = useState(false);

  const p = places[place]!;
  const [ours, market] = rates[code]!;
  const get = amount * ours;
  const max = Math.floor(balances[code]! / 100) * 100;

  // The hold counts down; when it runs out, a fresh quote starts.
  useEffect(() => {
    if (done || reduce) return;
    if (left <= 0) {
      setQuoteId((q) => q + 1);
      setLeft(HOLD_S);
      return;
    }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, done, reduce]);

  const requote = () => {
    setDone(false);
    setLeft(HOLD_S);
    setQuoteId((q) => q + 1);
  };

  const convert = () => {
    if (amount > balances[code]!) return;
    setBalances((b) => ({ ...b, [code]: b[code]! - amount, NGN: b.NGN! + get }));
    setDone(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.fields.map(([k, v]) => `${k}: ${v}`).join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard not available; nothing to do.
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Where customers pay from */}
      <div className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
        <p className="font-medium text-[12.5px] text-white/45">Where do your customers pay from?</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {places.map((x, i) => (
            <button
              key={x.code}
              type="button"
              onClick={() => setPlace(i)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                i === place ? 'bg-white text-graphite' : 'text-white/70 ring-1 ring-white/15 hover:bg-white/10'
              }`}
            >
              <img src={`https://flagcdn.com/w40/${x.flag}.png`} alt="" className="h-3 w-[18px] rounded-[2px] object-cover" loading="lazy" />
              {x.name}
            </button>
          ))}
        </div>

        <motion.div layout className="mt-6 overflow-hidden rounded-xl bg-white text-graphite">
          <div className="flex items-center justify-between border-b border-graphite/10 px-5 py-3">
            <span className="font-ledger text-[12px] font-medium">{p.code} account</span>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-graphite/60 hover:text-graphite">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy details'}
            </button>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.dl
              key={p.code}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
              className="divide-y divide-graphite/[0.07] px-5"
            >
              {p.fields.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-[13px] text-graphite/55">{k}</dt>
                  <dd className="text-right font-ledger text-[15px] font-medium tracking-wide">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </AnimatePresence>
        </motion.div>
        <p className="mt-4 text-[14px] leading-relaxed text-white/60">{p.note}</p>
      </div>

      {/* The convert desk */}
      <div className="rounded-2xl bg-white p-6 text-graphite sm:p-8">
        <div className="flex items-center justify-between">
          <p className="font-medium text-[12.5px] text-graphite/45">Convert to naira</p>
          <div className="flex rounded-md bg-ledger p-0.5 font-ledger text-[12px]">
            {(['USD', 'GBP', 'EUR'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCode(c);
                  setAmount(Math.min(amount, Math.floor(balances[c]! / 100) * 100));
                  requote();
                }}
                className={`rounded px-2.5 py-1 transition-colors ${c === code ? 'bg-graphite text-white' : 'text-graphite/55'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-baseline justify-between gap-4">
          <span className="text-sm text-graphite/55">You sell</span>
          <span className="font-ledger text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold tabular-nums">
            {symbol[code]}
            {fmt(amount)}
          </span>
        </div>
        <input
          type="range"
          aria-label="Amount to convert"
          min={100}
          max={Math.max(100, max)}
          step={100}
          value={amount}
          disabled={done}
          onChange={(e) => {
            setAmount(Number(e.target.value));
            requote();
          }}
          className="mt-3 w-full accent-[#141c17]"
        />
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-graphite/10 pt-4">
          <span className="text-sm text-graphite/55">You get</span>
          <span className="font-ledger text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold tabular-nums">₦{fmt(get)}</span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <div className="rounded-lg bg-ledger px-3 py-2.5">
            <dt className="text-graphite/50">Our rate</dt>
            <dd className="font-ledger font-medium tabular-nums">₦{fmt(ours)}</dd>
          </div>
          <div className="rounded-lg bg-ledger px-3 py-2.5">
            <dt className="text-graphite/50">Market rate</dt>
            <dd className="font-ledger font-medium tabular-nums">₦{fmt(market)}</dd>
          </div>
        </dl>

        {/* The hold */}
        {!done ? (
          <>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-graphite/10">
              <motion.div
                key={quoteId}
                className="h-full bg-graphite"
                initial={{ width: '100%' }}
                animate={{ width: reduce ? '100%' : '0%' }}
                transition={{ duration: HOLD_S, ease: 'linear' }}
              />
            </div>
            <p className="mt-2 font-ledger text-[11px] text-graphite/45">Rate held for {left}s while you decide</p>
            <button
              type="button"
              onClick={convert}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-graphite text-[15px] font-semibold text-white transition-colors hover:bg-black"
            >
              Convert {symbol[code]}
              {fmt(amount, 0)}
            </button>
          </>
        ) : (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-primary/25 px-4 py-3">
            <span className="flex items-center gap-2 text-[14px] font-semibold text-[#1f5c30]">
              <Check className="size-4" /> Converted at ₦{fmt(ours)}
            </span>
            <button type="button" onClick={requote} className="text-[13px] font-semibold text-graphite/60 hover:text-graphite">
              New quote
            </button>
          </div>
        )}

        {/* Balances, updating as you convert */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-graphite/10 pt-4 text-[13px]">
          {(['NGN', 'USD', 'GBP', 'EUR'] as const).map((c) => (
            <div key={c} className="flex justify-between">
              <span className="font-ledger text-graphite/45">{c}</span>
              <Balance code={c} value={balances[c]!} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
