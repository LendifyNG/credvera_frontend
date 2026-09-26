import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Audience } from '../../lib/audience';

const ease = [0.16, 1, 0.3, 1] as const;

// Today's example rate, the same on the Abroad page.
// TODO(credvera): use the live rate once the rates API is connected.
const RATE = 1535;

// The torn bottom edge of the receipt.
const TEAR = 'conic-gradient(from -45deg at bottom, transparent 90deg, #000 0) bottom / 14px 7px repeat-x, linear-gradient(#000 0 0) top / 100% calc(100% - 7px) no-repeat';

const ngn = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Line = [string, string, ('strong' | 'free' | 'muted')?];
type Case = {
  name: string;
  currency: '₦' | '$';
  start: number;
  max: number;
  step: number;
  lines: (amount: number, option: number) => Line[];
  options?: string[];
};

const cases: Record<Audience, Case[]> = {
  personal: [
    {
      name: 'Send to a Nigerian bank',
      currency: '₦',
      start: 50000,
      max: 1000000,
      step: 5000,
      lines: (a) => [
        ['You send', ngn(a)],
        ['Transfer fee', ngn(10)],
        ['They get', ngn(a), 'strong'],
        ['Taken from your balance', ngn(a + 10), 'muted'],
      ],
    },
    {
      name: 'Receive from abroad',
      currency: '$',
      start: 850,
      max: 10000,
      step: 50,
      lines: (a) => [
        ['Your client sends', usd(a)],
        ['Fee to receive', 'Free', 'free'],
        ['Lands in your USD account', usd(a), 'strong'],
      ],
    },
    {
      name: 'Convert dollars to naira',
      currency: '$',
      start: 500,
      max: 10000,
      step: 50,
      lines: (a) => [
        ['You convert', usd(a)],
        ['Our rate', ngn(RATE)],
        ['Market rate', ngn(RATE), 'muted'],
        ['You get', ngn(a * RATE), 'strong'],
      ],
    },
    {
      name: 'Pay a bill',
      currency: '₦',
      start: 19000,
      max: 200000,
      step: 500,
      options: ['Airtime', 'DStv', 'Remita'],
      lines: (a, o) => [
        [['Airtime', 'DStv', 'Remita'][o] ?? 'Bill', ngn(a)],
        ['Fee', 'Free', 'free'],
        ['Total', ngn(a), 'strong'],
      ],
    },
  ],
  business: [
    {
      name: 'Pay a Nigerian bank',
      currency: '₦',
      start: 650000,
      max: 20000000,
      step: 50000,
      lines: (a) => [
        ['You pay', ngn(a)],
        ['Transfer fee', ngn(25)],
        ['They get', ngn(a), 'strong'],
        ['Taken from your balance', ngn(a + 25), 'muted'],
      ],
    },
    {
      name: 'Pay a supplier abroad',
      currency: '$',
      start: 5000,
      max: 100000,
      step: 500,
      options: ['UK or euro', 'United States', 'China'],
      lines: (a, o) => [
        ['Supplier gets', usd(a), 'strong'],
        ['Payment fee, flat', ngn([2500, 3500, 5000][o] ?? 2500)],
        ['Same fee for any amount', '', 'muted'],
      ],
    },
    {
      name: 'Convert dollars to naira',
      currency: '$',
      start: 20000,
      max: 200000,
      step: 500,
      lines: (a) => [
        ['You convert', usd(a)],
        ['Our rate', ngn(RATE)],
        ['Market rate', ngn(RATE), 'muted'],
        ['You get', ngn(a * RATE), 'strong'],
      ],
    },
  ],
};

/**
 * Pricing you can try: pick what you want to do and how much, and a receipt
 * prints with the fee and exactly what arrives.
 */
