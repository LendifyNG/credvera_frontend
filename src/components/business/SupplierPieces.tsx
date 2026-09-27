import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

// An example order, the same one used across the business pages.
const ORDER = 12400;
const DEPOSIT = 0.3;
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const steps = [
  { title: 'Deposit paid', body: 'You pay 30% now and set the date the goods must ship by.' },
  { title: 'Bill of lading checked', body: 'The supplier sends it. We check it with the shipping line.' },
  { title: 'Loaded. Balance released', body: 'The shipping line confirms the goods are on board. The supplier is paid.' },
];

/** A shipping container, in hairlines, that fills and sails as the order moves on. */
function Container({ step }: { step: number }) {
  const loaded = step >= 1;
  const sailing = step >= 2;
  return (
    <svg viewBox="0 0 560 300" className="w-full" role="img" aria-label={steps[step]!.title}>
      {/* The quay, then the water once it's on board */}
      <motion.line x1="0" x2="560" y1="236" y2="236" stroke="#141c17" strokeOpacity="0.2" animate={{ opacity: sailing ? 0 : 1 }} />
      <AnimatePresence>
        {sailing && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            {/* Deck and hull */}
            <path d="M 70 236 L 490 236 L 460 272 L 100 272 Z" fill="none" stroke="#141c17" strokeWidth="1.5" />
            {[0, 1, 2].map((w) => (
              <motion.path
                key={w}
                d={`M ${-40 + w * 12} ${284 + w * 8} q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`}
                fill="none"
                stroke="#141c17"
                strokeOpacity={0.18 - w * 0.05}
                animate={{ x: [0, 40] }}
                transition={{ duration: 3 + w, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>

      <motion.g animate={{ x: sailing ? 50 : 0, y: sailing ? -2 : 0 }} transition={{ duration: 1.1, ease }}>
        {/* The box */}
        <rect
          x="90"
          y="100"
          width="330"
          height="134"
          rx="3"
          fill="white"
          stroke="#141c17"
          strokeWidth="1.5"
          strokeDasharray={loaded ? '0' : '6 6'}
          strokeOpacity={loaded ? 1 : 0.45}
        />
        {/* Ribs */}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={110 + i * 20} x2={110 + i * 20} y1="108" y2="226" stroke="#141c17" strokeOpacity={loaded ? 0.14 : 0.07} />
        ))}
        {/* Doors and locking bars */}
        <line x1="380" x2="380" y1="100" y2="234" stroke="#141c17" strokeOpacity={loaded ? 0.5 : 0.25} />
        {[392, 404].map((x) => (
          <line key={x} x1={x} x2={x} y1="110" y2="224" stroke="#141c17" strokeOpacity={loaded ? 0.6 : 0.25} strokeWidth="2" />
        ))}
        {/* Cargo, visible through the side once it's checked */}
        <AnimatePresence>
          {loaded &&
            [0, 1, 2, 3, 4, 5].map((b) => (
              <motion.rect
                key={b}
                x={112 + (b % 3) * 80}
                y={b < 3 ? 176 : 124}
                width="70"
                height="48"
                rx="2"
                fill="#7fde80"
                fillOpacity="0.22"
                stroke="#1f6b33"
                strokeOpacity="0.5"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: b * 0.07 }}
              />
            ))}
        </AnimatePresence>
        {/* The container's own number, stencilled */}
        <text x="104" y="96" fontSize="12" fill="#141c17" fillOpacity="0.5" fontFamily="Geist Mono, monospace">
          CRDU 418207 3 · 20FT
        </text>
      </motion.g>
    </svg>
  );
}

/**
 * Pay on shipment, in three steps: the container fills and goes on board, and
 * the money beside it moves from held to paid.
 */
export function WhereMoneyWaits() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const [step, setStep] = useState(reduce ? 2 : 0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inView || reduce || touched) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % steps.length), step === 2 ? 4200 : 2600);
    return () => clearTimeout(t);
  }, [inView, reduce, touched, step]);

  const paid = ORDER * DEPOSIT;
  const held = ORDER - paid;
  const released = step === 2;

  return (
    <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <Container step={step} />
      <div>
        <ol className="border-t border-graphite/15">
          {steps.map((s, i) => (
            <li key={s.title} className="border-b border-graphite/15">
              <button
                type="button"
                onClick={() => {
                  setTouched(true);
                  setStep(i);
                }}
                aria-pressed={i === step}
                className="grid w-full grid-cols-[2.5rem_1fr] gap-3 py-4 text-left"
              >
                <span className={`font-ledger text-[12px] ${i <= step ? 'text-graphite' : 'text-graphite/35'}`}>{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className={`block text-[17px] font-semibold tracking-tight ${i === step ? 'text-graphite' : 'text-graphite/45'}`}>{s.title}</span>
                  {i === step && <span className="mt-1 block text-[14px] leading-relaxed text-graphite/60">{s.body}</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <dl className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <dt className="font-medium text-[13px] text-graphite/45">Paid to supplier</dt>
            <dd className="mt-1 font-ledger text-[clamp(1.4rem,2.6vw,2rem)] font-medium tabular-nums">{usd(released ? ORDER : paid)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[13px] text-graphite/45">Held by Credvera</dt>
            <dd className={`mt-1 font-ledger text-[clamp(1.4rem,2.6vw,2rem)] font-medium tabular-nums ${released ? 'text-graphite/30 line-through' : ''}`}>
              {usd(held)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/** At the ship-by date, the road forks: loaded, or not. */
export function ShipFork() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const draw = (delay: number) => ({
    initial: reduce ? false : { pathLength: 0 },
    animate: seen || reduce ? { pathLength: 1 } : {},
    transition: { duration: 1.2, ease, delay },
  });
  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
      <svg viewBox="0 0 420 260" className="w-full max-w-md" aria-hidden>
        <motion.path d="M 10 130 L 180 130" fill="none" stroke="#141c17" strokeWidth="2" {...draw(0)} />
        <motion.path d="M 180 130 C 240 130, 250 50, 330 50 L 410 50" fill="none" stroke="#1f6b33" strokeWidth="2" {...draw(1)} />
        <motion.path d="M 180 130 C 240 130, 250 210, 330 210 L 410 210" fill="none" stroke="#b07a1d" strokeWidth="2" strokeDasharray="6 6" {...draw(1.2)} />
        <circle cx="180" cy="130" r="7" fill="white" stroke="#141c17" strokeWidth="2" />
        <text x="180" y="160" textAnchor="middle" fontSize="12" fill="#141c17" fillOpacity="0.55" fontFamily="Geist Mono, monospace">
          SHIP-BY DATE
        </text>
      </svg>
      <div className="space-y-8">
        <div className="border-l-2 border-[#1f6b33] pl-5">
          <p className="font-medium text-[13px] text-[#1f6b33]">Loaded in time</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">The balance goes to your supplier.</p>
          <p className="mt-1 text-[15px] text-graphite/60">Once the shipping line confirms your goods are on board.</p>
        </div>
        <div className="border-l-2 border-dashed border-[#b07a1d] pl-5">
          <p className="font-medium text-[13px] text-[#8a5a12]">Not loaded in time</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">The held money comes back to you.</p>
          <p className="mt-1 text-[15px] text-graphite/60">Only the deposit you chose was ever at stake.</p>
        </div>
      </div>
    </div>
  );
}

// An example supplier's record: 43 orders, 39 on time, 3 late, 1 disputed (order 17).
const record = Array.from({ length: 43 }, (_, i) => (i === 16 ? 'dispute' : [5, 22, 38].includes(i) ? 'late' : 'ontime'));

/** A supplier's record as a barcode: one bar per order shipped to a Nigerian business on Credvera. */
export function PassportBarcode() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-15% 0px' });
  return (
    <div ref={ref}>
      <div className="flex h-40 items-end gap-[3px] sm:gap-1">
        {record.map((r, i) => (
          <motion.span
            key={i}
            title={r === 'ontime' ? 'Shipped on time' : r === 'late' ? 'Shipped late' : 'Disputed'}
            className={`flex-1 rounded-[1px] ${r === 'ontime' ? 'bg-white' : r === 'late' ? 'bg-[#f5c451]' : 'bg-[#ef6b5b]'}`}
            initial={reduce ? false : { height: 0 }}
            animate={seen || reduce ? { height: r === 'dispute' ? '100%' : r === 'late' ? '70%' : `${78 + ((i * 37) % 22)}%` } : {}}
            transition={{ duration: 0.6, ease, delay: i * 0.02 }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-medium text-[13px] text-white/55">
        <span className="flex items-center gap-2"><span className="size-2 rounded-[1px] bg-white" /> On time · 39</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-[1px] bg-[#f5c451]" /> Late · 3</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-[1px] bg-[#ef6b5b]" /> Disputed · 1</span>
      </div>
      <p className="mt-8 flex items-center gap-2 text-[15px] text-white/70">
        <Check className="size-4 text-primary" /> We confirm shipment, not the quality of the goods.
      </p>
    </div>
  );
}
