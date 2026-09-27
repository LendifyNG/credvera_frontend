import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Bell, EyeOff, Fingerprint } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logo from '../../assets/logo.png';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

// An example virtual dollar card. Not a real card number.
const CARD = { number: '4859 2210 7718 0291', expiry: '09/29', cvv: '482', name: 'ADAEZE OKAFOR' };
const HOLD_MS = 1200;
const SHOW_S = 10;

function Ring({ progress, size = 56 }: { progress: number; size?: number }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#7fde80" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
    </svg>
  );
}

/**
 * Cards, told through how the details are guarded: press and hold to see
 * them, they hide again on their own, and every look is announced.
 */
export default function HoldReveal() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: '-30% 0px' });
  const [hold, setHold] = useState(0); // 0 to 1 while pressing
  const [left, setLeft] = useState(0); // seconds the details stay visible
  const [views, setViews] = useState(3);
  const raf = useRef(0);
  const touched = useRef(false);

  const shown = left > 0;

  const start = (auto = false) => {
    if (shown || views === 0) return;
    if (!auto) touched.current = true;
    const t0 = performance.now();
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / HOLD_MS);
      setHold(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        setHold(0);
        setLeft(SHOW_S);
        setViews((v) => v - 1);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf.current);
    setHold(0);
  };

  // Count down while the details are showing.
  useEffect(() => {
    if (!shown) return;
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, shown]);

  // Show it once on its own if nobody tries.
  useEffect(() => {
    if (!seen || reduce) return;
    const t = window.setTimeout(() => {
      if (!touched.current) start(true);
    }, 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, reduce]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const blur = shown ? 'blur(0px)' : 'blur(9px)';

  return (
    <section ref={ref} className="bg-secondary text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-36">
        <div>
          <Reveal>
            <p className="text-[13px] font-semibold text-primary">
              <span className="mr-3 tabular-nums">03</span>Cards
            </p>
          </Reveal>
          <Headline
            text={'A dollar card that\n*hides* itself.'}
            className="mt-5 text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-white/65">
              Pay for streaming, courses and shopping online in dollars. The details show only when you ask, hide again on
              their own, and you're told every time they're seen. Screenshots are blocked in the app.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-3"><Fingerprint className="size-4 text-primary" /> Your PIN or Face ID to see them</li>
              <li className="flex items-center gap-3"><EyeOff className="size-4 text-primary" /> Hidden again after {SHOW_S} seconds</li>
              <li className="flex items-center gap-3"><Bell className="size-4 text-primary" /> An alert every time they're viewed</li>
            </ul>
          </Reveal>
        </div>

        <div className="relative mx-auto w-full max-w-[460px]">
          {/* The alert that follows every look */}
          <div className="absolute -top-16 left-0 right-0 flex justify-center">
            <AnimatePresence>
              {shown && (
                <motion.div
                  initial={{ opacity: 0, y: -14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2.5 text-ink shadow-xl backdrop-blur-xl"
                >
                  <Bell className="size-4 text-background" />
                  <span className="text-[13px]">
                    <b className="font-semibold">Card details viewed</b> · just now
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The card, drawn */}
          <motion.div
            className="relative aspect-[1.586] overflow-hidden rounded-[1.4rem] p-6 shadow-[0_50px_90px_-40px_rgba(0,0,0,0.8)] sm:p-7"
            style={{ background: 'linear-gradient(135deg, #0d3a1d 0%, #063c1a 45%, #0a1f10 100%)' }}
            animate={{ rotateX: hold * 8, scale: 1 - hold * 0.02 }}
            transition={{ duration: 0.1 }}
          >
            {/* Fine guilloché lines, like security print */}
            <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 400 252" preserveAspectRatio="none">
              {Array.from({ length: 14 }, (_, i) => (
                <path key={i} d={`M -20 ${40 + i * 16} C 120 ${-10 + i * 16}, 260 ${110 + i * 16}, 420 ${30 + i * 16}`} fill="none" stroke="#7fde80" strokeWidth="0.8" />
              ))}
            </svg>
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between">
                <img src={logo} alt="Credvera" className="h-6 w-auto" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Virtual · USD</span>
              </div>
              <div className="mt-auto">
                <motion.p
                  className="font-mono text-[clamp(1.15rem,3.6vw,1.6rem)] tabular-nums tracking-[0.12em]"
                  animate={{ filter: blur, opacity: shown ? 1 : 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  {CARD.number}
                </motion.p>
                <div className="mt-4 flex items-end justify-between gap-4 text-[13px]">
                  <span className="font-semibold tracking-[0.12em]">{CARD.name}</span>
                  <span className="flex gap-5">
                    <span>
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-white/45">Expires</span>
                      <motion.span className="font-mono tabular-nums" animate={{ filter: blur }}>{CARD.expiry}</motion.span>
                    </span>
                    <span>
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-white/45">CVV</span>
                      <motion.span className="font-mono tabular-nums" animate={{ filter: blur }}>{CARD.cvv}</motion.span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Press and hold */}
          <div className="mt-8 flex items-center justify-between gap-6">
            <button
              type="button"
              onPointerDown={() => start()}
              onPointerUp={stop}
              onPointerLeave={stop}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && start()}
              onKeyUp={stop}
              disabled={shown || views === 0}
              className="group flex select-none items-center gap-4 text-left disabled:cursor-default"
            >
              <span className="relative grid place-items-center">
                <Ring progress={shown ? left / SHOW_S : hold} />
                <Fingerprint className={`absolute size-6 ${shown || hold > 0 ? 'text-primary' : 'text-white/70 group-hover:text-white'}`} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold">
                  {shown ? `Hiding in ${left}s` : views === 0 ? 'No views left for now' : hold > 0 ? 'Keep holding…' : 'Press and hold to see details'}
                </span>
                <span className="block text-xs text-white/45">In the app this asks for your PIN or Face ID</span>
              </span>
            </button>
            <span className="text-right text-xs text-white/45">
              <b className="block text-lg font-semibold tabular-nums text-white">{views} of 3</b>
              views left, 10 min
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
