import { ArrowUpRight } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import AppBand from '../components/editorial/AppBand';
import Headline from '../components/editorial/Headline';
import Manifesto from '../components/editorial/Manifesto';
import PageHeader from '../components/editorial/PageHeader';
import StatStack from '../components/editorial/StatStack';
import Reveal from '../components/ui/Reveal';
import { useAudience } from '../lib/audience';
import { photos } from '../lib/photos';
import { marketStats } from '../lib/site';

// TODO(credvera): the team to review this copy before launch.
const MANIFESTO =
  'Money in Nigeria is harder than it should be. A freelancer waits for dollars that land in someone else’s name. A trader juggles four apps to pay one supplier. A family abroad pays too much to send money home. None of that has to be true. Credvera puts earning, spending, saving and paying in one place, for people and for the businesses they run.';

const doors = [
  {
    to: '/',
    label: 'Personal',
    title: 'For your own money',
    body: 'Get paid from abroad, pay bills, save and split, and prove your income.',
    photo: photos.manCapSunglasses,
  },
  {
    to: '/business',
    label: 'Business',
    title: 'For the business you run',
    body: 'Collect, pay suppliers at home and abroad, send invoices and hold dollars.',
    photo: photos.marketNutsSeller,
  },
];

/** About: why Credvera exists, the numbers behind it, and the two ways in. */
export default function AboutPage() {
  const { audience } = useAudience();
  // Business has its own About page.
  if (audience === 'business') return <Navigate to="/business/about" replace />;
  return (
    <>
      <PageHeader
        label="About Credvera"
        title={'Money that moves\nlike *Nigerians* do.'}
        lede="Across apps, banks and borders, in naira and in dollars. We’re building one place for all of it."
      />

      <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-8 lg:pb-36">
        <Manifesto text={MANIFESTO} />
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="mx-auto mb-12 max-w-7xl px-6 lg:px-8">
          <Headline
            text={'The numbers\nare *people*.'}
            className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
        </div>
        <StatStack
          cards={[
            { stat: marketStats.msmes, video: { name: 'market-cash', label: 'A trader counting cash at a Lagos market' } },
            { stat: marketStats.msmeGdp, photo: photos.marketLagosScene },
            { stat: marketStats.instantPayments, video: { name: 'lagos-aerial', label: 'Lagos traffic and market streets from above' } },
            { stat: marketStats.remittances, photo: photos.womanBraidsPhone },
          ]}
        />
      </section>

      {/* Two ways in */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <Headline text={'One app,\n*two* doors.'} className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]" />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {doors.map((d, i) => (
            <Reveal key={d.to} delay={i * 0.08}>
              <Link to={d.to} className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] bg-secondary text-white sm:aspect-[5/6]">
                <img
                  src={d.photo.src}
                  alt={d.photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(1,21,4,0.88),transparent_55%)]" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 sm:p-9">
                  <div>
                    <p className="text-[13px] font-semibold text-primary">{d.label}</p>
                    <p className="mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-none tracking-[-0.03em]">{d.title}</p>
                    <p className="mt-3 max-w-sm text-white/70">{d.body}</p>
                  </div>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-secondary transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <AppBand />
    </>
  );
}
