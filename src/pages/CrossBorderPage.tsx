import { ArrowDownLeft, Globe2, Smartphone } from 'lucide-react';
import laptop from '../assets/photos/founders-laptop.webp';
import meeting from '../assets/photos/team-meeting.webp';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/sections/CtaBand';
import ButtonLink from '../components/ui/ButtonLink';
import ParallaxImage from '../components/ui/ParallaxImage';
import Reveal, { RevealText } from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import { links, marketStats } from '../lib/site';

// TODO(credvera): confirm this feature list and add supported countries/currencies.
const features = [
  { icon: Globe2, title: 'Pay suppliers abroad', body: 'Settle invoices with the international suppliers your business depends on.' },
  { icon: ArrowDownLeft, title: 'Get paid by customers abroad', body: 'Receive payments from clients and customers outside Nigeria.' },
  { icon: Smartphone, title: 'Manage it all from your phone', body: 'Start, follow and review your cross-border payments in the Credvera app.' },
];

export default function CrossBorderPage() {
  return (
    <>
      <PageHero
        eyebrow="Cross-border payments"
        title="Trade beyond Nigeria, without the friction."
        intro="Pay and get paid across borders from the same app you use for everyday business payments."
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to={links.openAccount}>Open an account</ButtonLink>
          <ButtonLink to="/contact" variant="outline-light">
            Talk to us
          </ButtonLink>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <div className="lg:order-2">
          <ParallaxImage src={laptop} alt="Two business owners smiling at a laptop" className="aspect-[4/3] rounded-[2rem]" />
        </div>
        <div>
          <RevealText text="Your business isn’t limited by borders. Your payments shouldn’t be either." className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl" />
          <ul className="mt-10 space-y-8">
            {features.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <li className="flex gap-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-background text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
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
          <RevealText text="Money moving into Nigeria is big — and still expensive." className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <StatCard stat={marketStats.remittances!} tone="dark" />
            </Reveal>
            <Reveal delay={0.08}>
              <StatCard stat={marketStats.remittanceCost!} tone="dark" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <ParallaxImage src={meeting} alt="A business team meeting in a bright office" className="aspect-[16/9] rounded-[2rem]" strength={70} />
      </section>

      <CtaBand title="Take your business across borders." />
    </>
  );
}
