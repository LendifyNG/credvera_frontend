import { motion } from 'framer-motion';
import type { SprayNoteValue } from '../../lib/celebrations';
import Swatch from '../asoebi/Swatch';
import SprayNote from '../spray/SprayNote';
import Reveal from '../ui/Reveal';

const ease = [0.16, 1, 0.3, 1] as const;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// An example celebration, as its page shows the couple. Names are made up.
const gifts = [
  { name: 'Aunty Bisi', note: 'God bless your home', amount: 50000 },
  { name: 'Chidi O.', note: 'Congrats, my guy!', amount: 20000 },
  { name: 'Mama Tolu', note: null, amount: 100000 },
  { name: 'Femi & Kemi', note: 'Happy married life', amount: 25000 },
];

/** A celebration's gifts as a ticket: who sent what, and the total, in the style of the rate ticket. */
export function GiftTicket() {
  const total = gifts.reduce((s, g) => s + g.amount, 0);
  return (
    <Reveal>
      <div className="relative mx-auto max-w-xl rounded-[1.75rem] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(14,15,17,0.35)] ring-1 ring-ink/5">
        <div className="rounded-[1.4rem] border border-dashed border-ink/15 px-6 pb-6 pt-5 sm:px-8">
          <div className="flex items-baseline justify-between text-[13px] font-semibold text-ink/45">
            <span>Ada &amp; Tunde’s wedding</span>
            <span>Gifts so far</span>
          </div>
          <ul className="mt-5 divide-y divide-dashed divide-ink/15">
            {gifts.map((g, i) => (
              <motion.li
                key={g.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.12 }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4"
              >
                <span className="grid size-9 place-items-center rounded-full bg-primary text-[12px] font-semibold text-secondary">
                  {g.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{g.name}</p>
                  <p className="truncate text-sm text-ink/50">{g.note ?? 'Sent a gift'}</p>
                </div>
                <p className="text-xl font-semibold tabular-nums tracking-tight">{naira(g.amount)}</p>
              </motion.li>
            ))}
          </ul>
          {/* Perforation */}
          <div className="relative -mx-6 my-2 border-t border-dashed border-ink/15 sm:-mx-8" />
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-sm text-ink/50">credvera.co/c/ada-and-tunde</span>
            <span className="text-2xl font-semibold tabular-nums tracking-tight">{naira(total)}</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

const fan: { value: SprayNoteValue; x: number; y: number; r: number }[] = [
  { value: 200, x: -18, y: 22, r: -14 },
  { value: 500, x: 6, y: 4, r: -3 },
  { value: 1000, x: 26, y: -16, r: 9 },
];

/** Three spray notes, fanned out as if mid-flick, with the couple's monogram. */
export function SprayFan() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
      {fan.map((n, i) => (
        <motion.div
          key={n.value}
          className="absolute left-[12%] top-[28%] w-[72%]"
          initial={{ opacity: 0, x: '-10%', y: '30%', rotate: n.r - 18 }}
          whileInView={{ opacity: 1, x: `${n.x}%`, y: `${n.y}%`, rotate: n.r }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 + i * 0.18 }}
        >
          <SprayNote value={n.value} mark="A&T" className="h-auto w-full" />
        </motion.div>
      ))}
    </div>
  );
}

// An example aso-ebi, as guests see it.
const fabrics = [
  { name: 'Gele only', price: 15000, left: 'Unlimited' },
  { name: 'Gele and buba', price: 35000, left: '12 of 30 left' },
  { name: 'Agbada set', price: 60000, left: '4 of 10 left' },
];

/** An aso-ebi as a tag: a band of fabric, then what's on offer and what's left. */
export function AsoEbiTicket() {
  return (
    <Reveal>
      <div className="relative mx-auto max-w-xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_60px_-30px_rgba(14,15,17,0.35)] ring-1 ring-ink/5">
        <Swatch pattern={0} moving speed={14} className="h-20 w-full" />
        <div className="px-6 pb-6 pt-5 sm:px-8">
          <div className="flex items-baseline justify-between text-[13px] font-semibold text-ink/45">
            <span>Tolu’s 40th · Wine and gold</span>
            <span>Order by 5 Dec</span>
          </div>
          <ul className="mt-4 divide-y divide-dashed divide-ink/15">
            {fabrics.map((f, i) => (
              <motion.li
                key={f.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.12 }}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-semibold">{f.name}</p>
                  <p className="text-sm text-ink/50">{f.left}</p>
                </div>
                <p className="text-xl font-semibold tabular-nums tracking-tight">{naira(f.price)}</p>
              </motion.li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink/50">credvera.co/a/tolu-at-40</p>
        </div>
      </div>
    </Reveal>
  );
}