export default function PriceCheck({ audience }: { audience: Audience }) {
  const list = cases[audience];
  const [which, setWhich] = useState(0);
  const [option, setOption] = useState(0);
  const c = list[which] ?? list[0]!;
  const [amount, setAmount] = useState(c.start);
  const [printed, setPrinted] = useState({ which: 0, option: 0, amount: c.start });

  // A fresh receipt shortly after the amount stops changing.
  useEffect(() => {
    const t = window.setTimeout(() => setPrinted({ which, option, amount }), 380);
    return () => clearTimeout(t);
  }, [which, option, amount]);

  const pick = (i: number) => {
    setWhich(i);
    setOption(0);
    setAmount(list[i]!.start);
  };

  const pc = list[printed.which] ?? c;
  const lines = pc.lines(printed.amount, printed.option);
  const stamp = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid items-start gap-14 lg:grid-cols-[1fr_minmax(0,400px)] lg:gap-24">
      <div>
        <p className="text-[13px] font-semibold text-ink/40">What do you want to do?</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {list.map((x, i) => (
            <button
              key={x.name}
              type="button"
              onClick={() => pick(i)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                i === which ? 'bg-secondary text-white' : 'bg-white text-ink/65 ring-1 ring-ink/10 hover:ring-ink/30'
              }`}
            >
              {x.name}
            </button>
          ))}
        </div>

        {c.options ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {c.options.map((o, i) => (
              <button
                key={o}
                type="button"
                onClick={() => setOption(i)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${i === option ? 'bg-primary text-secondary' : 'text-ink/55 ring-1 ring-ink/10'}`}
              >
                {o}
              </button>
            ))}
          </div>
        ) : null}

        <label htmlFor="price-amount" className="mt-10 block text-sm text-ink/55">
          Amount
        </label>
        <div className="mt-2 flex items-baseline gap-2 border-b-2 border-ink/15 pb-3 focus-within:border-background">
          <span className="text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-none text-ink/35">{c.currency}</span>
          <input
            id="price-amount"
            inputMode="numeric"
            value={amount.toLocaleString('en-NG')}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[^\d]/g, ''));
              setAmount(Math.min(c.max, n));
            }}
            className="w-full min-w-0 bg-transparent text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-none tabular-nums tracking-[-0.03em] outline-none"
          />
        </div>
        <input
          type="range"
          aria-label="Amount"
          min={c.step}
          max={c.max}
          step={c.step}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-6 w-full accent-[#063c1a]"
        />
        <p className="mt-6 max-w-md leading-relaxed text-ink/55">
          This is the same breakdown the app shows before you confirm. If a fee applies, you see it first.
        </p>
      </div>

      {/* The printer and its receipt */}
      <div className="relative">
        <div className="relative z-10 h-5 rounded-full bg-secondary shadow-[0_10px_20px_-10px_rgba(1,21,4,0.6)]">
          <span className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-black/50" />
        </div>
        <div className="-mt-2.5 overflow-hidden px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={JSON.stringify(printed)}
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%', transition: { duration: 0.25, ease: 'easeIn' } }}
              transition={{ duration: 0.9, ease }}
              className="relative bg-[#fbfaf6] px-6 pb-8 pt-8 font-mono text-[13px] text-ink shadow-[0_30px_50px_-30px_rgba(1,21,4,0.5)]"
              style={{ mask: TEAR, WebkitMask: TEAR }}
            >
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-ink/60">Credvera</p>
              <p className="mt-1 text-center text-[11px] text-ink/45">{pc.name} · {stamp}</p>
              <div className="mt-5 space-y-2.5 border-y border-dashed border-ink/25 py-4">
                {lines.map(([k, v, tone], i) => (
                  <motion.p
                    key={k}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.12 }}
                    className={`flex justify-between gap-4 ${tone === 'strong' ? 'text-[15px] font-bold' : tone === 'muted' ? 'text-ink/45' : ''}`}
                  >
                    <span>{k}</span>
                    <span className={`tabular-nums ${tone === 'free' ? 'rounded bg-primary/40 px-1.5 font-bold text-background' : ''}`}>{v}</span>
                  </motion.p>
                ))}
              </div>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-ink/45">Shown before you confirm.<br />No hidden charges.</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
