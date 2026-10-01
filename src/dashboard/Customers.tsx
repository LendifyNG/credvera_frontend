import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Mail, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, usePaymentLinks, type PaymentLinkDto } from '../api';
import { usePayments, useSession } from './data';
import { amount, byCurrency, StatusPill, valueOf, whenText } from './requests';
import { money, shortDate, type Payment } from './model';
import { Loading } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const panel = 'rounded-2xl border border-graphite/10 bg-white';

type Customer = {
  name: string;
  email?: string;
  requests: PaymentLinkDto[];
  /** Transfers in from them that weren't through an invoice link. */
  transfers: Payment[];
  lastPaid?: string;
};

const initials = (name: string) =>
  name
    .replace(/[^\p{L}\s&]/gu, '')
    .split(/\s+/)
    .filter((w) => w && w !== '&')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Payers the bank told us nothing about can't be put to a customer. */
const UNNAMED = new Set(['Bank transfer', 'Test credit']);

const paidOf = (c: Customer) => [
  ...c.requests.filter((l) => l.status === 'paid').map((l) => ({ currency: l.currency, value: valueOf(l) })),
  ...c.transfers.map((p) => ({ currency: p.currency, value: p.amount })),
];
const owedOf = (c: Customer) => c.requests.filter((l) => l.status === 'pending').map((l) => ({ currency: l.currency, value: valueOf(l) }));

/**
 * Everyone who pays the business: the people it has invoiced, and the people
 * whose transfers came in under their own name. Matched by name, ignoring case.
 */
function useCustomers() {
  const links = usePaymentLinks();
  const { payments } = usePayments();

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    const get = (name: string) => {
      const key = name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, { name: name.trim(), requests: [], transfers: [] });
      return map.get(key)!;
    };
    const seen = (c: Customer, date: string) => {
      if (!c.lastPaid || date > c.lastPaid) c.lastPaid = date;
    };

    for (const l of links.data ?? []) {
      const c = get(l.recipient.name);
      c.email ??= l.recipient.email ?? undefined;
      c.requests.push(l);
      if (l.status === 'paid' && l.paidAt) seen(c, l.paidAt);
    }
    for (const p of payments) {
      // Invoice payments are already counted through their invoice.
      if (p.kind !== 'in' || p.status !== 'received' || p.what === 'Payment link' || UNNAMED.has(p.who)) continue;
      const c = get(p.who);
      c.transfers.push(p);
      seen(c, p.date);
    }
    return [...map.values()].sort((a, b) => (b.lastPaid ?? '').localeCompare(a.lastPaid ?? '') || a.name.localeCompare(b.name));
  }, [links.data, payments]);

  return { customers, isLoading: links.isLoading, error: links.error };
}

