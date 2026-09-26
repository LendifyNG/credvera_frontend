import { motion } from 'framer-motion';
import { useState } from 'react';

// The parts of an invoice worth pointing at: [callout, where on the drawing (x, y in the 600×760 box), what it does].
const parts: { n: number; title: string; body: string; at: [number, number]; box: [number, number, number, number] }[] = [
  { n: 1, title: 'Your line items', body: 'What you sold, how many, and the price. Totals add themselves up.', at: [52, 322], box: [40, 300, 520, 150] },
  { n: 2, title: 'A due date', body: 'Pick the day it’s due. The customer sees it on every reminder.', at: [468, 168], box: [360, 150, 200, 44] },
  { n: 3, title: 'A payment link', body: 'Your customer pays by card or bank transfer from the invoice itself.', at: [52, 610], box: [40, 590, 520, 64] },
  { n: 4, title: 'Reminders, sent for you', body: 'If it isn’t paid on time, a polite reminder goes out. You don’t chase.', at: [468, 704], box: [300, 690, 260, 34] },
  { n: 5, title: 'Marks itself paid', body: 'When the money lands, the invoice says so, and you both get a receipt.', at: [468, 84], box: [400, 66, 160, 40] },
];

/**
 * An invoice drawn in hairlines, like a technical diagram, with numbered
 * notes on the parts that do the work. Pick a note to light up its part.
 */
export default function InvoiceAnatomy() {
  const [active, setActive] = useState(1);
  const a = parts.find((p) => p.n === active)!;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
      <svg viewBox="0 0 600 760" className="w-full max-w-[520px] justify-self-center" role="img" aria-label="An invoice with five numbered parts">
        {/* Paper */}
        <rect x="20" y="20" width="560" height="720" rx="14" fill="white" stroke="#141c17" strokeOpacity="0.18" />
        {/* Header */}
        <text x="44" y="78" fontSize="20" fontWeight="600" fill="#141c17">Adeola Foods Ltd</text>
        <text x="44" y="104" fontSize="13" fill="#141c17" fillOpacity="0.5" fontFamily="Geist Mono, monospace">INV-0143 · to Lekki Grill</text>
        <rect x="400" y="66" width="160" height="40" rx="20" fill="none" stroke="#141c17" strokeOpacity="0.25" />
        <text x="480" y="91" fontSize="13" textAnchor="middle" fill="#1f6b33" fontFamily="Geist Mono, monospace">PAID</text>
        <line x1="44" y1="130" x2="556" y2="130" stroke="#141c17" strokeOpacity="0.12" />
        <text x="44" y="176" fontSize="12" fill="#141c17" fillOpacity="0.45" fontFamily="Geist Mono, monospace">ISSUED 26 SEP</text>
        <text x="556" y="176" fontSize="12" textAnchor="end" fill="#141c17" fillOpacity="0.7" fontFamily="Geist Mono, monospace">DUE FRI 2 OCT</text>
        {/* Items */}
        {[
          ['Catering, 60 guests', '360,000.00'],
          ['Delivery and set-up', '25,000.00'],
          ['Service staff, 4 hours', '35,000.00'],
        ].map(([k, v], i) => (
          <g key={k}>
            <text x="56" y={338 + i * 44} fontSize="15" fill="#141c17" fillOpacity="0.8">{k}</text>
            <text x="544" y={338 + i * 44} fontSize="14" textAnchor="end" fill="#141c17" fontFamily="Geist Mono, monospace">₦{v}</text>
            <line x1="56" y1={354 + i * 44} x2="544" y2={354 + i * 44} stroke="#141c17" strokeOpacity="0.08" />
          </g>
        ))}
        <text x="56" y="510" fontSize="14" fill="#141c17" fillOpacity="0.55">Total</text>
        <text x="544" y="512" fontSize="22" fontWeight="600" textAnchor="end" fill="#141c17" fontFamily="Geist Mono, monospace">₦420,000.00</text>
        {/* Pay */}
        <rect x="40" y="590" width="520" height="64" rx="10" fill="#141c17" fillOpacity="0.04" stroke="#141c17" strokeOpacity="0.15" />
        <text x="300" y="628" fontSize="15" fontWeight="600" textAnchor="middle" fill="#141c17">Pay ₦420,000 · card or bank transfer</text>
        <text x="556" y="712" fontSize="12" textAnchor="end" fill="#141c17" fillOpacity="0.45" fontFamily="Geist Mono, monospace">REMINDER · 1 OCT, IF UNPAID</text>

        {/* The part being described */}
        <motion.rect
          initial={false}
          animate={{ x: a.box[0] - 6, y: a.box[1] - 6, width: a.box[2] + 12, height: a.box[3] + 12 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          rx="12"
          fill="#7fde80"
          fillOpacity="0.14"
          stroke="#1f6b33"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        {/* Numbered notes on the drawing */}
        {parts.map((p) => (
          <g key={p.n} className="cursor-pointer" onClick={() => setActive(p.n)} onMouseEnter={() => setActive(p.n)}>
            <circle cx={p.at[0]} cy={p.at[1]} r="15" fill={p.n === active ? '#141c17' : 'white'} stroke="#141c17" strokeWidth="1.2" />
            <text x={p.at[0]} y={p.at[1] + 5} fontSize="13" textAnchor="middle" fill={p.n === active ? 'white' : '#141c17'} fontFamily="Geist Mono, monospace">
              {p.n}
            </text>
          </g>
        ))}
      </svg>

      <ol className="border-t border-graphite/15">
        {parts.map((p) => {
          const on = p.n === active;
          return (
            <li key={p.n} className="border-b border-graphite/15">
              <button
                type="button"
                onClick={() => setActive(p.n)}
                onMouseEnter={() => setActive(p.n)}
                aria-pressed={on}
                className="grid w-full grid-cols-[2.5rem_1fr] gap-3 py-5 text-left"
              >
                <span
                  className={`grid size-7 place-items-center rounded-full font-ledger text-[12px] transition-colors ${
                    on ? 'bg-graphite text-white' : 'ring-1 ring-graphite/25 text-graphite/60'
                  }`}
                >
                  {p.n}
                </span>
                <span>
                  <span className={`block text-lg font-semibold tracking-tight transition-colors ${on ? 'text-graphite' : 'text-graphite/55'}`}>{p.title}</span>
                  <motion.span
                    initial={false}
                    animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
                    transition={{ duration: 0.35 }}
                    className="block overflow-hidden text-[15px] leading-relaxed text-graphite/65"
                  >
                    <span className="block pt-1.5">{p.body}</span>
                  </motion.span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
