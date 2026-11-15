import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

/**
 * A square of fabric, drawn in CSS: one of six weaves in lime on ink (or ink
 * on lime), so each option on an aso-ebi page has a look of its own. The
 * pattern drifts slowly when `moving`, like cloth catching the light.
 */

const LIME = '#dcf17e';
const INK = '#15171a';

type Weave = { image: string; size: string; position?: string; tile: [number, number] };

const soft = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

function weave(i: number, c: string): Weave {
  const s = soft(c, 45);
  switch (i % 6) {
    case 0: // Diagonal twill
      return {
        image: `linear-gradient(45deg, transparent 42%, ${c} 42% 58%, transparent 58%), linear-gradient(-45deg, transparent 44%, ${s} 44% 56%, transparent 56%)`,
        size: '12px 12px',
        tile: [12, 12],
      };
    case 1: // Gingham
      return {
        image: `linear-gradient(90deg, ${s} 50%, transparent 0), linear-gradient(${s} 50%, transparent 0)`,
        size: '14px 14px',
        tile: [14, 14],
      };
    case 2: // Adire dots
      return {
        image: `radial-gradient(circle, ${c} 2.2px, transparent 2.7px), radial-gradient(circle, ${s} 1.3px, transparent 1.8px)`,
        size: '14px 14px',
        position: '0 0, 7px 7px',
        tile: [14, 14],
      };
    case 3: // Zigzag
      return {
        image: `linear-gradient(135deg, ${c} 25%, transparent 25%), linear-gradient(225deg, ${c} 25%, transparent 25%), linear-gradient(315deg, ${s} 25%, transparent 25%), linear-gradient(45deg, ${s} 25%, transparent 25%)`,
        size: '20px 20px',
        position: '-10px 0, -10px 0, 0 0, 0 0',
        tile: [20, 20],
      };
    case 4: // Scallops
      return {
        image: `radial-gradient(circle at 50% 100%, transparent 0 4px, ${c} 4px 6px, transparent 6px 8.5px, ${s} 8.5px 10px, transparent 10px)`,
        size: '20px 10px',
        tile: [20, 10],
      };
    default: // Ankara stripes
      return {
        image: `linear-gradient(90deg, ${c} 0 3px, transparent 3px 7px, ${s} 7px 8.5px, transparent 8.5px 11px, ${s} 11px 12.5px, transparent 12.5px)`,
        size: '16px 16px',
        tile: [16, 16],
      };
  }
}

export default function Swatch({
  pattern,
  tone = 'ink',
  moving = false,
  className = '',
  speed = 9,
}: {
  pattern: number;
  /** ink: lime pattern on ink. lime: ink pattern on lime. */
  tone?: 'ink' | 'lime';
  moving?: boolean;
  className?: string;
  /** Seconds for one drift across two tiles. */
  speed?: number;
}) {
  const w = weave(pattern, tone === 'ink' ? LIME : INK);
  const [tx, ty] = w.tile;
  const style: CSSProperties = { backgroundImage: w.image, backgroundSize: w.size, backgroundPosition: w.position ?? '0 0' };
  return (
    <div aria-hidden className={`relative overflow-hidden ${tone === 'ink' ? 'bg-background' : 'bg-primary'} ${className}`}>
      <motion.div
        className="absolute -inset-12"
        style={style}
        animate={moving ? { x: [0, -tx * 2], y: [0, -ty * 2] } : { x: 0, y: 0 }}
        transition={moving ? { duration: speed, ease: 'linear', repeat: Infinity } : { duration: 0.6 }}
      />
    </div>
  );
}
