import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logoDark from '../../assets/logo-dark.png';
import logoLight from '../../assets/logo.png';
import { businessPages } from '../../lib/businessPages';

const ease = [0.16, 1, 0.3, 1] as const;

// Each panel has its own colour and its own way of telling the feature.
const tones = [
  { bg: 'bg-white', text: 'text-graphite', muted: 'text-graphite/55', line: 'border-graphite/10' },
  { bg: 'bg-graphite', text: 'text-white', muted: 'text-white/55', line: 'border-white/10' },
  { bg: 'bg-[#e4e8e2]', text: 'text-graphite', muted: 'text-graphite/55', line: 'border-graphite/10' },
  { bg: 'bg-[#26302a]', text: 'text-white', muted: 'text-white/55', line: 'border-white/10' },
];

/** Payments: one figure that says it, then three facts. */
function PaymentsBody() {
  return (
    <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-end">
      <div>
        <p className="font-ledger text-[clamp(3.5rem,7vw,5.5rem)] font-medium leading-none tracking-[-0.06em]">₦25</p>
        <p className="mt-2 text-sm text-graphite/55">to pay any Nigerian bank</p>
      </div>
      <ul className="space-y-2.5 text-[15px]">
        {['Invoices that mark themselves paid', 'Payment links, paid by card or transfer', 'Reminders sent for you'].map((x) => (
          <li key={x} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-[#1f6b33]" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** FX: the rates, side by side, and how customers abroad pay you. */
function FxBody() {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="font-medium text-[12.5px] text-white/40">
            <th className="pb-2 text-left font-normal">1 unit</th>
            <th className="pb-2 text-right font-normal">Our rate</th>
            <th className="pb-2 text-right font-normal">Market</th>
          </tr>
        </thead>
        <tbody className="font-ledger">
          {[
            ['USD', '₦1,535'],
            ['GBP', '₦2,065'],
            ['EUR', '₦1,790'],
          ].map(([c, r]) => (
            <tr key={c} className="border-t border-white/10">
              <td className="py-2">{c}</td>
              <td className="py-2 text-right">{r}</td>
              <td className="py-2 text-right text-white/45">{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="space-y-3 text-[14px]">
        {[
          ['US customers', 'Pay your ACH routing and account number'],
          ['UK customers', 'Pay your sort code and account number'],
          ['Euro customers', 'Pay your IBAN'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="font-medium text-[12.5px] text-white/40">{k}</dt>
            <dd className="text-white/80">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Suppliers: the money, split into what's paid and what's held. */
function SuppliersBody() {
  return (
    <div>
      <div className="flex h-14 overflow-hidden rounded-lg font-ledger text-[12px]">
        <div className="flex w-[30%] flex-col justify-center bg-graphite px-3 text-white">
          <span className="text-white/60">Paid now</span>
          <span>30% deposit</span>
        </div>
        <div className="flex flex-1 flex-col justify-center border-2 border-dashed border-graphite/25 px-3">
          <span className="text-graphite/55">Held by Credvera</span>
          <span>70%, released when the goods are loaded</span>
        </div>
      </div>
      <p className="mt-5 text-[15px] leading-relaxed text-graphite/70">
        The shipping line confirms loading, then the supplier is paid. If nothing ships in time, the held money comes back.
      </p>
      <p className="mt-4 font-ledger text-[12px] text-graphite/55">UK & euro ₦2,500 · US ₦3,500 · China ₦5,000 · per payment</p>
    </div>
  );
}

/** Cards: the two faces, small, with what they share. */
function CardsBody() {
  const face = (dark: boolean, code: string, sign: string) => (
    <div
      className={`relative aspect-[1.586] w-40 overflow-hidden rounded-lg p-3 sm:w-44 ${dark ? 'bg-[#0e1511] text-white ring-1 ring-white/10' : 'bg-[#eef1ec] text-graphite'}`}
    >
      <span aria-hidden className={`absolute -bottom-6 -right-1 font-ledger text-7xl leading-none ${dark ? 'text-white/[0.07]' : 'text-graphite/[0.08]'}`}>
        {sign}
      </span>
      <img src={dark ? logoLight : logoDark} alt="" className="h-3.5 w-auto" />
      <span className="absolute bottom-3 left-3 font-ledger text-[10px]">{code} · Virtual</span>
    </div>
  );
  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex gap-3">
        {face(true, 'USD', '$')}
        {face(false, 'NGN', '₦')}
      </div>
      <ul className="space-y-2 text-[14px] text-white/80">
        {['Monthly limits', 'Freeze in one tap', 'Details only after your PIN'].map((x) => (
          <li key={x} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

const bodies: ReactNode[] = [<PaymentsBody key="p" />, <FxBody key="f" />, <SuppliersBody key="s" />, <CardsBody key="c" />];

/**
 * The four business features as panels side by side. The open one widens and
 * tells its story its own way; the others fold into slim tabs. Stacks on phones.
 */
export default function BizAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-2 lg:h-[540px] lg:flex-row">
      {businessPages.map((p, i) => {
        const t = tones[i]!;
        const isOpen = i === open;
        return (
          <motion.div
            key={p.to}
            layout
            transition={{ duration: 0.7, ease }}
            className={`relative overflow-hidden rounded-2xl ${t.bg} ${t.text} ${isOpen ? 'lg:flex-[5]' : 'lg:flex-[1]'} lg:min-w-[88px]`}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              onMouseEnter={() => window.matchMedia('(hover: hover) and (min-width: 1024px)').matches && setOpen(i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 p-6 text-left lg:absolute lg:inset-0 lg:flex-col lg:items-start lg:justify-between"
              style={isOpen ? { pointerEvents: 'none' } : undefined}
            >
              <span className={`font-ledger text-[12px] ${t.muted}`}>{String(i + 1).padStart(2, '0')}</span>
              {/* Folded: the name runs up the tab */}
              <span
                className={`text-lg font-semibold tracking-tight lg:text-xl ${isOpen ? 'lg:hidden' : 'lg:[writing-mode:vertical-rl] lg:rotate-180'}`}
              >
                {p.label}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.25, duration: 0.5 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-col justify-between px-6 pb-6 lg:absolute lg:inset-0 lg:min-w-[560px] lg:p-10"
                >
                  <div>
                    <p className={`hidden font-ledger text-[12px] lg:block ${t.muted}`}>{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="hidden text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-none tracking-[-0.035em] lg:mt-4 lg:block">{p.label}</h3>
                    <p className={`mt-3 max-w-lg text-[15px] leading-relaxed ${t.muted}`}>{p.proof}</p>
                  </div>
                  <div className="mt-8 lg:mt-0">{bodies[i]}</div>
                  <Link
                    to={p.to}
                    className={`group mt-8 inline-flex w-fit items-center gap-2 border-b pb-1 text-[15px] font-semibold lg:mt-0 ${t.line}`}
                  >
                    Read more
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
