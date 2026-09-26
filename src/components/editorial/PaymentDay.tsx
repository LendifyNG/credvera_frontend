import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CreditCard, Lightbulb, Landmark, Smartphone, Tv, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import SplitFlap from './SplitFlap';

const ease = [0.16, 1, 0.3, 1] as const;

type Moment = {
  at: number; // minutes after midnight
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  amount: string;
  token?: string;
};

// One ordinary Tuesday in Lagos, paid from the app. Example people and amounts.
const day: Moment[] = [
  { at: 6 * 60 + 40, icon: Smartphone, title: 'MTN airtime', detail: '0803 ••• 4417', amount: '₦1,000.00' },
  { at: 7 * 60 + 55, icon: Lightbulb, title: 'Ikeja Electric', detail: 'Prepaid · meter 4510 ••• 2931', amount: '₦10,000.00', token: '4817 2290 3356 1049 7712' },
  { at: 12 * 60 + 20, icon: ArrowUpRight, title: 'Sent to Chiamaka Obi', detail: 'GTBank · “Lunch, thank you!”', amount: '₦4,500.00' },
  { at: 15 * 60 + 5, icon: Landmark, title: 'Remita', detail: 'Government payment · RRR 2810 ••• 7736', amount: '₦12,500.00' },
  { at: 19 * 60 + 30, icon: Tv, title: 'DStv Compact', detail: 'Renewed for a month', amount: '₦19,000.00' },
  { at: 21 * 60 + 45, icon: CreditCard, title: 'Netflix', detail: 'Dollar card •• 0291', amount: '$9.99' },
];

const START = 6 * 60; // 06:00
const END = 23 * 60; // 23:00
const MINUTES_PER_SECOND = 70; // the whole day in about 15 seconds

// The sky behind the day: [minute, top colour, bottom colour]
const sky: [number, string, string][] = [
  [6 * 60, '#f6d7b8', '#f5f7f2'], // dawn
  [9 * 60, '#dff0dc', '#f5f7f2'], // morning
  [13 * 60, '#cfeccd', '#eef6ea'], // midday
  [17 * 60 + 30, '#f3c08f', '#f7e6d3'], // late afternoon
  [19 * 60, '#b4674a', '#3b3a2a'], // dusk
  [20 * 60 + 30, '#063c1a', '#011504'], // night
  [23 * 60, '#042a13', '#011504'],
];

function skyAt(m: number) {
  let i = sky.findIndex(([t]) => t > m);
  if (i === -1) i = sky.length - 1;
  const [t0, a0, b0] = sky[Math.max(0, i - 1)]!;
  const [t1, a1, b1] = sky[i]!;
  const k = t1 === t0 ? 1 : Math.min(1, Math.max(0, (m - t0) / (t1 - t0)));
  const mix = (x: string, y: string) => `color-mix(in srgb, ${y} ${Math.round(k * 100)}%, ${x})`;
  return { top: mix(a0, a1), bottom: mix(b0, b1), dark: m >= 18 * 60 + 50 };
}

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;

/**
 * A day of payments: the clock runs from dawn to night, the sky changes with
 * it, and each payment lands at its time. Loops; pauses while hovered.
 */
export default function PaymentDay() {
  const reduce = useReducedMotion();
  const [minute, setMinute] = useState(reduce ? 22 * 60 : START);
  const paused = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => (visible.current = !!e?.isIntersecting));
    if (box.current) io.observe(box.current);
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (visible.current && !paused.current)
        setMinute((m) => {
          const next = m + dt * MINUTES_PER_SECOND;
          return next > END + 60 ? START : next; // hold on the night for a moment, then a new day
        });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce]);

  const m = Math.min(minute, END);
  const s = skyAt(m);
  const done = day.filter((d) => d.at <= m);
  const shown = done.slice(-4);
  const spent = done.filter((d) => d.amount.startsWith('₦')).reduce((a, d) => a + Number(d.amount.replace(/[₦,]/g, '')), 0);
  // The sun's path: a low arc across the top of the panel.
  const p = (m - START) / (END - START);
  const sunX = 8 + p * 84;
  const sunY = 70 - Math.sin(p * Math.PI) * 52;
  const ink = s.dark ? 'text-white' : 'text-ink';

  return (
    <div
      ref={box}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      className={`relative isolate flex h-[560px] w-full flex-col overflow-hidden rounded-[2rem] p-6 shadow-[0_50px_100px_-50px_rgba(1,21,4,0.55)] ring-1 ring-ink/5 sm:p-8 ${ink}`}
      style={{ background: `linear-gradient(to bottom, ${s.top}, ${s.bottom})` }}
      aria-label="An example day of payments in the Credvera app"
      role="img"
    >
      {/* Sun by day, moon by night */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40">
        <span
          className="absolute size-14 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background,box-shadow] duration-700"
          style={{
            left: `${sunX}%`,
            top: `${sunY}%`,
            background: s.dark ? '#e9f5e4' : '#ffd79a',
            boxShadow: s.dark ? '0 0 40px 6px rgba(127,222,128,0.25), inset -10px -4px 0 0 #cfe3c9' : '0 0 70px 20px rgba(255,200,120,0.55)',
          }}
        />
      </div>

      {/* The clock */}
      <div className="relative flex items-end justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${s.dark ? 'text-primary' : 'text-background'}`}>Lagos · Tuesday</p>
          <p className="mt-2 font-serif text-[clamp(4rem,9vw,6.5rem)] italic leading-none tabular-nums tracking-[-0.02em]">{hhmm(m)}</p>
        </div>
        <div className="pb-2 text-right">
          <p className={`text-xs ${s.dark ? 'text-white/55' : 'text-ink/50'}`}>Paid today</p>
          <p className="text-lg font-semibold tabular-nums">₦{spent.toLocaleString('en-NG')}.00</p>
        </div>
      </div>

      {/* The day's payments, newest at the bottom */}
      <ul className="relative mt-auto space-y-2.5">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((d) => (
            <motion.li
              key={d.title}
              layout
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.6, ease }}
              className="rounded-2xl bg-white/80 p-3.5 text-ink shadow-[0_18px_40px_-24px_rgba(1,21,4,0.5)] ring-1 ring-white/60 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <d.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[15px] font-semibold tracking-tight">{d.title}</span>
                    <span className="text-[15px] font-semibold tabular-nums">{d.amount}</span>
                  </span>
                  <span className="flex justify-between gap-3 text-[12.5px] text-ink/55">
                    <span className="truncate">{d.detail}</span>
                    <span className="tabular-nums">{hhmm(d.at)}</span>
                  </span>
                </span>
              </div>
              {d.token ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">Token</span>
                  <span className="text-[8.5px] sm:text-[10.5px]">
                    <SplitFlap text={d.token} length={24} />
                  </span>
                </div>
              ) : null}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
