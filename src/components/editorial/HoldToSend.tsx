import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Bell, Fingerprint, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logo from '../../assets/logo.png';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

// An example transfer. The name and account are made up.
const SEND = { amount: '₦25,000.00', name: 'CHIDI OKEKE', bank: 'GTBank', account: '0123 •••• 89', fee: '₦20.00' };
const HOLD_MS = 1200;

function Ring({ progress, size = 56 }: { progress: number; size?: number }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#dcf17e" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
    </svg>
  );
}

/**
 * Transfers, told through how they're guarded: the name is checked before you
 * send, nothing leaves until you press and hold (your PIN or Face ID in the
 * app), and every payment is announced. The launch stand-in for HoldReveal,
 * the dollar card, in the same place and the same shape (lib/launch.ts).
 */
export default function HoldToSend() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: '-30% 0px' });
  const [hold, setHold] = useState(0); // 0 to 1 while pressing
  const [sent, setSent] = useState(false);
  const raf = useRef(0);
  const touched = useRef(false);

  const start = (auto = false) => {
    if (sent) return;
    if (!auto) touched.current = true;
    const t0 = performance.now();
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / HOLD_MS);
      setHold(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        setHold(0);
        setSent(true);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf.current);
    setHold(0);
  };

  // After a while, set it back so it can be tried again.
  useEffect(() => {
    if (!sent) return;
    const t = window.setTimeout(() => setSent(false), 6000);
    return () => clearTimeout(t);
  }, [sent]);

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

  return (
    <section ref={ref} className="bg-secondary text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-36">
        <div>
          <Reveal>
            <p className="text-[13px] font-semibold text-primary">
              <span className="mr-3 tabular-nums">03</span>Transfers
            </p>
          </Reveal>
          <Headline
            text={'Nothing leaves\nuntil *you* say so.'}
            className="mt-5 text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-white/65">
              Send to any Nigerian bank in seconds. You see the name on the account before you pay, nothing moves without your
              PIN or Face ID, and you're told the moment it's gone.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-3"><ShieldCheck className="size-4 text-primary" /> The account name, checked before you send</li>
              <li className="flex items-center gap-3"><Fingerprint className="size-4 text-primary" /> Your PIN or Face ID for every payment</li>
              <li className="flex items-center gap-3"><Smartphone className="size-4 text-primary" /> Extra care after a new phone or SIM</li>
            </ul>
          </Reveal>
        </div>

        <div className="relative mx-auto w-full max-w-[460px]">
          {/* The alert that follows every payment */}
          <div className="absolute -top-16 left-0 right-0 flex justify-center">
            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: -14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2.5 text-ink shadow-xl backdrop-blur-xl"
                >
                  <Bell className="size-4 text-background" />
                  <span className="text-[13px]">
                    <b className="font-semibold">{SEND.amount} sent</b> · just now
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The transfer, as a slip */}
          <motion.div
            className="relative aspect-[1.586] overflow-hidden rounded-[1.4rem] p-6 shadow-[0_50px_90px_-40px_rgba(0,0,0,0.8)] sm:p-7"
            style={{ background: 'linear-gradient(135deg, #2c2e31 0%, #15171a 45%, #0e0f11 100%)' }}
            animate={{ rotateX: hold * 8, scale: 1 - hold * 0.02 }}
            transition={{ duration: 0.1 }}
          >
            {/* Fine guilloché lines, like security print */}
            <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 400 252" preserveAspectRatio="none">
              {Array.from({ length: 14 }, (_, i) => (
                <path key={i} d={`M -20 ${40 + i * 16} C 120 ${-10 + i * 16}, 260 ${110 + i * 16}, 420 ${30 + i * 16}`} fill="none" stroke="#dcf17e" strokeWidth="0.8" />
              ))}
            </svg>
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between">
                <img src={logo} alt="Credvera" className="h-6 w-auto" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{sent ? 'Sent' : 'Transfer · NGN'}</span>
              </div>
              <div className="mt-auto">
                <motion.p
                  className="text-[clamp(1.9rem,5.4vw,2.6rem)] font-semibold tabular-nums tracking-tight"
                  animate={{ scale: sent ? [1, 1.06, 1] : 1, color: sent ? '#dcf17e' : '#ffffff' }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: 'left center' }}
                >
                  {SEND.amount}
                </motion.p>
                <div className="mt-4 flex items-end justify-between gap-4 text-[13px]">
                  <span>
                    <span className="flex items-center gap-1.5 font-semibold tracking-[0.12em]">
                      {SEND.name} <ShieldCheck className="size-3.5 text-primary" />
                    </span>
                    <span className="mt-0.5 block text-white/55 tabular-nums">
                      {SEND.bank} · {SEND.account}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[9px] uppercase tracking-[0.2em] text-white/45">Fee</span>
                    <span className="tabular-nums">{SEND.fee}</span>
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
              disabled={sent}
              className="group flex select-none items-center gap-4 text-left disabled:cursor-default"
            >
              <span className="relative grid place-items-center">
                <Ring progress={sent ? 1 : hold} />
                <Fingerprint className={`absolute size-6 ${sent || hold > 0 ? 'text-primary' : 'text-white/70 group-hover:text-white'}`} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold">
                  {sent ? 'Sent. Receipt ready.' : hold > 0 ? 'Keep holding…' : 'Press and hold to send'}
                </span>
                <span className="block text-xs text-white/45">In the app this asks for your PIN or Face ID</span>
              </span>
            </button>
            <span className="text-right text-xs text-white/45">
              <b className="block text-lg font-semibold tabular-nums text-white">Seconds</b>
              to any Nigerian bank
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
