import { useInView } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAudience } from '../../lib/audience';

const WORD = 'credvera';
// Seconds: walking to a letter, then painting it. Unhurried on purpose.
const WALK = 1.1;
const PAINT = 3.2;
const STEP = WALK + PAINT;
const END = WORD.length * STEP + 2;

// Each letter gets its own shade from the account's palette.
const PALETTE = {
  personal: ['#7fde80', '#f5f7f2', '#3fcf5f', '#e3f6e3', '#a8ecaa', '#7fde80', '#f5f7f2', '#3fcf5f'],
  business: ['#f0f2ef', '#7fde80', '#c9d1cc', '#e3f6e3', '#9aa39e', '#f0f2ef', '#7fde80', '#c9d1cc'],
} as const;

// Where each glyph sits in its line box (the line height is 0.8 of the font
// size), as a share of the box's height: short letters start about 29% down,
// the tall "d" about 4% down, and all sit on a baseline about 95% down.
const GLYPH_TOP = (ch: string) => (ch === 'd' ? 0.04 : 0.29);
const BASELINE = 0.95;

type Box = { cx: number; top: number; bottom: number; width: number; boxH: number };

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
// A repeatable "random" number from a seed, so every visit plays the same.
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// The painter's grid: 48 wide, 60 tall, feet at y = 60. The brush tip, when
// held up, is at (46, 5).
const TIP = { x: 46, y: 5 };
// Painting a letter: a moment of strokes standing, then three hops, each
// higher, until the brush reaches the top of the letter.
const STAND = 0.2;
const HOPS = 3;

/**
 * The footer's big "credvera", painted in letter by letter by a small painter
 * with a hand brush, hopping to reach the tops, paint flying as he goes.
 * Drawn in code; plays once, the first time the footer comes into view.
 */
