import { animate, AnimatePresence, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useId, useRef, useState, useSyncExternalStore } from 'react';
import type { SprayNoteValue } from '../../lib/celebrations';
import { useReducedMotion } from '../../lib/motion';
import { photos, type Photo } from '../../lib/photos';
import { NOTE_STYLE } from '../spray/SprayNote';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// The example celebration on this page is Ada & Tunde's wedding (see GiftTicket).
const MARK = 'A&T';
// What the hall has sprayed before this wad lands. An example figure.
const SPRAYED_BEFORE = 246800;

type Spot = { left: number; top: number; r: number };
type Note = { photo: Photo; focus: string; value: SprayNoteValue; wide: Spot; narrow?: Spot };

// Each photo printed as a note. `focus` keeps faces (or the money) in the window.
// Spots are % of the stage; the last note sits out on phones.
const NOTES: Note[] = [
  { photo: photos.celebrateCouple, focus: '45% 26%', value: 1000, wide: { left: 1, top: 4, r: -9 }, narrow: { left: 0, top: 0, r: -7 } },
  { photo: photos.celebrateNaira, focus: '40% 30%', value: 500, wide: { left: 27, top: 18, r: 7 }, narrow: { left: 24, top: 31, r: 6 } },
  { photo: photos.blogKaftan, focus: '50% 18%', value: 200, wide: { left: 52, top: 1, r: -5 }, narrow: { left: 3, top: 62, r: -4 } },
  { photo: photos.friendsSelfie, focus: '60% 38%', value: 500, wide: { left: 67, top: 30, r: 10 } },
];

// Note size as a share of the stage, per layout.
const SIZE = { wide: { w: 30, h: 27 }, narrow: { w: 74, h: 27 } };

const query = '(min-width: 768px)';
function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => true,
  );
}

/** A photo printed as a spray note: the photo in the window, the value, and the couple's monogram. */
function PhotoNote({ note }: { note: Note }) {
  const s = NOTE_STYLE[note.value];
  const id = useId().replace(/:/g, '');
  const digits = note.value.toLocaleString('en-NG');
  return (
    <div
      className="@container relative aspect-[2/1] w-full overflow-hidden rounded-[2.4cqw] shadow-[0_24px_40px_-18px_rgba(14,15,17,0.55)]"
      style={{ backgroundColor: s.bg, color: s.ink }}
    >
      {/* Guilloche: rings behind the window and waves across, like an engraved note. */}
      <svg aria-hidden viewBox="0 0 240 120" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`sheen${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx="62" cy="60" rx={10 + i * 8} ry={8 + i * 6} fill="none" stroke={s.line} strokeWidth="0.9" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${84 + i * 5} C 30 ${76 + i * 5}, 60 ${94 + i * 5}, 90 ${84 + i * 5} S 150 ${76 + i * 5}, 240 ${86 + i * 5}`}
            fill="none"
            stroke={s.line}
            strokeWidth="0.8"
          />
        ))}
        <rect x="5" y="5" width="230" height="110" rx="5" fill="none" stroke={s.ink} strokeOpacity="0.35" strokeWidth="0.9" />
        <rect width="240" height="120" fill={`url(#sheen${id})`} />
      </svg>

      {/* The value, down the left */}
      <div aria-hidden className="absolute bottom-[9%] left-[6%] top-[10%] flex w-[30%] flex-col justify-between">
        <span className="text-[3.3cqw] font-bold leading-none tracking-[0.2em] opacity-70">SPRAY</span>
        <span className="flex items-start font-bold leading-[0.85] tracking-[-0.04em] tabular-nums">
          <span className="mr-[0.4cqw] mt-[0.6cqw] text-[5cqw] font-semibold">₦</span>
          <span className={digits.length > 3 ? 'text-[8cqw]' : 'text-[10cqw]'}>{digits}</span>
        </span>
        <span className="text-[3.2cqw] font-semibold leading-none opacity-75">credvera</span>
      </div>

      {/* The window: the photo is the note's portrait */}
      <div className="absolute bottom-[8%] right-[4%] top-[8%] w-[56%] overflow-hidden rounded-[1.6cqw]" style={{ boxShadow: `0 0 0 1px ${s.line}` }}>
        <img
          src={note.photo.src}
          alt={note.photo.alt}
          width={note.photo.width}
          height={note.photo.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-full select-none object-cover"
          style={{ objectPosition: note.focus }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_40%,rgba(0,0,0,0.18))]" />
        {/* Corner value */}
        <span
          aria-hidden
          className="absolute right-[3cqw] top-[2.6cqw] rounded-full px-[1.8cqw] py-[0.7cqw] text-[3cqw] font-bold leading-none tabular-nums"
          style={{ backgroundColor: s.bg, color: s.ink }}
        >
          {digits}
        </span>
      </div>

      {/* The monogram seal, astride the window's edge */}
      <div
        aria-hidden
        className="absolute left-[40%] top-[74%] grid aspect-square w-[13%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[0.5cqw]"
        style={{ backgroundColor: s.bg, borderColor: s.seal, color: s.seal }}
      >
        <span className="absolute inset-[9%] rounded-full border border-dashed opacity-50" style={{ borderColor: s.seal }} />
        <span className="text-[3.6cqw] font-bold tracking-[-0.03em]">{MARK}</span>
      </div>
    </div>
  );
}

