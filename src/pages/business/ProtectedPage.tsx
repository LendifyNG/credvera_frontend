import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import BizClose from '../../components/business/BizClose';
import { DeliverFork, SupplierRecord, WhereMoneyWaits } from '../../components/business/ProtectedPieces';
import LoopVideo from '../../components/editorial/LoopVideo';
import { businessPages } from '../../lib/businessPages';

// Shown at /business/suppliers while INTERNATIONAL is off (lib/launch.ts);
// SuppliersPage, for suppliers abroad, takes the place back when it's on.
const PATH = '/business/suppliers';
const INDEX = businessPages.findIndex((p) => p.to === PATH);
const ease = [0.16, 1, 0.3, 1] as const;

/** Business: protected orders to suppliers in Nigeria, in naira. */
export default function ProtectedPage() {
  const reduce = useReducedMotion();
  const line = 'text-[clamp(2.8rem,7.4vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.05em]';
  return (
    <>
      {/* 1. Opening: the headline, broken by a cinematic strip of a busy market */}
      <header className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pt-32 lg:px-8 lg:pt-40">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>{String(INDEX + 1).padStart(2, '0')} · Protected supplier payments</span>
            <span className="rounded-full bg-primary px-2.5 py-0.5 font-medium text-graphite">Nigerian suppliers, in naira</span>
          </div>
          <motion.h1 initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }} className={`mt-12 ${line}`}>
            Pay your supplier
          </motion.h1>
        </div>

        <motion.div
          initial={reduce ? false : { clipPath: 'inset(0 50% 0 50%)' }}
          animate={{ clipPath: 'inset(0 0% 0 0%)' }}
          transition={{ duration: 1.4, ease, delay: 0.3 }}
          className="relative mt-8 h-[clamp(140px,20vw,280px)] overflow-hidden"
        >
          <LoopVideo name="market-seller" label="A trader carrying her goods through a busy market" eager className="absolute inset-0 h-full w-full object-cover" />
        </motion.div>

        <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
          <p className={`mt-8 text-right text-graphite/45 ${line}`}>when the goods are right.</p>
          <div className="mt-12 grid gap-6 border-t border-graphite/15 pt-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <p className="max-w-xl text-lg leading-relaxed text-graphite/65">
              Pay a deposit now if you agreed one. We hold the rest until you say the goods are fine, then it goes to your supplier. If
              they never send, call it off and the held money is back in your balance.
            </p>
            <p className="font-ledger text-[12px] leading-relaxed text-graphite/55 lg:text-right">
              Holding the money is free
              <br />
              Deposit and balance · ₦10 to ₦40 each, like any transfer
            </p>
          </div>
        </div>
      </header>

      {/* 2. Where your money waits */}
      <section className="bg-white text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-14 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Where your money
            <br />
            <span className="text-graphite/45">waits.</span>
          </h2>
          <WhereMoneyWaits />
        </div>
      </section>

      {/* 3. If the goods don't come, or aren't right */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-14 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Two roads.
            <br />
            <span className="text-graphite/45">Only one pays the balance.</span>
          </h2>
          <DeliverFork />
        </div>
      </section>

      {/* 4. Your suppliers: the bank's name for each account, and what you've paid them */}
      <section className="bg-graphite text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <p className="font-medium text-[13px] text-white/50">Your suppliers</p>
            <h2 className="mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Know who you’re paying
              <br />
              <span className="text-white/45">before you pay them.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/65">
              Save a supplier once. The bank tells us the name on their account. Pay them from their page and we ask the bank again, so
              nothing goes if the name has changed.
            </p>
            <div className="mt-10 border-t border-white/15 pt-6">
              <p className="text-lg font-semibold">Okafor Paper Supplies</p>
              <p className="font-ledger text-[12px] text-white/50">4 payments · ₦2,063,500.00 paid · since September</p>
              <p className="mt-2 font-ledger text-[11px] text-white/35">An example supplier</p>
            </div>
          </div>
          <SupplierRecord />
        </div>
      </section>

      <BizClose path={PATH} />
    </>
  );
}
