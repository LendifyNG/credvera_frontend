import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowUpRight, Check, ShieldCheck, Smartphone, Tv, Zap, type LucideIcon } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from '../../lib/motion';
import { photos, type Photo } from '../../lib/photos';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

type Moment = {
  photo: Photo;
  /** object-position: x frames the face on phones (photo cropped at the sides), y on wide screens (cropped top and bottom). */
  pos: string;
  /** On wide screens, nudges the photo sideways so the person sits under the phone. */
  shift: string;
  label: string;
  caption: string;
  card: {
    icon: LucideIcon;
    kind: string;
    title: string;
    amount?: string;
    sub: string;
    checked?: boolean;
    fee: string;
    status: string;
  };
};

// Four everyday moments. Names, numbers and tokens are made up; fees follow
// the app (bills cost nothing extra, ₦20 to send ₦10,000 to ₦49,999).
const moments: Moment[] = [
  {
    photo: photos.womanBraidsPhone,
    pos: '12% 32%',
    shift: '7%',
    label: 'Airtime',
    caption: 'Credit ran out mid-call. Topped up before the line dropped.',
    card: { icon: Smartphone, kind: 'Airtime', title: 'MTN · 0803 ••• 4417', amount: '₦1,000.00', sub: 'Delivered to the line', fee: 'No extra fee', status: 'Done' },
  },
  {
    photo: photos.menYellowBus,
    pos: '48% 62%',
    shift: '0%',
    label: 'Transfers',
    caption: 'Paying a friend back from the danfo, with his name checked first.',
    card: { icon: ArrowUpRight, kind: 'Transfer', title: 'Chidi Okeke', amount: '₦25,000.00', sub: 'Name checked', checked: true, fee: 'Fee ₦20', status: 'Sent' },
  },
  {
    photo: photos.marketTomatoes,
    pos: '62% 38%',
    shift: '-7%',
    label: 'Electricity',
    caption: 'Light for home, bought between two customers.',
    card: { icon: Zap, kind: 'Electricity · prepaid', title: 'Ikeja Electric', amount: '₦5,000.00', sub: 'Token 4821 ••••', fee: 'No extra fee', status: 'Done' },
  },
  {
    photo: photos.manWorkWatch,
    pos: '30% 22%',
    shift: '4%',
    label: 'TV',
    caption: "DStv renewed on the way to work, ready for tonight's match.",
    card: { icon: Tv, kind: 'TV', title: 'DStv Compact', sub: 'Smartcard ••• 0921', fee: 'No extra fee', status: 'Renewed' },
  },
];

const SEG = 1 / moments.length;
const range = (i: number) => [i * SEG, (i + 1) * SEG] as const;
// Scroll ranges must sit inside 0–1 and keep rising, or the browser's animation
// engine refuses them and the page fails to render.
const span = (xs: readonly number[]) => {
  let prev = -1;
  return xs.map((x) => (prev = Math.max(Math.min(1, Math.max(0, x)), prev + 0.0001)));
};
const pad = (n: number) => String(n).padStart(2, '0');

// Outside the phone the moment is grey and dim; inside it, alive.
const DIM = 'grayscale(1) brightness(0.4) contrast(1.05)';

/** One photo, drawn twice (dim behind, lit inside the phone) with the same motion so the two stay aligned. */
function Plate({ m, i, p, lit, still }: { m: Moment; i: number; p: MotionValue<number>; lit: boolean; still: boolean }) {
  const [from, to] = range(i);
  const opacity = useTransform(p, span([from - 0.03, from + 0.03]), [i === 0 ? 1 : 0, 1]);
  const scale = useTransform(p, span([from - 0.05, to + 0.05]), still ? [1.16, 1.16] : [1.2, 1.14]);
  // Inside the phone the colour develops as the moment arrives.
  const grey = useTransform(p, span([from, from + 0.08]), [1, 0]);
  const bright = useTransform(p, span([from, from + 0.08]), [0.55, 1]);
  const develop = useMotionTemplate`grayscale(${grey}) brightness(${bright})`;

  return (
    <motion.div
      className="absolute inset-0 lg:[translate:var(--shift)_0]"
      style={{ opacity, '--shift': m.shift } as unknown as CSSProperties}
    >
      <motion.img
        src={m.photo.src}
        alt={lit ? '' : m.photo.alt}
        width={m.photo.width}
        height={m.photo.height}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        style={{ objectPosition: m.pos, scale, filter: lit ? develop : DIM }}
      />
    </motion.div>
  );
}