export default function PaintedWordmark() {
  const { audience } = useAudience();
  const colours = PALETTE[audience];
  const wrap = useRef<HTMLDivElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInView(wrap, { once: true, amount: 0.5 });
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [t, setT] = useState(0);

  // Where each letter's glyph sits, kept up to date as the page resizes.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const base = el.getBoundingClientRect();
      setBoxes(
        letters.current.map((l, i) => {
          const r = l!.getBoundingClientRect();
          const boxTop = r.top - base.top;
          return {
            cx: r.left - base.left + r.width / 2,
            top: boxTop + r.height * GLYPH_TOP(WORD[i]!),
            bottom: boxTop + r.height * BASELINE,
            width: r.width,
            boxH: r.height,
          };
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One clock drives the whole scene.
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const s = (now - start) / 1000;
      setT(Math.min(s, END));
      if (s < END) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const n = WORD.length;
  const ready = boxes.length === n;
  // About half a short letter tall.
  const letterH = ready ? boxes[0]!.boxH : 100;
  const scale = Math.max(0.6, Math.min(2, (letterH * 0.46) / 60));
  const baseY = ready ? boxes[0]!.bottom : 0;
  const standReach = (60 - TIP.y) * scale;

  // For a letter being painted at progress p (0 to 1): how high he's hopped,
  // how far up the glyph the paint has reached (0 to 1), and the brush's sway.
  const paintState = (i: number, p: number) => {
    const b = boxes[i];
    if (!b) return { jump: 0, k: 0, sway: 0 };
    const glyph = Math.max(1, b.bottom - b.top);
    const top = Math.max(0, glyph - standReach + 6 * scale);
    const apex = (j: number) => (top * (j + 1)) / HOPS;
    let jump = 0;
    let reached: number;
    if (p < STAND) {
      reached = Math.min(standReach, glyph) * (p / STAND);
    } else {
      const q = ((p - STAND) / (1 - STAND)) * HOPS;
      const j = Math.min(HOPS - 1, Math.floor(q));
      const u = q - j;
      jump = apex(j) * 4 * u * (1 - u);
      const before = j > 0 ? apex(j - 1) : 0;
      reached = standReach + (u < 0.5 ? Math.max(before, jump) : apex(j));
    }
    const sway = Math.sin(p * Math.PI * 9) * b.width * 0.18;
    return { jump, k: clamp01(reached / glyph), sway };
  };

  const seg = Number.isFinite(t) ? Math.min(n, Math.floor(t / STEP)) : 0;
  const local = t - seg * STEP;
  const walking = seg < n && local < WALK;
  const done = seg >= n;
  const p = seg < n && !walking ? (local - WALK) / PAINT : 0;
  const progress = (i: number) => (i < seg ? 1 : i === seg && !walking && ready ? paintState(i, p).k : 0);

  // The painter stands so the raised brush lands on the letter's middle.
  const standAt = (i: number) => (ready ? boxes[i]!.cx - TIP.x * scale : 0);
  let px = -60 * scale;
  let jump = 0;
  let stride = 0;
  if (ready) {
    if (done) {
      const u = clamp01((t - n * STEP) / 1.2);
      px = lerp(standAt(n - 1), standAt(n - 1) + boxes[n - 1]!.width * 0.9, ease(u));
      stride = u < 1 ? Math.sin(t * 11) : 0;
    } else if (walking) {
      const from = seg === 0 ? -60 * scale : standAt(seg - 1);
      px = lerp(from, standAt(seg), ease(local / WALK));
      stride = Math.sin(t * 11);
    } else {
      const s = paintState(seg, p);
      px = standAt(seg) + s.sway;
      jump = s.jump;
    }
  }
  const painting = ready && inView && !walking && !done;
  const current = colours[Math.min(seg, n - 1)]!;

  // Paint drops: fourteen per letter, flung from the brush as he works, each
  // flying for 0.7 s. Where the brush was when a drop left is worked out again
  // from that moment, so the arcs start at the bristles.
  const drops: { x: number; y: number; r: number; o: number; c: string }[] = [];
  if (painting) {
    for (let d = 0; d < 14; d++) {
      const emit = 0.06 + (d / 14) * 0.9;
      const age = (p - emit) * PAINT;
      if (age < 0 || age > 0.7) continue;
      const s = paintState(seg, emit);
      const x0 = standAt(seg) + s.sway + TIP.x * scale;
      const y0 = baseY - (60 - TIP.y) * scale - s.jump;
      const seed = seg * 31 + d;
      const vx = (rand(seed) - 0.5) * 160 * scale;
      const vy = -(40 + rand(seed + 7) * 90) * scale;
      drops.push({
        x: x0 + vx * age,
        y: Math.min(baseY, y0 + vy * age + 0.5 * 420 * scale * age * age),
        r: (1 + rand(seed + 3) * 1.6) * scale,
        o: 1 - age / 0.7,
        c: current,
      });
    }
  }
  // A few drops that landed stay on the ground by each finished letter.
  const landed: { x: number; r: number; c: string }[] = [];
  if (ready) {
    for (let i = 0; i < Math.min(seg, n); i++) {
      for (let d = 0; d < 3; d++) {
        const seed = i * 17 + d;
        landed.push({ x: boxes[i]!.cx + (rand(seed) - 0.5) * boxes[i]!.width * 1.1, r: (1.2 + rand(seed + 5)) * scale, c: colours[i]! });
      }
    }
  }

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none relative select-none px-4 pb-4">
      <p className="text-center text-[22vw] font-bold leading-[0.8] tracking-tighter">
        {WORD.split('').map((ch, i) => {
          const k = progress(i);
          // From the baseline up to where the brush has reached.
          const topF = k >= 1 ? -0.3 : BASELINE + 0.05 - k * (BASELINE + 0.05 - GLYPH_TOP(ch));
          return (
            // Unpainted letters are clear: the word only appears as it's painted.
            <span key={i} ref={(el) => void (letters.current[i] = el)} className="relative inline-block text-transparent">
              {ch}
              <span className="absolute inset-0" style={{ color: colours[i], clipPath: `inset(${topF * 100}% -12% -10% -12%)` }}>
                {ch}
              </span>
            </span>
          );
        })}
      </p>

      {ready && inView ? (
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          {landed.map((d, i) => (
            <ellipse key={`l${i}`} cx={d.x} cy={baseY + 1} rx={d.r * 1.6} ry={d.r * 0.6} fill={d.c} opacity={0.9} />
          ))}
          <Painter x={px} baseY={baseY} lift={jump} scale={scale} stride={stride} paint={current} painting={painting} tipCap={done && t > n * STEP + 1.3} />
          {drops.map((d, i) => (
            <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={d.o} />
          ))}
        </svg>
      ) : null}
    </div>
  );
}

/**
 * The painter, a character of our own in the classic cartoon plumber mould:
 * big head, round nose, thick moustache, cap with the Credvera diamond,
 * overalls with yellow buttons, white gloves, brown boots, and a hand brush.
 * Drawn facing right on a 48 × 60 grid, feet at the bottom.
 */
function Painter({
  x,
  baseY,
  lift,
  scale,
  stride,
  paint,
  painting,
  tipCap,
}: {
  x: number;
  baseY: number;
  lift: number;
  scale: number;
  stride: number;
  paint: string;
  painting: boolean;
  tipCap: boolean;
}) {
  const skin = '#f2c6a0';
  const skinShade = '#dba57f';
  const hair = '#4a2c1a';
  const shirt = '#1f8a45';
  const overalls = '#2f55a4';
  const overallsShade = '#24438a';
  const glove = '#ffffff';
  const boot = '#6b3f22';
  const leg = stride * 24;
  const bob = Math.abs(stride) * 1.4;
  // Legs tuck up while he's in the air.
  const airborne = lift > 1;

  return (
    <g transform={`translate(${x} ${baseY - 60 * scale - lift - bob * scale}) scale(${scale})`}>
      {/* A soft shadow on the ground, smaller the higher he hops */}
      <ellipse cx="20" cy={60 + (lift + bob * scale) / scale} rx={Math.max(4, 11 - lift / scale / 4)} ry="1.8" fill="#000" opacity="0.35" />

      {/* Legs and boots, swinging from the hip */}
      <g transform={`rotate(${airborne ? -18 : -leg} 18 44)`}>
        <rect x="14" y="42" width="7" height="12" rx="3" fill={overallsShade} />
        <path d="M12 52 h10 q4 0 4 4 v3 h-14 z" fill={boot} />
      </g>
      <g transform={`rotate(${airborne ? 14 : leg} 22 44)`}>
        <rect x="18" y="42" width="7" height="12" rx="3" fill={overalls} />
        <path d="M16 52 h10 q5 0 5 4 v3 h-15 z" fill={boot} />
      </g>

      {/* Body: shirt, then overalls with straps and buttons */}
      <path d="M9 32 q0 -8 8 -8 h8 q8 0 8 8 v6 h-24 z" fill={shirt} />
      <path d="M11 30 h4 v6 h12 v-6 h4 v12 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill={overalls} />
      <path d="M11 38 h20 v4 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill={overallsShade} />
      <circle cx="15.5" cy="33" r="1.5" fill="#f5c542" />
      <circle cx="26.5" cy="33" r="1.5" fill="#f5c542" />
      {/* Paint on his overalls */}
      <circle cx="18" cy="41" r="1.2" fill={paint} />
      <circle cx="25" cy="44" r="0.9" fill={paint} />

      {/* Back arm, swinging as he walks */}
      <g transform={`rotate(${painting ? 20 : leg * 0.8} 12 28)`}>
        <path d="M12 27 q-4 5 -3.5 10" stroke={shirt} strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="8.8" cy="38" r="3" fill={glove} />
      </g>

      {/* Head: ear, sideburn, face, eye, big nose, moustache */}
      <circle cx="22" cy="15" r="10.5" fill={skin} />
      <path d="M12 15 q0 -5 3 -7 l1 9 z" fill={hair} />
      <ellipse cx="15.5" cy="17" rx="2.2" ry="2.8" fill={skinShade} />
      <ellipse cx="26" cy="12.5" rx="1.9" ry="2.6" fill="#fff" />
      <ellipse cx="26.8" cy="12.9" rx="1.1" ry="1.6" fill="#1b1b1b" />
      <path d="M23.5 9.2 q2.5 -1.4 5 0" stroke={hair} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <ellipse cx="31" cy="16" rx="4" ry="3.4" fill={skinShade} />
      <ellipse cx="30.6" cy="15.4" rx="3.6" ry="3" fill={skin} />
      <path d="M22 19.5 q4 -2.6 8.5 -1 q3.5 -1.2 5.5 1.2 q-3 3.2 -7 1.8 q-4 1.8 -7 -2 z" fill={hair} />

      {/* Cap: dome, brim, and the Credvera diamond on a white badge */}
      <g transform={tipCap ? 'translate(2 -5) rotate(-18 22 8)' : undefined}>
        <path d="M11.5 11 q0 -10 11 -10 q10.5 0 11 9 z" fill={shirt} />
        <path d="M30 9.2 q7 -0.4 10 2.2 q-4.5 1.4 -10 0.6 z" fill="#17703a" />
        <circle cx="21.5" cy="6" r="3.4" fill="#fff" />
        <rect x="19.9" y="4.4" width="3.2" height="3.2" rx="0.4" fill={shirt} transform="rotate(45 21.5 6)" />
      </g>

      {/* Front arm: raised with the brush while painting, down while walking */}
      {painting ? (
        <g>
          <path d="M29 27 q6 -6 9 -12" stroke={shirt} strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="38.5" cy="14" r="3" fill={glove} />
          <Brush x={38.5} y={14} angle={-42} paint={paint} />
        </g>
      ) : (
        <g transform={`rotate(${-leg * 0.8} 30 28)`}>
          <path d="M30 27 q3 5 2.5 10" stroke={shirt} strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="32.5" cy="38" r="3" fill={glove} />
          <Brush x={32.5} y={38} angle={70} paint={paint} />
        </g>
      )}
    </g>
  );
}

// A hand brush: wooden handle, metal ferrule, bristles loaded with paint.
function Brush({ x, y, angle, paint }: { x: number; y: number; angle: number; paint: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x="-1.2" y="-2" width="9" height="2.6" rx="1.3" fill="#a9743f" />
      <rect x="7.4" y="-2.6" width="3" height="3.8" rx="0.6" fill="#b8bec4" />
      <path d="M10.2 -3 h4 q1.6 1.9 0 3.8 h-4 z" fill="#3a2a1a" />
      <path d="M12.4 -3 h1.8 q1.6 1.9 0 3.8 h-1.8 z" fill={paint} />
    </g>
  );
}
