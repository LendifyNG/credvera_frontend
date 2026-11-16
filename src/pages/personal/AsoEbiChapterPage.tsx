import SwatchBoard from '../../components/asoebi/SwatchBoard';
import AppBand from '../../components/editorial/AppBand';
import { AsoEbiTicket } from '../../components/editorial/CelebratePieces';
import Figure from '../../components/editorial/Figure';
import Headline from '../../components/editorial/Headline';
import Masthead from '../../components/editorial/Masthead';
import NextChapter from '../../components/editorial/NextChapter';
import Reveal from '../../components/ui/Reveal';
import { photos } from '../../lib/photos';

/** Personal, chapter 04 at launch: collecting for aso-ebi. */
export default function AsoEbiChapterPage() {
  return (
    <>
      <Masthead
        chapter="04"
        of="04"
        section="Aso-ebi"
        title={'Collect for the\nfabric, *not* the\nspreadsheet.'}
        lede="Set the fabrics, their prices and a deadline, and share one link. Guests pick what they want, add their sizes and pay. You see who paid for what, and tick them off as they collect."
        aside={<AsoEbiTicket />}
      />

      <SwatchBoard />

      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
        <div>
          <Headline
            text={'Every order,\n*matched*.'}
            className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <ul className="mt-10 space-y-4 text-lg">
              {[
                'Guests pay on the page, by transfer or card',
                'Gele, buba and agbada in one order, with their sizes',
                'Stock counts down, so nobody buys what’s gone',
                'Call or WhatsApp a guest straight from their order',
                'Add guests who paid you in cash, so the count is right',
              ].map((s) => (
                <li key={s} className="flex gap-4 border-b border-ink/10 pb-4">
                  <span className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-background" />
                  <span className="text-ink/75">{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Figure {...photos.womanGele} className="mx-auto w-full max-w-md lg:mr-0" />
      </section>

      <NextChapter current="/personal/aso-ebi" />
      <AppBand line={'One link.\n*Everyone* in colour.'} />
    </>
  );
}
