import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowUpRight, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Headline from './Headline';
import Reveal from '../ui/Reveal';

const ease = [0.16, 1, 0.3, 1] as const;
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// An example transfer: two digits typed the wrong way round first, then fixed.
const WRONG = '0241578363';
const RIGHT = '0241578336';
const NAMES = {
  wrong: { full: 'IBRAHIM MUSA BELLO', short: 'Ibrahim Bello' },
  right: { full: 'CHIAMAKA ADAOBI OBI', short: 'Chiamaka Obi' },
};

type Step = { number: string; lookup?: 'loading' | 'wrong' | 'right'; amount?: boolean; sent?: boolean; pressing?: boolean };

// The script, one frame per step: [how long to hold it, what it shows].
function script(): [number, Step][] {
  const s: [number, Step][] = [[700, { number: '' }]];
  for (let i = 1; i <= WRONG.length; i++) s.push([110, { number: WRONG.slice(0, i) }]);
  s.push([700, { number: WRONG, lookup: 'loading' }]);
  s.push([2300, { number: WRONG, lookup: 'wrong' }]);
  s.push([160, { number: WRONG.slice(0, 9) }], [260, { number: WRONG.slice(0, 8) }]);
  s.push([140, { number: RIGHT.slice(0, 9) }], [140, { number: RIGHT }]);
  s.push([700, { number: RIGHT, lookup: 'loading' }]);
  s.push([1300, { number: RIGHT, lookup: 'right' }]);
  s.push([900, { number: RIGHT, lookup: 'right', amount: true }]);
  s.push([260, { number: RIGHT, lookup: 'right', amount: true, pressing: true }]);
  s.push([3200, { number: RIGHT, lookup: 'right', amount: true, sent: true }]);
  return s;
}

/** A name that settles letter by letter, like a lookup coming back. */
function Resolving({ text }: { text: string }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - start;
      let done = true;
      setShown(
        text
          .split('')
          .map((ch, i) => {
            if (ch === ' ' || t > 90 + i * 35) return ch;
            done = false;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(''),
      );
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return <span aria-label={text}>{shown}</span>;
}

const fmt = (n: string) => n.replace(/^(\d{0,4})(\d{0,3})(\d{0,3}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));

/**
 * Sending, told through the fear everyone has: the wrong account. Two digits
 * go in the wrong way round, the wrong name comes back, the number is fixed,
 * the right name appears, and only then can the money go.
 */
export default function NameCheck() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const final: Step = { number: RIGHT, lookup: 'right', amount: true, sent: true };
  const [step, setStep] = useState<Step>(reduce ? final : { number: '' });

  useEffect(() => {
    if (!inView || reduce) return;
    const frames = script();
    let i = 0;
    let t = 0;
    const next = () => {
      const frame = frames[i % frames.length]!;
      setStep(frame[1]);
      i++;
      t = window.setTimeout(next, frame[0]);
    };
    next();
    return () => clearTimeout(t);
  }, [inView, reduce]);

  const who = step.lookup === 'wrong' ? NAMES.wrong : step.lookup === 'right' ? NAMES.right : null;

  return (
    <section ref={ref} className="relative overflow-hidden py-24 lg:py-36">
      {/* The name that came back, written large behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center">
        <AnimatePresence mode="wait">
          {who && (
            <motion.p
              key={who.short}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.8, ease }}
              className={`whitespace-nowrap font-serif text-[clamp(5rem,15vw,15rem)] italic leading-none tracking-[-0.03em] ${
                step.lookup === 'wrong' ? 'text-amber-500/[0.09]' : 'text-background/[0.08]'
              }`}
            >
              {who.short}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-24 lg:px-8">
        <div>
          <Reveal>
            <p className="text-[13px] font-semibold text-background">
              <span className="mr-3 tabular-nums">02</span>Sending
            </p>
          </Reveal>
          <Headline
            text={'See the *name*\nbefore you send.'}
            className="mt-5 text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/65">
              Send to any bank in Nigeria for ₦10. Type the account number and the name on it comes back before anything
              moves, so two swapped digits never cost you.
            </p>
          </Reveal>
        </div>

        {/* The transfer, drawn */}
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(1,21,4,0.4)] ring-1 ring-ink/5 sm:p-7">
          <p className="text-sm font-semibold">Send to a bank</p>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-paper px-4 py-3">
            <span className="text-xs text-ink/50">Bank</span>
            <span className="text-[15px] font-semibold">GTBank</span>
          </div>

          <div className="mt-2.5 rounded-2xl bg-paper px-4 py-3">
            <span className="text-xs text-ink/50">Account number</span>
            <p className="mt-0.5 h-8 font-mono text-[22px] font-semibold tabular-nums tracking-[0.06em]">
              {fmt(step.number)}
              {!step.lookup && <span className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 animate-pulse bg-background" />}
            </p>
          </div>

          {/* What the lookup says */}
          <div className="mt-2.5 min-h-[76px]">
            <AnimatePresence mode="wait">
              {step.lookup === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-4 py-4 text-sm text-ink/55"
                >
                  <motion.span
                    className="size-4 rounded-full border-2 border-ink/15 border-t-background"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  />
                  Checking the name on this account
                </motion.div>
              )}
              {step.lookup === 'wrong' && (
                <motion.div
                  key="wrong"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200"
                >
                  <p className="flex items-center gap-2 font-mono text-[15px] font-semibold tracking-wide text-amber-900">
                    <AlertTriangle className="size-4" />
                    <Resolving text={NAMES.wrong.full} />
                  </p>
                  <p className="mt-1 text-[13px] text-amber-800/80">Not who you meant? Check the number.</p>
                </motion.div>
              )}
              {step.lookup === 'right' && (
                <motion.div
                  key="right"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-primary/20 px-4 py-3 ring-1 ring-primary/50"
                >
                  <p className="flex items-center gap-2 font-mono text-[15px] font-semibold tracking-wide text-background">
                    <Check className="size-4" />
                    <Resolving text={NAMES.right.full} />
                  </p>
                  <p className="mt-1 text-[13px] text-background/70">Name found. You can send.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Amount and send */}
          <div className="mt-2.5 flex items-center justify-between rounded-2xl bg-paper px-4 py-3">
            <span className="text-xs text-ink/50">Amount</span>
            <motion.span
              className="text-[22px] font-semibold tabular-nums"
              animate={{ opacity: step.amount ? 1 : 0.2 }}
            >
              ₦4,500.00
            </motion.span>
          </div>

          <motion.div
            className={`mt-4 flex h-14 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-300 ${
              step.sent ? 'bg-primary text-secondary' : step.lookup === 'right' ? 'bg-secondary text-white' : 'bg-ink/10 text-ink/35'
            }`}
            animate={{ scale: step.pressing ? 0.96 : 1 }}
            transition={{ duration: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {step.sent ? (
                <motion.span key="sent" className="flex items-center gap-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <Check className="size-4" /> Sent to Chiamaka Obi
                </motion.span>
              ) : (
                <motion.span key="send" className="flex items-center gap-2" exit={{ opacity: 0, y: -6 }}>
                  {step.lookup === 'wrong' ? 'Check the number first' : 'Send'} <ArrowUpRight className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          <p className="mt-3 text-center text-xs text-ink/45">Fee ₦10 · arrives in seconds</p>
        </div>
      </div>
    </section>
  );
}
