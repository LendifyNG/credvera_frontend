import CommandHero from '../components/business/CommandHero';
import FirstWeek from '../components/business/FirstWeek';
import PriceRoll from '../components/business/PriceRoll';

/** Business: the front door. Short on purpose; each feature has its own page. */
export default function BusinessHomePage() {
  return (
    <>
      <CommandHero />
      <PriceRoll />
      <FirstWeek />
    </>
  );
}