/**
 * "The spray": the celebration's photos printed as spray notes and flicked
 * across the page. They arc in from the lower corner one after another, land
 * scattered over the headline, and the counter climbs as each one lands.
 */
export default function SprayPhotos() {
  const reduce = useReducedMotion();
  const wide = useWide();
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { once: true, amount: 0.3 });
  const [lifted, setLifted] = useState<number | null>(null);
  const [landed, setLanded] = useState<{ n: number; value: number } | null>(null);

  const total = useMotionValue(SPRAYED_BEFORE);
  const shown = useTransform(total, (v) => naira(Math.round(v)));
  const sum = useRef(SPRAYED_BEFORE);

  const counted = useRef(new Set<number>());
  const land = (i: number, value: number) => {
    if (counted.current.has(i)) return;
    counted.current.add(i);
    sum.current += value;
    animate(total, sum.current, { duration: 0.7, ease });
    setLanded({ n: i, value });
  };

  const size = wide ? SIZE.wide : SIZE.narrow;
  const notes = NOTES.filter((n) => wide || n.narrow);

  return (
    <section className="relative overflow-clip bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-[13px] font-semibold text-ink/50">At the owambe</p>
          </Reveal>

          {/* The live total, as the hall's screen shows it */}
          <Reveal delay={0.1}>
            <div className="sm:text-right">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink/50 sm:justify-end">
                <span className="relative flex size-2.5">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary"
                    animate={{ scale: [1, 2.2], opacity: [0.9, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <span aria-hidden className="relative size-2.5 rounded-full bg-primary ring-1 ring-ink/40" />
                </span>
                Sprayed so far · Ada &amp; Tunde
              </p>
              <div className="mt-2 flex items-center gap-3 sm:justify-end">
                <AnimatePresence>
                  {landed ? (
                    <motion.span
                      key={landed.n}
                      aria-hidden
                      className="order-last rounded-full bg-secondary px-2.5 py-1 text-[12px] font-semibold text-primary tabular-nums sm:order-first"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    >
                      +{naira(landed.value)}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                <motion.span className="font-ledger text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.035em] tabular-nums text-ink">
                  {shown}
                </motion.span>
              </div>
            </div>
          </Reveal>
        </div>

        <div ref={stage} className="relative mt-10 md:mt-6 md:h-[600px] lg:h-[680px]">
          <Headline
            text={'Let the\nnotes *fly*.'}
            className="relative z-0 text-[clamp(3rem,13vw,12rem)] font-semibold leading-[0.88] tracking-[-0.045em] text-ink md:absolute md:inset-x-0 md:bottom-0"
          />

          {/* The notes: on phones they stack under the headline; wider, they land over it. */}
          <div className="relative mt-10 h-[440px] md:absolute md:inset-0 md:mt-0 md:h-auto">
            {notes.map((n, i) => {
              const spot = (wide ? n.wide : n.narrow) as Spot;
              // Thrown from just off the stage's lower-left corner, in the note's own widths and heights.
              const fromX = `${-((spot.left / size.w) * 100 + 115)}%`;
              const fromY = `${((100 - spot.top) / size.h) * 100 + 20}%`;
              const isLifted = lifted === i;
              return (
                <motion.div
                  key={n.photo.src}
                  className="absolute hover:z-40!"
                  style={{ left: `${spot.left}%`, top: `${spot.top}%`, width: `${size.w}%`, zIndex: isLifted ? 40 : 10 + i, willChange: 'transform' }}
                  initial={reduce ? false : { x: fromX, y: fromY, rotate: spot.r - 40, scale: 0.78, opacity: 0 }}
                  animate={
                    inView
                      ? {
                          x: [fromX, '0%'],
                          y: [fromY, '-16%', '0%'],
                          rotate: [spot.r - 40, spot.r + 5, spot.r],
                          scale: [0.78, 1.03, 1],
                          opacity: [0, 1, 1],
                        }
                      : undefined
                  }
                  transition={{
                    delay: 0.15 + i * 0.32,
                    duration: 1.05,
                    times: [0, 0.68, 1],
                    ease: ['easeOut', 'easeInOut'],
                    x: { delay: 0.15 + i * 0.32, duration: 0.8, ease },
                    opacity: { delay: 0.15 + i * 0.32, duration: 0.35, times: [0, 0.4, 1] },
                  }}
                  onAnimationComplete={() => {
                    if (inView) land(i, n.value);
                  }}
                >
                  {/* Hover or tap lifts the note and straightens it. */}
                  <motion.figure
                    className="cursor-pointer"
                    animate={isLifted ? { rotate: -spot.r, scale: 1.07, y: -14 } : { rotate: 0, scale: 1, y: 0 }}
                    whileHover={{ rotate: -spot.r, scale: 1.07, y: -14 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    onTap={() => setLifted(isLifted ? null : i)}
                  >
                    <PhotoNote note={n} />
                  </motion.figure>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-ink/15 pt-10 md:mt-16 md:grid-cols-2">
          <Reveal>
            <p className="max-w-md text-lg leading-relaxed text-ink/65">
              Every note carries your monogram and lands on the big screen in the hall the moment it’s sprayed.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-lg leading-relaxed text-ink/65">
              No bending to pick money off the floor, no counting at 2am. It’s already in your celebration, with the name of
              whoever sprayed it.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
