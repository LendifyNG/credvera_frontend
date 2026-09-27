import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import logo from '../../assets/logo-dark.png';

const ease = [0.16, 1, 0.3, 1] as const;

// An example Passport, as the app shows it. Ranges only, never exact amounts.
const rows = [
  { label: 'Monthly income from abroad', value: '$1,000 – $2,000', strong: true },
  { label: 'Paid in the last 12 months', value: '12 of 12 months' },
  { label: 'Paid by', value: '2 payers in the United States and United Kingdom' },
  { label: 'Receiving income since', value: 'October 2025' },
];

/** The Earnings Passport page a landlord sees: it fills in line by line, then gets stamped. */
export default function PassportDoc({ dark = false }: { dark?: boolean }) {
  const reduce = useReducedMotion();
  const appear = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-15% 0px' },
    transition: { duration: 0.7, ease, delay: 0.25 + i * 0.22 },
  });

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className={`relative rounded-[1.75rem] p-7 sm:p-9 ${dark ? 'bg-paper text-ink' : 'bg-white text-ink shadow-[0_40px_80px_-40px_rgba(1,21,4,0.4)] ring-1 ring-ink/5'}`}>
        <div className="flex items-center justify-between">
          <img src={logo} alt="Credvera" className="h-6 w-auto" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/40">Ref 7KQ2-M9XP</span>
        </div>
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/45">Earnings Passport</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Adaeze Okafor</p>
        <p className="text-sm text-ink/55">Identity verified with BVN · Prepared for renting a home</p>

        <dl className="mt-7 divide-y divide-ink/10 border-t border-ink/10">
          {rows.map((r, i) => (
            <motion.div key={r.label} {...appear(i)} className="py-3.5">
              <dt className="text-[13px] text-ink/50">{r.label}</dt>
              <dd className={r.strong ? 'mt-0.5 text-2xl font-semibold tracking-tight' : 'mt-0.5 font-medium'}>{r.value}</dd>
            </motion.div>
          ))}
        </dl>
        <p className="mt-5 text-[12px] leading-relaxed text-ink/45">
          Based only on payments received into this person’s Credvera accounts. Valid until 25 October 2026.
        </p>

        {/* The stamp */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.6, rotate: -24 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.25 + rows.length * 0.22 }}
          className="absolute -right-4 top-24 grid size-28 place-items-center rounded-full border-[3px] border-background/80 text-center text-background/80 sm:-right-8"
        >
          <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.18em]">
            Verified
            <br />
            <span className="font-serif text-lg normal-case italic tracking-normal">by Credvera</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}
