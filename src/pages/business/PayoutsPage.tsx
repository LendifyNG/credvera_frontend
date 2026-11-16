import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import BizClose from '../../components/business/BizClose';
import { FileCheck, NamesLedger, PayrollRun, ScheduleStrip } from '../../components/business/PayoutPieces';
import { businessPages } from '../../lib/businessPages';

const PATH = '/business/payouts';
const INDEX = businessPages.findIndex((p) => p.to === PATH);
const ease = [0.16, 1, 0.3, 1] as const;

/** Business: paying many people from one list, and payments that repeat. Takes FX's place at launch. */
export default function PayoutsPage() {
  const reduce = useReducedMotion();
  return (
    <>
      {/* 1. Opening: a salary file, paid row by row */}
      <header className="bg-white text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-8 lg:pb-28 lg:pt-40">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>{String(INDEX + 1).padStart(2, '0')} · Bulk and scheduled payouts</span>
            <span>One list, one PIN</span>
          </div>
          <div className="mt-14">
            <PayrollRun />
          </div>
          <div className="mt-16 grid gap-8 border-t border-graphite/15 pt-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.4 }}
              className="text-[clamp(2.6rem,5.8vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
            >
              Pay everyone.
              <br />
              <span className="text-graphite/45">From one list.</span>
            </motion.h1>
            <p className="max-w-md text-lg leading-relaxed text-graphite/65">
              Staff, vendors and freelancers in one spreadsheet, paid to any Nigerian bank. You confirm once, and the whole list goes. From
              ₦10 a transfer, and nothing for the list itself.
            </p>
          </div>
        </div>
      </header>

      {/* 2. The file, checked before anything moves */}
      <section className="bg-graphite text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-12 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Every row checked,
            <br />
            <span className="text-white/45">before anything moves.</span>
          </h2>
          <FileCheck />
        </div>
      </section>

      {/* 3. Every account, named by the bank */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-10 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Every account,
            <br />
            <span className="text-graphite/45">named by the bank.</span>
          </h2>
          <NamesLedger />
        </div>
      </section>

      {/* 4. Payments that repeat */}
      <section className="bg-white text-graphite">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Salaries on payday.
              <br />
              <span className="text-graphite/45">Every month after.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-graphite/65">
              Set a payment to repeat every week or every month, and it goes on the same day each time. Pause it, start it again, or
              delete it. A paused payment doesn’t pay the missed dates all at once.
            </p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-graphite/55">
              Each one costs only its transfer fee. With approvals on, one over your limit waits for a second person, like any other
              payment.
            </p>
          </div>
          <ScheduleStrip />
        </div>
      </section>

      <BizClose path={PATH} />
    </>
  );
}
