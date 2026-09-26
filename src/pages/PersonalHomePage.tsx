import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Figure from '../components/editorial/Figure';
import Headline from '../components/editorial/Headline';
import PassportDoc from '../components/editorial/PassportDoc';
import FeatureIndex from '../components/editorial/FeatureIndex';
import EverydayPeople from '../components/editorial/EverydayPeople';
import LoopVideo from '../components/editorial/LoopVideo';
import CountUp from '../components/ui/CountUp';
import Reveal from '../components/ui/Reveal';
import { photos } from '../lib/photos';
import { ctaFor, marketStats, type Stat } from '../lib/site';

const cta = ctaFor('personal');

// The banner along the bottom of the opening.
const banner = [
  'Get paid in dollars, pounds and euros',
  'Our rate beside the market rate',
  'Airtime, electricity and TV',
  'A dollar card for online',
  'Savings goals that fill themselves',
  'Split bills and get paid back',
  'Earnings Passport',
  'Your PIN or Face ID on every payment',
];

const numbers: Stat[] = [marketStats.remittances, marketStats.migrants, marketStats.remittanceCost];

function GetTheApp({ light = false }: { light?: boolean }) {
  return (
    <a
      href={cta.to}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-[15px] font-semibold transition-colors ${
        light ? 'bg-primary text-secondary hover:bg-[#9aeb9b]' : 'bg-secondary text-white hover:bg-background'
      }`}
    >
      {cta.label}
      <span className={`grid size-9 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-45 ${light ? 'bg-secondary text-primary' : 'bg-primary text-secondary'}`}>
        <ArrowUpRight className="size-4" />
      </span>
    </a>
  );
}

/** Personal: the home page for the personal account. Everything happens in the app. */
export default function PersonalHomePage() {
  return (
    <>
      {/* Opening: the photo sits behind, fading in from the left so the type stays clear. */}
      <section className="relative isolate overflow-hidden">
        <motion.div
          className="hero-fade absolute bottom-0 right-0 top-0 -z-20 h-full w-full lg:top-24 lg:h-[calc(100%-6rem)] lg:w-[60%]"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <LoopVideo
            name="hero-daily"
            label="Everyday life in Nigeria: a busy street, the market, a call on the go, buying at a stall"
            eager
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
        {/* Desktop: the video fades itself into the paper (.hero-fade in index.css), so it has no hard edge. */}
        {/* Phones: the photo shows at the top and fades into paper behind the text. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-paper)_20%,transparent)_0%,color-mix(in_srgb,var(--color-paper)_85%,transparent)_42%,var(--color-paper)_62%)] lg:hidden" />

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-[52vh] lg:px-8 lg:pb-28 lg:pt-40">
          <Reveal>
            <div className="flex items-center gap-4 border-b border-ink/10 pb-5 text-xs font-semibold uppercase tracking-[0.22em] text-ink/50 whitespace-nowrap lg:max-w-[54%]">
              <span className="text-background">Credvera Personal</span>
              <span className="h-px w-8 bg-ink/20" />
              <span className="hidden sm:inline">In more than one currency</span>
            </div>
          </Reveal>
          <div className="mt-12 max-w-[46rem]">
            <Headline
              as="h1"
              text={'Your money,\n*home* and\n==abroad==.'}
              className="text-[clamp(3rem,8.4vw,7.4rem)] font-semibold leading-[0.9] tracking-[-0.045em]"
            />
            <Reveal delay={0.3}>
              <p className="mt-10 max-w-lg text-lg leading-relaxed text-ink/70 sm:text-xl">
                Get paid in dollars, pounds and euros. Pay your bills, save for what matters, and prove your income when it
                counts. Built for Nigerians whose money moves between home and the rest of the world.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
                <GetTheApp />
                <span className="text-sm text-ink/55">Open with your BVN or NIN, in minutes</span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* A slow, sleek banner of what's inside, along the bottom edge. */}
        <div
          className="border-y border-ink/10 bg-paper/80 py-4 backdrop-blur-md"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
        >
          <ul
            className="marquee flex w-max items-center gap-10 text-sm font-medium text-ink/70 [--marquee-duration:55s] hover:[animation-play-state:paused]"
            aria-label="What you can do with Credvera Personal"
          >
            {[...banner, ...banner].map((item, i) => (
              <li key={`${item}-${i}`} className="flex items-center gap-10 whitespace-nowrap" aria-hidden={i >= banner.length}>
                {item}
                <span className="font-serif text-lg italic text-background/50">✦</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FeatureIndex />

      <EverydayPeople />

      {/* Earnings Passport, the part nobody else has */}
      <section className="overflow-x-clip bg-secondary text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Only on Credvera</p>
            </Reveal>
            <Headline
              text={'Prove your income\n*without* a bank\nstatement.'}
              className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-white/65">
                Landlords, embassies and lenders often won’t believe a PDF. Earnings Passport shares a link that shows your
                income from abroad, verified from the payments you actually received. Never your balance.
              </p>
              <Link to="/personal/passport" className="mt-10 inline-flex items-center gap-3 text-[15px] font-semibold text-primary">
                Read the chapter <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
          <PassportDoc dark />
        </div>
      </section>

      {/* The numbers behind it */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <Headline
          text={'Millions of Nigerians\nearn from *abroad*.'}
          className="max-w-3xl text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.03em]"
        />
        <div className="mt-16 grid gap-12 border-t border-ink/15 pt-12 md:grid-cols-3">
          {numbers.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.08}>
              <figure>
                <p className="flex items-baseline gap-2 text-background">
                  <span className="text-[clamp(3rem,6vw,4.75rem)] font-semibold leading-none tracking-[-0.04em]">
                    <CountUp value={n.value} decimals={n.decimals} prefix={n.prefix} suffix={n.suffix} />
                  </span>
                  {n.unit ? <span className="font-serif text-2xl italic">{n.unit}</span> : null}
                </p>
                <figcaption className="mt-5 max-w-xs leading-relaxed text-ink/65">
                  {n.label}
                  <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-xs text-ink/40 underline-offset-4 hover:underline">
                    Source: {n.source}
                  </a>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Safety, said plainly */}
      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-4 lg:px-8">
          {[
            ['Nothing hidden', 'Every fee and rate is shown before you pay, and every payment gets a receipt.'],
            ['Your PIN, every time', 'Payments need your PIN or Face ID. We never ask for your PIN by phone or chat.'],
            ['Card details stay hidden', 'Shown only after your PIN, hidden again on their own, and screenshots are blocked.'],
            ['Care on a new phone', 'After a new phone or a SIM change, payments are capped for a while.'],
          ].map(([t, b], i) => (
            <Reveal key={t} delay={i * 0.06}>
              <p className="text-xs font-semibold tabular-nums text-ink/35">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{t}</h3>
              <p className="mt-2 leading-relaxed text-ink/60">{b}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Headline
              text={'Open your account\n*in minutes*.'}
              className="text-[clamp(2.6rem,6.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]"
            />
            <Reveal delay={0.15}>
              <ol className="mt-10 space-y-4 text-lg">
                {['Download Credvera and sign up with your phone and email.', 'Verify with your BVN or NIN.', 'Send, pay bills and save straight away.'].map((s, i) => (
                  <li key={s} className="flex gap-5 border-b border-ink/10 pb-4">
                    <span className="font-serif text-2xl italic text-background">{i + 1}</span>
                    <span className="text-ink/75">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-10">
                <GetTheApp />
              </div>
            </Reveal>
          </div>
          <Figure {...photos.womanGele} className="mx-auto w-full max-w-md lg:mr-0" />
        </div>
      </section>
    </>
  );
}
