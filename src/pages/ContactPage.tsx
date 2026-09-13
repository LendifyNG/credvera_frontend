import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import PageHero from '../components/layout/PageHero';
import ButtonLink from '../components/ui/ButtonLink';
import PlaceholderNote from '../components/ui/PlaceholderNote';
import Reveal from '../components/ui/Reveal';
import { company, navLinks } from '../lib/site';

const channels = [
  { icon: Mail, label: 'Email us', value: company.email, href: `mailto:${company.email}` },
  { icon: Phone, label: 'Call us', value: company.phone, href: `tel:${company.phone.replace(/\s+/g, '')}` },
  { icon: MapPin, label: 'Visit us', value: company.address },
  { icon: Clock, label: 'Support hours', value: company.supportHours },
];

const topics = [
  ...navLinks.filter((l) => l.description && !['/about', '/faq', '/contact'].includes(l.to)).map((l) => l.label),
  'Something else',
];

const inputClass =
  'w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-background';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  // No backend yet: compose the message in the visitor's own email app.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `${data.get('topic')} enquiry from ${data.get('name')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Business: ${data.get('business') || '—'}`,
      '',
      String(data.get('message') ?? ''),
    ].join('\n');
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the Credvera team."
        intro="Questions about payments, school fees, suppliers or getting your business set up — we’re here to help."
      />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <PlaceholderNote className="mb-10">Sample contact details — the real ones will be added before launch.</PlaceholderNote>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(({ icon: Icon, label, value, href }, i) => (
            <Reveal key={label} delay={i * 0.06}>
              <div className="h-full rounded-3xl border border-ink/10 bg-white p-7 transition-transform duration-500 hover:-translate-y-1">
                <span className="grid size-12 place-items-center rounded-2xl bg-background text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="mt-7 text-sm font-medium text-ink/50">{label}</p>
                {href ? (
                  <a href={href} className="mt-1 block text-lg font-semibold tracking-tight hover:text-background">
                    {value}
                  </a>
                ) : (
                  <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Send us a message</h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink/70">
              Tell us what you need and we’ll get back to you within one working day. Prefer quick answers? Our FAQ covers
              the basics.
            </p>
            <div className="mt-8">
              <ButtonLink to="/faq" variant="outline-dark">
                Read the FAQ
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-ink/10 bg-white p-6 sm:grid-cols-2 sm:p-8">
              <label className="grid gap-2 text-sm font-medium text-ink/70">
                Full name
                <input name="name" required autoComplete="name" className={inputClass} placeholder="Ada Okafor" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink/70">
                Email
                <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="ada@business.com" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink/70">
                Business name <span className="sr-only">(optional)</span>
                <input name="business" autoComplete="organization" className={inputClass} placeholder="Optional" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink/70">
                Topic
                <select name="topic" className={inputClass} defaultValue={topics[0]}>
                  {topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink/70 sm:col-span-2">
                Message
                <textarea name="message" required rows={5} className={`${inputClass} resize-y`} placeholder="How can we help?" />
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-background"
                >
                  Send message
                </button>
                <p className="text-sm text-ink/50" aria-live="polite">
                  {sent ? 'Your email app should have opened with your message.' : 'Opens your email app to send.'}
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
