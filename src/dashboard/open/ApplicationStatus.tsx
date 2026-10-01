import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BusinessDto } from '../../api';
import StoreButtons from '../../components/business/StoreButtons';
import { ease, primary } from './parts';

type Mark = 'done' | 'now' | 'next';

/** Where the application stands once it's with the team, in three steps. */
function timeline(business: BusinessDto): [string, string, Mark][] {
  const sent = business.submittedAt ? new Date(business.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'Sent';

  if (business.status === 'approved') {
    return [
      ['Application sent', sent, 'done'],
      ['Reviewed', 'Checked by two people on our team', 'done'],
      ['Fully open', 'Payments are on', 'done'],
    ];
  }

  return [
    ['Application sent', sent, 'done'],
    ['Under review', business.status === 'second_review' ? 'With a second reviewer' : 'Usually one or two working days', 'now'],
    ['Fully open', 'We’ll tell you by email and in the app', 'next'],
  ];
}

export default function ApplicationStatus({ business, onStartAnother }: { business: BusinessDto; onStartAnother: () => void }) {
  if (business.status === 'rejected') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mt-14 max-w-xl">
        <p className="text-xl font-semibold tracking-tight">We can’t open an account for {business.name}</p>
        {business.decisionNote && <p className="mt-3 text-[16px] leading-relaxed text-graphite/70">{business.decisionNote}</p>}
        <p className="mt-6 text-[15px] text-graphite/60">
          If you think we’ve got this wrong,{' '}
          <Link to="/business/contact" className="font-semibold text-graphite underline-offset-4 hover:underline">
            talk to us
          </Link>
          .
        </p>
        <button type="button" onClick={onStartAnother} className={`${primary} mt-8`}>
          Apply for a different company
        </button>
      </motion.div>
    );
  }

  const open = business.status === 'approved';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mt-14">
      <p className="mb-8 text-[15px] font-medium text-graphite/60">{business.name}</p>
      <ol className="relative space-y-8 border-l border-graphite/20 pl-8">
        {timeline(business).map(([title, body, mark]) => (
          <li key={title} className="relative">
            <span className={`absolute -left-[41px] top-0.5 grid size-5 place-items-center rounded-full ring-4 ring-ledger ${mark === 'done' ? 'bg-primary' : mark === 'now' ? 'bg-graphite' : 'bg-graphite/20'}`}>
              {mark === 'now' && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
            </span>
            <p className={`text-xl font-semibold tracking-tight ${mark === 'next' ? 'text-graphite/40' : ''}`}>{title}</p>
            <p className="text-[14px] text-graphite/55">{body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-12 max-w-lg text-lg leading-relaxed text-graphite/70">
        {open
          ? 'Your business account is open. Pay suppliers, staff and bills from your dashboard.'
          : 'Your naira account is already open, so customers can pay you while we review. Sending money opens once we’ve approved the business.'}
      </p>

      <div className="mt-10 rounded-xl bg-white p-6 ring-1 ring-graphite/10">
        <p className="text-lg font-semibold tracking-tight">Get the Credvera app</p>
        <p className="mt-1 max-w-md text-[15px] text-graphite/60">Approve payments with your PIN or Face ID. Your login works there too.</p>
        <StoreButtons className="mt-5" />
      </div>

      <Link to="/business/app" className={`${primary} mt-8`}>
        Go to your dashboard <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
