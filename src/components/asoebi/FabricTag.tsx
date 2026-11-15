import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { daysLeft, deadlineDate, type AsoEbiPage } from '../../lib/asoEbi';
import Swatch from './Swatch';

const ease = [0.16, 1, 0.3, 1] as const;

function countdown(deadline: string) {
  const d = daysLeft(deadline);
  if (d < 0) return null;
  if (d === 0) return 'Last day today';
  if (d === 1) return 'Ends tomorrow';
  return `${d} days left`;
}

/**
 * The collection as a clothing tag: a band of fabric on top, the organiser
 * and the title on the stitched label, and the deadline at the foot.
 */
export default function FabricTag({ c, open }: { c: AsoEbiPage; open: boolean }) {
  const left = open ? countdown(c.deadline) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: 1.4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, ease }}
      className="relative overflow-hidden rounded-[28px] bg-background text-white shadow-[0_30px_60px_-30px_rgba(21,23,26,0.55)]"
    >
      <div className="relative h-24 sm:h-28">
        <div className="absolute inset-0 opacity-90">
          <Swatch pattern={0} moving speed={14} className="size-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        {/* The tag's punched hole, with its string. */}
        <div className="absolute right-7 top-6 grid size-7 place-items-center rounded-full bg-paper shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] ring-4 ring-background">
          <span className="size-2 rounded-full bg-ink/15" />
        </div>
      </div>

      <div className="relative mx-2 mb-2 -mt-6 rounded-[22px] border border-dashed border-white/20 px-5 pb-6 pt-6 sm:px-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Aso-ebi</p>
        <h2 className="mt-3 text-[clamp(2rem,8vw,2.9rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-balance">{c.title}</h2>
        <p className="mt-3 inline-flex flex-wrap items-center gap-x-1.5 text-[14px] text-white/60">
          Collected by <span className="font-semibold text-white">{c.organiser}</span>
          <span className="text-white/30">·</span>
          <span className="inline-flex items-center gap-1 text-primary">
            <BadgeCheck className="size-4" strokeWidth={2} /> verified
          </span>
        </p>

        {c.note && <p className="mt-5 max-w-md whitespace-pre-line text-[15px] leading-relaxed text-white/80">{c.note}</p>}

        <div className="mt-7 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">{open ? 'Order by' : 'Deadline'}</p>
            <p className="mt-1 text-[16px] font-semibold">{deadlineDate(c.deadline)}</p>
          </div>
          {left && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-[13px] font-semibold text-white">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {left}
            </span>
          )}
        </div>

        {c.celebration && (
          <Link
            to={`/c/${encodeURIComponent(c.celebration.slug)}`}
            className="group mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-[14px] transition-colors hover:bg-white/[0.1]"
          >
            <span className="min-w-0">
              <span className="block text-white/50">For the celebration</span>
              <span className="block truncate font-semibold">{c.celebration.title}</span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-primary transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
