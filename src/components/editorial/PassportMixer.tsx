import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { useEffect, useRef, useState } from 'react';
import logo from '../../assets/logo-dark.png';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

const purposes = ['Renting a home', 'Visa application', 'Loan'];
const periods = [3, 6, 12];
const lifetimes = [7, 30, 90];

type Settings = { purpose: number; period: number; payers: boolean; life: number };

// The demo's own changes, until someone takes over.
const demo: Partial<Settings>[] = [{ payers: false }, { period: 1 }, { purpose: 1 }, { life: 0 }, { payers: true }, { period: 2 }, { purpose: 0 }, { life: 1 }];

/** A black bar that slides over what's hidden, like a redacted document. */
function Redact({ hidden, children, note }: { hidden: boolean; children: React.ReactNode; note: string }) {
  return (
    <span className="relative inline-block max-w-full">
      <span className={hidden ? 'select-none' : undefined} aria-hidden={hidden}>
        {children}
      </span>
      <motion.span
        aria-hidden
        className="absolute inset-y-[-2px] left-0 rounded-[3px] bg-ink"
        initial={false}
        animate={{ width: hidden ? '100%' : '0%' }}
        transition={{ duration: 0.45, ease }}
      />
      <AnimatePresence>
        {hidden && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 grid place-items-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80"
          >
            {note}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Choice<T extends string | number>({ label, options, value, onChange, format }: { label: string; options: T[]; value: number; onChange: (i: number) => void; format: (o: T) => string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink/40">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o, i) => (
          <button
            key={String(o)}
            type="button"
            onClick={() => onChange(i)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              i === value ? 'bg-secondary text-white' : 'bg-white text-ink/65 ring-1 ring-ink/10 hover:ring-ink/30'
            }`}
          >
            {format(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Creating a Passport: choose what it's for, how far back, whether payers
 * show, and how long the link lasts, and see the page they'll get change as
 * you choose. Hidden things are blacked out, not left out.
 */
export default function PassportMixer() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const [s, setS] = useState<Settings>({ purpose: 0, period: 2, payers: true, life: 1 });
  const [touched, setTouched] = useState(false);

  const set = (patch: Partial<Settings>) => {
    setTouched(true);
    setS((cur) => ({ ...cur, ...patch }));
  };

  useEffect(() => {
    if (!inView || reduce || touched) return;
    let i = 0;
    const t = window.setInterval(() => {
      setS((cur) => ({ ...cur, ...demo[i % demo.length] }));
      i++;
    }, 2000);
    return () => clearInterval(t);
  }, [inView, reduce, touched]);

  const months = periods[s.period]!;
  const expires = new Date();
  expires.setDate(expires.getDate() + lifetimes[s.life]!);
  const expiry = expires.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-36">
      <div ref={ref} className="grid items-center gap-16 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-24">
        <div>
          <Reveal>
            <p className="text-[13px] font-semibold text-background">
              <span className="mr-3 tabular-nums">01</span>Create
            </p>
          </Reveal>
          <Headline
            text={'You choose\nwhat they *see*.'}
            className="mt-5 text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/65">
              Say what it’s for, how far back to look, whether to show who paid you and how long the link lasts. The page
              they’ll get changes as you choose, so there are no surprises.
            </p>
            <div className="mt-10 max-w-lg space-y-6">
              <Choice label="It’s for" options={purposes} value={s.purpose} onChange={(i) => set({ purpose: i })} format={(o) => o} />
              <Choice label="Look back" options={periods} value={s.period} onChange={(i) => set({ period: i })} format={(o) => `${o} months`} />
              <div className="flex items-center justify-between gap-6 border-y border-ink/10 py-4">
                <span className="text-[15px] font-semibold">Show who paid you</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.payers}
                  aria-label="Show who paid you"
                  onClick={() => set({ payers: !s.payers })}
                  className={`relative h-7 w-12 rounded-full transition-colors ${s.payers ? 'bg-background' : 'bg-ink/15'}`}
                >
                  <motion.span className="absolute top-1 size-5 rounded-full bg-white shadow" animate={{ left: s.payers ? 24 : 4 }} transition={{ duration: 0.25 }} />
                </button>
              </div>
              <Choice label="Link lasts" options={lifetimes} value={s.life} onChange={(i) => set({ life: i })} format={(o) => `${o} days`} />
            </div>
          </Reveal>
        </div>

        {/* What they'll get, live */}
        <div className="relative">
          <p className="mb-3 text-center text-[13px] font-semibold text-ink/40">What they’ll see</p>
          <div className="rounded-[1.75rem] bg-white p-7 shadow-[0_40px_80px_-40px_rgba(1,21,4,0.4)] ring-1 ring-ink/5 sm:p-8">
            <div className="flex items-center justify-between">
              <img src={logo} alt="Credvera" className="h-5 w-auto" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">Earnings Passport</span>
            </div>
            <p className="mt-7 text-2xl font-semibold tracking-tight">Adaeze Okafor</p>
            <p className="text-sm text-ink/55">
              Identity checked with BVN · Prepared for{' '}
              <AnimatePresence mode="wait">
                <motion.span key={s.purpose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-semibold text-ink">
                  {purposes[s.purpose]!.toLowerCase()}
                </motion.span>
              </AnimatePresence>
            </p>

            <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-[14px]">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/55">Monthly income from abroad</dt>
                <dd className="font-semibold tabular-nums">$1,000 – $2,000</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/55">Paid in the last {months} months</dt>
                <dd className="font-semibold tabular-nums">
                  {months} of {months} months
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="shrink-0 text-ink/55">Paid by</dt>
                <dd className="min-w-0 text-right font-semibold">
                  <Redact hidden={!s.payers} note="Hidden by you">
                    Upwork · Brightline Studio
                  </Redact>
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/55">Balance</dt>
                <dd>
                  <Redact hidden note="Never shared">
                    ₦2,418,900.00
                  </Redact>
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/55">Other payments</dt>
                <dd>
                  <Redact hidden note="Never shared">
                    47 transactions
                  </Redact>
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-xs text-ink/45">
              Link works until <span className="font-semibold tabular-nums text-ink/70">{expiry}</span>, or until you cancel it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
