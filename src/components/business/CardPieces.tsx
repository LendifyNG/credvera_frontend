import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from 'framer-motion';
import { Minus, Plus, Snowflake } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logoDark from '../../assets/logo-dark.png';
import logoLight from '../../assets/logo.png';

const ease = [0.16, 1, 0.3, 1] as const;

/** One of the two business card faces, drawn. */
export function CardFace({ usd, frozen = false, className = '' }: { usd: boolean; frozen?: boolean; className?: string }) {
  return (
    <div
      className={`relative aspect-[1.586] w-full overflow-hidden rounded-2xl p-6 transition-[filter,opacity] duration-500 ${
        usd ? 'text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10' : 'text-graphite shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]'
      } ${frozen ? 'opacity-60 grayscale' : ''} ${className}`}
      style={{
        background: usd ? 'linear-gradient(135deg, #1b2520 0%, #141c17 55%, #0e1511 100%)' : 'linear-gradient(135deg, #fbfcfa 0%, #eef1ec 60%, #e2e7e0 100%)',
      }}
    >
      <span aria-hidden className={`pointer-events-none absolute -bottom-12 -right-3 font-ledger text-[13rem] leading-none ${usd ? 'text-white/[0.06]' : 'text-graphite/[0.07]'}`}>
        {usd ? '$' : '₦'}
      </span>
      <div className="relative flex items-start justify-between">
        <div>
          <img src={usd ? logoLight : logoDark} alt="Credvera" className="h-5 w-auto" />
          <p className={`mt-1 font-ledger text-[9px] uppercase tracking-[0.34em] ${usd ? 'text-white/60' : 'text-graphite/55'}`}>Business</p>
        </div>
        <span className={`font-ledger text-[11px] ${usd ? 'text-white/70' : 'text-graphite/60'}`}>{usd ? 'USD' : 'NGN'} · Virtual</span>
      </div>
      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
        <span className="text-[13px] font-semibold tracking-[0.12em]">ADEOLA FOODS LTD</span>
        <span className={`font-ledger text-[14px] tracking-[0.12em] ${usd ? 'text-white/80' : 'text-graphite/70'}`}>•••• {usd ? '0291' : '7730'}</span>
      </div>
      {frozen && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 font-ledger text-[12px] text-graphite">
            <Snowflake className="size-3.5" /> Frozen
          </span>
        </span>
      )}
    </div>
  );
}

// A month of business costs, and which card each belongs on.
const costs = [
  { id: 'ads', what: 'Google Ads', amount: '$120.00', usd: true },
  { id: 'diesel', what: 'Diesel for the generator', amount: '₦85,000.00', usd: false },
  { id: 'figma', what: 'Figma', amount: '$45.00', usd: true },
  { id: 'internet', what: 'Office internet', amount: '₦35,000.00', usd: false },
  { id: 'shopify', what: 'Shopify plan', amount: '$39.00', usd: true },
  { id: 'restock', what: 'Restock, online wholesaler', amount: '₦240,000.00', usd: false },
];

function Cost({ c }: { c: (typeof costs)[number] }) {
  return (
    <motion.li
      layout
      layoutId={c.id}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="flex items-baseline justify-between gap-4 rounded-lg bg-white px-4 py-3 ring-1 ring-graphite/10"
    >
      <span className="text-[14px]">{c.what}</span>
      <span className="font-ledger text-[13px] tabular-nums">{c.amount}</span>
    </motion.li>
  );
}