/** The payment for one moment, sliding up on the phone's screen. */
function Card({ m, i, p }: { m: Moment; i: number; p: MotionValue<number> }) {
  const [from, to] = range(i);
  const last = i === moments.length - 1;
  const inAt = [from + 0.02, from + 0.06];
  const outAt = [to - 0.025, to - 0.005];
  const opacity = useTransform(p, span(last ? inAt : [...inAt, ...outAt]), last ? [0, 1] : [0, 1, 1, 0]);
  const y = useTransform(p, span(last ? inAt : [...inAt, ...outAt]), last ? [56, 0] : [56, 0, 0, -20]);
  const stamp = useTransform(p, span([from + 0.08, from + 0.12]), [0.6, 1]);
  const c = m.card;
  const Icon = c.icon;

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-2.5 bottom-3 rounded-2xl bg-[#fbfbf7] p-3 text-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)] ring-1 ring-black/5 sm:inset-x-3 sm:p-3.5"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[10.5px] text-ink/50">{c.kind}</span>
          <span className="block truncate text-[13px] font-semibold">{c.title}</span>
        </span>
      </div>
      {c.amount && <p className="mt-2.5 text-[20px] font-semibold tabular-nums tracking-[-0.02em] sm:text-[22px]">{c.amount}</p>}
      <p className={`flex items-center gap-1 truncate text-[11px] tabular-nums ${c.amount ? '' : 'mt-2.5'} ${c.checked ? 'font-semibold text-ink/80' : 'text-ink/55'}`}>
        {c.checked && <ShieldCheck className="size-3.5 shrink-0" />}
        {c.sub}
        {c.checked && <Check className="size-3 shrink-0" />}
      </p>
      <div className="mt-2.5 flex items-center justify-between border-t border-ink/10 pt-2.5 text-[11px]">
        <span className="tabular-nums text-ink/50">{c.fee}</span>
        <motion.span
          style={{ scale: stamp }}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-semibold text-secondary"
        >
          <Check className="size-3" /> {c.status}
        </motion.span>
      </div>
    </motion.div>
  );
}

/** A thin bar that fills while its moment is on screen. */
function Tick({ i, p, className = '' }: { i: number; p: MotionValue<number>; className?: string }) {
  const [from, to] = range(i);
  const scaleX = useTransform(p, span([from, to]), [0, 1]);
  return (
    <span className={`relative block h-[2px] overflow-hidden rounded-full bg-white/15 ${className}`}>
      <motion.span style={{ scaleX }} className="absolute inset-0 origin-left bg-primary" />
    </span>
  );
}

/**
 * "Through the phone": the section pins while four Lagos moments pass behind
 * a phone. Outside the phone each photo is grey and dim; through the screen
 * the same photo is sharp and in colour, and that moment's payment slides up.
 */
