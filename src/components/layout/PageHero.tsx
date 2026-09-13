import type { ReactNode } from 'react';
import Reveal, { RevealText } from '../ui/Reveal';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/** Dark intro band used at the top of every inner page. */
export default function PageHero({ eyebrow, title, intro, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-background text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full bg-primary/20 blur-[120px]"
      />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-40 lg:px-8 lg:pb-28 lg:pt-48">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        </Reveal>
        <RevealText
          as="h1"
          text={title}
          className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl"
        />
        {intro && (
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">{intro}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.3}>{children}</Reveal>}
      </div>
    </section>
  );
}
