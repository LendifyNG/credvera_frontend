import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { INTERNATIONAL } from '../../lib/launch';
import { personalPages } from '../../lib/personalPages';
import Reveal from '../ui/Reveal';
import tailor from '../../assets/photos/business/trade-tailor.webp';
import { photos } from '../../lib/photos';
import CountUp from '../ui/CountUp';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

// A small drawn detail for each feature, shown when its row is open.
function Detail({ to }: { to: string }): ReactNode {
  if (to === '/personal/celebrate')
    return (
      <div className="space-y-2">
        {[
          ['AB', 'Aunty Bisi', '₦50,000'],
          ['CO', 'Chidi O.', '₦20,000'],
          ['MT', 'Mama Tolu', '₦100,000'],
        ].map(([initials, name, amount]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3">
            <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-secondary">{initials}</span>
            <span className="text-sm font-semibold">{name}</span>
            <span className="ml-auto text-sm tabular-nums text-ink/60">{amount}</span>
          </div>
        ))}
      </div>
    );
  if (to === '/personal/aso-ebi')
    return (
      <div className="space-y-2">
        {[
          ['Gele only', '₦15,000', 'Unlimited'],
          ['Gele and buba', '₦35,000', '12 left'],
          ['Agbada set', '₦60,000', '4 left'],
        ].map(([name, price, left]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3">
            <span className="text-sm font-semibold">{name}</span>
            <span className="text-xs text-ink/45">{left}</span>
            <span className="ml-auto text-sm tabular-nums text-ink/60">{price}</span>
          </div>
        ))}
      </div>
    );
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
        {['Airtime', 'Data', 'Electricity', 'DStv', 'GOtv', 'StarTimes', 'Remita', 'Bank transfer', ...(INTERNATIONAL ? ['Dollar card'] : [])].map((b) => (
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
        <span className="text-[13px] font-semibold text-ink/45">Earnings Passport</span>
        <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold text-primary">Verified</span>
      </div>
      <p className="mt-4 text-sm text-ink/50">Monthly income from abroad</p>
      <p className="text-2xl font-semibold tracking-tight">$1,000 – $2,000</p>
      <p className="mt-3 text-sm text-ink/50">Paid 12 of 12 months · Balance never shown</p>
    </div>
  );
}

// At launch: each row opens to a photograph, with one number and a punchline
// set over it, instead of a drawing. Fees are the ones in lib/site.ts pricing.
const figure: Record<
  string,
  { kicker: string; value: number; prefix?: string; suffix?: string; punch: string; fact: string; img: string; alt: string }
> = {
  '/personal/celebrate': {
    kicker: 'Gifts and spray',
    value: 0,
    prefix: '₦',
    punch: 'Every kobo they spray lands with you.',
    fact: 'Free to make the page, receive, and move it to your account.',
    img: photos.blogKaftan.src,
    alt: photos.blogKaftan.alt,
  },
  '/personal/everyday': {
    kicker: 'Transfers',
    value: 10,
    prefix: '₦',
    punch: 'A transfer costs less than pure water.',
    fact: 'Under ₦10,000, to any Nigerian bank. Airtime, data, light and TV: free.',
    img: photos.womanBraidsPhone.src,
    alt: photos.womanBraidsPhone.alt,
  },
  '/personal/save': {
    kicker: 'Auto-save',
    value: 52,
    suffix: '×',
    punch: 'Set it once. It saves all year.',
    fact: 'A weekly goal tops itself up, and split bills chase the money back.',
    img: photos.friendsSelfie.src,
    alt: photos.friendsSelfie.alt,
  },
  '/personal/aso-ebi': {
    kicker: 'Aso-ebi',
    value: 1,
    suffix: ' link',
    punch: 'No spreadsheet. No “who has paid?”',
    fact: 'Every fabric, size and payment, counted in one link.',
    img: tailor,
    alt: 'A smiling tailor at his work table',
  },
};

function Big({ to }: { to: string }) {
  const f = figure[to];
  if (!f) return null;
  return (
    <div className="relative isolate h-full min-h-[22rem] overflow-hidden rounded-3xl bg-secondary text-white">
      <motion.img
        src={f.img}
        alt={f.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Darkens the lower half so the words read on any photo. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-secondary via-secondary/55 to-transparent" />
      <div className="flex h-full min-h-[22rem] flex-col justify-between p-6 sm:p-7">
        <span className="self-start rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
          {f.kicker}
        </span>
        <div>
          <p className="text-[clamp(3.75rem,7vw,5.75rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-primary tabular-nums">
            <CountUp value={f.value} prefix={f.prefix} suffix={f.suffix} duration={1.2} />
          </p>
          <p className="mt-4 max-w-sm text-[1.3rem] font-semibold leading-snug tracking-tight">{f.punch}</p>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/65">{f.fact}</p>
        </div>
      </div>
    </div>
  );
}

// What each feature does, in a sentence and three points.
const more: Record<string, { body: string; points: string[] }> = {
  '/personal/celebrate': {
    body: 'One page for your wedding, birthday or naming. Guests send gifts with a note, and spray from their phones on the day.',
    points: ['A gift link and an account number of its own', 'Spray notes with your monogram, live on a big screen', 'Every gift and who sent it, in one list'],
  },
  '/personal/aso-ebi': {
    body: 'Share one link for the fabric. Guests choose, add their sizes and pay, and you tick them off as they collect.',
    points: ['Several fabrics, prices and a deadline', 'Stock that counts down as guests pay', 'Add guests who paid you in cash'],
  },
  '/personal/abroad': {
    body: 'Clients, employers and platforms pay you straight into US, UK and euro account details in your own name.',
    points: ['Your own USD, GBP and EUR account details', 'Our rate always beside the market rate', 'A PayPal link for clients who pay that way'],
  },
  '/personal/everyday': {
    body: 'Everything you pay for every month, from the same place as your money.',
    points: ['Airtime, data, electricity, TV and Remita', 'Send to any Nigerian bank in seconds', INTERNATIONAL ? 'A dollar card for online, a naira card for shops' : 'The name checked before you send'],
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
            <p className="text-[13px] font-semibold text-ink/45">What you can do</p>
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
                    className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-7 text-left sm:gap-4 sm:grid-cols-[3.5rem_1fr_auto] sm:py-8"
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-500 sm:size-10 ${
                        isOpen ? 'bg-primary text-secondary' : 'bg-ink/[0.05] text-ink/50 group-hover:bg-primary group-hover:text-secondary'
                      }`}
                    >
                      {p.no}
                    </span>
                    <span>
                      <span className="relative inline-block whitespace-nowrap text-[clamp(1.2rem,5.9vw,2.9rem)] font-semibold leading-none tracking-[-0.03em]">
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
                        <div className="grid gap-8 pb-10 pl-12 sm:pl-[4.5rem] md:grid-cols-[1.2fr_1fr]">
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
                          {/* At launch: one large figure instead of the drawn panel (lib/launch.ts). */}
                          {INTERNATIONAL ? (
                            <div className="rounded-3xl bg-white p-5 ring-1 ring-ink/5">
                              <Detail to={p.to} />
                            </div>
                          ) : (
                            <Big to={p.to} />
                          )}
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
