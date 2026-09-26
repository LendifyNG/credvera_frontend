import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, KeyRound, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import logo from '../../assets/logo-dark.png';
import { photos } from '../../lib/photos';

const ease = [0.16, 1, 0.3, 1] as const;

type Stage = 'papers' | 'rejected' | 'link' | 'verified' | 'home';

// A decorative QR pattern: the three corner squares, and fixed "random" cells.
const QR = 21;
const cells: [number, number][] = [];
for (let y = 0; y < QR; y++)
  for (let x = 0; x < QR; x++) {
    const finder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    if (finder) continue;
    if (((x * 7 + y * 13 + x * y * 3) % 5) < 2) cells.push([x, y]);
  }

function Qr() {
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#011504" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="white" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#011504" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${QR} ${QR}`} className="size-full" shapeRendering="crispEdges" aria-hidden>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#011504" />
      ))}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  );
}

// A bank statement, the old way: pages of lines nobody can check.
function Statement({ page }: { page: number }) {
  return (
    <div className="h-full w-full rounded-md bg-white p-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.45)] ring-1 ring-ink/10">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-ink/60">Statement of account</span>
        <span className="rounded bg-red-500/90 px-1.5 py-0.5 text-[7px] font-bold text-white">PDF</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="flex gap-2">
            <span className="h-1 w-8 rounded bg-ink/15" />
            <span className="h-1 flex-1 rounded bg-ink/10" style={{ maxWidth: `${40 + ((i * 37) % 50)}%` }} />
            <span className="ml-auto h-1 w-6 rounded bg-ink/15" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-right text-[7px] text-ink/40">Page {page} of 14</p>
    </div>
  );
}

function Stamp({ text, tone }: { text: string; tone: 'red' | 'lime' }) {
  return (
    <motion.div
      initial={{ scale: 2.4, opacity: 0, rotate: -18 }}
      animate={{ scale: 1, opacity: 1, rotate: -12 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 22 }}
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border-[3px] px-4 py-1.5 text-[clamp(1rem,2.4vw,1.4rem)] font-black uppercase tracking-[0.12em] mix-blend-multiply ${
        tone === 'red' ? 'border-red-600/80 text-red-600/80' : 'border-background text-background'
      }`}
    >
      {text}
    </motion.div>
  );
}

/**
 * Earnings Passport, told as the story of renting a flat: statements that
 * can't be checked get stamped, a Passport link replaces them and gets
 * verified, and the keys follow.
 */
export default function PassportProof() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const [stage, setStage] = useState<Stage>(reduce ? 'home' : 'papers');
  const timers = useRef<number[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const at = (ms: number, s: Stage) => timers.current.push(window.setTimeout(() => setStage(s), ms));
    setStage('papers');
    at(1300, 'rejected');
    at(2900, 'link');
    at(4600, 'verified');
    at(6000, 'home');
  }, []);

  useEffect(() => {
    if (seen && !reduce) play();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [seen, reduce, play]);

  const paperStage = stage === 'papers' || stage === 'rejected';
  const home = stage === 'home';

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[480px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-mist">
        {/* The desk, then the new home */}
        <motion.img
          src={photos.womanKeys.src}
          alt={photos.womanKeys.alt}
          className="absolute inset-0 h-full w-full object-cover object-[28%_center]"
          initial={false}
          animate={{ opacity: home ? 1 : 0, scale: home ? 1 : 1.08 }}
          transition={{ duration: 1.2, ease }}
        />
        <motion.div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(1,21,4,0.55),transparent_45%)]" animate={{ opacity: home ? 1 : 0 }} />

        {/* What the landlord asked for */}
        <AnimatePresence>
          {paperStage && (
            <motion.div
              key="ask"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-5 right-5 top-5 rounded-2xl bg-white px-4 py-3 text-[13px] shadow-sm"
            >
              <span className="text-ink/45">Landlord · Yaba</span>
              <p className="mt-0.5 font-medium">“Send your last 6 months of bank statements.”</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The statements, fanned out, then thrown aside */}
        <AnimatePresence>
          {paperStage &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={`sheet-${i}`}
                className="absolute left-[18%] top-[26%] h-[52%] w-[64%]"
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: i * -6, x: (i - 1) * 22, rotate: (i - 1) * 6 }}
                exit={{ x: -420, rotate: -30 - i * 8, opacity: 0, transition: { duration: 0.7, delay: i * 0.06, ease: 'easeIn' } }}
                transition={{ duration: 0.6, ease, delay: i * 0.12 }}
              >
                <Statement page={3 - i} />
              </motion.div>
            ))}
        </AnimatePresence>
        <AnimatePresence>{stage === 'rejected' && <Stamp key="no" text="Can’t verify" tone="red" />}</AnimatePresence>

        {/* The Passport, shared as a link */}
        <AnimatePresence>
          {!paperStage && (
            <motion.div
              key="passport"
              className="absolute"
              initial={{ opacity: 0, y: 60, left: '10%', right: '10%', top: '22%' }}
              animate={
                home
                  ? { opacity: 1, y: 0, left: '6%', right: '30%', top: '58%', scale: 0.92 }
                  : { opacity: 1, y: 0, left: '10%', right: '10%', top: '22%', scale: 1 }
              }
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              <div className="relative rounded-2xl bg-white p-4 text-ink shadow-[0_30px_60px_-25px_rgba(1,21,4,0.55)] sm:p-5">
                <div className="flex items-center justify-between">
                  <img src={logo} alt="Credvera" className="h-4 w-auto" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">Earnings Passport</span>
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">Adaeze Okafor</p>
                    <p className="text-[11px] text-ink/50">Identity checked with BVN</p>
                    <p className="mt-3 text-[11px] text-ink/50">Monthly income from abroad</p>
                    <p className="text-[19px] font-semibold tabular-nums tracking-tight">$1,000 – $2,000</p>
                    <p className="text-[11px] text-ink/50">Paid 12 of the last 12 months</p>
                  </div>
                  {!home && (
                    <div className="relative size-[88px] shrink-0 overflow-hidden rounded-md p-1 ring-1 ring-ink/10">
                      <Qr />
                      {/* The scan */}
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-primary/60 to-transparent"
                        initial={{ top: '-30%' }}
                        animate={{ top: ['-30%', '100%'] }}
                        transition={{ duration: 1.1, repeat: stage === 'link' ? Infinity : 0, ease: 'linear' }}
                      />
                    </div>
                  )}
                </div>
                {!home && <p className="mt-3 truncate font-mono text-[11px] text-background">credvera.co/p/7KQ2-M9XP</p>}
                <AnimatePresence>{stage === 'verified' && <Stamp key="yes" text="Verified" tone="lime" />}</AnimatePresence>
                {home && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-background">
                    <Check className="size-3.5" /> Verified by Credvera
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Approved */}
        <AnimatePresence>
          {home && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.6 }}
              className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-secondary shadow-lg"
            >
              <KeyRound className="size-4" /> Flat in Yaba · Approved
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={play}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition-colors hover:text-background"
      >
        <RotateCcw className="size-4" /> Play it again
      </button>
    </div>
  );
}
