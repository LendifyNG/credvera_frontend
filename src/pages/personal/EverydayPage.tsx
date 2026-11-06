import AppBand from '../../components/editorial/AppBand';
import BillerRail from '../../components/editorial/BillerRail';
import Headline from '../../components/editorial/Headline';
import HoldReveal from '../../components/editorial/HoldReveal';
import LightsBack from '../../components/editorial/LightsBack';
import Masthead from '../../components/editorial/Masthead';
import NameCheck from '../../components/editorial/NameCheck';
import NextChapter from '../../components/editorial/NextChapter';
import PaymentDay from '../../components/editorial/PaymentDay';
import Receipt from '../../components/editorial/Receipt';
import Reveal from '../../components/ui/Reveal';

/** Personal, chapter 02: everyday money. */
export default function EverydayPage() {
  return (
    <>
      <Masthead
        chapter="02"
        of="04"
        section="Everyday money"
        title={'Bills, airtime\nand a card that\nworks *online*.'}
        lede="Top up airtime, buy electricity, renew your TV and pay government bills in a few taps. Send to any Nigerian bank, and pay online with a dollar card."
        aside={<PaymentDay />}
      />

      <BillerRail />

      <LightsBack />
      <NameCheck />
      <HoldReveal />

      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
        <div>
          <Headline
            text={'Every payment\nleaves a *receipt*.'}
            className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/65">
              Tokens, references and who you paid are kept with each payment, ready to share. If something goes wrong,
              report it from the payment itself and follow the reply in the app.
            </p>
          </Reveal>
        </div>
        <Receipt />
      </section>

      <NextChapter current="/personal/everyday" />
      <AppBand />
    </>
  );
}
