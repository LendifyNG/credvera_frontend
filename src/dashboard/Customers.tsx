import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Link2, Mail, Phone, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addContact, invoiceTotals, isOverdue, money, RATES, shortDate, useDash, type Invoice, type Payment } from './store';

const ease = [0.16, 1, 0.3, 1] as const;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

type Customer = {
  name: string;
  email?: string;
  phone?: string;
  paid: number; // in naira terms
  owes: number;
  overdue: number;
  lastPaid?: string;
  how: string[];
  invoices: Invoice[];
  payments: Payment[];
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

/** Everyone who pays the business, put together from invoices, payments and the customers added by hand. */
function useCustomers(): Customer[] {
  const { invoices, payments, contacts } = useDash();
  return useMemo(() => {
    const map = new Map<string, Customer>();
    const get = (name: string) => {
      if (!map.has(name)) map.set(name, { name, paid: 0, owes: 0, overdue: 0, how: [], invoices: [], payments: [] });
      return map.get(name)!;
    };
    for (const c of contacts) Object.assign(get(c.name), { email: c.email, phone: c.phone });
    for (const i of invoices) {
      const c = get(i.customer);
      c.email ??= i.email;
      c.invoices.push(i);
      if (i.status === 'sent' || i.status === 'viewed') {
        const t = invoiceTotals(i).total * RATES[i.currency];
        c.owes += t;
        if (isOverdue(i)) c.overdue += t;
      }
    }
    for (const p of payments) {
      if (p.kind !== 'in' || p.internal || p.status !== 'received') continue;
      const c = get(p.who);
      c.payments.push(p);
      c.paid += p.amount * RATES[p.currency];
      if (!c.lastPaid || p.date > c.lastPaid) c.lastPaid = p.date;
      const how = /payment link/i.test(p.what) ? 'Payment link' : /INV-/.test(p.what) ? 'Invoice' : 'Transfer';
      if (!c.how.includes(how)) c.how.push(how);
    }
    return [...map.values()].sort((a, b) => b.paid + b.owes - (a.paid + a.owes));
  }, [invoices, payments, contacts]);
}

/** Customers: who pays you, what they've paid, and what they still owe. */
export default function Customers() {
  const { session } = useDash();
  const customers = useCustomers();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const shown = customers.filter((c) => !q || `${c.name} ${c.email ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  const owed = customers.reduce((a, c) => a + c.owes, 0);
  const top = customers.reduce<Customer | null>((a, c) => (!a || c.paid > a.paid ? c : a), null);
  const current = customers.find((c) => c.name === open);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Customers</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Everyone who pays you, what they’ve paid, and what they still owe.</p>
        </div>
        <button type="button" onClick={() => setAdding(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> Add a customer
        </button>
      </div>

      <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-graphite/10">
        {[
          { label: 'Customers', value: String(customers.length) },
          { label: 'Owed to you', value: money(owed), tone: '' },
          { label: 'Pays you the most', value: top?.name ?? '—', sub: top ? money(top.paid) : '' },
        ].map((s, i) => (
          <div key={s.label} className={`min-w-0 px-6 py-5 ${i ? 'border-t border-graphite/10 sm:border-t-0' : ''}`}>
            <p className="text-[13px] font-medium text-graphite/55">{s.label}</p>
            <p className={`mt-1 truncate ${i === 2 ? 'text-[17px]' : 'font-ledger text-[22px]'} font-semibold tracking-[-0.02em]`}>{s.value}</p>
            {s.sub && <p className="font-ledger text-[12.5px] text-graphite/50">{s.sub} paid in total</p>}
          </div>
        ))}
      </section>

      <section className={`${panel} mt-6`}>
        <div className="flex items-center gap-3 border-b border-graphite/10 p-4">
          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-graphite/15 px-3 focus-within:border-graphite/40 sm:w-72">
            <Search className="size-4 text-graphite/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" aria-label="Search customers" className="w-full bg-transparent text-[14px] outline-none placeholder:text-graphite/35" />
          </label>
          <p className="ml-auto hidden text-[12.5px] text-graphite/45 sm:block">Amounts in naira at today’s rate</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                <th className="py-3 pl-5 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 text-right font-medium">Paid you</th>
                <th className="py-3 pr-4 text-right font-medium">Owes you</th>
                <th className="py-3 pr-4 font-medium">Last paid</th>
                <th className="py-3 pr-5 font-medium">Pays by</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
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
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{c.paid ? money(c.paid) : '—'}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right">
                    {c.owes ? (
                      <>
                        <span className="font-ledger font-medium">{money(c.owes)}</span>
                        {c.overdue > 0 && <span className="block text-[12px] font-medium text-[#9a3a17]">{money(c.overdue)} overdue</span>}
                      </>
                    ) : (
                      <span className="text-graphite/40">Nothing</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-graphite/60">{c.lastPaid ? shortDate(c.lastPaid) : '—'}</td>
                  <td className="py-3.5 pr-5">
                    <span className="flex flex-wrap gap-1">
                      {c.how.map((h) => (
                        <span key={h} className="rounded-md bg-[#efeee7] px-1.5 py-0.5 text-[11.5px] text-graphite/65">
                          {h}
                        </span>
                      ))}
                      {c.how.length === 0 && <span className="text-graphite/40">—</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="py-14 text-center text-[14px] text-graphite/50">Nobody matches.</p>}
        </div>
      </section>

      <AnimatePresence>
        {(current || adding) && (
          <motion.div
            className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(null);
              setAdding(false);
            }}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={adding ? 'Add a customer' : current!.name}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
                <p className="text-[15px] font-semibold">{adding ? 'Add a customer' : 'Customer'}</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(null);
                    setAdding(false);
                  }}
                  aria-label="Close"
                  className="text-graphite/45 hover:text-graphite"
                >
                  <X className="size-5" />
                </button>
              </div>

              {adding ? (
                <form
                  className="flex flex-1 flex-col"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (name.trim().length < 2) return;
                    addContact({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
                    setAdding(false);
                    setOpen(name.trim());
                    setName('');
                    setEmail('');
                    setPhone('');
                  }}
                >
                  <div className="flex-1 space-y-5 px-6 py-6">
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Name</span>
                      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Business or person" className={field} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Email</span>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For invoices and receipts" className={field} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Phone</span>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For payment links on WhatsApp" className={field} />
                    </label>
                  </div>
                  <div className="border-t border-graphite/10 px-6 py-5">
                    <button type="submit" disabled={name.trim().length < 2} className="h-11 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
                      Add them
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-[#efeee7] text-[14px] font-semibold">{initials(current!.name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[17px] font-semibold">{current!.name}</p>
                      <p className="flex flex-wrap gap-x-3 text-[13px] text-graphite/55">
                        {current!.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3.5" /> {current!.email}
                          </span>
                        )}
                        {current!.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3.5" /> {current!.phone}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f5f4ef] p-4">
                      <p className="text-[12.5px] text-graphite/55">Paid you</p>
                      <p className="mt-0.5 font-ledger text-[18px] font-semibold text-[#1f6b33]">{money(current!.paid)}</p>
                    </div>
                    <div className="rounded-xl bg-[#f5f4ef] p-4">
                      <p className="text-[12.5px] text-graphite/55">Owes you</p>
                      <p className={`mt-0.5 font-ledger text-[18px] font-semibold ${current!.overdue ? 'text-[#9a3a17]' : ''}`}>{money(current!.owes)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/business/app/invoices?new=1&to=${encodeURIComponent(current!.name)}${current!.email ? `&email=${encodeURIComponent(current!.email)}` : ''}`}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-graphite text-[14px] font-semibold text-white hover:bg-black"
                    >
                      <FileText className="size-4" /> New invoice
                    </Link>
                    <Link to="/business/app/links" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-graphite/15 text-[14px] font-semibold hover:border-graphite/30">
                      <Link2 className="size-4" /> Payment link
                    </Link>
                  </div>

                  <p className="mt-8 text-[14px] font-semibold">Invoices</p>
                  <ul className="mt-2 divide-y divide-graphite/[0.07]">
                    {current!.invoices.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                        <span>
                          <span className="block font-medium">{i.number}</span>
                          <span className={`block text-[12.5px] ${isOverdue(i) ? 'text-[#9a3a17]' : 'text-graphite/50'}`}>
                            {i.status === 'paid' ? 'Paid' : isOverdue(i) ? 'Overdue' : i.status === 'draft' ? 'Draft' : `Due ${shortDate(i.due)}`}
                          </span>
                        </span>
                        <span className="font-ledger font-medium">{money(invoiceTotals(i).total, i.currency)}</span>
                      </li>
                    ))}
                    {current!.invoices.length === 0 && <li className="py-4 text-[14px] text-graphite/50">No invoices yet.</li>}
                  </ul>

                  <p className="mt-7 text-[14px] font-semibold">Payments</p>
                  <ul className="mt-2 divide-y divide-graphite/[0.07]">
                    {current!.payments.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                        <span>
                          <span className="block font-medium">{p.what.split(' · ')[0]}</span>
                          <span className="block text-[12.5px] text-graphite/50">{shortDate(p.date)}</span>
                        </span>
                        <span className="font-ledger font-medium text-[#1f6b33]">+{money(p.amount, p.currency)}</span>
                      </li>
                    ))}
                    {current!.payments.length === 0 && <li className="py-4 text-[14px] text-graphite/50">Nothing paid yet.</li>}
                  </ul>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
