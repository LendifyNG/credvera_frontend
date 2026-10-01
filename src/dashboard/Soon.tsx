import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

// What each part of the dashboard will hold, while it's being built.
const about: Record<string, string> = {
  bills: 'Pay electricity, airtime, data and TV for the business, with receipts kept for you.',
  'payment-links': 'Make a link for any amount; your customer pays by card or bank transfer.',
  invoices: 'Send invoices, see what’s outstanding and what’s overdue.',
  accounts: 'Your naira, dollar, pound and euro accounts, with the details to share.',
  fx: 'Today’s rates for your currencies, and alerts when a rate reaches your number.',
  cards: 'Virtual and physical cards for the team, each with its own limit.',
  team: 'Invite people, give them roles, and choose who approves payments.',
  settings: 'Your business details, security and notifications.',
  help: 'Answers, and a way to reach us.',
  'bulk-payments': 'Upload one file and pay many people at once, like salaries, each checked before it goes.',
  'scheduled-payments': 'Rent, salaries and suppliers paid on the day, every time, with approvals kept.',
  'rate-alerts': 'Tell us the rate you want, and we’ll let you know the moment it’s reached.',
  customers: 'Everyone who pays you, what they’ve paid and what they still owe.',
  suppliers: 'The businesses you pay, here and abroad, with their details kept safe.',
  'protected-orders': 'Money held until your supplier’s goods are on their way, then released.',
  'invoice-checks': 'A warning when a supplier’s bank details change on a new invoice, before you pay.',
  roles: 'Who can pay, who can approve, and above what amount a second person must agree.',
  reports: 'Statements, cash flow and reconciliation for your accountant.',
  statements: 'Official statements for any account and any dates, ready to download.',
  'cash-flow': 'Money in and money out over time, with conversions kept apart.',
  reconciliation: 'Each payment matched to the invoice or bill it settles.',
  'profit-calculator': 'What an order really earns once the rate, fees and shipping are counted.',
};

/** A part of the dashboard that isn't built yet: what it will do, and the way back. */
export default function Soon() {
  const { what = '' } = useParams();
  return <SoonPage what={what} />;
}

/**
 * The same, for a page with its own place in the sidebar whose API isn't
 * there yet. It says so rather than showing made-up records.
 */
export function SoonPage({ what }: { what: string }) {
  const name = what ? what[0]!.toUpperCase() + what.slice(1).replace(/-/g, ' ') : '';
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="text-[13px] font-medium text-graphite/45">{name}</p>
      <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">We’re building this next</h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-graphite/60">{about[what] ?? 'This part of your dashboard is on its way.'}</p>
      <Link to="/business/app" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[14px] font-semibold ring-1 ring-graphite/15 hover:ring-graphite/30">
        <ArrowLeft className="size-4" /> Back to Home
      </Link>
    </div>
  );
}
