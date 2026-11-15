import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deadlineDate } from '../../lib/asoEbi';
import Swatch from './Swatch';

export type AsoEbiLinkItem = { slug: string; title: string; deadline: string };

/** On a celebration's page: the family's aso-ebi, each a link to its own page. */
export default function AsoEbiLinks({ items }: { items: AsoEbiLinkItem[] }) {
  return (
    <div className="mt-5 grid gap-3">
      {items.map((a, i) => (
        <motion.div key={a.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}>
          <Link
            to={`/a/${encodeURIComponent(a.slug)}`}
            className="group flex items-center gap-4 rounded-[24px] bg-white p-3 pr-4 ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-0.5 hover:ring-ink/25 hover:shadow-[0_18px_40px_-28px_rgba(21,23,26,0.6)]"
          >
            <Swatch pattern={i + 2} moving className="size-14 shrink-0 rounded-[16px]" speed={12} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">Buy the family aso-ebi</span>
              <span className="mt-0.5 block truncate text-[13.5px] text-ink/55">
                {a.title} <span className="text-ink/30">·</span> order by {deadlineDate(a.deadline, false)}
              </span>
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-ink transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