/** A pile of the month's costs sorts itself onto the right card. */
export function CostSorter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-25% 0px' });
  const [sorted, setSorted] = useState(!!reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = window.setTimeout(() => setSorted(true), 900);
    return () => clearTimeout(t);
  }, [inView, reduce]);

  const usd = costs.filter((c) => c.usd);
  const ngn = costs.filter((c) => !c.usd);

  return (
    <div ref={ref}>
      <LayoutGroup>
        {!sorted ? (
          <ul className="mx-auto grid max-w-2xl gap-2 sm:grid-cols-2">
            {costs.map((c) => (
              <Cost key={c.id} c={c} />
            ))}
          </ul>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            {[
              { title: 'Dollar card', sub: 'Spends from your US dollar account', list: usd, total: '$204.00' },
              { title: 'Naira card', sub: 'Spends from your naira account', list: ngn, total: '₦360,000.00' },
            ].map((col) => (
              <div key={col.title}>
                <div className="mb-4 flex items-baseline justify-between border-b border-graphite/15 pb-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">{col.title}</p>
                    <p className="text-[13px] text-graphite/55">{col.sub}</p>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="font-ledger text-[15px] font-medium tabular-nums"
                  >
                    {col.total}
                  </motion.p>
                </div>
                <ul className="space-y-2">
                  {col.list.map((c) => (
                    <Cost key={c.id} c={c} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </LayoutGroup>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setSorted((s) => !s)}
          className="rounded-md px-4 py-2 text-[14px] font-semibold text-graphite/60 ring-1 ring-graphite/15 transition-colors hover:text-graphite"
        >
          {sorted ? 'Mix them again' : 'Sort them'}
        </button>
      </div>
    </div>
  );
}

const SEGMENTS = 20;
const SPENT = 1240;

/** A monthly limit you move, a meter of what's spent, and a freeze switch that means it. */
export function CardControls() {
  const [limit, setLimit] = useState(2000);
  const [frozen, setFrozen] = useState(false);
  const [tried, setTried] = useState(false);
  const used = Math.min(1, SPENT / limit);
  const lit = Math.round(used * SEGMENTS);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
      <div>
        <p className="font-medium text-[13px] text-white/45">Monthly limit · dollar card</p>
        <div className="mt-4 flex items-center gap-5">
          <button
            type="button"
            aria-label="Lower the limit"
            onClick={() => setLimit((l) => Math.max(500, l - 250))}
            className="grid size-11 place-items-center rounded-md ring-1 ring-white/20 transition-colors hover:bg-white/10"
          >
            <Minus className="size-4" />
          </button>
          <p className="font-ledger text-[clamp(2.6rem,6vw,4.4rem)] font-medium tabular-nums tracking-[-0.05em]">
            ${limit.toLocaleString('en-US')}
          </p>
          <button
            type="button"
            aria-label="Raise the limit"
            onClick={() => setLimit((l) => Math.min(10000, l + 250))}
            className="grid size-11 place-items-center rounded-md ring-1 ring-white/20 transition-colors hover:bg-white/10"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="mt-6 flex gap-1" aria-label={`$${SPENT} of $${limit} spent this month`}>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className={`h-3 flex-1 rounded-[2px] transition-colors duration-300 ${i < lit ? (used > 0.85 ? 'bg-[#f5c451]' : 'bg-primary') : 'bg-white/10'}`}
            />
          ))}
        </div>
        <p className="mt-3 font-ledger text-[12px] text-white/55">
          ${SPENT.toLocaleString('en-US')} spent this month · ${Math.max(0, limit - SPENT).toLocaleString('en-US')} left
        </p>

        <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-6">
          <div>
            <p className="text-lg font-semibold">Freeze the card</p>
            <p className="text-[14px] text-white/55">One tap. Unfreeze it the same way.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={frozen}
            aria-label="Freeze the card"
            onClick={() => {
              setFrozen((f) => !f);
              setTried(false);
            }}
            className={`relative h-8 w-14 rounded-full transition-colors ${frozen ? 'bg-primary' : 'bg-white/20'}`}
          >
            <motion.span className="absolute top-1 size-6 rounded-full bg-white shadow" animate={{ left: frozen ? 28 : 4 }} transition={{ duration: 0.25 }} />
          </button>
        </div>
      </div>

      <div>
        <CardFace usd frozen={frozen} />
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
          <span className="text-[14px]">Try a $39.00 payment</span>
          <button type="button" onClick={() => setTried(true)} className="rounded-md bg-white px-3 py-1.5 text-[13px] font-semibold text-graphite">
            Pay
          </button>
        </div>
        <AnimatePresence mode="wait">
          {tried && (
            <motion.p
              key={frozen ? 'no' : 'yes'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 font-ledger text-[12px] ${frozen ? 'text-[#f5c451]' : 'text-primary'}`}
            >
              {frozen ? 'Declined · the card is frozen' : limit - SPENT >= 39 ? 'Approved · $39.00, within your limit' : 'Declined · over your monthly limit'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** The physical card, as an outline: it's coming, and we say so. */
export function PhysicalOutline() {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  return (
    <svg ref={ref} viewBox="0 0 520 330" className="w-full max-w-lg" role="img" aria-label="An outline of the physical business card, coming soon">
      <motion.rect
        x="10"
        y="10"
        width="500"
        height="310"
        rx="24"
        fill="none"
        stroke="#141c17"
        strokeWidth="1.5"
        strokeDasharray="8 8"
        initial={reduce ? false : { pathLength: 0 }}
        animate={seen || reduce ? { pathLength: 1 } : {}}
        transition={{ duration: 1.6, ease }}
      />
      {/* Chip */}
      <rect x="54" y="120" width="62" height="48" rx="8" fill="none" stroke="#141c17" strokeOpacity="0.45" />
      <path d="M 54 144 H 116 M 75 120 V 168 M 95 120 V 168" stroke="#141c17" strokeOpacity="0.3" />
      {/* Contactless */}
      {[12, 20, 28].map((r) => (
        <path key={r} d={`M ${150} ${144 - r} a ${r} ${r} 0 0 1 0 ${r * 2}`} fill="none" stroke="#141c17" strokeOpacity="0.35" />
      ))}
      <text x="54" y="270" fontSize="16" fontWeight="600" letterSpacing="2" fill="#141c17" fillOpacity="0.55">
        ADEOLA FOODS LTD
      </text>
      <text x="466" y="62" fontSize="12" textAnchor="end" fill="#141c17" fillOpacity="0.45" fontFamily="Geist Mono, monospace">
        PHYSICAL · ON THE WAY
      </text>
    </svg>
  );
}
