import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Asks for the 4-digit PIN before anything moves. The PIN is never kept.
 * TODO(credvera): check the PIN with the API; for now any four digits confirm.
 */
export function PinPrompt({ open, title, detail, onConfirm, onClose }: { open: boolean; title: string; detail?: string; onConfirm: () => void; onClose: () => void }) {
  const [digits, setDigits] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDigits('');
    const t = window.setTimeout(() => input.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (digits.length !== 4) return;
    const t = window.setTimeout(() => {
      onConfirm();
      setDigits('');
    }, 250);
    return () => clearTimeout(t);
  }, [digits, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-graphite/40 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-7 text-graphite shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-graphite text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/40 hover:text-graphite">
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-5 text-xl font-semibold tracking-tight">{title}</p>
            {detail && <p className="mt-1 text-[14px] text-graphite/60">{detail}</p>}
            <label className="relative mt-6 block">
              <span className="sr-only">Your 4-digit PIN</span>
              <input
                ref={input}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={digits}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="absolute inset-0 opacity-0"
              />
              <span className="flex justify-center gap-3" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`grid size-12 place-items-center rounded-lg ring-1 transition-colors ${i < digits.length ? 'bg-graphite ring-graphite' : 'ring-graphite/20'}`}>
                    {i < digits.length && <span className="size-2.5 rounded-full bg-white" />}
                  </span>
                ))}
              </span>
            </label>
            <p className="mt-5 text-center text-[13px] text-graphite/50">Enter your PIN to confirm</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A decorative QR pattern that changes with its seed, so a refreshed code looks new. */
export function QrPattern({ seed, className = '' }: { seed: number; className?: string }) {
  const N = 25;
  const cells: [number, number][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const finder = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (finder) continue;
      if ((x * 31 + y * 17 + x * y * (seed % 7 + 3) + seed * 13) % 7 < 3) cells.push([x, y]);
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" rx="1.2" fill="#141c17" />
      <rect x={x + 1} y={y + 1} width="5" height="5" rx="0.8" fill="white" />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.6" fill="#141c17" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} shapeRendering="crispEdges" aria-hidden>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#141c17" />
      ))}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}
