import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';

type Kind = 'in' | 'out';
type Row = { date: string; who: string; what: string; amount: string; kind: Kind; waiting?: boolean };

// An example month for the example business.
const rows: Row[] = [
  { date: '26 Sep', who: 'Kemi Adeyemi', what: 'Salary · Zenith Bank', amount: '₦650,000.00', kind: 'out', waiting: true },
  { date: '26 Sep', who: 'Lekki Grill', what: 'INV-0143 · bank transfer', amount: '₦420,000.00', kind: 'in' },
  { date: '25 Sep', who: 'Müller Verpackung GmbH', what: 'Supplier · Germany', amount: '€2,300.00', kind: 'out' },
  { date: '24 Sep', who: 'Ikeja Electric', what: 'Bill · prepaid', amount: '₦85,000.00', kind: 'out' },
  { date: '23 Sep', who: 'Northwind Retail', what: 'Payment link · card', amount: '$3,200.00', kind: 'in' },
  { date: '22 Sep', who: 'Chinedu Logistics', what: 'Delivery · GTBank', amount: '₦240,000.00', kind: 'out' },
  { date: '21 Sep', who: 'Oak & Iron Studio', what: 'INV-0138 · card', amount: '₦180,000.00', kind: 'in' },
];

const filters = ['All', 'Money in', 'Money out', 'Waiting'] as const;

/** Every payment in one list: filter it, search it, the way the app does. */
export default function PaymentLedger() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [q, setQ] = useState('');

  const shown = rows.filter((r) => {
    if (filter === 'Money in' && r.kind !== 'in') return false;
    if (filter === 'Money out' && r.kind !== 'out') return false;
    if (filter === 'Waiting' && !r.waiting) return false;
    return !q || `${r.who} ${r.what} ${r.amount}`.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                f === filter ? 'bg-graphite text-white' : 'text-graphite/60 hover:bg-graphite/5 hover:text-graphite'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="flex w-full items-center gap-2 border-b border-graphite/20 pb-1.5 sm:w-64">
          <Search className="size-4 text-graphite/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a name or amount"
            aria-label="Search payments"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-graphite/35"
          />
        </label>
      </div>

      <ul className="min-h-[392px]">
        <AnimatePresence initial={false}>
          {shown.map((r) => (
            <motion.li
              key={r.who + r.date}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 border-b border-graphite/[0.08] py-4 sm:grid-cols-[5rem_1fr_auto_6.5rem]"
            >
              <span className="font-ledger text-[12px] text-graphite/45">{r.date}</span>
              <span className="min-w-0">
                <span className="block text-[15px] font-medium leading-snug">{r.who}</span>
                <span className="block text-[13px] leading-snug text-graphite/50">{r.what}</span>
              </span>
              <span className={`text-right font-ledger text-[14px] tabular-nums ${r.kind === 'in' ? 'text-[#1f6b33]' : ''}`}>
                {r.kind === 'in' ? '+' : '−'}
                {r.amount}
              </span>
              <span className="hidden text-right font-medium text-[13px] text-graphite/45 sm:block">
                {r.waiting ? <span className="text-[#8a5a12]">Waiting</span> : r.kind === 'in' ? 'Received' : 'Paid'}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        {shown.length === 0 && <li className="py-10 text-center text-[14px] text-graphite/45">Nothing matches “{q}”.</li>}
      </ul>
    </div>
  );
}
