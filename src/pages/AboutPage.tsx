import lounge from '../assets/photos/lounge-owner.webp';
import shopOwner from '../assets/photos/shop-owner-counter.webp';
import suya from '../assets/photos/suya-vendor-phone.webp';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/sections/CtaBand';
import ParallaxImage from '../components/ui/ParallaxImage';
import Reveal, { RevealText } from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import { marketStats } from '../lib/site';

// Stock photography of real people — captions describe the kind of business
// shown and must never imply these are Credvera staff or customers.
const builtFor = [
  { src: suya, alt: 'A food vendor smiling at his phone at his stall', caption: 'Food vendors' },
  { src: shopOwner, alt: 'A shop owner behind her counter', caption: 'Retail shops' },
  { src: lounge, alt: 'A hospitality business owner outside his venue', caption: 'Hospitality' },
];

const stats = [marketStats.msmes!, marketStats.msmeGdp!, marketStats.instantPayments!, marketStats.remittances!];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Credvera"
        title="We’re building the payments app Nigerians deserve."
        intro="Credvera makes payments simpler for Nigerian businesses and families — from everyday business payments to school fees, suppliers and support across borders."
      />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <RevealText text="Small businesses are Nigeria’s economy." className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl" />
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-ink/70">
              Millions of Nigerian businesses — from market stalls to fast-growing companies — create most of the country’s
              jobs and nearly half of its GDP. Many of them still juggle payments across different apps, accounts and
              providers, and pay too much to move money across borders. Credvera brings those payments together in one
              place.
            </p>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <StatCard stat={stat} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <RevealText text="Built for businesses like these." className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {builtFor.map(({ src, alt, caption }, i) => (
              <Reveal key={caption} delay={i * 0.08}>
                <figure className="group">
                  <ParallaxImage src={src} alt={alt} className="aspect-[3/4] rounded-[1.5rem]" strength={30} />
                  <figcaption className="mt-4 text-lg font-semibold tracking-tight">{caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
