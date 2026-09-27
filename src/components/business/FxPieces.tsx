import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Check, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import frankfurt from '../../assets/photos/business/city-frankfurt.webp';
import lagos from '../../assets/photos/business/city-lagos.webp';
import london from '../../assets/photos/business/city-london.webp';
import newyork from '../../assets/photos/business/city-newyork.webp';

const ease = [0.16, 1, 0.3, 1] as const;

// Each currency, filled with a photograph of a city that trades in it
// (Pexels photos 38513712, 29532724, 14944496, 31640270).
const windows = [
  { glyph: '₦', code: 'NGN', city: 'Lagos', img: lagos, pos: '50% 60%' },
  { glyph: '$', code: 'USD', city: 'New York', img: newyork, pos: '50% 55%' },
  { glyph: '£', code: 'GBP', city: 'London', img: london, pos: '50% 50%' },
  { glyph: '€', code: 'EUR', city: 'Frankfurt', img: frankfurt, pos: '50% 50%' },
];

/** Four currency signs, each a window onto a city. The photo drifts inside the sign on hover. */
export function CurrencyWindows() {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
      {windows.map((w, i) => (
        <motion.figure
          key={w.code}
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.1 + i * 0.1 }}
          className="group"
        >
          <span
            role="img"
            aria-label={`${w.code}, with a photo of ${w.city}`}
            className="block text-center text-[clamp(8rem,20vw,17rem)] font-black leading-[0.85] tracking-[-0.06em] text-transparent transition-[background-position] duration-[2500ms] ease-out [background-clip:text] [-webkit-background-clip:text] group-hover:[background-position:50%_20%]"
            style={{ backgroundImage: `url(${w.img})`, backgroundSize: 'cover', backgroundPosition: w.pos }}
          >
            {w.glyph}
          </span>
          <figcaption className="mt-4 flex items-baseline justify-center gap-3 font-medium text-[13px]">
            <span className="text-graphite">{w.code}</span>
            <span className="text-graphite/45">{w.city}</span>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}

// Today's example rates, the same across the site.
// TODO(credvera): live rates once the rates API is connected.
const rates = { USD: 1535, GBP: 2065, EUR: 1790 } as const;
const sign = { USD: '$', GBP: '£', EUR: '€' } as const;
const amounts = [1000, 5000, 20000];
const fmt = (n: number) => n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A quote written out as a sum: what you sell, times our rate, is what you get. */
export function QuoteSum() {
  const [code, setCode] = useState<keyof typeof rates>('USD');
  const [amount, setAmount] = useState(5000);
  const rate = rates[code];
  const cell = 'font-ledger text-[clamp(1.6rem,4.2vw,3.6rem)] font-medium tabular-nums tracking-[-0.04em]';
  const label = 'mt-3 font-medium text-[13px] text-graphite/45';
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(rates) as (keyof typeof rates)[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCode(c)}
            className={`rounded-md px-3 py-1.5 font-ledger text-[12px] transition-colors ${c === code ? 'bg-graphite text-white' : 'text-graphite/55 ring-1 ring-graphite/15 hover:text-graphite'}`}
          >
            {c}
          </button>
        ))}
        <span className="mx-2 w-px bg-graphite/15" />
        {amounts.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAmount(a)}
            className={`rounded-md px-3 py-1.5 font-ledger text-[12px] transition-colors ${a === amount ? 'bg-graphite text-white' : 'text-graphite/55 ring-1 ring-graphite/15 hover:text-graphite'}`}
          >
            {sign[code]}
            {a.toLocaleString('en-US')}
          </button>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-[auto_auto] items-start gap-x-6 gap-y-8 lg:grid-cols-[auto_auto_auto_auto_auto] lg:gap-x-8">
        <div>
          <p className={cell}>
            {sign[code]}
            {fmt(amount)}
          </p>
          <p className={label}>You sell</p>
        </div>
        <p className={`${cell} text-graphite/30`}>×</p>
        <div>
          <p className={cell}>₦{fmt(rate)}</p>
          <p className={label}>Our rate · market ₦{fmt(rate)}</p>
        </div>
        <p className={`${cell} text-graphite/30`}>=</p>
        <div className="col-span-2 lg:col-span-1">
          <p className={`${cell} text-[#1f5c30]`}>₦{fmt(amount * rate)}</p>
          <p className={label}>You get</p>
        </div>
      </div>
      <p className="mt-10 max-w-xl text-[15px] leading-relaxed text-graphite/60">
        That’s the whole sum. The rate you see is the rate you get, and it sits beside the market rate every time.
      </p>
    </div>
  );
}

/** Two thirty-second tracks: one confirmed inside the hold, one where the rate moved and you were asked again. */
export function HoldTracks() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const go = seen || !!reduce;

  const Track = ({ stop, delay, children }: { stop: number; delay: number; children: React.ReactNode }) => (
    <div>
      <div className="relative h-10">
        {/* Thirty ticks, one a second */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {Array.from({ length: 31 }, (_, s) => (
            <span key={s} className={`w-px bg-graphite/20 ${s % 5 === 0 ? 'h-4' : 'h-2'}`} />
          ))}
        </div>
        <motion.span
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-graphite"
          initial={{ width: 0 }}
          animate={{ width: go ? `${(stop / 30) * 100}%` : 0 }}
          transition={{ duration: reduce ? 0 : 2.2 * (stop / 30) + 0.4, ease: 'linear', delay }}
        />
        <motion.span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-graphite ring-4 ring-white"
          initial={{ left: 0, opacity: 0 }}
          animate={go ? { left: `${(stop / 30) * 100}%`, opacity: 1 } : {}}
          transition={{ duration: reduce ? 0 : 2.2 * (stop / 30) + 0.4, ease: 'linear', delay }}
        />
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={go ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: delay + 2.2 * (stop / 30) + 0.5 }}
        className="mt-3"
      >
        {children}
      </motion.div>
    </div>
  );

  return (
    <div ref={ref} className="space-y-12">
      <div className="flex justify-between font-ledger text-[11px] text-graphite/40">
        <span>0s</span>
        <span>The rate is held for 30 seconds</span>
        <span>30s</span>
      </div>
      <Track stop={12} delay={0}>
        <p className="flex items-center gap-2 text-[16px] font-semibold">
          <Check className="size-4 text-[#1f6b33]" /> Confirmed at 12 seconds
        </p>
        <p className="mt-1 text-[14px] text-graphite/60">Converted at the rate you were shown. Nothing changed underneath you.</p>
      </Track>
      <Track stop={30} delay={0.6}>
        <p className="flex items-center gap-2 text-[16px] font-semibold">
          <RefreshCw className="size-4 text-[#8a5a12]" /> The hold ran out, and the rate had moved
        </p>
        <p className="mt-1 text-[14px] text-graphite/60">We show you the new rate and ask again. You choose to convert, or not.</p>
      </Track>
    </div>
  );
}
