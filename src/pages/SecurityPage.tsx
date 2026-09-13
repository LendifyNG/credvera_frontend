import { BadgeCheck, Landmark, ShieldAlert, UserCheck } from 'lucide-react';
import PageHero from '../components/layout/PageHero';
import ButtonLink from '../components/ui/ButtonLink';
import Reveal from '../components/ui/Reveal';
import { company } from '../lib/site';

const pillars = [
  {
    icon: Landmark,
    title: 'Licensed partners hold and move your money',
    body: company.licenceStatement,
  },
  {
    icon: UserCheck,
    title: 'Every account is verified',
    body: 'In line with Nigerian regulations, we verify the identity of every person and business before money can move. It keeps fraudsters out and your account yours.',
  },
  {
    icon: BadgeCheck,
    title: 'You stay in control',
    body: 'Every payment you make or receive shows up in your Credvera app, so you always know where your money is and where it’s going.',
  },
];

const tips = [
  'Never share your PIN, password or one-time codes with anyone — including anyone who says they work for Credvera.',
  'Only download Credvera from the official Google Play Store listing.',
  'Check who you’re paying before you confirm a transfer. Payments can be hard to reverse once sent.',
  'If something feels wrong, stop and contact us before you act.',
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="Your business money deserves serious protection."
        intro="How Credvera keeps your account safe — and how you can help keep it that way."
      />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-ink/10 bg-white p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-background text-primary">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-8 text-xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-3 leading-relaxed text-ink/70">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1.4fr] lg:px-8 lg:py-28">
          <Reveal>
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-secondary">
              <ShieldAlert className="size-5" />
            </span>
            <h2 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">Staying safe from scams</h2>
            <p className="mt-4 leading-relaxed text-white/60">A few habits that protect your business every day.</p>
          </Reveal>
          <ol className="space-y-4">
            {tips.map((tip, i) => (
              <Reveal key={tip} delay={i * 0.06}>
                <li className="flex gap-5 rounded-2xl border border-white/10 p-6">
                  <span className="text-sm font-semibold text-primary">0{i + 1}</span>
                  <p className="leading-relaxed text-white/80">{tip}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight">Spotted something suspicious?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink/70">Tell us straight away and we’ll help you secure your account.</p>
          <div className="mt-8 flex justify-center">
            <ButtonLink to="/contact" variant="dark">
              Report a concern
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
