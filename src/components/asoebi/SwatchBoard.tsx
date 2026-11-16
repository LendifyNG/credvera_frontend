import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import tailorPhoto from '../../assets/photos/business/trade-tailor.webp';
import { useReducedMotion } from '../../lib/motion';
import { photos } from '../../lib/photos';
import Headline from '../editorial/Headline';
import Reveal from '../ui/Reveal';
import Swatch from './Swatch';

/**
 * "Cut from the same cloth": the aso-ebi told as a tailor's cutting board.
 * A measuring tape slides across, three photos cut with pinking shears drop
 * onto the board with their fabric and price, then guests' tags tick to paid
 * one by one while the count climbs. Same example as AsoEbiTicket.
 */

const ease = [0.16, 1, 0.3, 1] as const;
const INK = '#15171a';
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/**
 * A pinking-shears edge as a clip-path: zig-zag teeth on all four sides.
 * Positions along each edge are in percent, the tooth depth in pixels, so
 * the teeth stay the same depth at any size.
 */
function pinked(across: number, down: number, depth = 6) {
  const pts: string[] = [];
  const d = `${depth}px`;
  const far = `calc(100% - ${depth}px)`;
  for (let i = 0; i < across; i++) {
    const a = (i / across) * 100;
    const m = ((i + 0.5) / across) * 100;
    pts.push(`${a}% ${d}`, `${m}% 0%`);
  }
  for (let i = 0; i < down; i++) {
    const a = (i / down) * 100;
    const m = ((i + 0.5) / down) * 100;
    pts.push(`${far} ${a}%`, `100% ${m}%`);
  }
  for (let i = 0; i < across; i++) {
    const a = 100 - (i / across) * 100;
    const m = 100 - ((i + 0.5) / across) * 100;
    pts.push(`${a}% ${far}`, `${m}% 100%`);
  }
  for (let i = 0; i < down; i++) {
    const a = 100 - (i / down) * 100;
    const m = 100 - ((i + 0.5) / down) * 100;
    pts.push(`${d} ${a}%`, `0% ${m}%`);
  }
  return `polygon(${pts.join(', ')})`;
}

type Piece = {
  src: string;
  alt: string;
  width: number;
  height: number;
  fabric: string;
  price: number;
  /** Where it sits on the board: phone first, then md and up. */
  place: string;
  aspect: string;
  rotate: number;
  teeth: [number, number];
  /** object-position, to keep faces in the cut. */
  focus: string;
  fix: 'pin' | 'tape';
  /** Where its price tag hangs. */
  tag: string;
  tagRotate: number;
};

// Fabrics and prices match the aso-ebi ticket at the top of the page.
const pieces: Piece[] = [
  {
    ...photos.asoEbiGroup,
    fabric: 'Gele and buba',
    price: 35000,
    place: 'left-[3%] top-[12%] w-[66%] md:left-[4%] md:top-[9%] md:w-[45%] z-10',
    aspect: 'aspect-[5/3.4]',
    rotate: -3.5,
    teeth: [34, 23],
    focus: '50% 32%',
    fix: 'pin',
    tag: '-bottom-5 right-[-4%] md:right-auto md:left-[-3%] md:-bottom-6',
    tagRotate: -5,
  },
  {
    ...photos.asoEbiTailor,
    fabric: 'Gele only',
    price: 15000,
    place: 'left-[5%] top-[52%] w-[42%] md:left-[44%] md:top-[5%] md:w-[23%] z-20',
    aspect: 'aspect-[3/4]',
    rotate: 4,
    teeth: [17, 23],
    focus: '50% 24%',
    fix: 'tape',
    tag: '-bottom-5 left-[-6%]',
    tagRotate: 4,
  },
  {
    src: tailorPhoto,
    width: 800,
    height: 1066,
    alt: 'A smiling tailor at his work table',
    fabric: 'Agbada set',
    price: 60000,
    place: 'left-[45%] top-[48%] w-[45%] md:left-[66%] md:top-[15%] md:w-[24%] z-30',
    aspect: 'aspect-[3/4]',
    rotate: -2.5,
    teeth: [17, 23],
    focus: '50% 20%',
    fix: 'pin',
    tag: '-bottom-5 left-[-6%]',
    tagRotate: -3,
  },
];

// Guests on Tolu's list, as the organiser sees them come in.
const guests = [
  { name: 'Kemi', size: 'Size 12', weave: 0, done: 'paid' as const },
  { name: 'Bola', size: 'Size 14', weave: 2, done: 'paid' as const },
  { name: 'Uche', size: 'Agbada L', weave: 5, done: 'collected' as const },
];
const TOTAL = 30;
const BEFORE = 15; // paid before these three

type Status = 'hidden' | 'paying' | 'paid' | 'collected';

// One step per beat: each guest appears paying, then ticks to paid; Uche
// is then ticked off as collected.
function statusAt(step: number, i: number): Status {
  const shown = 1 + i * 2;
  if (step < shown) return 'hidden';
  if (step === shown) return 'paying';
  if (i === 2 && step >= 7) return 'collected';
  return 'paid';
}
const LAST_STEP = 7;