export default function PhoneWindow() {
  const still = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // Read through a plain function so the browser never takes these over as scroll-timeline animations:
  // that path left cards and photos stuck when the page jumped (a link, a refresh mid-page).
  const p = useTransform(scrollYProgress, (v) => v);
  const [step, setStep] = useState(0);
  useMotionValueEvent(p, 'change', (v) => setStep(Math.min(moments.length - 1, Math.max(0, Math.floor(v / SEG)))));
  const now = moments[step] ?? moments[0]!;

  // The phone's screen. The lit photo is clipped to exactly this box, so it lines up with the dim one behind.
  // --lift raises it a little on phones, where the caption needs room below.
  const screen =
    'inset(calc(50% - var(--lift) - var(--ph) / 2) calc(50% - var(--pw) / 2) calc(50% + var(--lift) - var(--ph) / 2) round var(--pr))';

  return (
    <section ref={ref} aria-label="Everyday payments, moment by moment" className="relative h-[300vh] px-3 sm:px-6 lg:h-[400vh]">
      <ol className="sr-only">
        {moments.map((m) => (
          <li key={m.label}>
            {m.label}: {m.caption}
          </li>
        ))}
      </ol>

      <div className="sticky top-0 flex h-svh flex-col pb-3 pt-20 sm:pb-6">
        <div className="relative mx-auto w-full max-w-7xl flex-1 overflow-hidden rounded-[2rem] bg-[#070b09] text-white [--lift:28px] [--ph:min(460px,52svh)] [--pr:calc(var(--pw)*0.17)] [--pw:calc(var(--ph)*0.49)] sm:[--lift:20px] sm:[--ph:min(560px,58svh)] lg:[--lift:0px] lg:[--ph:min(620px,64svh)]">
          {/* The moment, dim and grey */}
          {moments.map((m, i) => (
            <Plate key={m.label} m={m} i={i} p={p} lit={false} still={still} />
          ))}
          {/* Keeps the words readable */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,11,9,0.85),transparent_40%),linear-gradient(to_bottom,rgba(7,11,9,0.6),transparent_30%)]" />

          {/* The same moment through the phone: sharp and in colour */}
          <div aria-hidden className="absolute inset-0" style={{ clipPath: screen, WebkitClipPath: screen }}>
            {moments.map((m, i) => (
              <Plate key={m.label} m={m} i={i} p={p} lit still={still} />
            ))}
          </div>

          {/* The phone: a thin frame around the screen, nothing more */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            style={{
              top: 'calc(50% - var(--lift))',
              width: 'var(--pw)',
              height: 'var(--ph)',
              borderRadius: 'var(--pr)',
              boxShadow: '0 0 0 7px #0e0f11, 0 0 0 8px rgba(255,255,255,0.3), 0 50px 90px -30px rgba(0,0,0,0.9)',
            }}
          >
            <span className="absolute left-1/2 top-2.5 h-[20px] w-[30%] -translate-x-1/2 rounded-full bg-[#0e0f11]" />
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.14),transparent_35%)]" />
            {moments.map((m, i) => (
              <Card key={m.label} m={m} i={i} p={p} />
            ))}
          </div>

          {/* Top: what this is */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-6 p-5 sm:p-10 lg:p-14">
            <div className="lg:w-[min(22rem,calc(50%_-_var(--pw)/2_-_3rem))]">
              <p className="text-[13px] font-semibold text-primary">Through the phone</p>
              <Headline
                text={'Pay for the moment,\n*in the moment*.'}
                className="mt-4 hidden text-[clamp(2rem,3.2vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.035em] lg:block"
              />
            </div>
            <p aria-hidden className="text-sm font-semibold tabular-nums lg:hidden">
              {pad(step + 1)}
              <span className="text-white/40"> / {pad(moments.length)}</span>
            </p>
          </div>

          {/* Bottom left: the step and its caption */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 p-5 sm:p-10 lg:right-auto lg:max-w-[min(22rem,calc(50%_-_var(--pw)/2_-_4.5rem))] lg:p-14">
            <div className="hidden items-baseline gap-2 lg:flex">
              <span className="text-[clamp(3.5rem,6vw,5.5rem)] font-semibold leading-none tabular-nums tracking-[-0.04em]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={step}
                    className="inline-block"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    {pad(step + 1)}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-lg font-semibold tabular-nums text-white/40">/ {pad(moments.length)}</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease }}
                className="lg:mt-4"
              >
                <p className="text-[13px] font-semibold text-primary">{now.label}</p>
                <p className="mt-1.5 text-[15px] leading-snug text-white/80 sm:text-lg">{now.caption}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 grid grid-cols-4 gap-2 lg:hidden">
              {moments.map((m, i) => (
                <Tick key={m.label} i={i} p={p} />
              ))}
            </div>
          </div>

          {/* Right, wide screens: the four moments as an index */}
          <ol aria-hidden className="absolute right-14 top-1/2 hidden w-40 -translate-y-1/2 space-y-6 lg:block xl:w-48">
            {moments.map((m, i) => (
              <li key={m.label}>
                <span className={`flex items-baseline gap-3 text-sm font-semibold transition-colors duration-500 ${i === step ? 'text-white' : 'text-white/35'}`}>
                  <span className="tabular-nums">{pad(i + 1)}</span>
                  {m.label}
                </span>
                <Tick i={i} p={p} className="mt-2.5" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