/** Customers: who pays you, what they've paid, and what they still owe. */
export default function Customers() {
  const session = useSession();
  const { customers, isLoading, error } = useCustomers();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const shown = customers.filter((c) => !q || `${c.name} ${c.email ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  const owing = customers.filter((c) => owedOf(c).length > 0);
  const current = customers.find((c) => c.name === open);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Customers</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Everyone who pays you, what they’ve paid, and what they still owe.</p>
        </div>
        <Link to="/business/app/invoices?new=1" className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> New invoice
        </Link>
      </div>

      <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-graphite/10">
        {[
          { label: 'Customers', value: String(customers.length) },
          { label: 'Owed to you', value: byCurrency(customers.flatMap(owedOf)) },
          { label: 'Customers who owe you', value: String(owing.length) },
        ].map((s, i) => (
          <div key={s.label} className={`min-w-0 px-6 py-5 ${i ? 'border-t border-graphite/10 sm:border-t-0' : ''}`}>
            <p className="text-[13px] font-medium text-graphite/55">{s.label}</p>
            <p className="mt-1 truncate font-ledger text-[22px] font-semibold tracking-[-0.02em]">{s.value}</p>
          </div>
        ))}
      </section>

      <section className={`${panel} mt-6`}>
        <div className="flex items-center gap-3 border-b border-graphite/10 p-4">
          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-graphite/15 px-3 focus-within:border-graphite/40 sm:w-72">
            <Search className="size-4 text-graphite/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" aria-label="Search customers" className="w-full bg-transparent text-[14px] outline-none placeholder:text-graphite/35" />
          </label>
        </div>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <p className="py-14 text-center text-[14px] text-[#9a3a17]">{errorMessage(error)}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                  <th className="py-3 pl-5 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 text-right font-medium">Paid you</th>
                  <th className="py-3 pr-4 text-right font-medium">Owes you</th>
                  <th className="py-3 pr-4 font-medium">Last paid</th>
                  <th className="py-3 pr-5 text-right font-medium">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => {
                  const paid = paidOf(c);
                  const owed = owedOf(c);
                  return (
                    <tr
                      key={c.name}
                      tabIndex={0}
                      onClick={() => setOpen(c.name)}
                      onKeyDown={(e) => e.key === 'Enter' && setOpen(c.name)}
                      className="cursor-pointer border-b border-graphite/[0.06] outline-none transition-colors last:border-0 hover:bg-[#faf9f5] focus-visible:bg-[#faf9f5]"
                    >
                      <td className="py-3.5 pl-5 pr-4">
                        <span className="flex items-center gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[11.5px] font-semibold">{initials(c.name)}</span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{c.name}</span>
                            <span className="block truncate text-[12.5px] text-graphite/45">{c.email ?? '—'}</span>
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{paid.length ? byCurrency(paid) : '—'}</td>
                      <td className="whitespace-nowrap py-3.5 pr-4 text-right">{owed.length ? <span className="font-ledger font-medium">{byCurrency(owed)}</span> : <span className="text-graphite/40">Nothing</span>}</td>
                      <td className="whitespace-nowrap py-3.5 pr-4 text-graphite/60">{c.lastPaid ? shortDate(c.lastPaid) : '—'}</td>
                      <td className="py-3.5 pr-5 text-right text-graphite/60">{c.requests.length || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {shown.length === 0 &&
              (customers.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-[15px] font-medium">No customers yet</p>
                  <p className="mt-1 text-[14px] text-graphite/50">They appear here once you invoice them, or once their transfers come in.</p>
                </div>
              ) : (
                <p className="py-14 text-center text-[14px] text-graphite/50">Nobody matches.</p>
              ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {current && (
          <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={current.name}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
                <p className="text-[15px] font-semibold">Customer</p>
                <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="text-graphite/45 hover:text-graphite">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-[#efeee7] text-[14px] font-semibold">{initials(current.name)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-semibold">{current.name}</p>
                    {current.email && (
                      <p className="flex items-center gap-1 text-[13px] text-graphite/55">
                        <Mail className="size-3.5" /> {current.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#f5f4ef] p-4">
                    <p className="text-[12.5px] text-graphite/55">Paid you</p>
                    <p className="mt-0.5 font-ledger text-[16px] font-semibold text-[#1f6b33]">{byCurrency(paidOf(current))}</p>
                  </div>
                  <div className="rounded-xl bg-[#f5f4ef] p-4">
                    <p className="text-[12.5px] text-graphite/55">Owes you</p>
                    <p className="mt-0.5 font-ledger text-[16px] font-semibold">{byCurrency(owedOf(current))}</p>
                  </div>
                </div>

                <Link
                  to={`/business/app/invoices?new=1&to=${encodeURIComponent(current.name)}${current.email ? `&email=${encodeURIComponent(current.email)}` : ''}`}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-graphite text-[14px] font-semibold text-white hover:bg-black"
                >
                  <FileText className="size-4" /> New invoice
                </Link>

                <p className="mt-8 text-[14px] font-semibold">Invoices</p>
                <ul className="mt-2 divide-y divide-graphite/[0.07]">
                  {current.requests.map((l) => (
                    <li key={l.reference} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                      <span>
                        <span className="block font-medium">{l.invoiceName}</span>
                        <span className="block text-[12.5px] text-graphite/50">{whenText(l)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-ledger font-medium">{amount(Number(l.amount), l.currency)}</span>
                        <StatusPill status={l.status} />
                      </span>
                    </li>
                  ))}
                  {current.requests.length === 0 && <li className="py-4 text-[14px] text-graphite/50">No invoices yet.</li>}
                </ul>

                <p className="mt-7 text-[14px] font-semibold">Transfers in</p>
                <ul className="mt-2 divide-y divide-graphite/[0.07]">
                  {current.transfers.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                      <span className="text-graphite/60">{shortDate(p.date)}</span>
                      <span className="font-ledger font-medium text-[#1f6b33]">+{money(p.amount, p.currency)}</span>
                    </li>
                  ))}
                  {current.transfers.length === 0 && <li className="py-4 text-[14px] text-graphite/50">None outside invoices.</li>}
                </ul>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
