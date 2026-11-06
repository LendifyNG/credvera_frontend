import AppBand from '../../components/editorial/AppBand';
import Headline from '../../components/editorial/Headline';
import Masthead from '../../components/editorial/Masthead';
import NextChapter from '../../components/editorial/NextChapter';
import RateTicket from '../../components/editorial/RateTicket';
import EarnAnywhere from '../../components/editorial/EarnAnywhere';
import MoneyRoute from '../../components/editorial/MoneyRoute';
import Reveal from '../../components/ui/Reveal';

/** Personal, chapter 01: getting paid from abroad. */
export default function AbroadPage() {
  return (
    <>
      <Masthead
        chapter="01"
        of="04"
        section="Get paid from abroad"
        title={'Dollars, pounds\nand euros, in\n*your own* name.'}
        lede="Clients, employers and platforms pay you straight into your own US, UK and euro account details. Keep the money in that currency, or convert it when the rate suits you."
      />

      <MoneyRoute />

      {/* The rate, in full view */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
        <div>
          <Headline
            text={'*No* hidden rate.\nJust two numbers.'}
            className="text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/65">
              A margin is often hidden inside an exchange rate. We show our rate and the market rate side by side, every time,
              so you know exactly what you get.
            </p>
          </Reveal>
        </div>
        <RateTicket />
      </section>

      <EarnAnywhere />

      <NextChapter current="/personal/abroad" />
      <AppBand />
    </>
  );
}