/** A dressmaker's pin with a lime head, pushed into the board. */
function Pin() {
  return (
    <span aria-hidden className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
      <span className="block size-3.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0,#dcf17e_32%,#8fa232_100%)] shadow-[0_3px_5px_rgba(0,0,0,0.45)] md:size-4" />
    </span>
  );
}

/** A strip of paper tape across the top edge. */
function Tape() {
  return (
    <span
      aria-hidden
      className="absolute left-1/2 top-0 z-10 h-5 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-6 bg-[#f3f4ef]/75 shadow-[0_1px_2px_rgba(0,0,0,0.15)] md:h-6 md:w-20"
    />
  );
}

function PriceTag({ fabric, price }: { fabric: string; price: number }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap rounded-md bg-white py-1.5 pl-2 pr-2.5 text-[11px] font-semibold leading-none text-ink shadow-[0_8px_18px_-6px_rgba(0,0,0,0.5)] md:gap-2.5 md:py-2 md:pl-2.5 md:pr-3 md:text-[13px]">
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-background/80 ring-2 ring-ink/10 md:size-2" />
      <span>{fabric}</span>
      <span aria-hidden className="text-ink/30">·</span>
      <span className="tabular-nums">{naira(price)}</span>
    </span>
  );
}

/** A tailor's tape: lime, with ticks on both edges and the numbers between. */
function MeasuringTape({ seen, reduce }: { seen: boolean; reduce: boolean }) {
  const tick = (w: string) => `linear-gradient(90deg, ${INK} 0 ${w}, transparent ${w})`;
  const ruler: CSSProperties = {
    backgroundImage: [tick('1.5px'), tick('1px'), tick('1px'), tick('1.5px'), tick('1px'), tick('1px')].join(', '),
    backgroundSize: [
      'var(--cell) 30%',
      'var(--cell) 22%',
      'calc(var(--cell) / 10) 13%',
      'var(--cell) 30%',
      'var(--cell) 22%',
      'calc(var(--cell) / 10) 13%',
    ].join(', '),
    backgroundPosition: '0 0, calc(var(--cell) / 2) 0, 0 0, 0 100%, calc(var(--cell) / 2) 100%, 0 100%',
    backgroundRepeat: 'repeat-x',
  };
  return (
    <div
      aria-hidden
      className="absolute left-[3%] top-[2.5%] w-[115%] origin-left rotate-[1.5deg] [--cell:30px] md:top-[77%] md:-rotate-[2.5deg] md:[--cell:44px]"
    >
      <motion.div
        className="flex h-8 shadow-[0_10px_18px_-8px_rgba(0,0,0,0.7)] md:h-11"
        initial={reduce ? false : { x: '70%', opacity: 0 }}
        animate={seen ? { x: '0%', opacity: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 60, damping: 18, mass: 1.1 }}
      >
        {/* The metal tip */}
        <span className="w-3.5 shrink-0 rounded-l-[3px] bg-[linear-gradient(180deg,#d9dcd4_0%,#f7f8f4_35%,#a3a69e_100%)] md:w-5" />
        <div className="relative flex-1 overflow-hidden bg-primary" style={ruler}>
          <div className="flex h-full items-center">
            {Array.from({ length: 48 }, (_, i) => (
              <span
                key={i}
                className="w-[var(--cell)] shrink-0 pl-[3px] text-[10px] font-semibold leading-none tabular-nums text-ink/80 md:pl-1 md:text-[12px]"
              >
                {i === 0 ? '' : i}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function GuestTag({ name, size, weave, status }: { name: string; size: string; weave: number; status: Status }) {
  const visible = status !== 'hidden';
  return (
    <motion.li
      className="flex min-w-0 items-center gap-3 rounded-2xl bg-white py-2.5 pl-2.5 pr-3 text-ink shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)]"
      initial={false}
      animate={visible ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : { opacity: 0, y: 18, rotate: -4, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      aria-hidden={!visible}
    >
      <Swatch pattern={weave} className="size-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-tight">{name}</p>
        <p className="truncate text-[13px] leading-tight text-ink/50">{size}</p>
      </div>
      <span className="relative grid h-7 min-w-[6.5rem] place-items-end overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={status}
            className={`flex h-7 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold ${
              status === 'collected'
                ? 'bg-background text-primary'
                : status === 'paid'
                  ? 'bg-primary text-secondary'
                  : 'bg-ink/[0.06] text-ink/50'
            }`}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            {status === 'paid' ? (
              <>
                Paid <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </>
            ) : status === 'collected' ? (
              <>
                Collected <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </>
            ) : (
              <>
                <motion.span
                  aria-hidden
                  className="size-1.5 rounded-full bg-ink/40"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                Paying
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.li>
  );
}

export default function SwatchBoard() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -20% 0px' }) || reduce;
  const [step, setStep] = useState(reduce ? LAST_STEP : 0);

  useEffect(() => {
    if (!seen || reduce) return;
    const beats = [2100, 2700, 3200, 3800, 4300, 4900, 5900];
    const timers = beats.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [seen, reduce]);

  const paid = BEFORE + guests.filter((_, i) => ['paid', 'collected'].includes(statusAt(step, i))).length;
  const collected = guests.filter((_, i) => statusAt(step, i) === 'collected').length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      <div className="grid items-end gap-8 md:grid-cols-[1.15fr_1fr] md:gap-16">
        <Headline
          text={'Cut from the\n*same cloth*.'}
          className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
        />
        <Reveal delay={0.1}>
          <p className="max-w-md text-lg text-ink/70 md:ml-auto">
            Put up each fabric with its price. Guests pick theirs, add a size and pay on the link, and every order lands on
            your list, ready to tick off when they collect.
          </p>
        </Reveal>
      </div>

      <div
        ref={ref}
        className="relative mt-14 overflow-hidden rounded-[2rem] bg-background text-paper lg:mt-20"
        style={{
          // A cutting mat's grid, faint.
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '-1px -1px',
        }}
      >
        {/* The board */}
        <div className="relative aspect-[3/4.4] w-full md:aspect-[16/10]">
          <MeasuringTape seen={seen} reduce={reduce} />

          {/* An offcut of the fabric itself, pinked like the photos */}
          <motion.div
            aria-hidden
            className="absolute left-[76%] top-[16%] w-[17%] md:left-[36%] md:top-[61%] md:w-[8%]"
            initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -30 }}
            animate={seen ? { opacity: 1, scale: 1, rotate: 12 } : undefined}
            transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 1.5 }}
          >
            <div className="aspect-square" style={{ clipPath: pinked(8, 8, 4) }}>
              <Swatch pattern={3} tone="lime" moving speed={18} className="size-full" />
            </div>
          </motion.div>

          {/* The event, chalked on the mat */}
          <motion.p
            aria-hidden
            className="font-serif absolute bottom-[6%] left-[5%] hidden text-[clamp(1.1rem,2vw,1.6rem)] text-paper/55 md:block"
            initial={reduce ? false : { opacity: 0, x: -16 }}
            animate={seen ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 1.2, ease, delay: 1.8 }}
          >
            Tolu’s 40th, wine and gold
          </motion.p>

          {pieces.map((p, i) => (
            <motion.figure
              key={p.fabric}
              className={`absolute ${p.place}`}
              style={{ filter: 'drop-shadow(0 22px 24px rgba(0,0,0,0.5))' }}
              initial={reduce ? false : { opacity: 0, y: -70, scale: 1.12, rotate: p.rotate - 10 }}
              animate={seen ? { opacity: 1, y: 0, scale: 1, rotate: p.rotate } : undefined}
              transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.9, delay: 0.55 + i * 0.28 }}
            >
              <div className={`${p.aspect} overflow-hidden bg-mist`} style={{ clipPath: pinked(p.teeth[0], p.teeth[1]) }}>
                <img
                  src={p.src}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  loading="lazy"
                  decoding="async"
                  className="block size-full object-cover"
                  style={{ objectPosition: p.focus }}
                />
              </div>
              {p.fix === 'pin' ? <Pin /> : <Tape />}
              <motion.figcaption
                className={`absolute z-10 origin-top-left ${p.tag}`}
                initial={reduce ? false : { opacity: 0, rotate: -28, y: -8 }}
                animate={seen ? { opacity: 1, rotate: p.tagRotate - p.rotate, y: 0 } : undefined}
                transition={{ type: 'spring', stiffness: 170, damping: 9, delay: 0.95 + i * 0.28 }}
              >
                <PriceTag fabric={p.fabric} price={p.price} />
              </motion.figcaption>
            </motion.figure>
          ))}
        </div>

        {/* The organiser's list, under a stitch line */}
        <div className="relative border-t border-dashed border-paper/20 px-5 pb-6 pt-6 md:px-8 md:pb-8 md:pt-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:items-center lg:gap-10">
            <div>
              <p className="text-[13px] font-semibold text-paper/50">Paid so far</p>
              <p className="mt-1 flex items-baseline gap-2 text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-none tracking-[-0.03em]">
                <span className="relative inline-grid overflow-hidden tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={paid}
                      initial={{ y: '100%' }}
                      animate={{ y: '0%' }}
                      exit={{ y: '-100%' }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    >
                      {paid}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-paper/45">of {TOTAL} paid</span>
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper/10">
                <motion.div
                  className="h-full origin-left rounded-full bg-primary"
                  initial={false}
                  animate={{ scaleX: paid / TOTAL }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                />
              </div>
              <p className="mt-3 text-[13px] text-paper/50">
                <span className="tabular-nums">{collected}</span> collected
              </p>
            </div>
            <ul className="grid gap-3 md:grid-cols-3">
              {guests.map((g, i) => (
                <GuestTag key={g.name} name={g.name} size={g.size} weave={g.weave} status={statusAt(step, i)} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
