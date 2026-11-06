import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ease = [0.16, 1, 0.3, 1] as const;

// Only what the app does today. Team roles come with the business dashboard.
const checks = [
  ['CAC registration', 'Your company is checked against the Corporate Affairs Commission register.'],
  ['Directors and owners', 'Each one is checked against their BVN before the business can pay.'],
  ['Your documents', 'Reviewed before the business is fully open, usually within one or two working days.'],
];

const cases = [
  {
    name: 'The changed bank details',
    how: 'An email arrives from your supplier, or someone pretending to be them: “We’ve changed banks. Please pay the new account.” The next payment goes to a fraudster.',
    stops: [
      'Suppliers are saved once, with their bank details, and paid from there',
      'Changed details show as a new recipient, not a quiet edit',
      'Big payments wait for a second approval',
    ],
  },
  {
    name: 'The supplier who never ships',
    how: 'A new supplier found online takes the full payment up front, then stops answering.',
    stops: [
      'Pay a 30% or 50% deposit, not the whole order',
      'The balance is held until the shipping line confirms loading',
      'Supplier Passport shows their record with other Nigerian businesses',
    ],
  },
  {
    name: 'The payment nobody agreed',
    how: 'Someone with access to the account sends a large payment without anyone else knowing.',
    stops: [
      'Every payment needs a PIN or Face ID',
      'Big payments wait for someone else to approve them',
      'Every payment lands in one list, with a receipt',
    ],
  },
];

const controls = [
  ['PIN or Face ID', 'On every payment'],
  ['Daily limits', 'On each account'],
  ['Second approval', 'For big payments'],
  ['Card freeze', 'In one tap'],
  ['Card details', 'Only after your PIN'],
  ['Screenshots', 'Blocked while details show'],
  ['New phone', 'Payments capped for a while'],
  ['Receipts', 'For every payment'],
];

/** Business security: verification, the frauds businesses face, and the controls on every account. */
export default function BizSecurityPage() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);
  const c = cases[open]!;

  return (
    <>
      {/* 1. Opening */}
      <header className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-8 lg:pb-24 lg:pt-40">
          <div className="flex items-center justify-between border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>Business · Security</span>
            <span>Verified · approved · recorded</span>
          </div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mt-12 max-w-5xl text-[clamp(2.8rem,6.4vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.05em]"
          >
            Keep the business’s money
            <br />
            <span className="text-graphite/45">where it belongs.</span>
          </motion.h1>
        </div>
      </header>

      {/* 2. Before the first payment */}
      <section className="bg-white text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Checked before
              <br />
              <span className="text-graphite/45">your first payment.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-graphite/60">
              Every business on Credvera has been through the same three checks. It keeps fraudsters out, and it’s why your
              customers and suppliers can trust who they’re dealing with.
            </p>
          </div>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
            {checks.map(([t, b], i) => (
              <li key={t} className="relative md:pr-10">
                <div className="flex items-center gap-4">
                  <span className="grid size-10 place-items-center rounded-full bg-graphite font-ledger text-[13px] text-white">{i + 1}</span>
                  {i < checks.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-graphite/20 md:block" />}
                </div>
                <p className="mt-6 text-xl font-semibold tracking-tight">{t}</p>
                <p className="mt-2 max-w-xs leading-relaxed text-graphite/60">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. The fraud casebook */}
      <section className="bg-graphite text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            The fraud casebook.
            <br />
            <span className="text-white/45">And what stops each one.</span>
          </h2>
          <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <ol className="border-t border-white/15">
              {cases.map((x, i) => (
                <li key={x.name} className="border-b border-white/15">
                  <button type="button" onClick={() => setOpen(i)} aria-pressed={i === open} className="flex w-full items-baseline gap-4 py-5 text-left">
                    <span className="font-ledger text-[12px] text-white/40">Case {String(i + 1).padStart(2, '0')}</span>
                    <span className={`text-xl font-semibold tracking-tight transition-colors ${i === open ? 'text-white' : 'text-white/45 hover:text-white/75'}`}>{x.name}</span>
                  </button>
                </li>
              ))}
            </ol>
            <motion.div key={open} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }} className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="font-medium text-[13px] text-[#f5c451]">How it goes</p>
                <p className="mt-3 text-[17px] leading-relaxed text-white/80">{c.how}</p>
              </div>
              <div>
                <p className="font-medium text-[13px] text-primary">What stops it on Credvera</p>
                <ul className="mt-3 space-y-3">
                  {c.stops.map((s) => (
                    <li key={s} className="border-l-2 border-primary pl-4 text-[15px] leading-relaxed text-white/80">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Controls at a glance */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            On every account,
            <br />
            <span className="text-graphite/45">from day one.</span>
          </h2>
          <dl className="mt-14 grid gap-px overflow-hidden rounded-xl bg-graphite/10 sm:grid-cols-2 lg:grid-cols-4">
            {controls.map(([k, v]) => (
              <div key={k} className="bg-ledger p-6">
                <dt className="text-lg font-semibold tracking-tight">{k}</dt>
                <dd className="mt-1 font-medium text-[13px] text-graphite/50">{v}</dd>
              </div>
            ))}
          </dl>
          <Link to="/business/contact" className="group mt-14 inline-flex items-center gap-3 text-lg font-semibold">
            Spotted something suspicious? Report it
            <span className="grid size-10 place-items-center rounded-md bg-graphite text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
