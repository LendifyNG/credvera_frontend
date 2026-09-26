import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Headline from '../components/editorial/Headline';
import PageHeader from '../components/editorial/PageHeader';
import ScamTest from '../components/editorial/ScamTest';
import Reveal from '../components/ui/Reveal';

const habits = [
  ['Keep your PIN to yourself', 'Never share your PIN, password or one-time codes with anyone, including someone who says they work for Credvera.'],
  ['Get the app from the store', 'Only download Credvera from the official app store listing, never from a link someone sends you.'],
  ['Read the name before you send', 'Check the account name the app shows. Payments can be hard to reverse once they’ve gone.'],
  ['When in doubt, stop', 'If something feels rushed or strange, don’t act. Contact us first, and we’ll help.'],
];

/** Security: the scams people try, played against the app, then good habits. */
export default function SecurityPage() {
  return (
    <>
      <PageHeader
        label="Security"
        title={'Built for the day\n*someone* tries.'}
        lede="Your PIN on every payment, card details that hide themselves, extra care on a new phone, and the name shown before you send. Here’s how that plays out."
      />

      {/* Think like a scammer */}
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-secondary px-6 py-16 text-white sm:px-10 lg:px-14 lg:py-20">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <Headline
              text={'Think like\na *scammer*.'}
              className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
            <Reveal delay={0.15}>
              <p className="max-w-sm text-lg leading-relaxed text-white/60">Pick a trick people really use, and watch what happens when it meets Credvera.</p>
            </Reveal>
          </div>
          <ScamTest />
        </div>
      </section>

      {/* Habits */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <Headline
          text={'Four habits that\n*keep* you safe.'}
          className="text-[clamp(2.2rem,5vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.03em]"
        />
        <ol className="mt-14 grid gap-x-12 gap-y-10 border-t border-ink/15 pt-12 md:grid-cols-2">
          {habits.map(([t, b], i) => (
            <Reveal key={t} delay={(i % 2) * 0.08}>
              <li className="flex gap-6">
                <span className="font-serif text-4xl italic leading-none text-background">{i + 1}</span>
                <span>
                  <span className="block text-xl font-semibold tracking-tight">{t}</span>
                  <span className="mt-2 block leading-relaxed text-ink/65">{b}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Report */}
      <section className="border-t border-ink/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-2xl font-semibold tracking-tight">Spotted something suspicious?</p>
            <p className="mt-2 text-ink/60">Tell us straight away and we’ll help you secure your account.</p>
          </div>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 rounded-full bg-secondary py-2 pl-6 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-background"
          >
            Report a concern
            <span className="grid size-9 place-items-center rounded-full bg-primary text-secondary transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
