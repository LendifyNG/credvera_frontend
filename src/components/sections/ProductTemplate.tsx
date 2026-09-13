import type { LucideIcon } from 'lucide-react';
import type { Stat } from '../../lib/site';
import { links } from '../../lib/site';
import PageHero from '../layout/PageHero';
import ButtonLink from '../ui/ButtonLink';
import ParallaxImage from '../ui/ParallaxImage';
import Reveal, { RevealText } from '../ui/Reveal';
import StatCard from '../ui/StatCard';
import CtaBand from './CtaBand';

type Photo = { src: string; alt: string };

export type ProductTemplateProps = {
  eyebrow: string;
  title: string;
  intro: string;
  featuresHeading: string;
  features: { icon: LucideIcon; title: string; body: string }[];
  featureImage: Photo;
  /** Put the photo on the right on large screens. */
  imageRight?: boolean;
  statsHeading: string;
  stats: Stat[];
  story?: { heading: string; body: string; image: Photo };
  ctaTitle?: string;
  secondaryCta?: { label: string; to: string };
};

/** Shared layout for product pages: hero, features beside a photo, market stats, story, closing CTA. */
export default function ProductTemplate({
  eyebrow,
  title,
  intro,
  featuresHeading,
  features,
  featureImage,
  imageRight = false,
  statsHeading,
  stats,
  story,
  ctaTitle,
  secondaryCta = { label: 'See pricing', to: '/pricing' },
}: ProductTemplateProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro}>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to={links.openAccount}>Open an account</ButtonLink>
          <ButtonLink to={secondaryCta.to} variant="outline-light">
            {secondaryCta.label}
          </ButtonLink>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <div className={imageRight ? 'lg:order-2' : undefined}>
          <ParallaxImage src={featureImage.src} alt={featureImage.alt} className="aspect-[4/5] rounded-[2rem] lg:aspect-[5/6]" />
        </div>
        <div>
          <RevealText text={featuresHeading} className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl" />
          <ul className="mt-10 space-y-8">
            {features.map(({ icon: Icon, title: featureTitle, body }, i) => (
              <Reveal key={featureTitle} delay={i * 0.08}>
                <li className="flex gap-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-background text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{featureTitle}</h3>
                    <p className="mt-1 leading-relaxed text-ink/70">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-secondary text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <RevealText text={statsHeading} className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl" />
          <div className={`mt-12 grid gap-6 ${stats.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <StatCard stat={stat} tone="dark" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {story && (
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8 lg:py-28">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{story.heading}</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/70">{story.body}</p>
          </Reveal>
          <ParallaxImage src={story.image.src} alt={story.image.alt} className="aspect-[4/3] rounded-[2rem]" />
        </section>
      )}

      <CtaBand title={ctaTitle} />
    </>
  );
}
