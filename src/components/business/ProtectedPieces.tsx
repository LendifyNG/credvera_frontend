import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Check, Loader2, ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const ink = '#1c1e21';

// An example protected order for the example business, Okafor Studios.
const ORDER = 1_200_000;
const DEPOSIT = 0.3;
const naira = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

// What the order really does (backend protected-orders): the deposit goes now,
// the rest is held, and the business releases it when the goods are fine.
const steps = [
  { title: 'Deposit paid. The rest held', body: 'The deposit you agreed goes to your supplier now: none, 20, 30 or 50%. The rest leaves your balance and waits with us.' },
  { title: 'Goods on the road', body: 'You set the date they must ship by, 14 to 45 days out. Nothing more is paid while the goods are on their way.' },
  { title: 'Goods are fine. Balance released', body: 'You release it with your PIN. It goes to the account saved when the order started.' },
];

/** A carton of goods, in hairlines. */
function Carton({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease, delay }}>
      <rect x={x} y={y} width="30" height="30" rx="2" fill="#dcf17e" fillOpacity="0.28" stroke="#1f6b33" strokeOpacity="0.55" />
      <line x1={x + 15} x2={x + 15} y1={y} y2={y + 11} stroke="#1f6b33" strokeOpacity="0.45" />
    </motion.g>
  );
}

/**
 * A Lagos street in hairlines: the supplier's warehouse, the road, and the
 * business's door. The goods load into a van, drive over, and arrive.
 */
