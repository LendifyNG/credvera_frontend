import { motion, useReducedMotion } from 'framer-motion';
import BizClose from '../../components/business/BizClose';
import FxDesk from '../../components/business/FxDesk';
import { CurrencyWindows, HoldTracks, QuoteSum } from '../../components/business/FxPieces';
import { businessPages } from '../../lib/businessPages';

const PATH = '/business/fx';
const INDEX = businessPages.findIndex((p) => p.to === PATH);
const ease = [0.16, 1, 0.3, 1] as const;

/** Business: currency accounts and converting. */
export default function FxPage() {
  const reduce = useReducedMotion();
  return (
    <>
      {/* 1. Opening: the currencies, as windows onto their cities */}
      <header className="bg-white text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-8 lg:pb-28 lg:pt-40">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>{String(INDEX + 1).padStart(2, '0')} · FX and currencies</span>
            <span>Four currencies, one account</span>
          </div>
          <div className="mt-14">
            <CurrencyWindows />
          </div>
          <div className="mt-16 grid gap-8 border-t border-graphite/15 pt-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.4 }}
              className="text-[clamp(2.6rem,5.8vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
            >
              Hold dollars.
              <br />
              <span className="text-graphite/45">Convert when ready.</span>
            </motion.h1>
            <p className="max-w-md text-lg leading-relaxed text-graphite/65">
              Dollar, pound and euro accounts in your business’s name, alongside your naira. Customers abroad pay you like a local,
              and you convert at a rate you can see.
            </p>
          </div>
        </div>
      </header>

      {/* 2. Your accounts, in their format */}
      <section className="bg-graphite text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-12 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Your accounts,
            <br />
            <span className="text-white/45">in their format.</span>
          </h2>
          <FxDesk />
        </div>
      </section>

      {/* 3. The quote, written as a sum */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-10 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            The quote,
            <br />
            <span className="text-graphite/45">as a sum.</span>
          </h2>
          <QuoteSum />
        </div>
      </section>

      {/* 4. Held while you decide */}
      <section className="bg-white text-graphite">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Held while you decide.
              <br />
              <span className="text-graphite/45">Asked again if it moves.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-graphite/65">
              Once you see a rate, it’s yours for thirty seconds. If it changes after that, nothing converts until you say so.
            </p>
          </div>
          <HoldTracks />
        </div>
      </section>

      <BizClose path={PATH} />
    </>
  );
}
