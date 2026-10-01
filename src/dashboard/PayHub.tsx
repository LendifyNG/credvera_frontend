import { motion } from 'framer-motion';
import { NavLink, useParams } from 'react-router-dom';
import { useSession } from './data';
import Bills from './pay/Bills';
import PaySomeone from './pay/PaySomeone';
import { ComingSoon } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;

const SECTIONS = [
  { to: '/business/app/pay', label: 'Pay someone', end: true },
  { to: '/business/app/pay/bulk', label: 'Bulk payments' },
  { to: '/business/app/pay/scheduled', label: 'Scheduled' },
  { to: '/business/app/pay/bills', label: 'Bills' },
];

function Section({ name }: { name: string | undefined }) {
  switch (name) {
    case 'bulk':
      return (
        <ComingSoon title="Bulk payments">
          Pay many people at once from one spreadsheet, like salaries, with every row checked before anything goes.
        </ComingSoon>
      );
    case 'scheduled':
      return (
        <ComingSoon title="Scheduled payments">
          Rent, salaries and suppliers paid on the day, every week or month, without you having to remember.
        </ComingSoon>
      );
    case 'bills':
      return <Bills />;
    default:
      return <PaySomeone />;
  }
}

/** Paying out: one person, many at once, on a schedule, or a bill. */
export default function PayHub() {
  const { section } = useParams();
  const session = useSession();

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
        <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Payments</h1>
        <p className="mt-1 text-[15px] text-graphite/55">Pay one person, or a bill.</p>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite/10" aria-label="Payments">
        {SECTIONS.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            end={s.end}
            className={({ isActive }) => `-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[14.5px] font-medium transition-colors ${isActive ? 'border-graphite text-graphite' : 'border-transparent text-graphite/50 hover:text-graphite'}`}
          >
            {s.label}
          </NavLink>
        ))}
      </nav>

      <motion.div key={section ?? 'pay'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
        <Section name={section} />
      </motion.div>
    </div>
  );
}
