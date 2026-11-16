import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Check, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { photos } from '../../lib/photos';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// An example dinner, paid by you and split four ways in the app.
const BILL = 50000;
const SHARE = BILL / 4;
const OWED = BILL - SHARE; // what the three friends send back
const people = ['You', 'Amaka', 'Chidi', 'Femi'];
const payOrder = [2, 1, 3]; // Chidi pays first, then Amaka, then Femi

// How each slice sits once the picture is torn into shares: pushed apart
// (as a share of the slice's own width), lifted or dropped, and tilted.
const apart = [
  { x: '-18%', y: 0, rotate: -1.6 },
  { x: '-6%', y: 18, rotate: 1.2 },
  { x: '6%', y: -8, rotate: -0.8 },
  { x: '18%', y: 12, rotate: 1.8 },
];

// 0 whole · 1 torn, links sent · 2–4 friends paying · 5 settled, whole again
type Step = 0 | 1 | 2 | 3 | 4 | 5;
const timeline: [number, Step][] = [
  [700, 1],
  [2300, 2],
  [3200, 3],
  [4100, 4],
  [5200, 5],
];

/**
 * Split the picture: the dinner photo tears into four shares, one per
 * person, and each friend's slice comes back to life as they pay. When the
 * last one pays, the slices close up into the whole picture again.
 */
