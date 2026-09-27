import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, Lightbulb, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { photos } from '../../lib/photos';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

// An example electricity purchase. The token and units are illustrative.
const TOKEN = '48172290335610497712';
const UNITS = '47.7 kWh';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '↵'];

type Stage = 'dark' | 'paying' | 'typing' | 'accepted' | 'on';

const group = (t: string) => t.replace(/(.{4})(?=.)/g, '$1 ');

/**
 * Bills, told as the moment everyone knows: the house is dark, you buy
 * electricity in the app, the token keys into the meter, and the lights
 * flicker back on. Plays once on its own when seen; the button replays it.
 */
export default function LightsBack() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-30% 0px' });
  const [stage, setStage] = useState<Stage>(reduce ? 'on' : 'dark');
  const [typed, setTyped] = useState(reduce ? TOKEN.length : 0);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const run = useCallback(() => {
    clear();
    setStage('paying');
    setTyped(0);
    later(1100, () => setStage('typing'));
    for (let i = 1; i <= TOKEN.length; i++) later(1100 + i * 75, () => setTyped(i));
    const typedAt = 1100 + TOKEN.length * 75;
    later(typedAt + 350, () => setStage('accepted'));
    later(typedAt + 1300, () => setStage('on'));
  }, []);

  const reset = () => {
    clear();
    setStage('dark');
    setTyped(0);
    later(900, run);
  };

  useEffect(() => {
    if (seen && !reduce) later(1200, run);
    return clear;
  }, [seen, reduce, run]);

  const on = stage === 'on';
  const lastKey = stage === 'typing' && typed > 0 ? TOKEN[typed - 1] : stage === 'accepted' ? '↵' : null;
  const lcd =
    stage === 'on'
      ? ['CREDIT', UNITS]
      : stage === 'accepted'
        ? ['TOKEN', 'ACCEPTED']
        : stage === 'typing'
          ? ['ENTER TOKEN', group(TOKEN.slice(0, typed)) || '_']
          : ['CREDIT', '0.0 kWh'];

  return (
    <section className="px-3 py-16 sm:px-6 lg:py-24">
      <div
        ref={ref}
        className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col justify-end overflow-hidden rounded-[2rem] bg-[#070b09] text-white lg:h-[min(88vh,860px)]"
      >
        {/* The room, in the dark */}
        <img
          src={photos.familySofa.src}
          alt={photos.familySofa.alt}
          className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
          style={{ filter: 'brightness(0.16) saturate(0.25) contrast(1.1)' }}
          loading="lazy"
          decoding="async"
        />
        <div aria-hidden className="absolute inset-0 bg-[#0b1d3a]/35 mix-blend-multiply" />

        {/* The room, lights back: flickers in over the dark one */}
        <motion.img
          src={photos.familySofa.src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
          initial={false}
          animate={on ? { opacity: [0, 0.75, 0.08, 0.9, 0.3, 1] } : { opacity: 0 }}
          transition={on ? { duration: 1.2, times: [0, 0.12, 0.22, 0.38, 0.5, 0.75] } : { duration: 0.5 }}
        />
        {/* A warm bloom as the bulbs come on */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,214,150,0.35), transparent 60%)' }}
          initial={false}
          animate={{ opacity: on ? [0, 1, 0.35] : 0 }}
          transition={{ duration: 2.2, times: [0, 0.35, 1], delay: on ? 0.5 : 0 }}
        />
        {/* Keeps the words readable in both lights */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(1,21,4,0.85),rgba(1,21,4,0.2)_45%,transparent_70%)]" />
        {/* On phones the words sit over the middle of the lit photo, so shade it there too */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(1,21,4,0.35)_0%,rgba(1,21,4,0.7)_30%,rgba(1,21,4,0.7)_60%,rgba(1,21,4,0.3)_100%)] lg:hidden" />

        {/* Status, top left */}
        <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 text-sm backdrop-blur-md sm:left-10 sm:top-8">
          <motion.span
            className="size-2 rounded-full"
            animate={{ backgroundColor: on ? '#7fde80' : '#f87171' }}
            transition={{ duration: 0.4 }}
          />
          <AnimatePresence mode="wait">
            <motion.span key={on ? 'on' : 'off'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              {on ? 'Light is back' : 'No light'}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="relative grid items-end gap-8 p-6 pt-24 sm:p-10 sm:pt-28 lg:grid-cols-[1fr_auto] lg:p-14">
          {/* The words */}
          <div className="max-w-xl">
            <p className="text-[13px] font-semibold text-primary">
              <span className="mr-3 tabular-nums">01</span>Bills
            </p>
            <Headline
              text={'Buy light\n*in seconds*.'}
              className="mt-4 text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
              Pay Ikeja, Eko or Abuja Electric and your meter token is there the moment you pay. Airtime, data, DStv, GOtv,
              StarTimes and Remita work the same way.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:border-primary hover:text-primary"
            >
              <RotateCcw className="size-4" /> Play it again
            </button>
          </div>

          {/* The payment, then the meter */}
          <div className="relative w-full max-w-[300px] justify-self-center lg:justify-self-end">
            <AnimatePresence>
              {stage !== 'dark' && (
                <motion.div
                  initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease }}
                  className="mb-3 rounded-2xl bg-white/85 p-3.5 text-ink shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      {stage === 'paying' ? (
                        <motion.span
                          className="size-4 rounded-full border-2 border-primary/30 border-t-primary"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        />
                      ) : (
                        <Check className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between text-[14px] font-semibold">
                        Ikeja Electric <span className="tabular-nums">₦10,000.00</span>
                      </span>
                      <span className="block truncate text-[12px] text-ink/55">
                        {stage === 'paying' ? 'Paying with your PIN…' : `Token ${group(TOKEN)}`}
                      </span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* A prepaid meter, drawn */}
            <div className="rounded-[1.4rem] bg-[#dcd7cb] p-4 text-[#1e2420] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.6)]">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">
                <span>Prepaid meter</span>
                <span className="flex gap-1.5">
                  <span className={`size-1.5 rounded-full ${on ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-black/20'}`} />
                  <span className={`size-1.5 rounded-full ${on ? 'bg-black/20' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'}`} />
                </span>
              </div>
              <div
                className="mt-2.5 rounded-lg px-3 py-2.5 font-mono transition-colors duration-500"
                style={{ background: on || stage === 'accepted' || stage === 'typing' ? '#a8d9a0' : '#8fa78b', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)' }}
              >
                <p className="text-[10px] tracking-[0.18em] text-black/55">{lcd[0]}</p>
                <p className="mt-0.5 truncate text-[17px] font-semibold tabular-nums tracking-wide text-black/80">{lcd[1]}</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {KEYS.map((k) => (
                  <span
                    key={k}
                    className={`grid h-8 place-items-center rounded-md text-[13px] font-semibold transition-all duration-100 ${
                      lastKey === k ? 'translate-y-px bg-[#9aa39c] shadow-none' : 'bg-[#eeebe3]'
                    }`}
                    style={lastKey === k ? undefined : { boxShadow: '0 2px 0 #b3aea2' }}
                  >
                    {k}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                <Lightbulb className="size-3" /> Credit {on ? UNITS : '0.0 kWh'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
