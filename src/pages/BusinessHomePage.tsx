import { FileCheck2, KeyRound, Landmark, ScanEye } from 'lucide-react';
import handshake from '../assets/photos/business-handshake.webp';
import marketTrader from '../assets/photos/market-trader.webp';
import shopOwner from '../assets/photos/shop-owner-counter.webp';
import meeting from '../assets/photos/team-meeting.webp';
import FeatureSection from '../components/landing/FeatureSection';
import LandingHero from '../components/landing/LandingHero';
import SignatureSection from '../components/landing/SignatureSection';
import StepsSection from '../components/landing/StepsSection';
import TrustSection from '../components/landing/TrustSection';
import CtaBand from '../components/sections/CtaBand';
import Reveal, { RevealText } from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import { heroImage } from '../lib/hero';
import { ctaFor, marketStats } from '../lib/site';

const cta = ctaFor('business');

// Screenshots of the real app (see /public/images/app).
const screen = (name: string, alt: string) => ({ src: `/images/app/${name}.webp`, alt });

const businessTypes = ['Importers', 'Exporters', 'Online stores', 'Market traders', 'Agencies', 'Restaurants', 'Retail shops', 'Studios'];

const stats = [marketStats.msmes!, marketStats.chinaImports!, marketStats.instantPayments!, marketStats.intraAfricaRouting!];

/** Business: the landing page for the business account. */
export default function BusinessHomePage() {
  return (
    <>
      <LandingHero
        eyebrow="Business account"
        title={'Get paid.\nPay out.\nTrade abroad.'}
        body="Collect from customers, pay suppliers at home and abroad, send invoices and hold dollars, all from one business account backed by licensed partners."
        image={{ ...heroImage, alt: 'Two business owners smiling at a laptop' }}
        cta={cta}
        secondary={{ label: 'See what you can do', to: '/business#payments' }}
        ticker={businessTypes}
        tickerLabel="Businesses Credvera is built for"
      />

      <FeatureSection
        id="payments"
        eyebrow="Payments and invoices"
        title="Get paid, and pay anyone."
        body="Pay a Nigerian bank account or a supplier abroad from the same place. Send invoices with a payment link and see the moment they’re paid."
        points={[
          'Choose who you’re paying first, then how much, with saved recipients at home and abroad',
          'Invoices with due dates, drafts and reminders, marked paid when your customer pays',
          'Payment links your customer pays by card or bank transfer',
          'Every payment in one list, with search and filters',
        ]}
        photo={{ src: shopOwner, alt: 'A shop owner smiling behind the counter of her store' }}
        screen={screen('business-payments', 'The Credvera business payments screen')}
      />

      <FeatureSection
        id="fx"
        flip
        eyebrow="FX and currencies"
        title="Hold, receive and convert at a clear rate."
        body="Open US dollar, pound and euro accounts for your business, get paid by customers abroad, and convert when the rate suits you."
        points={[
          'Add a currency by the country you trade with',
          'Our rate always shown beside the market rate',
          'The rate is held while you confirm, and you approve it again if it moves',
          'Converting and paying out are tracked separately, so you always know what has arrived',
        ]}
        photo={{ src: meeting, alt: 'A team of four talking in a bright office' }}
        screen={screen('business-fx', 'FX and currencies in the Credvera business app')}
      />

      <SignatureSection
        id="suppliers"
        eyebrow="Only on Credvera"
        title="Pay your supplier when the goods ship."
        body="Pay a deposit now. We hold the rest and pay it when the shipping line confirms your goods are loaded, so you stop gambling on suppliers you found online."
        steps={[
          { title: 'Pay a deposit', body: 'Choose 30% or 50% now, and the date the goods must ship by.' },
          { title: 'The supplier ships', body: 'They send the bill of lading. We check it with the shipping line.' },
          { title: 'The balance is released', body: 'Once the goods are loaded, the supplier is paid. If nothing ships in time, you get the held money back.' },
        ]}
        note="Every order builds the supplier’s Supplier Passport: how many businesses they’ve shipped to and how often on time. We confirm shipment, not the quality of the goods."
        screen={screen('business-order', 'A pay-on-shipment order timeline in the Credvera app')}
      />

      <FeatureSection
        id="cards"
        eyebrow="Business cards"
        title="Cards for the way your business spends."
        body="A dollar card for software, ads and subscriptions, and a naira card for everyday expenses. Each spends straight from its account."
        points={[
          'The dollar card spends from money your business receives from abroad',
          'The naira card spends from your naira account, topped up by transfer',
          'Monthly limits, freeze in one tap, and card details behind your PIN',
          'Physical business cards are on the way',
        ]}
        photo={{ src: marketTrader, alt: 'A market trader arranging goods at her stall under a parasol' }}
        screen={screen('business-cards', 'Business cards in the Credvera app')}
      />

      {/* The market */}
      <section className="mt-20 bg-secondary text-white lg:mt-28">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <RevealText text="The businesses that keep Nigeria running need better payments." className="max-w-4xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06}>
                <StatCard stat={stat} tone="dark" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TrustSection
        title="Controls a business can trust."
        body="Credvera is not a bank. Your money is held by our licensed partner bank, and every business is verified before it can pay."
        items={[
          { icon: FileCheck2, title: 'Verified businesses', body: 'We check your CAC registration, and every director and owner is checked against their BVN.' },
          { icon: KeyRound, title: 'Every payment confirmed', body: 'Payments need your PIN or Face ID, and each account has a daily limit.' },
          { icon: ScanEye, title: 'Card details stay hidden', body: 'Your PIN or Face ID is needed to see them, and screenshots are blocked while they show.' },
          { icon: Landmark, title: 'Licensed partner bank', body: 'Your business account is held with a licensed Nigerian bank.' },
        ]}
      />

      <StepsSection
        title="Open a business account."
        steps={[
          { title: 'Download the app', body: 'Choose a business account and add your CAC number.' },
          { title: 'Verify your business', body: 'Confirm your details, your directors and owners, and upload your documents.' },
          { title: 'Start trading', body: 'Use the account while we check your documents, usually within one or two working days.' },
        ]}
      />

      <CtaBand
        title="Run your business money from one account."
        body="Collect, pay suppliers and trade across borders with Credvera."
        cta={cta}
        image={{ src: handshake, alt: 'Business partners shaking hands in a bright office' }}
      />
    </>
  );
}
