import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppBand from '../components/editorial/AppBand';
import Headline from '../components/editorial/Headline';
import PageHeader from '../components/editorial/PageHeader';
import PriceCheck from '../components/editorial/PriceCheck';
import Reveal from '../components/ui/Reveal';
import { useAudience } from '../lib/audience';
import { pricingFor } from '../lib/site';

/** Pricing: try a payment and see the receipt, then the whole price list. */
export default function PricingPage() {
  const { audience } = useAudience();
  const pricing = pricingFor[audience];
  const business = audience === 'business';

  return (
    <>
      <PageHeader
        label={business ? 'Pricing · Business' : 'Pricing'}
        title={'Every *naira*,\naccounted for.'}
        lede={
          business
            ? 'Flat fees for paying suppliers, our rate beside the market rate, and nothing added on top. Try a payment below.'
            : 'Most of what you do is free. Where there’s a fee, it’s small, and you see it before you confirm. Try it below.'
        }
      />

      {/* Try a payment */}
      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <PriceCheck key={audience} audience={audience} />
        </div>
      </section>

      {/* The whole price list, like a menu */}
      <section className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-32">
        <Headline
          text={'The whole\n*price list*.'}
          className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
        />
        <div className="mt-16 space-y-16">
          {pricing.map((group, g) => (
            <Reveal key={group.product} delay={g * 0.05}>
              <div className="flex items-baseline justify-between gap-6 border-b border-ink/15 pb-4">
                <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] italic leading-none">{group.product}</h2>
                <Link to={group.to} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-background">
                  About it <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                </Link>
              </div>
              <dl className="mt-2">
                {group.rows.map(([item, fee]) => (
                  <div key={item} className="flex items-baseline gap-3 py-3.5 text-[clamp(1rem,1.6vw,1.2rem)]">
                    <dt className="text-ink/75">{item}</dt>
                    <span aria-hidden className="min-w-8 flex-1 -translate-y-[0.3em] border-b-2 border-dotted border-ink/20" />
                    <dd className={`max-w-[50%] shrink-0 text-right font-semibold ${fee.startsWith('Free') ? 'text-background' : ''}`}>{fee}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-16 max-w-2xl border-l-2 border-background pl-6 leading-relaxed text-ink/60">
            Prices can change. When they do, we’ll tell you in the app before they apply, and the app always shows the fee on
            the payment itself.
          </p>
        </Reveal>
      </section>

      <AppBand audience={audience} line={business ? 'Know the cost\n*before* you pay.' : 'Free to open.\n*Fair* to use.'} />
    </>
  );
}
