import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Download, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import port from '../assets/photos/container-port-aerial.webp';
import familyHome from '../assets/photos/family-home.webp';
import shopOwner from '../assets/photos/shop-owner-counter.webp';
import graduates from '../assets/photos/study-graduates.webp';
import meeting from '../assets/photos/team-meeting.webp';
import womanPhone from '../assets/photos/woman-phone.webp';
import CtaBand from '../components/sections/CtaBand';
import ButtonLink from '../components/ui/ButtonLink';
import ParallaxImage from '../components/ui/ParallaxImage';
import Reveal, { RevealText } from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import { heroImage } from '../lib/hero';
import { useIntroDone } from '../lib/intro';
import { links, marketStats } from '../lib/site';
const ease = [0.16, 1, 0.3, 1] as const;

const businessTypes = ['Market traders', 'Online stores', 'Importers', 'Exporters', 'Restaurants', 'Agencies', 'Retail shops', 'Freelancers'];

const products = [
  {
    to: '/business-payments',
    eyebrow: 'Business payments',
    title: 'Get paid and pay out, in naira.',
    img: shopOwner,
    alt: 'A shop owner smiling behind her counter',
  },
  {
    to: '/cross-border',
    eyebrow: 'Cross-border payments',
    title: 'Pay and get paid beyond Nigeria.',
    img: meeting,
    alt: 'A business team meeting in a bright office',
  },
  {
    to: '/study-abroad',
    eyebrow: 'Study abroad',
    title: 'School fees, proof of funds and allowances.',
    img: graduates,
    alt: 'Two smiling graduates in academic gowns',
  },
  {
    to: '/supplier-payments',
    eyebrow: 'Supplier payments',
    title: 'Pay suppliers in China and across Africa.',
    img: port,
    alt: 'Aerial view of shipping containers at a port',
  },
  {
    to: '/pay-home',
    eyebrow: 'Pay Home',
    title: 'Look after home from anywhere.',
    img: familyHome,
    alt: 'A family sitting together on a sofa at home',
  },
];

const steps = [
  { icon: Download, title: 'Download the app', body: 'Get Credvera from the Google Play Store.' },
  { icon: BadgeCheck, title: 'Verify your business', body: 'Confirm your identity and business details, as Nigerian regulations require.' },
  { icon: Send, title: 'Start moving money', body: 'Handle your business payments at home and across borders.' },
];

const stats = [marketStats.msmes!, marketStats.instantPayments!, marketStats.remittances!, marketStats.remittanceCost!];

function Hero() {
  const done = useIntroDone();
  const reduce = useReducedMotion();
  const item = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } };

  return (
    <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-secondary text-white">
      <motion.img
        src={heroImage.src}
        srcSet={heroImage.srcSet}
        sizes={heroImage.sizes}
        alt="Two business owners smiling at a laptop"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover object-[70%_center] lg:object-[62%_center]"
        initial={reduce ? false : { opacity: 0, scale: 1.12 }}
        animate={done ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.6, ease }}
      />
      {/* Darkest behind the text on the left and along the bottom edge. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-secondary/95 via-secondary/55 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-gradient-to-t from-secondary via-secondary/60 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-36 sm:pb-28 lg:px-8 lg:pb-32">
        <motion.div
          className="max-w-[50rem]"
          initial={reduce ? false : 'hidden'}
          animate={done ? 'visible' : 'hidden'}
          variants={{ visible: { transition: { staggerChildren: 0.35, delayChildren: 0.35 } } }}
        >
          <motion.p variants={item} className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Business &amp; cross-border payments
          </motion.p>
          <RevealText
            as="h1"
            play={done}
            delay={0.45}
            text={'Get paid.\nPay out.\nTrade abroad.'}
            className="mt-5 text-[clamp(2.75rem,8.5vw,7rem)] font-bold leading-[0.92] tracking-[-0.035em]"
          />
          <motion.p variants={item} className="mt-7 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            Collect from customers, pay suppliers and staff, and move money across borders — all from one app, backed by
            licensed partners.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-6">
            <a
              href={links.openAccount}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-paper py-1.5 pl-5 pr-1.5 text-sm font-semibold text-secondary transition-colors hover:bg-white"
            >
              Open an account
              <span className="grid size-8 place-items-center rounded-full bg-secondary text-primary transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
            <Link to="/business-payments" className="text-sm font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline">
              See how it works
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Slim keyword ticker along the bottom edge. */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-secondary/40 py-3 backdrop-blur-sm"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
      >
        <ul className="marquee flex w-max items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60" aria-label="Businesses Credvera is built for">
          {[...businessTypes, ...businessTypes].map((type, i) => (
            <li key={`${type}-${i}`} className="flex items-center gap-6" aria-hidden={i >= businessTypes.length}>
              {type}
              <span className="size-1 rounded-full bg-primary" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <RevealText text="Five ways Credvera moves your money." className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl" />
        <div className="mt-12 grid gap-6 md:grid-cols-6">
          {products.map((p, i) => (
            <Reveal key={p.to} delay={(i < 2 ? i : i - 2) * 0.08} className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}>
              <Link to={p.to} className="group relative block overflow-hidden rounded-[2rem] bg-secondary">
                <img
                  src={p.img}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{p.eyebrow}</p>
                    <h3 className={`mt-3 max-w-xs text-2xl font-semibold tracking-tight text-white ${i < 2 ? 'sm:text-3xl' : ''}`}>{p.title}</h3>
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

      {/* Market */}
      <section className="bg-secondary text-white">
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

      {/* How it works */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <RevealText text="Up and running in three steps." className="text-3xl font-semibold tracking-tight sm:text-5xl" />
          <ol className="mt-10 space-y-4">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <li className="flex gap-5 rounded-3xl border border-ink/10 bg-white p-6">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-background text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink/40">Step {i + 1}</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
                    <p className="mt-1 leading-relaxed text-ink/70">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.3}>
            <div className="mt-8">
              <ButtonLink to="/security" variant="outline-dark">
                How we keep you safe
              </ButtonLink>
            </div>
          </Reveal>
        </div>
        <ParallaxImage src={womanPhone} alt="A smiling business owner checking her phone" className="aspect-[4/3] rounded-[2rem] lg:aspect-[4/5]" />
      </section>

      <CtaBand />
    </>
  );
}
