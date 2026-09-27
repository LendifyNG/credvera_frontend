import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const ease = [0.16, 1, 0.3, 1] as const;

// The four prices a business asks about first (from the pricing page).
const prices = [
  { value: '₦0', label: 'to open a business account' },
  { value: '₦0', label: 'for invoices and payment links' },
  { value: '₦25', label: 'to pay any Nigerian bank' },
  { value: '₦2,500', label: 'flat, to pay a supplier in the UK or Europe' },
];

/** A digit that rolls up into place, like a counter on a till. */
function Digit({ d, delay, go }: { d: number; delay: number; go: boolean }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top leading-none">
      <motion.span
        className="flex flex-col"
        initial={{ y: '0%' }}
        animate={go ? { y: `${-d * 10}%` } : { y: "0%" }}
        transition={{ duration: 1.4, ease, delay }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-[1em] leading-none">
            {9 - n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Rolling({ text, go, base }: { text: string; go: boolean; base: number }) {
  let i = 0;
  return (
    <span aria-label={text} className="inline-flex">
      {text.split('').map((ch, k) => {
        if (!/\d/.test(ch))
          return (
            <span key={k} aria-hidden className="leading-none">
              {ch}
            </span>
          );
        // Column runs 9..0 top to bottom, so digit d sits at row 9 - d.
        const row = 9 - Number(ch);
        return <Digit key={k} d={row} delay={base + i++ * 0.08} go={go} />;
      })}
    </span>
  );
}

/** What it costs: four prices that roll into place, and the way to the full list. */
export default function PriceRoll() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const go = inView || !!reduce;

  return (
    <section className="bg-graphite text-white">
      <div ref={ref} className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            What it costs.
            <br />
            <span className="text-white/45">Nothing hidden in between.</span>
          </h2>
          <Link to="/pricing" className="group inline-flex items-center gap-2 border-b border-white/20 pb-1 text-[15px] font-semibold">
            See the full price list
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <dl className="mt-14 grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {prices.map((p, i) => (
            <div key={p.label} className="border-b border-white/15 py-8 sm:odd:pr-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
              <dt className="font-ledger text-[clamp(3rem,5.6vw,4.8rem)] font-medium tracking-[-0.05em]">
                <Rolling text={p.value} go={go} base={i * 0.15} />
              </dt>
              <dd className="mt-4 max-w-[14rem] text-[15px] leading-snug text-white/60">{p.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
