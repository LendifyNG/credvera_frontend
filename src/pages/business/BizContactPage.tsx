import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { ArrowRight, Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { company } from '../../lib/site';

const ease = [0.16, 1, 0.3, 1] as const;

// What a business writes to us about, and what helps us answer first time.
const reasons = [
  { name: 'Opening an account', ready: ['Your CAC registration number', 'Where you are in the sign-up'] },
  { name: 'A payment or invoice', ready: ['The date and amount', 'The invoice number, if there is one', 'Who it was to or from'] },
  { name: 'A supplier order', ready: ['The supplier’s name', 'The order date and ship-by date', 'The bill of lading, if you have it'] },
  { name: 'FX or large volumes', ready: ['The currencies you use', 'Roughly how much you move each month'] },
  { name: 'A security concern', ready: ['What happened, and when', 'Don’t send your PIN, password or codes, ever'] },
  { name: 'Something else', ready: ['Anything that helps us understand'] },
];

const roles = ['Owner', 'Director', 'Finance', 'Someone else'];

const field =
  'w-full border-b border-graphite/20 bg-transparent py-3 text-[16px] outline-none transition-colors placeholder:text-graphite/30 focus:border-graphite';
const label = 'font-medium text-[13px] text-graphite/50';

/** Business contact: say what it's about, have the right details ready, and write it once. */
export default function BizContactPage() {
  const reduce = useReducedMotion();
  const [reason, setReason] = useState(0);
  const [sent, setSent] = useState(false);
  const r = reasons[reason]!;

  // No backend yet: compose the message in the visitor's own email app.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const subject = `[Business] ${r.name} · ${d.get('business')}`;
    const body = [
      `Business: ${d.get('business')}`,
      `RC number: ${d.get('rc') || '—'}`,
      `Name: ${d.get('name')} (${d.get('role')})`,
      `Email: ${d.get('email')}`,
      `Phone: ${d.get('phone') || '—'}`,
      '',
      String(d.get('message') ?? ''),
    ].join('\n');
    window.location.href = `mailto:${company.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <header className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-32 lg:px-8 lg:pt-40">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>Business · Contact</span>
            <span>{company.supportHours}</span>
          </div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mt-12 text-[clamp(2.8rem,6.4vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.05em]"
          >
            Tell us what you need.
            <br />
            <span className="text-graphite/45">We’ll send it the right way.</span>
          </motion.h1>
        </div>
      </header>

      {/* What it's about, and what to have ready */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8 lg:pb-24">
          <div>
            <p className={label}>What is it about?</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {reasons.map((x, i) => (
                <button
                  key={x.name}
                  type="button"
                  onClick={() => setReason(i)}
                  aria-pressed={i === reason}
                  className={`min-h-[88px] rounded-lg p-4 text-left text-[15px] font-medium leading-snug transition-colors ${
                    i === reason ? 'bg-graphite text-white' : 'bg-white text-graphite ring-1 ring-graphite/10 hover:ring-graphite/30'
                  }`}
                >
                  <span className={`mb-2 block font-ledger text-[11px] ${i === reason ? 'text-primary' : 'text-graphite/40'}`}>{String(i + 1).padStart(2, '0')}</span>
                  {x.name}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white p-7 ring-1 ring-graphite/10">
            <p className={label}>Have these ready</p>
            <AnimatePresence mode="wait">
              <motion.ul key={reason} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-5 space-y-3">
                {r.ready.map((x) => (
                  <li key={x} className="flex gap-3 text-[16px] leading-snug">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#1f6b33]" />
                    {x}
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* The message */}
      <section className="bg-white text-graphite">
        <form onSubmit={submit} className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.04em]">Your message</h2>
            <p className="font-ledger text-[12px] text-graphite/50">About: {r.name}</p>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            <label className="block">
              <span className={label}>Business name</span>
              <input name="business" required autoComplete="organization" placeholder="Adeola Foods Ltd" className={field} />
            </label>
            <label className="block">
              <span className={label}>RC number · optional</span>
              <input name="rc" inputMode="numeric" placeholder="RC 1234567" className={field} />
            </label>
            <label className="block">
              <span className={label}>Your name</span>
              <input name="name" required autoComplete="name" placeholder="Your full name" className={field} />
            </label>
            <fieldset>
              <legend className={label}>Your role</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {roles.map((x, i) => (
                  <label key={x} className="cursor-pointer">
                    <input type="radio" name="role" value={x} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="block rounded-md px-3 py-1.5 text-[14px] ring-1 ring-graphite/15 transition-colors peer-checked:bg-graphite peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-graphite">
                      {x}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className={label}>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@business.com" className={field} />
            </label>
            <label className="block">
              <span className={label}>Phone · optional</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder="+234" className={field} />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>Message</span>
              <textarea name="message" required rows={4} placeholder="What happened, or what you need" className={`${field} resize-y`} />
            </label>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button type="submit" className="group inline-flex h-12 items-center gap-2 rounded-md bg-graphite px-6 text-[15px] font-semibold text-white transition-colors hover:bg-black">
              Send to support
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <p className="text-[14px] text-graphite/50" aria-live="polite">
              {sent ? 'Your email app should have opened with your message.' : 'Opens your email app. We reply within one working day.'}
            </p>
          </div>
        </form>
      </section>

      {/* Direct lines */}
      <section className="bg-graphite text-white">
        <dl className="mx-auto grid max-w-7xl gap-px px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            ['Email', company.supportEmail, `mailto:${company.supportEmail}`],
            ['Phone', company.phone, `tel:${company.phone.replace(/\s+/g, '')}`],
            ['Office', company.address, ''],
            ['Hours', company.supportHours, ''],
          ].map(([k, v, href]) => (
            <div key={k} className="py-4 sm:pr-8">
              <dt className="font-medium text-[13px] text-white/45">{k}</dt>
              <dd className="mt-2 text-[17px] font-medium">
                {href ? (
                  <a href={href} className="underline-offset-4 hover:underline">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
