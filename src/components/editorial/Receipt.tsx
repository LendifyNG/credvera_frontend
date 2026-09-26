import { motion, useReducedMotion } from 'framer-motion';

// An example receipt from the app: prepaid electricity with its token.
const lines = [
  ['Ikeja Electric, prepaid', '₦25,000.00'],
  ['Meter', '4512 8890 3321'],
  ['Service fee', '₦100.00'],
  ['Paid from', 'Naira wallet'],
];

/** A receipt that prints out as it scrolls into view. */
export default function Receipt() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden pt-3">
      {/* The printer slot */}
      <div className="absolute inset-x-6 top-0 z-10 h-3 rounded-full bg-secondary" />
      <motion.div
        initial={reduce ? false : { y: '-85%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="mx-9 bg-white px-6 pb-8 pt-7 font-mono text-[13px] text-ink shadow-[0_20px_40px_-20px_rgba(1,21,4,0.3)]"
        style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,94% 97%,88% 100%,82% 97%,76% 100%,70% 97%,64% 100%,58% 97%,52% 100%,46% 97%,40% 100%,34% 97%,28% 100%,22% 97%,16% 100%,10% 97%,4% 100%,0 97%)' }}
      >
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-ink/50">Credvera</p>
        <p className="mt-1 text-center text-[11px] uppercase tracking-[0.2em] text-ink/40">Electricity token</p>
        <div className="my-5 border-t border-dashed border-ink/20" />
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-1">
            <span className="text-ink/55">{k}</span>
            <span className="text-right">{v}</span>
          </div>
        ))}
        <div className="my-5 border-t border-dashed border-ink/20" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/45">Token</p>
        <p className="mt-1 text-lg tracking-[0.12em]">4821 0937 5521 6604 1189</p>
        <p className="mt-6 text-center text-[11px] text-ink/40">Saved in your transactions · Share any time</p>
      </motion.div>
    </div>
  );
}
