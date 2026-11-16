import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { useRef } from 'react';
import BizClose from '../../components/business/BizClose';
import { ApprovalFlow, DecisionLog, PermissionsGrid, RoleCard } from '../../components/business/TeamPieces';
import { businessPages } from '../../lib/businessPages';

const PATH = '/business/team';
const INDEX = businessPages.findIndex((p) => p.to === PATH);

/** Business: the team, their roles, and approvals for big payments. Takes Cards' place at launch. */
export default function TeamPage() {
  const reduce = useReducedMotion();
  // The owner's and the admin's cards start stacked and part as the page scrolls, making room for the words.
  const stage = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
  const leftX = useTransform(scrollYProgress, [0, 0.6], ['8%', '-58%']);
  const rightX = useTransform(scrollYProgress, [0, 0.6], ['-8%', '58%']);
  const leftR = useTransform(scrollYProgress, [0, 0.6], [-6, -2]);
  const rightR = useTransform(scrollYProgress, [0, 0.6], [5, 2]);
  const words = useTransform(scrollYProgress, [0.3, 0.65], [0, 1]);

  return (
    <>
      {/* 1. Opening: two people on one account, stacked, then parting */}
      <header ref={stage} className={reduce ? 'bg-graphite text-white' : 'relative h-[190vh] bg-graphite text-white'}>
        <div className={reduce ? 'px-6 pb-20 pt-32' : 'sticky top-0 flex h-screen flex-col overflow-hidden px-6 pt-28 lg:px-8'}>
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-white/15 pb-5 font-medium text-[13px] text-white/50">
            <span>{String(INDEX + 1).padStart(2, '0')} · Team and approvals</span>
            <span>Scroll to part them</span>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <motion.div className="absolute w-[min(78vw,420px)]" style={reduce ? { x: '-55%' } : { x: leftX, rotate: leftR }}>
              <RoleCard role="owner" />
            </motion.div>
            <motion.div className="absolute w-[min(78vw,420px)]" style={reduce ? { x: '55%' } : { x: rightX, rotate: rightR }}>
              <RoleCard role="admin" />
            </motion.div>
            <motion.div style={reduce ? undefined : { opacity: words }} className="pointer-events-none relative z-10 text-center">
              <h1 className="text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                One account.
                <br />
                <span className="text-white/45">The whole team.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-white/60">
                Invite the people who run the business with you. Choose who can see and who can pay. Free on every business account.
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* 2. Who can see, who can pay */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-14 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Who can see.
            <br />
            <span className="text-graphite/45">Who can pay.</span>
          </h2>
          <PermissionsGrid />
        </div>
      </section>

      {/* 3. Approvals over a limit */}
      <section className="bg-graphite text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-14 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Big payments
            <br />
            <span className="text-white/45">wait for a second person.</span>
          </h2>
          <ApprovalFlow />
          <p className="mt-12 border-t border-white/15 pt-6 font-medium text-[13px] text-white/45">
            The owner or an admin approves, never whoever asked · a payment no one decides lapses after three days
          </p>
        </div>
      </section>

      {/* 4. Every decision, with a name on it */}
      <section className="bg-white text-graphite">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Every decision,
              <br />
              <span className="text-graphite/45">with a name on it.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-graphite/65">
              Everyone signs in with their own Credvera account and confirms with their own PIN. Approvals keep who asked, who decided,
              and what they said.
            </p>
          </div>
          <DecisionLog />
        </div>
      </section>

      <BizClose path={PATH} />
    </>
  );
}
