import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Check, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

// Example goals, with what's already saved in each.
const goals = [
  { name: 'School fees', target: 1200000, saved: 450000 },
  { name: 'Rent', target: 1800000, saved: 600000 },
  { name: 'New laptop', target: 900000, saved: 280000 },
  { name: 'Emergency fund', target: 500000, saved: 150000 },
];

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;
const DROP_MS = 1400; // one deposit on screen, standing in for a week or a month

// The jar's outline, used both to draw it and to hold the liquid.
const JAR = 'M 70 40 L 230 40 L 230 70 Q 230 86 244 96 Q 270 116 270 150 L 270 390 Q 270 420 240 420 L 60 420 Q 30 420 30 390 L 30 150 Q 30 116 56 96 Q 70 86 70 70 Z';
const TOP = 96; // where the jar's body starts
const BOTTOM = 420;

/**
 * Savings goals as a jar that fills: pick a goal and how much to put away,
 * and watch deposits drop in until it's full, with the date you'll get there.
 */
export default function GoalJar() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const [goalIndex, setGoalIndex] = useState(0);
  const [amount, setAmount] = useState(25000);
  const [monthly, setMonthly] = useState(false);
  const goal = goals[goalIndex]!;
  const [saved, setSaved] = useState(goal.saved);
  const [drops, setDrops] = useState(0);

  // Start again from what's saved whenever the plan changes.
  useEffect(() => {
    setSaved(goal.saved);
  }, [goal, amount, monthly]);

  // Deposits, one after another, while the jar is on screen.
  useEffect(() => {
    if (!inView || reduce) return;
    const t = window.setInterval(() => {
      setDrops((d) => d + 1);
      // Full: pour back to what's saved and go again.
      setSaved((s) => (s >= goal.target ? goal.saved : Math.min(goal.target, s + amount)));
    }, DROP_MS);
    return () => clearInterval(t);
  }, [inView, reduce, goal, amount]);

  const full = saved >= goal.target;
  const fill = Math.min(1, saved / goal.target);
  const level = BOTTOM - fill * (BOTTOM - TOP);

  // When the goal is reached if this plan starts today.
  const periods = Math.ceil((goal.target - goal.saved) / amount);
  const when = new Date();
  if (monthly) when.setMonth(when.getMonth() + periods);
  else when.setDate(when.getDate() + periods * 7);
  const date = when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const max = monthly ? 400000 : 100000;
  const step = monthly ? 10000 : 5000;

  return (
    <div ref={ref} className="grid items-center gap-14 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-24">
      <div>
        <Headline
          text={'Goals that fill\n*on their own*.'}
          className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
        />
        <Reveal delay={0.15}>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/65">
            Choose how much and how often. Credvera moves it into the goal for you, and money in a goal is kept apart, so
            you don’t spend it by accident.
          </p>

          {/* The plan */}
          <div className="mt-10 max-w-lg space-y-7">
            <div className="flex flex-wrap gap-2">
              {goals.map((g, i) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => setGoalIndex(i)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    i === goalIndex ? 'bg-secondary text-white' : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:ring-ink/30'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="save-amount" className="text-sm text-ink/55">
                  Put away
                </label>
                <div className="flex rounded-full bg-white p-1 text-xs font-semibold ring-1 ring-ink/10">
                  {['Weekly', 'Monthly'].map((f) => {
                    const on = (f === 'Monthly') === monthly;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          const m = f === 'Monthly';
                          setMonthly(m);
                          setAmount(m ? 100000 : 25000);
                        }}
                        className={`rounded-full px-3 py-1 transition-colors ${on ? 'bg-primary text-secondary' : 'text-ink/50'}`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                {naira(amount)} <span className="text-base font-medium text-ink/45">a {monthly ? 'month' : 'week'}</span>
              </p>
              <input
                id="save-amount"
                type="range"
                min={step}
                max={max}
                step={step}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-4 w-full accent-[#063c1a]"
              />
            </div>

            <div className="border-t border-ink/10 pt-6">
              <p className="text-sm text-ink/55">You’ll have {naira(goal.target)} by</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="mt-1 text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-background"
                >
                  {date}
                </motion.p>
              </AnimatePresence>
              <p className="mt-2 text-sm text-ink/45">
                {periods} {monthly ? 'months' : 'weeks'} from today, starting from {naira(goal.saved)} saved
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* The jar */}
      <div className="relative mx-auto w-full max-w-[380px]">
        <svg viewBox="0 0 300 440" className="w-full overflow-visible" role="img" aria-label={`${goal.name}: ${naira(saved)} of ${naira(goal.target)} saved`}>
          <defs>
            <clipPath id="jar-clip">
              <path d={JAR} />
            </clipPath>
            <linearGradient id="jar-liquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7fde80" />
              <stop offset="100%" stopColor="#2f9e4f" />
            </linearGradient>
          </defs>

          {/* Glass */}
          <path d={JAR} fill="rgba(255,255,255,0.7)" />

          {/* Liquid, with a moving surface */}
          <g clipPath="url(#jar-clip)">
            <motion.g initial={false} animate={{ y: level - TOP }} transition={{ type: 'spring', stiffness: 60, damping: 14 }}>
              <g className={reduce ? '' : 'jar-wave'}>
                <path
                  d={`M -300 ${TOP} q 37.5 -12 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 V 460 H -300 Z`}
                  fill="url(#jar-liquid)"
                />
              </g>
              <g className={reduce ? '' : 'jar-wave-slow'} opacity="0.35">
                <path
                  d={`M -300 ${TOP + 4} q 37.5 10 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 t 75 0 V 460 H -300 Z`}
                  fill="#063c1a"
                />
              </g>
            </motion.g>
          </g>

          {/* Glass edge and shine */}
          <path d={JAR} fill="none" stroke="rgba(1,21,4,0.18)" strokeWidth="2.5" />
          <path d="M 52 160 Q 50 260 56 380" fill="none" stroke="white" strokeOpacity="0.75" strokeWidth="7" strokeLinecap="round" />
          {/* Lid */}
          <rect x="62" y="22" width="176" height="24" rx="8" fill={full ? '#7fde80' : '#011504'} className="transition-colors duration-500" />

          {/* What's inside, in the middle of the jar */}
          <text x="150" y="275" textAnchor="middle" fontSize="30" fontWeight="700" fill="#011504" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {naira(saved)}
          </text>
          <text x="150" y="302" textAnchor="middle" fontSize="14" fill="rgba(1,21,4,0.6)">
            of {naira(goal.target)} · {Math.round(fill * 100)}%
          </text>
        </svg>

        {/* Each deposit, dropping in through the lid */}
        <AnimatePresence>
          {!reduce && inView && !full && (
            <motion.div
              key={drops}
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: [-40, 10, 150], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, times: [0, 0.3, 1], ease: 'easeIn' }}
            >
              <span className="whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary shadow-lg">
                +{naira(amount)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reached */}
        <AnimatePresence>
          {full && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="absolute left-1/2 top-[30%] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-background shadow-xl"
            >
              <Check className="size-4" /> {goal.name}, reached
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-ink/50">
          <Lock className="size-3.5" /> Kept apart from your spending money
        </p>
      </div>
    </div>
  );
}
