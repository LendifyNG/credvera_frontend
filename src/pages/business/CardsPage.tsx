import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import BizClose from '../../components/business/BizClose';
import { CardControls, CardFace, CostSorter, PhysicalOutline } from '../../components/business/CardPieces';
import { businessPages } from '../../lib/businessPages';

const PATH = '/business/cards';
const INDEX = businessPages.findIndex((p) => p.to === PATH);

/** Business: the dollar and naira cards. */
export default function CardsPage() {
  const reduce = useReducedMotion();
  // The two cards start stacked and part as the page scrolls, making room for the words.
  const stage = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
  const leftX = useTransform(scrollYProgress, [0, 0.6], ['8%', '-58%']);
  const rightX = useTransform(scrollYProgress, [0, 0.6], ['-8%', '58%']);
  const leftR = useTransform(scrollYProgress, [0, 0.6], [-6, -2]);
  const rightR = useTransform(scrollYProgress, [0, 0.6], [5, 2]);
  const words = useTransform(scrollYProgress, [0.3, 0.65], [0, 1]);

  return (
    <>
      {/* 1. Opening: two cards, stacked, then parting */}
      <header ref={stage} className={reduce ? 'bg-graphite text-white' : 'relative h-[190vh] bg-graphite text-white'}>
        <div className={reduce ? 'px-6 pb-20 pt-32' : 'sticky top-0 flex h-screen flex-col overflow-hidden px-6 pt-28 lg:px-8'}>
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-white/15 pb-5 font-medium text-[13px] text-white/50">
            <span>{String(INDEX + 1).padStart(2, '0')} · Business cards</span>
            <span>Scroll to part them</span>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <motion.div className="absolute w-[min(78vw,420px)]" style={reduce ? { x: '-55%' } : { x: leftX, rotate: leftR }}>
              <CardFace usd />
            </motion.div>
            <motion.div className="absolute w-[min(78vw,420px)]" style={reduce ? { x: '55%' } : { x: rightX, rotate: rightR }}>
              <CardFace usd={false} />
            </motion.div>
            <motion.div style={reduce ? undefined : { opacity: words }} className="pointer-events-none relative z-10 text-center">
              <h1 className="text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                Two cards.
                <br />
                <span className="text-white/45">One job each.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-white/60">
                Dollars for software, ads and subscriptions. Naira for everyday costs.
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* 2. Every cost on the right card */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-14 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Every cost,
            <br />
            <span className="text-graphite/45">on the right card.</span>
          </h2>
          <CostSorter />
        </div>
      </section>

      {/* 3. Limits and freezing */}
      <section className="bg-graphite text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-14 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Limits you set.
            <br />
            <span className="text-white/45">A freeze you control.</span>
          </h2>
          <CardControls />
          <p className="mt-12 border-t border-white/15 pt-6 font-medium text-[13px] text-white/45">
            Card details show only after your PIN · screenshots are blocked while they show
          </p>
        </div>
      </section>

      {/* 4. The physical card, coming */}
      <section className="bg-white text-graphite">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              The one in your hand
              <br />
              <span className="text-graphite/45">is on its way.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-graphite/65">
              Both cards are virtual today, ready the moment your account opens. Physical business cards are coming, and you’ll be
              told in the app when yours can be ordered.
            </p>
          </div>
          <div className="justify-self-center">
            <PhysicalOutline />
          </div>
        </div>
      </section>

      <BizClose path={PATH} />
    </>
  );
}
