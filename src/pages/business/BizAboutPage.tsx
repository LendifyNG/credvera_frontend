import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import agency from '../../assets/photos/business/trade-agency.webp';
import importer from '../../assets/photos/business/trade-importer.webp';
import kitchen from '../../assets/photos/business/trade-kitchen.webp';
import pharmacy from '../../assets/photos/business/trade-pharmacy.webp';
import tailor from '../../assets/photos/business/trade-tailor.webp';
import Reveal from '../../components/ui/Reveal';
import { company, marketStats } from '../../lib/site';

const ease = [0.16, 1, 0.3, 1] as const;

// The figures quoted in the brief, in the order they're footnoted.
const sources = [marketStats.msmes!, marketStats.msmeGdp!, marketStats.chinaImports!, marketStats.intraAfricaRouting!];

/** A figure in the brief, with its footnote number. */
function Fig({ n, children }: { n: number; children: string }) {
  return (
    <span className="whitespace-nowrap font-ledger font-medium tracking-[-0.04em] text-graphite">
      {children}
      <sup className="ml-0.5 align-super font-ledger text-[0.4em] tracking-normal text-[#1f6b33]">{n}</sup>
    </span>
  );
}

const charter = [
  ['You see the fee before you pay.', 'On every payment screen, never after the money has gone.'],
  ['A supplier is paid when the goods ship.', 'Not on faith, and not before the shipping line says so.'],
  ['Big payments get a second pair of eyes.', 'Nobody moves a large amount alone.'],
  ['Customers abroad pay you like a local.', 'With account details in their own country’s format.'],
  ['Your accountant gets one clean list.', 'Every payment in and out, with a receipt for each.'],
];

// Real businesses of the kinds Credvera is for (Pexels photos 7464397, 28459125,
// 11645426, 30678215, 8547282). Stock photography: never implied to be customers.
const trades = [
  { name: 'Importers', line: 'Paying suppliers in China, the UK and Europe', img: importer, w: 800, h: 534, alt: 'A man packing cardboard boxes for shipping' },
  { name: 'Restaurants and kitchens', line: 'Suppliers at home, card payments online', img: kitchen, w: 800, h: 1200, alt: 'Chefs preparing dishes in a busy kitchen' },
  { name: 'Fashion and tailoring', line: 'Fabric abroad, customers everywhere', img: tailor, w: 800, h: 1066, alt: 'A smiling tailor at his work table' },
  { name: 'Pharmacies', line: 'Stock from importers, salaries with approvals', img: pharmacy, w: 800, h: 534, alt: 'Customers shopping in a Lagos pharmacy' },
  { name: 'Agencies and studios', line: 'Clients abroad paying in dollars and pounds', img: agency, w: 800, h: 534, alt: 'A team looking at a laptop together in an office' },
];

const roman = ['I', 'II', 'III', 'IV', 'V'];

