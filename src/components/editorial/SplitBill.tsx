import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { photos } from '../../lib/photos';

const ease = [0.16, 1, 0.3, 1] as const;

// An example dinner for three, paid by one and split in the app.
const items: [string, number][] = [
  ['Seafood pasta', 24000],
  ['Pizza to share', 18000],
  ['Grilled fish', 22000],
  ['Drinks', 14000],
  ['Service', 6000],
];
const TOTAL = items.reduce((a, [, n]) => a + n, 0); // ₦84,000
const SHARE = TOTAL / 3;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// Where each friend's tag sits on the photo (percent of its width and
// height, clear of faces), and what happens with their share.
const people = [
  { name: 'Kemi', x: 25, y: 50, status: 'paid' as const },
  { name: 'You', x: 50, y: 21, status: 'you' as const },
  { name: 'Ada', x: 73, y: 56, status: 'part' as const },
];

type Stage = 'photo' | 'bill' | 'split' | 'shares' | 'settled';

function Receipt({ clip }: { clip?: string }) {
  return (
    <div
      className="absolute inset-0 rounded-2xl bg-[#fbfaf6] p-4 font-mono text-[11px] text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] sm:p-5 sm:text-[12px]"
      style={clip ? { clipPath: clip } : undefined}
    >
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-ink/60">Dinner · Victoria Island</p>
      <div className="mt-3 space-y-1.5 border-y border-dashed border-ink/20 py-3">
        {items.map(([n, v]) => (
          <p key={n} className="flex justify-between">
            <span>{n}</span>
            <span className="tabular-nums">{naira(v)}</span>
          </p>
        ))}
      </div>
      <p className="mt-2.5 flex justify-between text-[13px] font-bold">
        <span>Total</span>
        <span className="tabular-nums">{naira(TOTAL)}</span>
      </p>
      <p className="mt-1 text-[10px] text-ink/50">Paid with Credvera · split 3 ways</p>
    </div>
  );
}

/**
 * Split a bill, told on the photo itself: the bill lands on the table, tears
 * into three, and each share goes to a friend, who then pays you back.
 */
export default function SplitBill() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const [stage, setStage] = useState<Stage>(reduce ? 'settled' : 'photo');
  const timers = useRef<number[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const at = (ms: number, s: Stage) => timers.current.push(window.setTimeout(() => setStage(s), ms));
    setStage('photo');
    at(700, 'bill');
    at(2600, 'split');
    at(3500, 'shares');
    at(5600, 'settled');
  }, []);

  useEffect(() => {
    if (seen && !reduce) play();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [seen, reduce, play]);

  const showShares = stage === 'shares' || stage === 'settled';
  const settled = stage === 'settled';
  const thirds = ['inset(0 66.66% 0 0 round 16px 0 0 16px)', 'inset(0 33.33% 0 33.33%)', 'inset(0 0 0 66.66% round 0 16px 16px 0)'];

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[460px]">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-mist">
        <img
          src={photos.friendsSelfie.src}
          alt={photos.friendsSelfie.alt}
          width={photos.friendsSelfie.width}
          height={photos.friendsSelfie.height}
          className="block h-auto w-full"
          loading="eager"
          decoding="async"
        />
        {/* Dims a little while the bill is on the table */}
        <motion.div aria-hidden className="absolute inset-0 bg-ink" animate={{ opacity: stage === 'bill' || stage === 'split' ? 0.35 : 0 }} transition={{ duration: 0.6 }} />

        {/* The bill: lands on the table, then tears into three */}
        <div className="absolute inset-x-[12%] bottom-[7%] h-[34%]">
          <AnimatePresence>
            {stage === 'bill' && (
              <motion.div
                key="whole"
                className="absolute inset-0"
                initial={{ y: 80, opacity: 0, rotate: -4 }}
                animate={{ y: 0, opacity: 1, rotate: -2 }}
                exit={{ opacity: 0, transition: { duration: 0.01 } }}
                transition={{ duration: 0.8, ease }}
              >
                <Receipt />
              </motion.div>
            )}
          </AnimatePresence>
          {stage === 'split' &&
            thirds.map((clip, i) => (
              <motion.div
                key={clip}
                className="absolute inset-0"
                initial={{ rotate: -2, x: 0, y: 0, opacity: 1 }}
                animate={{ x: (i - 1) * 46, y: [0, -10, -140], rotate: (i - 1) * 9, opacity: [1, 1, 0], scale: [1, 1, 0.6] }}
                transition={{ duration: 0.9, times: [0, 0.3, 1], ease: 'easeIn' }}
              >
                <Receipt clip={clip} />
              </motion.div>
            ))}
        </div>

        {/* Each friend's share, by their face */}
        {people.map((p, i) => (
          <AnimatePresence key={p.name}>
            {showShares && (
              <motion.div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={{ opacity: 0, scale: 0.6, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease, delay: i * 0.12 }}
              >
                <div
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-lg backdrop-blur-xl transition-colors duration-500 sm:text-[13px] ${
                    settled && p.status === 'paid'
                      ? 'bg-primary text-secondary'
                      : settled && p.status === 'part'
                        ? 'bg-amber-100/95 text-amber-900'
                        : 'bg-white/90 text-ink'
                  }`}
                >
                  {p.status === 'you' ? (
                    <>You paid {naira(TOTAL)}</>
                  ) : settled && p.status === 'paid' ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="size-3.5" /> {p.name} paid {naira(SHARE)}
                    </span>
                  ) : settled && p.status === 'part' ? (
                    <>
                      {p.name} · {naira(15000)} of {naira(SHARE)}
                    </>
                  ) : (
                    <>
                      {p.name} owes {naira(SHARE)}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* The money coming back */}
        <AnimatePresence>
          {settled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.4 }}
              className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 p-3.5 text-ink shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold">Dinner split</span>
                <span className="tabular-nums text-ink/60">
                  {naira(SHARE + 15000)} of {naira(SHARE * 2)} back
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                <motion.div
                  className="h-full rounded-full bg-background"
                  initial={{ width: 0 }}
                  animate={{ width: `${((SHARE + 15000) / (SHARE * 2)) * 100}%` }}
                  transition={{ duration: 1.2, ease, delay: 0.6 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={play}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition-colors hover:text-background"
      >
        <RotateCcw className="size-4" /> Split it again
      </button>
    </div>
  );
}
