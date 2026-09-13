import { LineChart, Send, Wallet } from 'lucide-react';
import shopOwner from '../assets/photos/shop-owner-counter.webp';
import trader from '../assets/photos/market-trader.webp';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/sections/CtaBand';
import ButtonLink from '../components/ui/ButtonLink';
import ParallaxImage from '../components/ui/ParallaxImage';
import Reveal, { RevealText } from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import { links, marketStats } from '../lib/site';

// TODO(credvera): confirm this feature list and add specifics (e.g. payment links, virtual accounts).
const features = [
  { icon: Wallet, title: 'Get paid by customers', body: 'Collect payments for your goods and services straight into your Credvera account.' },
  { icon: Send, title: 'Pay suppliers and staff', body: 'Send money to the people and businesses you work with, right from your phone.' },
  { icon: LineChart, title: 'See every payment in one place', body: 'Every naira in and out, recorded in the app — so you always know where you stand.' },
];

export default function BusinessPaymentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Business payments"
        title="Get paid. Pay out. Stay on top of it."
        intro="Credvera brings your business payments into one app — built for the way Nigerian businesses really trade."
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to={links.openAccount}>Open an account</ButtonLink>
          <ButtonLink to="/pricing" variant="outline-light">
            See pricing
          </ButtonLink>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <ParallaxImage src={shopOwner} alt="A shop owner smiling behind her counter" className="aspect-[4/5] rounded-[2rem]" />
        <div>
          <RevealText text="Everything your business needs to move money." className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl" />
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
          <RevealText text="Nigeria already runs on digital payments." className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <StatCard stat={marketStats.instantPayments!} tone="dark" />
            </Reveal>
            <Reveal delay={0.08}>
              <StatCard stat={marketStats.msmes!} tone="dark" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8 lg:py-28">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">From the market stall to the head office.</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/70">
            Whether you sell from a roadside stand or run a growing team, Credvera is built to keep your business payments
            simple.
          </p>
        </Reveal>
        <ParallaxImage src={trader} alt="A trader preparing roasted plantain at her market stall" className="aspect-[4/5] rounded-[2rem] lg:aspect-[5/6]" />
      </section>

      <CtaBand />
    </>
  );
}
