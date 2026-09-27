import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ctaFor } from '../../lib/site';
import LoopVideo from '../editorial/LoopVideo';
import StoreButtons from './StoreButtons';

const ease = [0.16, 1, 0.3, 1] as const;
const cta = ctaFor('business');

// What a business asks for, and what the app does with it, in one line each.
// Example names and amounts, matching the app's example business account.
const commands: { text: string; result: string; waiting?: boolean }[] = [
  { text: 'Pay Shenzhen Hongda $12,400 when the goods ship', result: 'Deposit of $3,720 paid. The rest waits until the goods are loaded.' },
  { text: 'Invoice Lekki Grill ₦420,000, due Friday', result: 'INV-0143 sent to Lekki Grill by email and WhatsApp.' },
  { text: 'Pay Kemi’s September salary, ₦650,000', result: 'Sent to Tunde in Finance for a second approval.', waiting: true },
  { text: 'Convert $5,000 to naira', result: '₦7,675,000.00 in your naira account, at ₦1,535.00 to the dollar.' },
  { text: 'Send a payment link for ₦85,000', result: 'Link ready. Your customer pays by card or bank transfer.' },
];

const TYPE_MS = 34;
const HOLD_MS = 3000;

/**
 * Business, in the owner's own words: a request types itself into a slim bar
 * and a one-line result appears beneath it. Moves through them on its own;
 * the dots jump to one.
 */
export default function CommandHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const [which, setWhich] = useState(0);
  const [typed, setTyped] = useState(reduce ? commands[0]!.text.length : 0);
  const [done, setDone] = useState(!!reduce);
  const [touched, setTouched] = useState(false);
  const c = commands[which]!;

  useEffect(() => {
    if (!inView || reduce) return;
    if (typed < c.text.length) {
      const t = window.setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 450 : TYPE_MS);
      return () => clearTimeout(t);
    }
    if (!done) {
      const t = window.setTimeout(() => setDone(true), 380);
      return () => clearTimeout(t);
    }
    if (touched) return;
    const t = window.setTimeout(() => {
      setWhich((w) => (w + 1) % commands.length);
      setTyped(0);
      setDone(false);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [inView, reduce, typed, done, touched, c.text.length]);

  const pick = (i: number) => {
    setTouched(true);
    setWhich(i);
    setTyped(reduce ? commands[i]!.text.length : 0);
    setDone(!!reduce);
  };

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-graphite text-white">
      <LoopVideo
        name="business-open"
        label="Nigerian businesses at work: a provisions shop, a seamstress, stock being checked, a delivery"
        eager
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,28,23,0.9)_0%,rgba(20,28,23,0.7)_50%,rgba(20,28,23,0.35)_100%),linear-gradient(to_top,rgba(20,28,23,0.8),transparent_50%)]" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-36 lg:px-8 lg:pb-24">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="max-w-3xl text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
        >
          Run your business
          <br />
          <span className="text-white/50">in plain words.</span>
        </motion.h1>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 max-w-2xl"
        >
          {/* The request */}
          <div className="flex items-center gap-3 border-b border-white/25 pb-3">
            <span className="font-ledger text-primary">›</span>
            <p className="min-h-[1.5em] flex-1 text-[clamp(1.05rem,1.8vw,1.3rem)]" aria-live="polite">
              {c.text.slice(0, typed)}
              {!done && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-primary" />}
            </p>
          </div>

          {/* What happened, in one line */}
          <div className="mt-3 min-h-[1.6em]">
            <AnimatePresence mode="wait">
              {done && (
                <motion.p
                  key={which}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="flex items-center gap-2.5 text-[15px] text-white/75"
                >
                  <span className={`size-1.5 shrink-0 rounded-full ${c.waiting ? 'bg-[#f5c451]' : 'bg-primary'}`} />
                  {c.result}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Which one */}
          <div className="mt-6 flex gap-2" role="tablist" aria-label="Examples">
            {commands.map((x, i) => (
              <button
                key={x.text}
                type="button"
                role="tab"
                aria-selected={i === which}
                aria-label={x.text}
                onClick={() => pick(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === which ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4"
        >
          <Link
            to={cta.to}
            className="group inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-[15px] font-semibold text-graphite transition-colors hover:bg-primary"
          >
            {cta.label}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <StoreButtons tone="light" />
        </motion.div>
      </div>
    </section>
  );
}
