import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { personalPages } from '../../lib/personalPages';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

// A small drawn detail for each feature, shown when its row is open.
function Detail({ to }: { to: string }): ReactNode {
  if (to === '/personal/abroad')
    return (
      <div className="space-y-2">
        {[
          ['us', 'USD', '₦1,535.00'],
          ['gb', 'GBP', '₦2,065.00'],
          ['eu', 'EUR', '₦1,790.00'],
        ].map(([flag, code, rate]) => (
          <div key={code} className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3">
            <img src={`https://flagcdn.com/w40/${flag}.png`} alt="" className="h-4 w-6 rounded-[2px] object-cover" loading="lazy" />
            <span className="text-sm font-semibold">{code}</span>
            <span className="ml-auto text-sm tabular-nums text-ink/60">{rate}</span>
          </div>
        ))}
      </div>
    );
  if (to === '/personal/everyday')
    return (
      <div className="flex flex-wrap gap-2">
        {['Airtime', 'Data', 'Electricity', 'DStv', 'GOtv', 'StarTimes', 'Remita', 'Bank transfer', 'Dollar card'].map((b) => (
          <span key={b} className="rounded-full border border-ink/10 bg-paper px-3.5 py-1.5 text-sm text-ink/70">
            {b}
          </span>
        ))}
      </div>
    );
  if (to === '/personal/save')
    return (
      <div className="space-y-4">
        {[
          ['School fees', 38],
          ['New laptop', 31],
          ['Emergency fund', 30],
        ].map(([name, pct]) => (
          <div key={name}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{name}</span>
              <span className="tabular-nums text-ink/50">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
              <motion.div
                className="h-full rounded-full bg-background"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease, delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <div className="rounded-2xl bg-paper p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">Earnings Passport</span>
        <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold text-primary">Verified</span>
      </div>
      <p className="mt-4 text-sm text-ink/50">Monthly income from abroad</p>
      <p className="text-2xl font-semibold tracking-tight">$1,000 – $2,000</p>
      <p className="mt-3 text-sm text-ink/50">Paid 12 of 12 months · Balance never shown</p>
    </div>
  );
}

// What each feature does, in a sentence and three points.
const more: Record<string, { body: string; points: string[] }> = {
  '/personal/abroad': {
    body: 'Clients, employers and platforms pay you straight into US, UK and euro account details in your own name.',
    points: ['Your own USD, GBP and EUR account details', 'Our rate always beside the market rate', 'A PayPal link for clients who pay that way'],
  },
  '/personal/everyday': {
    body: 'Everything you pay for every month, from the same place as your money.',
    points: ['Airtime, data, electricity, TV and Remita', 'Send to any Nigerian bank in seconds', 'A dollar card for online, a naira card for shops'],
  },
  '/personal/save': {
    body: 'Put money aside for what’s next, and stop chasing friends for their share.',
    points: ['Goals with weekly or monthly auto-save', 'Money in a goal is kept apart', 'Split any bill and see who still owes'],
  },
  '/personal/passport': {
    body: 'Share a link that proves your income from abroad, checked from the payments you actually received.',
    points: ['Shows a range, never your balance', 'You choose the months and how long it lasts', 'Cancel it and the link stops working'],
  },
};

/** The four core features as open-on-click rows, with a short explanation and a way into each page. */
export default function FeatureIndex() {
  const [open, setOpen] = useState<string | null>(personalPages[0].to);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">What you can do</p>
          </Reveal>
          <Headline
            text={'Everything your\nmoney needs,\n*in one place*.'}
            className="mt-5 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1] tracking-[-0.03em]"
          />
        </div>

        <ol className="border-t border-ink/15">
          {personalPages.map((p, i) => {
            const isOpen = open === p.to;
            const m = more[p.to]!;
            return (
              <Reveal key={p.to} delay={i * 0.05}>
                <li className="border-b border-ink/15">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : p.to)}
                    aria-expanded={isOpen}
                    className="group grid w-full grid-cols-[2.75rem_1fr_auto] items-center gap-4 py-7 text-left sm:grid-cols-[3.5rem_1fr_auto] sm:py-8"
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-500 sm:size-10 ${
                        isOpen ? 'bg-primary text-secondary' : 'bg-ink/[0.05] text-ink/50 group-hover:bg-primary group-hover:text-secondary'
                      }`}
                    >
                      {p.no}
                    </span>
                    <span>
                      <span className="relative inline-block text-[clamp(1.6rem,3.6vw,2.9rem)] font-semibold leading-none tracking-[-0.03em]">
                        {p.title}
                        {/* A thin line sweeps under the title on hover */}
                        <span
                          className={`absolute -bottom-2 left-0 h-[2px] bg-background transition-all duration-500 ease-out ${
                            isOpen ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        />
                      </span>
                      <span className="mt-3 block font-serif text-lg italic text-ink/55 sm:text-xl">{p.line}</span>
                    </span>
                    <span
                      className={`grid size-10 place-items-center rounded-full border transition-all duration-500 ${
                        isOpen ? 'rotate-45 border-background bg-background text-primary' : 'border-ink/15 text-ink/50 group-hover:border-background group-hover:text-background'
                      }`}
                    >
                      <Plus className="size-5" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-8 pb-10 pl-[3.75rem] sm:pl-[4.5rem] md:grid-cols-[1.2fr_1fr]">
                          <div>
                            <p className="max-w-md text-lg leading-relaxed text-ink/70">{m.body}</p>
                            <ul className="mt-6 space-y-2.5">
                              {m.points.map((pt) => (
                                <li key={pt} className="flex items-start gap-3 text-[15px] text-ink/75">
                                  <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-background" />
                                  {pt}
                                </li>
                              ))}
                            </ul>
                            <Link
                              to={p.to}
                              className="group/link mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-background"
                            >
                              See how it works
                              <ArrowRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                          <div className="rounded-3xl bg-white p-5 ring-1 ring-ink/5">
                            <Detail to={p.to} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