function Street({ step }: { step: number }) {
  const moving = step === 1;
  const vanX = step === 0 ? 184 : step === 1 ? 252 : 326;
  return (
    <svg viewBox="0 0 600 300" className="w-full" role="img" aria-label={steps[step]!.title}>
      {/* The road, its markings moving while the van drives */}
      <line x1="0" x2="600" y1="250" y2="250" stroke={ink} strokeOpacity="0.25" />
      <motion.line
        x1="0"
        x2="600"
        y1="268"
        y2="268"
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
        strokeDasharray="16 12"
        animate={moving ? { strokeDashoffset: [0, 56] } : { strokeDashoffset: 0 }}
        transition={moving ? { duration: 0.7, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
      />

      {/* The supplier's warehouse, roller shutter up */}
      <g>
        <path d="M 16 132 L 96 96 L 176 132" fill="none" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="24" y="132" width="144" height="118" fill="white" stroke={ink} strokeWidth="1.5" />
        <rect x="42" y="166" width="108" height="84" fill="#f5f4ef" stroke={ink} strokeOpacity="0.4" />
        {Array.from({ length: 3 }, (_, i) => (
          <line key={i} x1="42" x2="150" y1={160 - i * 5} y2={160 - i * 5} stroke={ink} strokeOpacity="0.25" />
        ))}
        <text x="96" y="150" textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="1.2" fill={ink} fillOpacity="0.55">
          OKAFOR PAPER
        </text>
      </g>

      {/* The business's door, with a striped awning */}
      <g>
        <rect x="444" y="150" width="140" height="100" fill="white" stroke={ink} strokeWidth="1.5" />
        <rect x="436" y="134" width="156" height="16" rx="2" fill="#dcf17e" stroke={ink} strokeWidth="1.5" />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={462 + i * 22} x2={462 + i * 22} y1="134" y2="150" stroke={ink} strokeOpacity="0.35" />
        ))}
        <rect x="532" y="186" width="36" height="64" fill="#f5f4ef" stroke={ink} strokeOpacity="0.5" />
        <circle cx="560" cy="220" r="2" fill={ink} fillOpacity="0.5" />
        <text x="514" y="126" textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="1.2" fill={ink} fillOpacity="0.55">
          OKAFOR STUDIOS
        </text>
      </g>

      {/* The goods: in the warehouse, then the van, then at the door */}
      <AnimatePresence>
        {step === 0 && (
          <motion.g key="warehouse" exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.5 }}>
            <Carton x={58} y={219} />
            <Carton x={92} y={219} delay={0.06} />
            <Carton x={75} y={188} delay={0.12} />
          </motion.g>
        )}
        {step === 2 && (
          <motion.g key="door" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Carton x={460} y={219} delay={0.5} />
            <Carton x={494} y={219} delay={0.56} />
            <Carton x={477} y={188} delay={0.62} />
            <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease, delay: 0.9 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <circle cx="492" cy="166" r="13" fill="#dcf17e" stroke={ink} strokeWidth="1.5" />
              <path d="M 486 166 L 490.5 170.5 L 498.5 161.5" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>

      {/* The van */}
      <motion.g initial={false} animate={{ x: vanX }} transition={{ duration: 1.2, ease }}>
        <motion.g animate={moving ? { y: [0, -1.5, 0] } : { y: 0 }} transition={moving ? { duration: 0.45, repeat: Infinity } : { duration: 0.3 }}>
          {/* Speed lines, only on the road */}
          <AnimatePresence>
            {moving &&
              [0, 1, 2].map((i) => (
                <motion.line
                  key={i}
                  x1={-10 - i * 4}
                  x2={-34 - i * 6}
                  y1={190 + i * 16}
                  y2={190 + i * 16}
                  stroke={ink}
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
          </AnimatePresence>
          {/* Cargo box, see-through so the goods show inside */}
          <rect x="0" y="170" width="80" height="68" rx="3" fill="white" fillOpacity="0.85" stroke={ink} strokeWidth="1.5" strokeDasharray={step === 1 ? '0' : '6 5'} strokeOpacity={step === 1 ? 1 : 0.5} />
          <AnimatePresence>
            {step === 1 && (
              <motion.g key="van" exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.4 }}>
                <Carton x={8} y={204} delay={0.1} />
                <Carton x={42} y={204} delay={0.16} />
                <Carton x={25} y={174} delay={0.22} />
              </motion.g>
            )}
          </AnimatePresence>
          {/* Cab */}
          <path d="M 80 188 L 98 188 L 112 210 L 112 238 L 80 238 Z" fill="white" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 85 194 L 96 194 L 106 210 L 85 210 Z" fill="#f5f4ef" stroke={ink} strokeOpacity="0.45" />
          <line x1="0" x2="112" y1="238" y2="238" stroke={ink} strokeWidth="1.5" />
          {/* Wheels, turning on the road */}
          {[22, 92].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="240" r="10" fill="white" stroke={ink} strokeWidth="1.5" />
              <motion.g
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                animate={moving ? { rotate: 360 } : { rotate: 0 }}
                transition={moving ? { duration: 0.6, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
              >
                <line x1={cx - 6} x2={cx + 6} y1="240" y2="240" stroke={ink} strokeOpacity="0.5" />
                <line x1={cx} x2={cx} y1="234" y2="246" stroke={ink} strokeOpacity="0.5" />
              </motion.g>
            </g>
          ))}
        </motion.g>
      </motion.g>
    </svg>
  );
}

/**
 * A protected order, in three steps: the goods leave the warehouse on a van
 * and arrive, and the money beside it moves from held to paid.
 */
export function WhereMoneyWaits() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const [step, setStep] = useState(reduce ? 2 : 0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inView || reduce || touched) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % steps.length), step === 2 ? 4200 : 2800);
    return () => clearTimeout(t);
  }, [inView, reduce, touched, step]);

  const paid = ORDER * DEPOSIT;
  const held = ORDER - paid;
  const released = step === 2;

  return (
    <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <div>
        <Street step={step} />
        <p className="mt-4 text-[13px] text-graphite/45">PO-0007 · Photo paper and ink, 40 cartons · {naira(ORDER)}</p>
      </div>
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
            <dd className="mt-1 font-ledger text-[clamp(1.4rem,2.6vw,2rem)] font-medium tabular-nums">{naira(released ? ORDER : paid)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[13px] text-graphite/45">Held by Credvera</dt>
            <dd className={`mt-1 font-ledger text-[clamp(1.4rem,2.6vw,2rem)] font-medium tabular-nums ${released ? 'text-graphite/30 line-through' : ''}`}>
              {naira(held)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const GOOD = 'M 10 130 L 180 130 C 240 130, 250 50, 330 50 L 410 50';
const BACK = 'M 10 130 L 180 130 C 240 130, 250 210, 330 210 L 410 210';

/** By the ship-by date, the road forks: the goods are fine, or the order is called off. */
export function DeliverFork() {
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
        <motion.path d="M 10 130 L 180 130" fill="none" stroke={ink} strokeWidth="2" {...draw(0)} />
        <motion.path d="M 180 130 C 240 130, 250 50, 330 50 L 410 50" fill="none" stroke="#1f6b33" strokeWidth="2" {...draw(1)} />
        <motion.path d="M 180 130 C 240 130, 250 210, 330 210 L 410 210" fill="none" stroke="#b07a1d" strokeWidth="2" strokeDasharray="6 6" {...draw(1.2)} />
        {/* The held money, travelling each road once both are drawn */}
        {seen && (
          <>
            <circle r="6" fill="#dcf17e" stroke="#1f6b33" strokeWidth="1.5">
              <animateMotion dur="3.6s" begin="2.4s" repeatCount="indefinite" path={GOOD} />
            </circle>
            <circle r="6" fill="white" stroke="#b07a1d" strokeWidth="1.5">
              <animateMotion dur="3.6s" begin="4.2s" repeatCount="indefinite" path={BACK} />
            </circle>
          </>
        )}
        <circle cx="180" cy="130" r="7" fill="white" stroke={ink} strokeWidth="2" />
        <text x="180" y="160" textAnchor="middle" fontSize="12" fontWeight="600" fill={ink} fillOpacity="0.55">
          Ships by 5 Dec
        </text>
        <text x="410" y="38" textAnchor="end" fontSize="12" fontWeight="600" fill="#1f6b33">
          Release
        </text>
        <text x="410" y="232" textAnchor="end" fontSize="12" fontWeight="600" fill="#8a5a12">
          Call it off
        </text>
      </svg>
      <div className="space-y-8">
        <div className="border-l-2 border-[#1f6b33] pl-5">
          <p className="font-medium text-[13px] text-[#1f6b33]">The goods are fine</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">You release the balance to your supplier.</p>
          <p className="mt-1 text-[15px] text-graphite/60">One tap and your PIN. Nothing goes until you say so.</p>
        </div>
        <div className="border-l-2 border-dashed border-[#b07a1d] pl-5">
          <p className="font-medium text-[13px] text-[#8a5a12]">Never sent, or not right</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">Call it off. The held money comes back.</p>
          <p className="mt-1 text-[15px] text-graphite/60">Straight to your balance, with the fee we set aside to send it. Only the deposit you chose was ever at stake.</p>
        </div>
        <p className="border-t border-graphite/15 pt-5 text-[14px] leading-relaxed text-graphite/55">
          Need time to sort it out? Raise a problem, and the money stays held. Only the owner or an admin can start, release or call off an order.
        </p>
      </div>
    </div>
  );
}

// An example supplier's record, as the dashboard shows it.
const ACCOUNT = '0124417306';
const history = [
  { date: '14 Nov', amount: 360_000 },
  { date: '28 Oct', amount: 615_000 },
  { date: '3 Oct', amount: 840_000 },
  { date: '12 Sep', amount: 248_500 },
];
const total = history.reduce((s, p) => s + p.amount, 0);

/**
 * Saving a supplier: the account number goes in, the bank names the account,
 * and every payment made to them lines up underneath.
 */
export function SupplierRecord() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-15% 0px' });
  // 0..10 digits typed, then asking, then named.
  const [typed, setTyped] = useState(reduce ? ACCOUNT.length : 0);
  const [named, setNamed] = useState(reduce);

  useEffect(() => {
    if (!seen || reduce) return;
    if (typed < ACCOUNT.length) {
      const t = window.setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 400 : 90);
      return () => clearTimeout(t);
    }
    if (!named) {
      const t = window.setTimeout(() => setNamed(true), 1100);
      return () => clearTimeout(t);
    }
  }, [seen, reduce, typed, named]);

  const digits = ACCOUNT.slice(0, typed);
  return (
    <div ref={ref} className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-[13px] font-semibold">OP</span>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-semibold">Okafor Paper Supplies</p>
          <p className="text-[13px] text-white/45">Paper and ink</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white/[0.06] p-4">
        <p className="font-medium text-[12.5px] text-white/45">Account number</p>
        <p className="mt-1 h-7 font-ledger text-[20px] tracking-[0.08em] tabular-nums">
          {digits}
          {typed < ACCOUNT.length && <span className="ml-0.5 inline-block h-5 w-px translate-y-0.5 animate-pulse bg-white/70" />}
        </p>
        <div className="mt-3 flex min-h-6 items-center gap-2 text-[14px]">
          <AnimatePresence mode="wait">
            {typed === ACCOUNT.length && !named && (
              <motion.span key="asking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-white/55">
                <Loader2 className="size-4 animate-spin" /> Asking the bank for the name on this account…
              </motion.span>
            )}
            {named && (
              <motion.span key="named" initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="flex flex-wrap items-center gap-x-2 text-white/70">
                <Check className="size-4 text-primary" /> The bank names it <span className="font-semibold text-white">OKAFOR PAPER SUPPLIES LTD</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-7">
        <motion.p initial={reduce ? false : { opacity: 0 }} animate={named ? { opacity: 1 } : {}} transition={{ duration: 0.5 }} className="font-medium text-[12.5px] text-white/45">
          Paid <span className="font-ledger">{naira(total)}</span> in {history.length} payments
        </motion.p>
        <ul className="mt-2 divide-y divide-white/[0.08]">
          {history.map((p, i) => (
            <motion.li
              key={p.date}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={named ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.12 }}
              className="flex items-center gap-3 py-3 text-[14px]"
            >
              <span className="min-w-0 flex-1">
                <span className="block">{p.date}</span>
                <span className="block truncate text-[12.5px] text-white/45">OKAFOR PAPER SUPPLIES LTD · ••••7306</span>
              </span>
              <span className="text-[12.5px] text-white/45">Paid</span>
              <span className="w-32 text-right font-ledger font-medium tabular-nums">−{naira(p.amount)}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <p className="mt-6 flex gap-2 border-t border-white/10 pt-5 text-[14px] leading-relaxed text-white/60">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
        If their bank details change, the supplier carries a warning for three days, and the next payment asks you to confirm them.
      </p>
    </div>
  );
}
