import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ease = [0.16, 1, 0.3, 1] as const;

// The business tariff. Keep in step with pricingFor.business in lib/site.ts.
// TODO(credvera): confirm with the partner bank before launch.
const tariff: [string, string, string][] = [
  ['Opening a business account', 'Free', 'Once'],
  ['Transfer to a Nigerian bank', '₦25', 'Per transfer'],
  ['Invoices and payment links', 'Free', 'To create and send'],
];

/** Business pricing: the tariff and the promises behind it. */
export default function BizPricingPage() {
  const reduce = useReducedMotion();

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

      {/* 2. Promises on price */}
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
              ['Free stays free', 'Opening the account, invoices and payment links cost nothing.'],
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

      {/* 3. Volume */}
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
