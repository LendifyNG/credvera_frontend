import { AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errorMessage, usePaymentLinks, type PaymentLinkDto } from '../api';
import { useSession } from './data';
import { amount, byCurrency, Made, NewRequest, RequestDetail, StatusPill, valueOf, whenText } from './requests';
import { shortDate } from './model';
import { Loading } from './ui';

const DAY = 86400000;
const panel = 'rounded-2xl border border-graphite/10 bg-white';

const TABS = [
  ['all', 'All'],
  ['pending', 'Waiting'],
  ['paid', 'Paid'],
  ['closed', 'Expired or cancelled'],
] as const;
type Tab = (typeof TABS)[number][0];

const inTab = (tab: Tab, l: PaymentLinkDto) =>
  tab === 'all' || (tab === 'closed' ? l.status === 'expired' || l.status === 'cancelled' : l.status === tab);

/** Invoices: what customers owe, what's been paid, and the link each one pays on. */
export default function Invoices() {
  const links = usePaymentLinks();
  const session = useSession();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(params.get('new') === '1');
  const [made, setMade] = useState<PaymentLinkDto | null>(null);

  const all = useMemo(() => links.data ?? [], [links.data]);
  const waiting = all.filter((l) => l.status === 'pending');
  const paid30 = all.filter((l) => l.status === 'paid' && l.paidAt && Date.now() - new Date(l.paidAt).getTime() < 30 * DAY);
  const paidAll = all.filter((l) => l.status === 'paid' && l.paidAt);
  const avgDays = paidAll.length ? Math.round(paidAll.reduce((a, l) => a + (new Date(l.paidAt!).getTime() - new Date(l.createdAt).getTime()) / DAY, 0) / paidAll.length) : 0;

  const shown = all.filter((l) => inTab(tab, l) && (!q || `${l.invoiceName} ${l.recipient.name}`.toLowerCase().includes(q.toLowerCase())));
  const current = all.find((l) => l.reference === open);
  const value = (rows: PaymentLinkDto[]) => byCurrency(rows.map((l) => ({ currency: l.currency, value: valueOf(l) })));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Invoices</h1>
          <p className="mt-1 text-[15px] text-graphite/55">What customers owe you and what’s been paid. Each invoice has a link they pay on.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> New invoice
        </button>
      </div>

      <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-graphite/10">
        {[
          { label: 'Waiting to be paid', value: value(waiting), sub: `${waiting.length} ${waiting.length === 1 ? 'invoice' : 'invoices'}` },
          { label: 'Paid, last 30 days', value: value(paid30), sub: `${paid30.length} ${paid30.length === 1 ? 'invoice' : 'invoices'}`, tone: 'text-[#1f6b33]' },
          { label: 'Usually paid in', value: avgDays ? `${avgDays} ${avgDays === 1 ? 'day' : 'days'}` : '—', sub: 'From sending to paid' },
        ].map((s, i) => (
          <div key={s.label} className={`min-w-0 px-6 py-5 ${i ? 'border-t border-graphite/10 sm:border-t-0' : ''}`}>
            <p className="text-[13px] font-medium text-graphite/55">{s.label}</p>
            <p className={`mt-1 truncate font-ledger text-[20px] font-semibold tracking-[-0.02em] ${s.tone ?? ''}`}>{s.value}</p>
            <p className="text-[12.5px] text-graphite/45">{s.sub}</p>
          </div>
        ))}
      </section>

      <Made link={made} onClose={() => setMade(null)} />

      <section className={`${panel} mt-6`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-graphite/10 p-4">
          <div className="flex flex-wrap rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium">
            {TABS.map(([k, l]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-md px-3 py-1 ${tab === k ? 'bg-white shadow-sm' : 'text-graphite/55 hover:text-graphite'}`}>
                {l}
              </button>
            ))}
          </div>
          <label className="ml-auto flex h-9 w-full items-center gap-2 rounded-lg border border-graphite/15 px-3 focus-within:border-graphite/40 sm:w-60">
            <Search className="size-4 text-graphite/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number or customer" aria-label="Search invoices" className="w-full bg-transparent text-[14px] outline-none placeholder:text-graphite/35" />
          </label>
        </div>
        {links.isLoading ? (
          <Loading />
        ) : links.error ? (
          <p className="py-14 text-center text-[14px] text-[#9a3a17]">{errorMessage(links.error)}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                  <th className="py-3 pl-5 pr-4 font-medium">Invoice</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Issued</th>
                  <th className="py-3 pr-4 font-medium">When</th>
                  <th className="py-3 pr-4 text-right font-medium">Amount</th>
                  <th className="py-3 pr-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => (
                  <tr
                    key={l.reference}
                    tabIndex={0}
                    onClick={() => setOpen(l.reference)}
                    onKeyDown={(e) => e.key === 'Enter' && setOpen(l.reference)}
                    className="cursor-pointer border-b border-graphite/[0.06] outline-none transition-colors last:border-0 hover:bg-[#faf9f5] focus-visible:bg-[#faf9f5]"
                  >
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-4 font-medium">{l.invoiceName}</td>
                    <td className="py-3.5 pr-4">
                      <span className="block font-medium">{l.recipient.name}</span>
                      {l.recipient.email && <span className="block text-[12.5px] text-graphite/45">{l.recipient.email}</span>}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-graphite/60">{shortDate(l.createdAt)}</td>
                    <td className={`whitespace-nowrap py-3.5 pr-4 ${l.status === 'expired' ? 'font-medium text-[#9a3a17]' : 'text-graphite/60'}`}>{whenText(l)}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{amount(Number(l.amount), l.currency)}</td>
                    <td className="py-3.5 pr-5">
                      <StatusPill status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 &&
              (all.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-[15px] font-medium">No invoices yet</p>
                  <p className="mt-1 text-[14px] text-graphite/50">Make one and share its link; your customer pays by card or bank transfer.</p>
                </div>
              ) : (
                <p className="py-14 text-center text-[14px] text-graphite/50">Nothing here.</p>
              ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {current && <RequestDetail key={current.reference} link={current} onClose={() => setOpen(null)} />}
        {creating && (
          <NewRequest
            existing={all}
            to={params.get('to') ?? undefined}
            toEmail={params.get('email') ?? undefined}
            onClose={() => setCreating(false)}
            onDone={(l) => {
              setCreating(false);
              setMade(l);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
