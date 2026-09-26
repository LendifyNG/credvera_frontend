import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ease = [0.16, 1, 0.3, 1] as const;

// The business tariff. Keep in step with pricingFor.business in lib/site.ts.
// TODO(credvera): confirm with the partner bank and Verto before launch.
const tariff: [string, string, string][] = [
  ['Opening a business account', 'Free', 'Once'],
  ['Transfer to a Nigerian bank', '₦25', 'Per transfer'],
  ['Invoices and payment links', 'Free', 'To create and send'],
  ['Dollar, pound and euro accounts', 'Free', 'To open'],
  ['Converting between currencies', 'Our rate, beside the market rate', 'Per conversion'],
  ['Supplier payment · UK and euro countries', '₦2,500', 'Flat, per payment'],
  ['Supplier payment · United States', '₦3,500', 'Flat, per payment'],
  ['Supplier payment · China', '₦5,000', 'Flat, per payment'],
];

const inputs = [
  { key: 'transfers', label: 'Transfers to Nigerian banks', fee: 25, start: 120, step: 10, max: 2000 },
  { key: 'uk', label: 'Supplier payments, UK and euro', fee: 2500, start: 2, step: 1, max: 60 },
  { key: 'us', label: 'Supplier payments, US', fee: 3500, start: 1, step: 1, max: 60 },
  { key: 'cn', label: 'Supplier payments, China', fee: 5000, start: 3, step: 1, max: 60 },
] as const;

const ngn = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/** Business pricing: the tariff, a month costed, and the promises behind it. */
export default function BizPricingPage() {
  const reduce = useReducedMotion();
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(inputs.map((i) => [i.key, i.start])));
  const lines = inputs.map((i) => ({ ...i, n: counts[i.key]!, cost: counts[i.key]! * i.fee }));
  const total = lines.reduce((a, l) => a + l.cost, 0);

  return (
    <>
      {/* 1. The tariff */}
      <header className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8 lg:pb-32 lg:pt-40">
          <div className="flex items-center justify-between border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>Business · Pricing</span>
            <span>Tariff, September 2026</span>
          </div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mt-12 text-[clamp(2.8rem,6.4vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.05em]"
          >
            What it costs
            <br />
            <span className="text-graphite/45">to run a business on it.</span>
          </motion.h1>

          <div className="mt-16 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-graphite/25 font-medium text-[13px] text-graphite/45">
                  <th className="py-3 pr-6 font-normal">Service</th>
                  <th className="py-3 pr-6 font-normal">Fee</th>
                  <th className="py-3 text-right font-normal">Charged</th>
                </tr>
              </thead>
              <tbody>
                {tariff.map(([service, fee, when]) => (
                  <tr key={service} className="group border-b border-graphite/10 transition-colors hover:bg-white">
                    <td className="py-5 pr-6 text-[17px]">{service}</td>
                    <td className={`py-5 pr-6 font-ledger text-[17px] font-medium ${fee === 'Free' ? 'text-[#1f6b33]' : ''}`}>{fee}</td>
                    <td className="py-5 text-right font-medium text-[13px] text-graphite/50">{when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </header>

      {/* 2. A month, costed */}
      <section className="bg-graphite text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Your month,
              <br />
              <span className="text-white/45">costed.</span>
            </h2>
            <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-[15px]">{l.label}</p>
                    <p className="font-ledger text-[11px] text-white/45">{ngn(l.fee)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Fewer ${l.label.toLowerCase()}`}
                      onClick={() => setCounts((c) => ({ ...c, [l.key]: Math.max(0, c[l.key]! - l.step) }))}
                      className="grid size-9 place-items-center rounded-md ring-1 ring-white/20 hover:bg-white/10"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-12 text-center font-ledger text-[17px] tabular-nums">{l.n}</span>
                    <button
                      type="button"
                      aria-label={`More ${l.label.toLowerCase()}`}
                      onClick={() => setCounts((c) => ({ ...c, [l.key]: Math.min(l.max, c[l.key]! + l.step) }))}
                      className="grid size-9 place-items-center rounded-md ring-1 ring-white/20 hover:bg-white/10"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-24">
            <p className="font-medium text-[13px] text-white/45">A month like this costs</p>
            <p className="mt-3 font-ledger text-[clamp(3rem,6.6vw,5.6rem)] font-medium tabular-nums leading-none tracking-[-0.05em]">{ngn(total)}</p>
            <p className="mt-3 font-ledger text-[13px] text-white/50">{ngn(total * 12)} a year</p>
            {/* Where the month's fees go */}
            <div className="mt-8 flex h-2 overflow-hidden rounded-full bg-white/10">
              {lines.map((l, i) => (
                <motion.span
                  key={l.key}
                  className={['bg-primary', 'bg-white', 'bg-white/60', 'bg-white/30'][i]}
                  animate={{ width: total ? `${(l.cost / total) * 100}%` : '0%' }}
                  transition={{ duration: 0.5, ease }}
                />
              ))}
            </div>
            <ul className="mt-4 space-y-1.5 font-ledger text-[12px] text-white/55">
              {lines.map((l, i) => (
                <li key={l.key} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${['bg-primary', 'bg-white', 'bg-white/60', 'bg-white/30'][i]}`} />
                    {l.label}
                  </span>
                  <span className="tabular-nums">{ngn(l.cost)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[14px] text-white/45">Invoices, payment links and currency accounts add nothing to this.</p>
          </div>
        </div>
      </section>

      {/* 3. Promises on price */}
      <section className="bg-white text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Three promises
            <br />
            <span className="text-graphite/45">about price.</span>
          </h2>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-xl bg-graphite/10 md:grid-cols-3">
            {[
              ['Before you confirm', 'The fee is on every payment screen before you press pay. Never after.'],
              ['Thirty days’ notice', 'If a price changes, we tell you in the app at least thirty days before it applies.'],
              ['Free stays free', 'Opening the account, invoices, payment links and currency accounts cost nothing.'],
            ].map(([t, b], i) => (
              <li key={t} className="bg-white p-8">
                <span className="font-ledger text-[12px] text-graphite/40">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-10 text-2xl font-semibold tracking-tight">{t}</p>
                <p className="mt-3 leading-relaxed text-graphite/60">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Volume */}
      <Link to="/business/contact" className="group block bg-ledger text-graphite">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-8 px-6 py-24 lg:px-8 lg:py-28">
          <div>
            <p className="font-medium text-[13px] text-graphite/45">Moving large volumes?</p>
            <p className="mt-4 text-[clamp(2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-2">
              Talk to our team about your volumes.
            </p>
          </div>
          <span className="grid size-16 shrink-0 place-items-center rounded-md bg-graphite text-white transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="size-6" />
          </span>
        </div>
      </Link>
    </>
  );
}