function SplitStage() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const [step, setStep] = useState<Step>(reduce ? 5 : 0);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = timeline.map(([ms, s]) => window.setTimeout(() => setStep(s), ms));
    setStep(0);
    setRun((r) => r + 1);
  }, []);

  // Plays each time it comes on screen.
  useEffect(() => {
    if (!inView || reduce) return;
    play();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [inView, reduce, play]);

  const torn = step >= 1 && step <= 4;
  const paidCount = step >= 5 ? 3 : Math.max(0, step - 1);
  const isPaid = (i: number) => payOrder.indexOf(i) > -1 && payOrder.indexOf(i) < paidCount;
  const back = paidCount * SHARE;
  const settled = step === 5;

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink/10 pb-4 text-[13px] font-semibold text-ink/50">
        <span>Friday dinner, paid by you</span>
        <span className="tabular-nums">{naira(BILL)} · split 4 ways</span>
      </div>

      {/* The picture, in four slices */}
      <motion.div
        role="img"
        aria-label={`${photos.splitDinner.alt}. The bill of ${naira(BILL)} is split four ways, ${naira(SHARE)} each.`}
        className="mt-10 flex lg:mt-14"
        initial={false}
        animate={{ scale: torn ? 0.9 : 1 }}
        transition={torn ? { type: 'spring', stiffness: 120, damping: 20 } : { duration: 1.2, ease }}
      >
        {people.map((name, i) => {
          const paid = isPaid(i);
          const you = i === 0;
          const a = apart[i]!;
          return (
            <motion.div
              key={name}
              className="relative w-1/4"
              initial={false}
              animate={torn ? { x: a.x, y: a.y } : { x: '0%', y: 0 }}
              transition={
                torn
                  ? { type: 'spring', stiffness: 140, damping: 16, delay: i * 0.06 }
                  : { duration: 1.2, ease, delay: (3 - i) * 0.05 }
              }
            >
              <motion.div
                className={`relative aspect-[1/3] overflow-hidden bg-mist shadow-[0_24px_40px_-28px_rgba(14,15,17,0.55)] sm:aspect-[1/2.2] lg:aspect-[1/1.9] ${
                  i === 0 ? 'rounded-l-[1.25rem]' : i === 3 ? 'rounded-r-[1.25rem]' : ''
                }`}
                initial={false}
                animate={{ rotate: torn ? a.rotate : 0 }}
                transition={torn ? { type: 'spring', stiffness: 120, damping: 14, delay: i * 0.06 } : { duration: 1.2, ease }}
              >
                {/* The same photo in every slice, shifted along so the four make one picture */}
                <img
                  src={photos.splitDinner.src}
                  alt=""
                  width={photos.splitDinner.width}
                  height={photos.splitDinner.height}
                  className="absolute top-0 h-full max-w-none object-cover"
                  style={{ width: '400%', left: `${-i * 100}%`, objectPosition: '50% 55%' }}
                  loading="lazy"
                  decoding="async"
                />

                {/* A friend's share looks faded until they pay it back */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 bg-paper"
                  initial={false}
                  animate={{ opacity: torn && !you && !paid ? 0.55 : 0 }}
                  transition={{ duration: 0.7 }}
                />

                {/* A flash of lime as the money lands */}
                {paid && (
                  <motion.div
                    key={`flash-${run}`}
                    aria-hidden
                    className="absolute inset-0 bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.55, 0] }}
                    transition={{ duration: 0.9, times: [0, 0.25, 1] }}
                  />
                )}

                {/* The tick, landing on the slice */}
                <div className="absolute inset-x-0 top-3 flex justify-center sm:top-5">
                  <AnimatePresence>
                    {paid && (
                      <motion.span
                        key={`tick-${run}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary p-1.5 text-[13px] font-semibold text-secondary shadow-[0_10px_24px_-8px_rgba(14,15,17,0.5)] sm:px-3 sm:py-1.5"
                        initial={{ opacity: 0, scale: 1.8, y: -28, rotate: -18 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                      >
                        <Check className="size-4" strokeWidth={3} />
                        <span className="hidden tabular-nums sm:inline">+{naira(SHARE)}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Whose share it is */}
              <motion.div
                className="mt-4 min-w-0 px-0.5 sm:mt-5"
                initial={false}
                animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
                transition={{ duration: 0.6, ease, delay: step === 1 ? 0.25 + i * 0.08 : 0 }}
              >
                <p className="truncate text-[13px] font-semibold text-ink sm:text-base">{name}</p>
                <p className="text-[12px] tabular-nums text-ink/60 sm:text-sm">{naira(SHARE)}</p>
                <p
                  className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors duration-500 sm:text-[13px] ${
                    you || paid ? 'text-ink' : 'text-ink/40'
                  }`}
                >
                  {you ? (
                    'Your share'
                  ) : paid ? (
                    <>
                      <span className="size-1.5 shrink-0 rounded-full bg-primary ring-1 ring-ink/20 sm:size-2" />
                      Paid back
                    </>
                  ) : (
                    'Link sent'
                  )}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* What's come back */}
      <div className="mt-10 flex min-h-[5.5rem] flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-ink/10 pt-6 lg:mt-14">
        <AnimatePresence mode="wait">
          {settled ? (
            <motion.p
              key="settled"
              className="text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease, delay: 0.5 }}
            >
              Bill settled. <span className="mark tabular-nums">{naira(OWED)}</span> back with you.
            </motion.p>
          ) : (
            <motion.div
              key="progress"
              className="w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm text-ink/55">
                <span className="font-semibold tabular-nums text-ink">{naira(back)}</span> of {naira(OWED)} back
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
                <motion.div
                  className="h-full origin-left rounded-full bg-background"
                  initial={false}
                  animate={{ scaleX: back / OWED }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={play}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition-colors hover:text-background"
        >
          <RotateCcw className="size-4" /> Split it again
        </button>
      </div>
    </div>
  );
}

// A year of monthly saving towards rent, drawn round the photo's frame.
const MONTHLY = 150000;
const MONTHS = 12;
const GOAL = MONTHLY * MONTHS;
const MONTH_MS = 420;
const HOLD_MS = 3800;
// The frame's edge, starting top middle and going round clockwise.
const EDGE =
  'M200 6.4 H372 A21.6 21.6 0 0 1 393.6 28 V472 A21.6 21.6 0 0 1 372 493.6 H28 A21.6 21.6 0 0 1 6.4 472 V28 A21.6 21.6 0 0 1 28 6.4 Z';

/** The goal you saved for: a lime line fills the frame round the photo, month by month. */
function GoalFrame() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const [month, setMonth] = useState(reduce ? MONTHS : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    setMonth(0);
    let m = 0;
    let t = 0;
    const tick = () => {
      if (m >= MONTHS) {
        // Hold on the keys, then start the year again.
        t = window.setTimeout(() => {
          m = 0;
          setMonth(0);
          t = window.setTimeout(tick, 1200);
        }, HOLD_MS);
        return;
      }
      m += 1;
      setMonth(m);
      t = window.setTimeout(tick, MONTH_MS);
    };
    t = window.setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [inView, reduce]);

  const saved = month * MONTHLY;
  const reached = month >= MONTHS;

  return (
    <div ref={ref} className="relative mx-auto aspect-[4/5] w-full max-w-[400px] rounded-[1.75rem] bg-secondary p-[3.2%]">
      <div className="relative h-full w-full overflow-hidden rounded-[0.95rem]">
        <img
          src={photos.womanKeys.src}
          alt={photos.womanKeys.alt}
          width={photos.womanKeys.width}
          height={photos.womanKeys.height}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '14% 50%' }}
          loading="lazy"
          decoding="async"
        />

        {/* Reached */}
        <div className="absolute inset-x-0 top-5 flex justify-center">
          <AnimatePresence>
            {reached && (
              <motion.span
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-secondary shadow-[0_12px_28px_-10px_rgba(14,15,17,0.55)]"
                initial={{ opacity: 0, scale: 1.6, y: -24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20, delay: 0.25 }}
              >
                <Check className="size-4" strokeWidth={3} /> Goal reached
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* The goal */}
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/90 p-3.5 text-ink shadow-xl backdrop-blur-xl sm:inset-x-4 sm:bottom-4">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="font-semibold">Rent</span>
            <span className="tabular-nums text-ink/55">
              {reached ? 'A year of saving' : `${month} of ${MONTHS} months`}
            </span>
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {naira(saved)} <span className="text-sm font-medium text-ink/45">of {naira(GOAL)}</span>
          </p>
        </div>
      </div>

      {/* The line round the frame */}
      <svg viewBox="0 0 400 500" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <path d={EDGE} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <motion.path
          d={EDGE}
          fill="none"
          stroke="#dcf17e"
          strokeWidth="4.5"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: month / MONTHS, opacity: month === 0 ? 0 : 1 }}
          transition={month === 0 ? { duration: 0.8, ease } : { type: 'spring', stiffness: 90, damping: 18 }}
        />
      </svg>
    </div>
  );
}

/** Save and split, told on real photos: the bill splits the picture, and the goal fills its frame. */
export default function SplitPhoto() {
  return (
    <section className="overflow-x-clip">
      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-24">
          <div>
            <Reveal>
              <p className="text-[13px] font-semibold text-ink/50">Split a bill</p>
            </Reveal>
            <Headline
              text={'One bill,\n*four* shares.'}
              className="mt-5 text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-md text-lg leading-relaxed text-ink/65">
              You pay, then split it in the app. Each friend gets their own link to pay their share by transfer or card, and
              you see every payment come back.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12 lg:mt-16">
          <SplitStage />
        </Reveal>

        {/* Saving: the goal you put money aside for */}
        <div className="mt-24 grid items-center gap-12 lg:mt-32 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-24">
          <Reveal className="order-2 lg:order-1">
            <GoalFrame />
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="text-[13px] font-semibold text-ink/50">Save for a goal</p>
            </Reveal>
            <Headline
              text={'Then one day,\nthe *keys*.'}
              className="mt-5 text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
            <Reveal delay={0.15}>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/65">
                Put a little into the goal every week or month and watch it fill. One day it’s all there, ready for the
                thing you were saving for.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
