import AppBand from '../../components/editorial/AppBand';
import Headline from '../../components/editorial/Headline';
import Masthead from '../../components/editorial/Masthead';
import NextChapter from '../../components/editorial/NextChapter';
import PassportDoc from '../../components/editorial/PassportDoc';
import PassportMirror from '../../components/editorial/PassportMirror';
import PassportMixer from '../../components/editorial/PassportMixer';
import PassportProof from '../../components/editorial/PassportProof';
import Reveal from '../../components/ui/Reveal';

const sees = [
  'Your name, and that your identity was checked with your BVN',
  'Your monthly income from abroad, as a range',
  'How many months you were paid, and since when',
  'Who paid you, only if you choose to show it',
];
const neverSees = ['Your balance', 'Exact amounts', 'Any other payments', 'Anything after you cancel the link'];

/** Personal, chapter 04: Earnings Passport. */
export default function PassportPage() {
  return (
    <>
      <Masthead
        chapter="04"
        of="04"
        section="Earnings Passport"
        title={'Prove your income\n*without* a bank\nstatement.'}
        lede="Landlords want a year’s rent upfront. Embassies want statements. Lenders want proof. Earnings Passport shares a link that shows your income from abroad, verified from the payments you actually received."
        aside={<PassportProof />}
      />

      {/* The document itself */}
      <section className="overflow-x-clip bg-secondary text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <Reveal>
              <p className="text-[13px] font-semibold text-primary">What they see</p>
            </Reveal>
            <Headline
              text={'A page they can\n*trust*, because\nwe checked it.'}
              className="mt-6 text-[clamp(2.3rem,5.2vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              <Reveal delay={0.1}>
                <p className="text-sm font-semibold text-primary">They see</p>
                <ul className="mt-4 space-y-3 text-white/75">
                  {sees.map((s) => (
                    <li key={s} className="border-b border-white/10 pb-3 leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-sm font-semibold text-white/45">They never see</p>
                <ul className="mt-4 space-y-3 text-white/45">
                  {neverSees.map((s) => (
                    <li key={s} className="border-b border-white/10 pb-3 leading-relaxed line-through decoration-white/25">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
          <PassportDoc dark />
        </div>
      </section>

      <PassportMixer />
      <PassportMirror />

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-20 lg:px-8">
        <Reveal>
          <p className="max-w-2xl border-l-2 border-background pl-6 text-lg leading-relaxed text-ink/65">
            Earnings Passport uses the money you receive into your Credvera dollar, pound and euro accounts, so it opens
            once receiving from abroad is on. Only payments that really arrived are counted.
          </p>
        </Reveal>
      </section>

      <NextChapter current="/personal/passport" />
      <AppBand line={'Your income,\n*believed*.'} />
    </>
  );
}
