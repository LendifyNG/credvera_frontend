import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Ban, Eye, Link2, Lock, QrCode, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logo from '../../assets/logo-dark.png';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

// Example opens of a shared Passport.
const OPENS = ['Lagos · 10:14', 'Lagos · 10:31', 'Lagos · 16:02', 'Ikeja · 09:47'];

/**
 * Sharing and control, side by side: your app on the left, the landlord's
 * screen on the right. Opens show up as they happen; cancel the link and
 * their page stops working at once.
 */
export default function PassportMirror() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const [opens, setOpens] = useState(reduce ? 3 : 0);
  const [cancelled, setCancelled] = useState(false);
  const [touched, setTouched] = useState(false);

  // Opens arrive one by one; if nobody presses cancel, the demo does.
  useEffect(() => {
    if (!inView || reduce || cancelled) return;
    const t = window.setTimeout(() => {
      if (opens < 3) setOpens((o) => o + 1);
      else if (!touched) setCancelled(true);
    }, opens < 3 ? 1800 : 2600);
    return () => clearTimeout(t);
  }, [inView, reduce, cancelled, opens, touched]);

  // After a cancel, the demo shares a fresh link again.
  useEffect(() => {
    if (!cancelled || touched || reduce) return;
    const t = window.setTimeout(() => {
      setCancelled(false);
      setOpens(0);
    }, 4200);
    return () => clearTimeout(t);
  }, [cancelled, touched, reduce]);

  const cancel = () => {
    setTouched(true);
    setCancelled(true);
  };
  const reshare = () => {
    setTouched(true);
    setCancelled(false);
    setOpens(0);
  };

  return (
    <section className="bg-secondary text-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Reveal>
              <p className="text-[13px] font-semibold text-primary">
                <span className="mr-3 tabular-nums">02</span>Share and control
              </p>
            </Reveal>
            <Headline
              text={'Their screen.\n*Your* switch.'}
              className="mt-5 text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-lg leading-relaxed text-white/65">
              Send a link or let them scan a code. See every time it’s opened. Cancel it, and their page stops working that
              second.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* You, in the app */}
          <div className="rounded-[1.75rem] bg-paper p-6 text-ink">
            <p className="text-[13px] font-semibold text-ink/40">Your app</p>
            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-ink/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold">Renting a home</p>
                  <p className="text-xs text-ink/50">Shared with your landlord</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    cancelled ? 'bg-red-100 text-red-700' : 'bg-primary/25 text-background'
                  }`}
                >
                  {cancelled ? 'Cancelled' : 'Active'}
                </span>
              </div>
              <div className="mt-3 flex gap-2 text-xs text-ink/55">
                <span className="flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1"><Link2 className="size-3.5" /> Link</span>
                <span className="flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1"><QrCode className="size-3.5" /> QR code</span>
              </div>

              <p className="mt-5 flex items-center gap-2 text-sm font-semibold">
                <Eye className="size-4 text-background" /> Opened {opens} {opens === 1 ? 'time' : 'times'}
              </p>
              <ul className="mt-2 min-h-[84px] space-y-1.5 text-[13px] text-ink/60">
                <AnimatePresence initial={false}>
                  {OPENS.slice(0, opens)
                    .reverse()
                    .map((o, i) => (
                      <motion.li
                        key={o}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-between"
                      >
                        <span>{i === 0 ? 'Opened just now' : 'Opened'}</span>
                        <span className="tabular-nums">{o}</span>
                      </motion.li>
                    ))}
                </AnimatePresence>
              </ul>
            </div>

            {cancelled ? (
              <button
                type="button"
                onClick={reshare}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-background"
              >
                <RotateCcw className="size-4" /> Share a new link
              </button>
            ) : (
              <button
                type="button"
                onClick={cancel}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Ban className="size-4" /> Cancel link
              </button>
            )}
          </div>

          {/* Them, in a browser */}
          <div className="overflow-hidden rounded-[1.75rem] bg-white text-ink">
            <div className="flex items-center gap-3 border-b border-ink/10 bg-paper px-4 py-3">
              <span className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-ink/15" />
                <span className="size-2.5 rounded-full bg-ink/15" />
                <span className="size-2.5 rounded-full bg-ink/15" />
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 font-mono text-[12px] text-ink/60 ring-1 ring-ink/10">
                <Lock className="size-3 shrink-0" /> <span className="truncate">credvera.co/p/7KQ2-M9XP</span>
              </span>
              <span className="hidden text-xs text-ink/40 sm:block">Landlord’s screen</span>
            </div>

            <div className="relative min-h-[360px] p-7 sm:p-10">
              <motion.div
                animate={cancelled ? { opacity: 0.08, filter: 'blur(6px) grayscale(1)' } : { opacity: 1, filter: 'blur(0px) grayscale(0)' }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <img src={logo} alt="" className="h-5 w-auto" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">Earnings Passport · Verified</span>
                </div>
                <p className="mt-7 text-3xl font-semibold tracking-tight">Adaeze Okafor</p>
                <p className="text-sm text-ink/55">Identity checked with BVN · Prepared for renting a home</p>
                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  {[
                    ['Monthly income from abroad', '$1,000 – $2,000'],
                    ['Paid in the last 12 months', '12 of 12'],
                    ['Receiving since', 'October 2025'],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-paper p-4">
                      <p className="text-xs text-ink/50">{k}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums">{v}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Opened: a quiet pulse on their side */}
              <AnimatePresence>
                {!cancelled && opens > 0 && (
                  <motion.span
                    key={opens}
                    aria-hidden
                    className="absolute right-6 top-6 size-2.5 rounded-full bg-primary"
                    initial={{ scale: 0.5, opacity: 1, boxShadow: '0 0 0 0 rgba(127,222,128,0.7)' }}
                    animate={{ scale: 1, boxShadow: '0 0 0 14px rgba(127,222,128,0)' }}
                    transition={{ duration: 1 }}
                  />
                )}
              </AnimatePresence>

              {/* Cancelled: the page stops working */}
              <AnimatePresence>
                {cancelled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.2 }}
                    className="absolute inset-0 grid place-items-center p-8 text-center"
                  >
                    <div>
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
                        <Ban className="size-5" />
                      </span>
                      <p className="mt-4 text-xl font-semibold tracking-tight">This Passport was cancelled</p>
                      <p className="mt-1 text-sm text-ink/55">Its owner stopped sharing it. This link no longer works.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
