import type { ReactNode } from 'react';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

type PageHeaderProps = {
  label: string;
  title: string;
  lede: string;
  children?: ReactNode;
};

/** A type-only opening for pages that aren't chapters, like Pricing and Security. */
export default function PageHeader({ label, title, lede, children }: PageHeaderProps) {
  return (
    <header className="mx-auto max-w-7xl px-6 pb-16 pt-32 lg:px-8 lg:pb-20 lg:pt-40">
      <Reveal>
        <p className="border-b border-ink/10 pb-5 text-[13px] font-semibold text-background">{label}</p>
      </Reveal>
      <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <Headline as="h1" text={title} className="text-[clamp(2.8rem,7vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]" />
        <Reveal delay={0.25}>
          <p className="max-w-md text-lg leading-relaxed text-ink/65 sm:text-xl lg:pb-3">{lede}</p>
          {children}
        </Reveal>
      </div>
    </header>
  );
}