/** About, for business: why it exists, what it stands for, who it's for, and where to find us. */
export default function BizAboutPage() {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <>
      {/* 1. Why it exists, as a brief with its sources */}
      <header className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8 lg:pb-32 lg:pt-40">
          <div className="flex items-center justify-between border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>Business · About</span>
            <span>Why we built it</span>
          </div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mt-12 max-w-5xl text-[clamp(2.8rem,6.4vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.05em]"
          >
            For the businesses
            <br />
            <span className="text-graphite/45">that keep Nigeria running.</span>
          </motion.h1>
          <Reveal>
            <p className="mt-16 max-w-5xl text-[clamp(1.5rem,3vw,2.6rem)] font-medium leading-[1.25] tracking-[-0.02em] text-graphite/45">
              Nigeria runs on <Fig n={1}>39.65 million</Fig> small businesses, and they make <Fig n={2}>46.31%</Fig> of the economy.
              In 2024, Nigeria imported <Fig n={3}>₦14.15 trillion</Fig> of goods from China alone. Yet more than <Fig n={4}>80%</Fig>{' '}
              of payments between African countries still go through Europe or the US.{' '}
              <span className="text-graphite">They deserve an account built for how they trade.</span>
            </p>
          </Reveal>
          <ol className="mt-12 grid gap-x-10 gap-y-3 border-t border-graphite/15 pt-8 sm:grid-cols-2">
            {sources.map((st, i) => (
              <li key={st.label} className="flex gap-3 text-[13px] leading-relaxed">
                <span className="font-ledger text-[#1f6b33]">{i + 1}</span>
                <a href={st.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-graphite/60 underline-offset-4 hover:text-graphite hover:underline">
                  {st.source} <span className="text-graphite/40">· {st.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </header>

      {/* 2. The charter */}
      <section className="bg-graphite text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <p className="font-medium text-[13px] text-white/50">What we stand by</p>
          <ol className="mt-10 border-t border-white/15">
            {charter.map(([t, b], i) => (
              <Reveal key={t} delay={i * 0.04}>
                <li className="grid gap-3 border-b border-white/15 py-8 md:grid-cols-[5rem_1.3fr_1fr] md:items-baseline md:gap-8">
                  <span className="font-ledger text-[13px] text-primary">Art. {roman[i]}</span>
                  <p className="text-[clamp(1.5rem,3vw,2.4rem)] font-semibold leading-tight tracking-[-0.03em]">{t}</p>
                  <p className="text-[15px] leading-relaxed text-white/55">{b}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. Who it's for: hover a trade to see it */}
      <section
        className="relative overflow-hidden bg-white text-graphite"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseLeave={() => setHover(null)}
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <p className="font-medium text-[13px] text-graphite/50">Who it’s for</p>
          <ul className="mt-10 border-t border-graphite/15">
            {trades.map((t, i) => (
              <li key={t.name} onMouseEnter={() => setHover(i)} className="border-b border-graphite/15">
                <div className="grid items-center gap-4 py-7 sm:grid-cols-[1fr_auto] lg:py-9">
                  <div>
                    <p
                      className={`text-[clamp(2rem,5vw,4.2rem)] font-semibold leading-none tracking-[-0.045em] transition-colors duration-300 ${
                        hover === null || hover === i ? 'text-graphite' : 'text-graphite/25'
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="mt-3 text-[15px] text-graphite/55">{t.line}</p>
                  </div>
                  {/* Phones: the photo sits in the row */}
                  <img src={t.img} alt={t.alt} loading="lazy" decoding="async" className="h-24 w-auto rounded-md lg:hidden" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Large screens: the photo follows the pointer */}
        <AnimatePresence>
          {hover !== null && (
            <motion.img
              key={hover}
              src={trades[hover]!.img}
              alt={trades[hover]!.alt}
              aria-hidden
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, x: pos.x + 40, y: pos.y - 140 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ opacity: { duration: 0.25 }, scale: { duration: 0.35, ease }, x: { type: 'spring', stiffness: 200, damping: 25 }, y: { type: 'spring', stiffness: 200, damping: 25 } }}
              className="pointer-events-none absolute left-0 top-0 hidden w-[300px] rounded-lg shadow-[0_30px_60px_-25px_rgba(20,28,23,0.5)] lg:block"
              style={{ aspectRatio: `${trades[hover]!.w} / ${trades[hover]!.h}` }}
            />
          )}
        </AnimatePresence>
      </section>

      {/* 4. Where to find us */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            A real team,
            <br />
            <span className="text-graphite/45">a message away.</span>
          </h2>
          <dl className="mt-14 grid gap-px overflow-hidden rounded-xl bg-graphite/10 md:grid-cols-3">
            {[
              ['Support hours', company.supportHours],
              ['Email', company.email],
              ['Office', company.address],
            ].map(([k, v]) => (
              <div key={k} className="bg-ledger p-7">
                <dt className="font-medium text-[13px] text-graphite/45">{k}</dt>
                <dd className="mt-3 text-lg font-semibold tracking-tight">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              ['Talk to our team', '/business/contact'],
              ['Pricing', '/business/pricing'],
              ['Security', '/business/security'],
            ].map(([label, to], i) => (
              <Link
                key={to}
                to={to!}
                className={`group inline-flex h-12 items-center gap-2 rounded-md px-5 text-[15px] font-semibold transition-colors ${
                  i === 0 ? 'bg-graphite text-white hover:bg-black' : 'ring-1 ring-graphite/20 hover:bg-white'
                }`}
              >
                {label}
                {i === 0 && <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
