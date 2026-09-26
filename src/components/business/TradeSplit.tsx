import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import LoopVideo from '../editorial/LoopVideo';

const clock = (zone: string) => new Date().toLocaleTimeString('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit' });

/** The time in a city, kept current. */
function useClock(zone: string) {
  const [t, setT] = useState(() => clock(zone));
  useEffect(() => {
    const i = window.setInterval(() => setT(clock(zone)), 15000);
    return () => clearInterval(i);
  }, [zone]);
  return t;
}

/**
 * Local and international trade in one frame: business at home on the left,
 * the supplier's side abroad on the right, each with its own clock. Drag the
 * handle (or use the arrow keys) to see more of either side.
 */
export default function TradeSplit() {
  const [split, setSplit] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const home = useClock('Africa/Lagos');
  const abroad = useClock('Asia/Shanghai');

  const moveTo = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setSplit(Math.min(82, Math.max(18, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section className="bg-white text-graphite">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Two ends of one trade.
            <br />
            <span className="text-graphite/45">One account between them.</span>
          </h2>
          <p className="font-medium text-[13px] text-graphite/45">Drag to look closer</p>
        </div>

        <div
          ref={box}
          className="relative flex h-[min(72vh,640px)] min-h-[420px] touch-none select-none overflow-hidden rounded-2xl bg-graphite"
          onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => (dragging.current = false)}
        >
          {/* Home */}
          <motion.div className="relative h-full overflow-hidden" animate={{ width: `${split}%` }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
            <LoopVideo name="trade-lagos" label="A Lagos business district from above, then a busy Nigerian market" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,28,23,0.75),transparent_45%)]" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="font-medium text-[13px] text-white/60">At home · Nigeria</p>
              <p className="mt-1 font-ledger text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium tabular-nums leading-none">{home}</p>
              <p className="mt-2 max-w-[16rem] text-[14px] leading-snug text-white/75">Your customers, your shop, your staff.</p>
            </div>
          </motion.div>

          {/* Abroad */}
          <div className="relative h-full flex-1 overflow-hidden">
            <LoopVideo name="trade-abroad" label="Goods being loaded for export, then a supplier's warehouse" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,28,23,0.75),transparent_45%)]" />
            <div className="absolute bottom-6 right-6 text-right text-white">
              <p className="font-medium text-[13px] text-white/60">Abroad · your supplier</p>
              <p className="mt-1 font-ledger text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium tabular-nums leading-none">{abroad}</p>
              <p className="ml-auto mt-2 max-w-[16rem] text-[14px] leading-snug text-white/75">Paid in their currency, when the goods ship.</p>
            </div>
          </div>

          {/* The handle */}
          <motion.div
            className="absolute inset-y-0 z-10 -ml-px w-0.5 bg-white/85"
            animate={{ left: `${split}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          >
            <button
              type="button"
              aria-label="Move the divider between home and abroad"
              aria-valuenow={Math.round(split)}
              aria-valuemin={18}
              aria-valuemax={82}
              role="slider"
              onPointerDown={(e) => {
                dragging.current = true;
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
              onPointerUp={() => (dragging.current = false)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') setSplit((s) => Math.max(18, s - 5));
                if (e.key === 'ArrowRight') setSplit((s) => Math.min(82, s + 5));
              }}
              className="absolute left-1/2 top-1/2 grid h-14 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              <span className="flex gap-1">
                <span className="h-4 w-0.5 rounded-full bg-graphite/40" />
                <span className="h-4 w-0.5 rounded-full bg-graphite/40" />
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
