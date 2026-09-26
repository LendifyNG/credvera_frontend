import type { ReactNode } from 'react';
import type { Photo } from '../../lib/photos';
import Reveal from '../ui/Reveal';
import Figure from './Figure';
import Headline from './Headline';

type MastheadProps = {
  chapter: string; // "02"
  of: string; // "04"
  section: string;
  title: string;
  lede: string;
  /** Leave out for a type-only opening. */
  photo?: Photo;
  caption?: string;
  /** A drawn piece beside the headline, in place of a photo. */
  aside?: ReactNode;
  children?: ReactNode;
};

/** The opening of a feature page: chapter, headline, lede and a whole photo. */
export default function Masthead({ chapter, of, section, title, lede, photo, caption, aside, children }: MastheadProps) {
  const portrait = !!aside || (!!photo && photo.height >= photo.width * 0.98);
  const titleClass = `${aside ? 'text-[clamp(2.8rem,5.4vw,5rem)]' : 'text-[clamp(2.8rem,7.2vw,6.4rem)]'} font-semibold leading-[0.95] tracking-[-0.035em] text-ink`;
  return (
    <header className="mx-auto max-w-7xl px-6 pb-16 pt-32 lg:px-8 lg:pb-24 lg:pt-40">
      <Reveal>
        <div className="flex items-center gap-4 border-b border-ink/10 pb-5 text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">
          <span className="text-background">Chapter {chapter}</span>
          <span className="h-px w-8 bg-ink/20" />
          <span>{section}</span>
          <span className="ml-auto tabular-nums">
            {chapter} / {of}
          </span>
        </div>
      </Reveal>
      {portrait ? (
        <div className={`mt-12 grid gap-12 ${aside ? 'items-center lg:grid-cols-[1.1fr_1fr]' : 'items-end lg:grid-cols-[1.25fr_1fr]'}`}>
          <div>
            <Headline as="h1" text={title} className={titleClass} />
            <Reveal delay={0.25}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/65 sm:text-xl">{lede}</p>
            </Reveal>
            {children}
          </div>
          {aside ?? (photo ? <Figure {...photo} caption={caption} priority className="mx-auto w-full max-w-md lg:max-w-none" /> : null)}
        </div>
      ) : (
        <>
          {/* Wide photo: headline and lede side by side, the photo full width below. */}
          <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <Headline as="h1" text={title} className={titleClass} />
            <Reveal delay={0.25}>
              <p className="max-w-md text-lg leading-relaxed text-ink/65 sm:text-xl lg:pb-3">{lede}</p>
              {children}
            </Reveal>
          </div>
          {photo ? <Figure {...photo} caption={caption} priority className="mt-14" /> : null}
        </>
      )}
    </header>
  );
}
