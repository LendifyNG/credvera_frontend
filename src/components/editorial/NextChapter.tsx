import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { personalPages } from '../../lib/personalPages';

/** Closes a feature page with the next one, so the pages read like a story. */
export default function NextChapter({ current }: { current: string }) {
  const i = personalPages.findIndex((p) => p.to === current);
  const next = personalPages[(i + 1) % personalPages.length] ?? personalPages[0];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <Link to={next.to} className="group block border-t border-ink/15 pt-8">
        <p className="text-[13px] font-semibold text-ink/45">Next chapter · {next.no}</p>
        <div className="mt-4 flex items-end justify-between gap-8">
          <div>
            <p className="text-[clamp(2.2rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.03em] transition-colors duration-500 group-hover:text-background">
              {next.title}
            </p>
            <p className="mt-3 font-serif text-2xl italic text-ink/55">{next.line}</p>
          </div>
          <span className="grid size-16 shrink-0 place-items-center rounded-full border border-ink/15 transition-all duration-500 group-hover:border-background group-hover:bg-background group-hover:text-primary sm:size-20">
            <ArrowRight className="size-6 transition-transform duration-500 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </section>
  );
}
