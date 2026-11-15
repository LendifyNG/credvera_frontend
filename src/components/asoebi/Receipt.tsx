import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { linesOf, type AsoEbiPage, type OrderState } from '../../lib/asoEbi';
import { naira } from '../pay/PayFlow';
import Swatch from './Swatch';

const paidOn = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' });

/** Paid: the thank-you, and the order as a little receipt to keep. */
export default function Receipt({
  c,
  order,
  pattern,
  buyer,
  onAgain,
}: {
  c: AsoEbiPage;
  order: OrderState;
  pattern: number;
  /** First name, only in the tab they ordered in. */
  buyer: string | null;
  onAgain: () => void;
}) {
  const lines = linesOf(order);
  const rows: [string, string][] = [
    ...lines.map((l, i) => [i === 0 ? (lines.length > 1 ? 'Fabrics' : 'Fabric') : '', `${l.quantity} × ${l.name}`] as [string, string]),
    ...(lines.length ? [] : ([['Quantity', String(order.quantity)]] as [string, string][])),
    ['Paid', naira(Number(order.amount))],
    ...(order.paidAt ? ([['When', paidOn(order.paidAt)]] as [string, string][]) : []),
    ['Reference', order.reference],
  ];
  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid size-20 place-items-center rounded-full bg-primary"
      >
        <Check className="size-9 text-ink" strokeWidth={2.4} />
      </motion.div>
      <h2 className="mt-7 text-[clamp(1.9rem,7vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-ink">
        Paid. Thank you{buyer ? `, ${buyer}` : ''}.
      </h2>
      <p className="mt-3 max-w-sm text-lg leading-relaxed text-ink/65">
        {c.organiser} has your order and will reach you about getting your fabric.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-8 overflow-hidden rounded-[24px] bg-background text-white"
      >
        <div className="flex items-center gap-4 p-5">
          <Swatch pattern={pattern} tone="lime" moving className="size-12 shrink-0 rounded-[14px]" />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">Aso-ebi</p>
            <p className="truncate text-[16px] font-semibold">{order.collection.title}</p>
          </div>
        </div>
        {/* The tear line, with a notch either side. */}
        <div className="relative h-6">
          <span className="absolute -left-3 top-0 size-6 rounded-full bg-paper" />
          <span className="absolute -right-3 top-0 size-6 rounded-full bg-paper" />
          <span className="absolute inset-x-5 top-1/2 border-t border-dashed border-white/20" />
        </div>
        <dl className="grid gap-3 px-5 pb-6 pt-1 text-[14.5px]">
          {rows.map(([k, v], i) => (
            <div key={`${k}${i}`} className="flex items-baseline justify-between gap-4">
              <dt className="text-white/45">{k}</dt>
              <dd className={`min-w-0 truncate text-right font-medium ${k === 'Paid' ? 'font-ledger text-[18px] font-semibold text-primary' : ''}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
      <p className="mt-4 text-[13.5px] text-ink/50">Keep the reference in case you need to ask about your order.</p>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={onAgain} className="text-[15px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-4">
          Order more
        </button>
        {c.celebration && (
          <Link to={`/c/${encodeURIComponent(c.celebration.slug)}`} className="group inline-flex items-center gap-1 text-[15px] font-semibold text-ink/60 hover:text-ink">
            Send {c.celebration.title} a gift
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        )}
      </div>
    </div>
  );
}
