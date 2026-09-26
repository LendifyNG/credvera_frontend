import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ctaFor } from '../../lib/site';

const ease = [0.16, 1, 0.3, 1] as const;
const cta = ctaFor('business');

// A business's first week on Credvera, one thing a day. Only what the app does today.
const days = [
  {
    day: 'Mon',
    title: 'Open the account',
    body: 'Add your CAC number and the BVN of each director and owner. We check them while you carry on.',
    tag: 'A few minutes',
  },
  {
    day: 'Tue',
    title: 'Send your first invoice',
    body: 'Your line items, a due date and a payment link. Reminders go out on their own.',
    tag: 'Free',
  },
  {
    day: 'Wed',
    title: 'Get paid',
    body: 'Your customer pays by card or transfer. The invoice marks itself paid.',
    tag: 'Card or transfer',
  },
  {
    day: 'Thu',
    title: 'Order from your supplier',
    body: 'Pay a 30% deposit to Shenzhen. The rest waits until the goods are loaded.',
    tag: 'From ₦2,500',
  },
  {
    day: 'Fri',
    title: 'Pay salaries',
    body: 'Big payments wait for a second approval, then go out with your PIN.',
    tag: '₦25 each',
  },
];

/** Business: the first week, Monday to Friday, ending with the account. */
export default function FirstWeek() {
  const reduce = useReducedMotion();
  return (
    <section className="bg-ledger text-graphite">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <h2 className="text-[clamp(2.4rem,5.5vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
          Your first week.
          <br />
          <span className="text-graphite/45">From sign-up to supplier.</span>
        </h2>

        {/* The week, like a page from a desk calendar */}
        <ol className="mt-14 grid overflow-hidden rounded-2xl bg-graphite/10 ring-1 ring-graphite/10 [gap:1px] sm:grid-cols-2 lg:grid-cols-5">
          {days.map((d, i) => (
            <motion.li
              key={d.day}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
              className={`flex min-h-[260px] flex-col p-6 ${i === 0 ? 'bg-graphite text-white' : 'bg-white'}`}
            >
              <div className="flex items-baseline justify-between">
                <span className={`font-medium text-[13px] ${i === 0 ? 'text-primary' : 'text-graphite/45'}`}>{d.day}</span>
                <span className={`font-ledger text-[11px] ${i === 0 ? 'text-white/40' : 'text-graphite/35'}`}>Day {i + 1}</span>
              </div>
              <p className="mt-8 text-[19px] font-semibold leading-tight tracking-tight">{d.title}</p>
              <p className={`mt-3 text-[14px] leading-relaxed ${i === 0 ? 'text-white/65' : 'text-graphite/60'}`}>{d.body}</p>
              <span
                className={`mt-auto w-fit rounded-full px-2.5 py-1 pt-1 font-ledger text-[11px] ${i === 0 ? 'bg-primary text-graphite' : 'bg-ledger text-graphite/70'}`}
              >
                {d.tag}
              </span>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            to={cta.to}
            className="group inline-flex h-12 items-center gap-2 rounded-md bg-graphite px-5 text-[15px] font-semibold text-white transition-colors hover:bg-black"
          >
            Start on Monday · {cta.label}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link to="/business/contact" className="text-[15px] font-semibold text-graphite/60 underline-offset-4 hover:text-graphite hover:underline">
            Talk to our team first
          </Link>
        </div>
        <p className="mt-6 text-[14px] text-graphite/50">We review your documents in one or two working days. You can use the account meanwhile.</p>
      </div>
    </section>
  );
}
