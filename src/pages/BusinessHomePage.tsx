import BizAccordion from '../components/business/BizAccordion';
import CommandHero from '../components/business/CommandHero';
import FirstWeek from '../components/business/FirstWeek';
import PriceRoll from '../components/business/PriceRoll';
import TradeSplit from '../components/business/TradeSplit';

/** Business: the front door. Short on purpose; each feature has its own page. */
export default function BusinessHomePage() {
  return (
    <>
      <CommandHero />

      {/* What's inside: the four features, side by side */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Built for <span className="text-graphite/45">how you trade.</span>
            </h2>
            <p className="font-medium text-[13px] text-graphite/45">Open one to read more</p>
          </div>
          <BizAccordion />
        </div>
      </section>

      <TradeSplit />
      <PriceRoll />
      <FirstWeek />
    </>
  );
}
