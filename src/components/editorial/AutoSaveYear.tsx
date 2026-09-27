import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const WEEKLY = 25000;
const WEEKS = 52;
const TICK_MS = 170;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

type Week = 'saved' | 'paused' | null;

/**
 * Auto-save as a year of Fridays: each week lights up as the money moves.
 * Pause it and the weeks go by empty; resume and it carries on.
 */
export default function AutoSaveYear() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const [weeks, setWeeks] = useState<Week[]>(() => Array(WEEKS).fill(reduce ? 'saved' : null));
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const next = weeks.findIndex((w) => w === null);
  const done = next === -1;

  useEffect(() => {
    if (!inView || reduce || done) return;
    const t = window.setTimeout(() => {
      setWeeks((ws) => {
        const i = ws.findIndex((w) => w === null);
        if (i === -1) return ws;
        const copy = [...ws];
        copy[i] = pausedRef.current ? 'paused' : 'saved';
        return copy;
      });
    }, TICK_MS);
    return () => clearTimeout(t);
  }, [inView, reduce, done, weeks]);

  const savedCount = weeks.filter((w) => w === 'saved').length;
  const pausedCount = weeks.filter((w) => w === 'paused').length;
  const total = savedCount * WEEKLY;

  const restart = () => {
    setPaused(false);
    setWeeks(Array(WEEKS).fill(null));
  };

  return (
    <section className="bg-secondary text-white">
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1fr_1.15fr] lg:px-8 lg:py-32">
        <div>
          <Reveal>
            <p className="text-[13px] font-semibold text-primary">
              <span className="mr-3 tabular-nums">01</span>Automatic
            </p>
          </Reveal>
          <Headline
            text={'A year of *Fridays*,\nsaving for you.'}
            className="mt-5 text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-white/65">
              Turn on auto-save and the same amount moves into your goal every week or month, without you lifting a finger.
              Pause it when money is tight, change it, or take some out whenever you need to.
            </p>
          </Reveal>
        </div>

        <div className="rounded-[1.75rem] bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-white/50">School fees · {naira(WEEKLY)} every Friday</p>
              <p className="mt-1 text-[clamp(2rem,4vw,2.8rem)] font-semibold tabular-nums tracking-tight">{naira(total)}</p>
            </div>
            <div className="flex gap-2">
              {done ? (
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
                >
                  <RotateCcw className="size-4" /> Run the year again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    paused ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                  {paused ? 'Resume auto-save' : 'Pause auto-save'}
                </button>
              )}
            </div>
          </div>

          {/* The year, a week per square, in rows of months */}
          <div className="mt-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            {MONTHS.map((m, row) => {
              const start = Math.round((row * WEEKS) / 12);
              const end = Math.round(((row + 1) * WEEKS) / 12);
              return (
                <div key={m} className="contents">
                  <span className="text-[13px] font-semibold text-white/35">{m}</span>
                  <div className="flex gap-1.5">
                    {weeks.slice(start, end).map((w, j) => (
                      <motion.span
                        key={start + j}
                        className={`h-5 flex-1 rounded-[5px] ${
                          w === 'saved' ? 'bg-primary' : w === 'paused' ? 'ring-1 ring-inset ring-white/25' : 'bg-white/[0.06]'
                        }`}
                        initial={false}
                        animate={w === 'saved' ? { scale: [0.6, 1.15, 1], opacity: 1 } : { scale: 1 }}
                        transition={{ duration: 0.35 }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-[3px] bg-primary" /> Saved · {savedCount} weeks</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-[3px] ring-1 ring-inset ring-white/40" /> Paused · {pausedCount} weeks</span>
            <span className="ml-auto tabular-nums">{done ? 'A full year' : `Week ${next + 1} of ${WEEKS}`}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
