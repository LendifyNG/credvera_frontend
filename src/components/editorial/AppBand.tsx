import { ArrowUpRight } from 'lucide-react';
import type { Audience } from '../../lib/audience';
import { ctaFor } from '../../lib/site';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

/** Closing band: one line and the app (or a business account). */
export default function AppBand({ line = 'All of it, in *one* app.', audience = 'personal' }: { line?: string; audience?: Audience }) {
  const cta = ctaFor(audience);
  return (
    <section className="px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 rounded-[2rem] bg-secondary px-8 py-16 text-white sm:px-14 lg:flex-row lg:items-end lg:py-20">
        <Headline text={line} className="max-w-2xl text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.035em]" />
        <Reveal delay={0.2}>
          <a
            href={cta.to}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[15px] font-semibold text-secondary transition-colors hover:bg-[#9aeb9b]"
          >
            {cta.label}
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
