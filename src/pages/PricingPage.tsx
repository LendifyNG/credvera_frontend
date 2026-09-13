import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PageHero from '../components/layout/PageHero';
import ButtonLink from '../components/ui/ButtonLink';
import PlaceholderNote from '../components/ui/PlaceholderNote';
import Reveal from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import { links, marketStats, pricing } from '../lib/site';

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Clear pricing for every payment."
        intro="Simple fees for each product, shown before you pay. No surprises."
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to={links.openAccount}>Open an account</ButtonLink>
          <ButtonLink to="/contact" variant="outline-light">
            Talk to us
          </ButtonLink>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <PlaceholderNote className="mb-10">
          Sample fees for layout only — Credvera’s confirmed pricing will replace these before launch.
        </PlaceholderNote>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricing.map((plan, i) => (
            <Reveal key={plan.product} delay={(i % 3) * 0.06}>
              <div className="flex h-full flex-col rounded-3xl border border-ink/10 bg-white p-8">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-tight">{plan.product}</h2>
                  <Link
                    to={plan.to}
                    aria-label={`About ${plan.product}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-mist text-background transition-transform duration-500 hover:rotate-45"
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
                <dl className="mt-6 divide-y divide-ink/10 border-t border-ink/10">
                  {plan.rows.map(([item, fee]) => (
                    <div key={item} className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="text-sm text-ink/60">{item}</dt>
                      <dd className="text-right text-sm font-semibold">{fee}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Moving money into Africa still costs too much.
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-white/60">
              Sub-Saharan Africa remains the most expensive region in the world to send money to. That’s the problem
              Credvera is here to help Nigerian businesses and families with.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <StatCard stat={marketStats.remittanceCost} tone="dark" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
