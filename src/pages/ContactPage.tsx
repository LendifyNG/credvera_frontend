import { ArrowUpRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/editorial/PageHeader';
import Reveal from '../components/ui/Reveal';
import { company } from '../lib/site';

const channels = [
  { label: 'Email', value: company.email, href: `mailto:${company.email}` },
  { label: 'Call', value: company.phone, href: `tel:${company.phone.replace(/\s+/g, '')}` },
  { label: 'Visit', value: company.address },
];

// What people write about, worded to finish the sentence "I'm writing about …".
const topics = [
  'my personal account',
  'a payment',
  'getting paid from abroad',
  'my dollar card',
  'Earnings Passport',
  'my business account',
  'paying suppliers abroad',
  'a security concern',
  'something else',
];

// Support hours in Lagos: Monday to Friday, 8am to 6pm (company.supportHours).
// TODO(credvera): keep in step with the real support hours.
function openNow() {
  const lagos = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const day = lagos.getDay();
  const hour = lagos.getHours();
  const weekday = day >= 1 && day <= 5;
  if (weekday && hour >= 8 && hour < 18) return { open: true, text: 'We’re open now' };
  const nextDay = weekday && hour < 8 ? 'today' : day >= 1 && day <= 4 ? 'tomorrow' : 'Monday';
  return { open: false, text: `Closed now · back ${nextDay} at 8am` };
}

// Inputs that sit inside the sentence, underlined like a form on paper.
const blank =
  'mx-1 inline-block min-w-0 border-b-2 border-ink/20 bg-transparent px-1 pb-0.5 font-semibold text-background outline-none transition-colors placeholder:font-normal placeholder:text-ink/30 focus:border-background';

/** Contact: when we're around, how to reach us, and a message written as a sentence. */
export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const status = openNow();

  // No backend yet: compose the message in the visitor's own email app.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `${data.get('topic')} enquiry from ${data.get('name')}`;
    const body = [`Name: ${data.get('name')}`, `Email: ${data.get('email')}`, '', String(data.get('message') ?? '')].join('\n');
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <PageHeader label="Contact" title={'Talk to\n*people*, not a bot.'} lede="Questions about your account, a payment or getting your business set up. Pick the way that suits you.">
        <p className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.open ? 'bg-primary/25 text-background' : 'bg-ink/5 text-ink/60'}`}>
          <span className={`size-2 rounded-full ${status.open ? 'animate-pulse bg-background' : 'bg-ink/30'}`} />
          {status.text}
        </p>
      </PageHeader>

      {/* The ways to reach us, big */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <ul className="border-t border-ink/15">
          {channels.map(({ label, value, href }, i) => {
            const row = (
              <>
                <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-ink/40 sm:w-28">{label}</span>
                <span className="min-w-0 flex-1 truncate text-[clamp(1.6rem,5vw,4.2rem)] font-semibold tracking-[-0.035em] transition-transform duration-500 group-hover:translate-x-3">
                  {value}
                </span>
                {href ? (
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-mist text-background transition-all duration-500 group-hover:rotate-45 group-hover:bg-primary">
                    <ArrowUpRight className="size-5" />
                  </span>
                ) : null}
              </>
            );
            return (
              <Reveal key={label} delay={i * 0.06}>
                <li className="border-b border-ink/15">
                  {href ? (
                    <a href={href} className="group flex items-center gap-6 py-7 sm:py-9">
                      {row}
                    </a>
                  ) : (
                    <div className="group flex items-center gap-6 py-7 sm:py-9">{row}</div>
                  )}
                </li>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-5 text-sm text-ink/50">{company.supportHours}</p>
      </section>

      {/* A message, written as a sentence */}
      <section className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-32">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-background">Or write to us</p>
        </Reveal>
        <form onSubmit={handleSubmit} className="mt-8">
          <p className="text-[clamp(1.5rem,3.4vw,2.6rem)] font-medium leading-[1.7] tracking-[-0.02em] text-ink/80">
            Hi Credvera, I’m
            <input name="name" required autoComplete="name" placeholder="your name" aria-label="Your name" className={`${blank} w-[9em]`} />, and you can reach me at
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="your email"
              aria-label="Your email"
              className={`${blank} w-[11em]`}
            />
            . I’m writing about
            <select name="topic" aria-label="Topic" defaultValue={topics[0]} className={`${blank} cursor-pointer appearance-none pr-2`}>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            .
          </p>
          <label htmlFor="contact-message" className="mt-10 block text-sm text-ink/55">
            Tell us more
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            placeholder="How can we help?"
            className="mt-2 w-full resize-y rounded-2xl border border-ink/15 bg-white px-5 py-4 text-lg outline-none transition-colors placeholder:text-ink/30 focus:border-background"
          />
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <button
              type="submit"
              className="group inline-flex items-center gap-3 rounded-full bg-secondary py-2 pl-6 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-background"
            >
              Send message
              <span className="grid size-9 place-items-center rounded-full bg-primary text-secondary transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
            <p className="text-sm text-ink/50" aria-live="polite">
              {sent ? 'Your email app should have opened with your message.' : 'Opens your email app to send. We reply within one working day.'}
            </p>
          </div>
        </form>
        <p className="mt-14 text-ink/55">
          Looking for a quick answer?{' '}
          <Link to="/faq" className="font-semibold text-background underline-offset-4 hover:underline">
            Read the FAQ
          </Link>
          .
        </p>
      </section>
    </>
  );
}
