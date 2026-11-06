import AppBand from '../../components/editorial/AppBand';
import AutoSaveYear from '../../components/editorial/AutoSaveYear';
import GoalJar from '../../components/editorial/GoalJar';
import Masthead from '../../components/editorial/Masthead';
import NextChapter from '../../components/editorial/NextChapter';
import NudgeChat from '../../components/editorial/NudgeChat';
import SplitBill from '../../components/editorial/SplitBill';

/** Personal, chapter 03: saving and splitting bills. */
export default function SavePage() {
  return (
    <>
      <Masthead
        chapter="03"
        of="04"
        section="Save and split"
        title={'Put money aside.\n*Get paid* back.'}
        lede="Set goals for school fees, rent or a new laptop and let Credvera save for you. Split a bill with friends and see who still owes you, without the awkward reminder."
        aside={<SplitBill />}
      />

      {/* Goals, filling up */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <GoalJar />
      </section>

      <AutoSaveYear />
      <NudgeChat />

      <NextChapter current="/personal/save" />
      <AppBand line={'Save a little.\n*Every* week.'} />
    </>
  );
}
