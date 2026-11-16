import AppBand from '../../components/editorial/AppBand';
import { GiftTicket, SprayFan } from '../../components/editorial/CelebratePieces';
import Headline from '../../components/editorial/Headline';
import Masthead from '../../components/editorial/Masthead';
import NextChapter from '../../components/editorial/NextChapter';
import Reveal from '../../components/ui/Reveal';

/** Personal, chapter 01 at launch: celebrations, their gifts and spraying. */
export default function CelebratePage() {
  return (
    <>
      <Masthead
        chapter="01"
        of="04"
        section="Celebrations"
        title={'One link for\nevery *gift*.'}
        lede="Make a page for your wedding, birthday or naming ceremony and share the link. Guests send a gift by transfer or card, with a note, and it lands in your celebration, ready to move to your account."
        aside={<GiftTicket />}
      />

      {/* Spraying, on the day */}
      <section className="overflow-x-clip bg-secondary text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <Reveal>
              <p className="text-[13px] font-semibold text-primary">On the day</p>
            </Reveal>
            <Headline
              text={'Spray from\nyour *phone*.'}
              className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
            />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-white/65">
                Guests buy a wad of spray notes printed with your monogram and flick them across their screen. The money is
                yours the moment it’s paid. Put the live screen up in the hall and everyone sees the notes land.
              </p>
            </Reveal>
          </div>
          <SprayFan />
        </div>
      </section>

      {/* Its own number */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <Headline
          text={'Its own\n*account number*.'}
          className="max-w-3xl text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
        />
        <div className="mt-16 grid gap-12 border-t border-ink/15 pt-12 md:grid-cols-3">
          {[
            ['For the bank app crowd', 'Each celebration gets an account number of its own. Guests who would rather use their bank app send straight to it.'],
            ['Every gift accounted for', 'Who sent what, and their note, in one list. Nothing to match up against a bank statement after.'],
            ['Kept apart until you’re ready', 'Gifts sit in the celebration, away from your everyday money, until you move them to your account.'],
          ].map(([t, b], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <h3 className="text-xl font-semibold tracking-tight">{t}</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-ink/65">{b}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <NextChapter current="/personal/celebrate" />
      <AppBand line={'Make every\n*owambe* count.'} />
    </>
  );
}
