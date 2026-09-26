import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·';

/**
 * An airport departures-board line: when the text changes, each letter
 * clicks through a few characters before landing, left to right.
 */
export default function SplitFlap({ text, length = 30, className = '' }: { text: string; length?: number; className?: string }) {
  const target = text.toUpperCase().padEnd(length, ' ').slice(0, length);
  const [shown, setShown] = useState(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(target);
      return;
    }
    const start = performance.now();
    const from = shown;
    const tick = (now: number) => {
      const t = now - start;
      let done = true;
      const next = target
        .split('')
        .map((ch, i) => {
          const settleAt = 120 + i * 28; // left to right
          if (t >= settleAt || ch === from[i]) return ch;
          done = false;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');
      setShown(next);
      if (!done) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // Runs when the target changes; `shown` is read as the starting point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <span className={`inline-flex gap-[2px] ${className}`} aria-label={text}>
      {shown.split('').map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="relative grid h-[1.9em] w-[1.25em] place-items-center overflow-hidden rounded-[3px] bg-[#0b1f10] font-mono text-primary shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
        >
          {ch === ' ' ? ' ' : ch}
          {/* The hinge across the middle of each flap */}
          <span className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
        </span>
      ))}
    </span>
  );
}
