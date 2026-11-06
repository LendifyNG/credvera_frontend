import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessPages } from '../../lib/businessPages';

/**
 * The end of a business feature page: a calm way on to the next one. The
 * footer below carries the account button, so there's no second call here.
 */
export default function BizClose({ path }: { path: string }) {
  const index = businessPages.findIndex((p) => p.to === path);
  const nextIndex = (index + 1) % businessPages.length;
  const next = businessPages[nextIndex]!;
  return (
    <Link to={next.to} className="group block bg-ledger text-graphite">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex items-center justify-between border-t border-graphite/15 pt-8 font-medium text-[13px] text-graphite/45">
          <span>Next</span>
          <span className="tabular-nums">
            {String(nextIndex + 1).padStart(2, '0')} / {String(businessPages.length).padStart(2, '0')}
          </span>
        </div>
        <div className="mt-10 flex items-end justify-between gap-8">
          <div>
            <p className="text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.045em] transition-transform duration-500 group-hover:translate-x-2">
              {next.label}
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-graphite/60">{next.proof}</p>
          </div>
          <span className="grid size-16 shrink-0 place-items-center rounded-md bg-graphite text-white transition-transform duration-300 group-hover:translate-x-1 lg:size-20">
            <ArrowRight className="size-6" />
          </span>
        </div>
      </div>
    </Link>
  );
}
