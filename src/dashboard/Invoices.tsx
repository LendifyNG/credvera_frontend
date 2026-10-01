import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CircleCheck, Link2, Plus, Printer, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
import { CURRENCIES } from './money';
import {
  invoiceTotals,
  isOverdue,
  markInvoicePaid,
  money,
  RATES,
  saveInvoice,
  shortDate,
  updateInvoice,
  useDash,
  type Currency,
  type Invoice,
  type InvoiceItem,
} from './store';
import { usePayInAccount, useSession } from './data';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

const TABS = [
  ['all', 'All'],
  ['outstanding', 'Outstanding'],
  ['overdue', 'Overdue'],
  ['paid', 'Paid'],
  ['draft', 'Drafts'],
] as const;

type Shown = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue';
const shownStatus = (i: Invoice): Shown => (isOverdue(i) ? 'overdue' : i.status);
const PILL: Record<Shown, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'bg-[#efeee7] text-graphite/60' },
  sent: { label: 'Sent', tone: 'bg-[#e6ecf7] text-[#2b4a86]' },
  viewed: { label: 'Viewed', tone: 'bg-[#ece6f7] text-[#5a3d8f]' },
  paid: { label: 'Paid', tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
  overdue: { label: 'Overdue', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
};

/** "in 5 days", "due today", "6 days late". */
function dueText(i: Invoice) {
  if (i.status === 'paid') return i.paidOn ? `Paid ${shortDate(i.paidOn)}` : 'Paid';
  const today = new Date().setHours(0, 0, 0, 0);
  const days = Math.round((new Date(i.due).setHours(0, 0, 0, 0) - today) / DAY);
  if (days === 0) return 'Due today';
  return days > 0 ? `In ${days} ${days === 1 ? 'day' : 'days'}` : `${-days} ${days === -1 ? 'day' : 'days'} late`;
}

// The same link format as the app: pay.credvera.co/i/…
const payLink = (i: Invoice) => `https://pay.credvera.co/i/${i.number.replace('INV-', 'INV')}`;

/** The invoice as the customer receives it: on paper, in a panel from the right. */
function Paper({ inv, company, onClose }: { inv: Invoice; company?: string; onClose: () => void }) {
  const address = useDash().profile.address;
  const payIn = usePayInAccount(inv.currency);
  const { subtotal, vat, total } = invoiceTotals(inv);
  const [note, setNote] = useState<string | null>(null);
  const status = shownStatus(inv);
  const say = (t: string) => {
    setNote(t);
    window.setTimeout(() => setNote(null), 2400);
  };
  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={inv.number}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-xl flex-col bg-[#f5f4ef] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite/10 bg-white px-6 py-4">
          <p className="flex items-center gap-3 text-[15px] font-semibold">
            {inv.number} <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${PILL[status].tone}`}>{PILL[status].label}</span>
          </p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* The paper */}
          <article className="rounded-sm bg-white p-8 text-[13.5px] shadow-[0_1px_2px_rgba(20,28,23,0.08),0_12px_32px_-16px_rgba(20,28,23,0.25)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <img src={logoDark} alt="Credvera" className="h-5 w-auto opacity-80" />
                <p className="mt-4 text-[15px] font-semibold">{company}</p>
                <p className="text-graphite/50">{address}</p>
              </div>
              <div className="text-right">
                <p className="text-[22px] font-semibold tracking-[-0.02em]">Invoice</p>
                <p className="text-graphite/55">{inv.number}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[12px] text-graphite/45">Billed to</p>
                <p className="mt-0.5 font-medium">{inv.customer}</p>
                <p className="text-graphite/55">{inv.email}</p>
              </div>
              <div>
                <p className="text-[12px] text-graphite/45">Issued</p>
                <p className="mt-0.5 font-medium">{shortDate(inv.issued)}</p>
              </div>
              <div>
                <p className="text-[12px] text-graphite/45">Due</p>
                <p className="mt-0.5 font-medium">{shortDate(inv.due)}</p>
              </div>
            </div>

            <table className="mt-8 w-full">
              <thead>
                <tr className="border-b border-graphite/15 text-left text-[12px] text-graphite/45">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Price</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((it, n) => (
                  <tr key={n} className="border-b border-graphite/[0.07]">
                    <td className="py-2.5">{it.desc}</td>
                    <td className="py-2.5 text-right font-ledger">{it.qty}</td>
                    <td className="py-2.5 text-right font-ledger">{money(it.price, inv.currency)}</td>
                    <td className="py-2.5 text-right font-ledger">{money(it.qty * it.price, inv.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="ml-auto mt-4 w-64 space-y-1.5">
              <div className="flex justify-between text-graphite/60">
                <dt>Subtotal</dt>
                <dd className="font-ledger">{money(subtotal, inv.currency)}</dd>
              </div>
              {inv.vat && (
                <div className="flex justify-between text-graphite/60">
                  <dt>VAT 7.5%</dt>
                  <dd className="font-ledger">{money(vat, inv.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-graphite/15 pt-2 text-[15px] font-semibold">
                <dt>Total</dt>
                <dd className="font-ledger">{money(total, inv.currency)}</dd>
              </div>
            </dl>

            <div className="mt-8 rounded-lg bg-[#f5f4ef] p-4">
              <p className="font-semibold">How to pay</p>
              <p className="mt-1 text-graphite/60">
                Pay online at <span className="font-medium text-graphite">{payLink(inv).replace('https://', '')}</span>
                {payIn.ready && payIn.account ? `, or transfer to ${payIn.account.accountName}, account ${payIn.account.accountNumber}, ${payIn.account.bankName}.` : '.'}
              </p>
            </div>
            {inv.note && <p className="mt-5 text-graphite/55">{inv.note}</p>}
          </article>
        </div>

        <div className="border-t border-graphite/10 bg-white px-6 py-4">
          <AnimatePresence>
            {note && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 flex items-center gap-2 text-[13.5px] font-medium text-[#1f6b33]">
                <Check className="size-4" /> {note}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex flex-wrap gap-2">
            {inv.status === 'draft' ? (
              <button
                type="button"
                onClick={() => {
                  // TODO(credvera): emailed to the customer by the API.
                  updateInvoice(inv.id, { status: 'sent', issued: new Date().toISOString() });
                  say(`Sent to ${inv.email}.`);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black"
              >
                Send it
              </button>
            ) : inv.status !== 'paid' ? (
              <>
                <button type="button" onClick={() => say(`Reminder sent to ${inv.email}.`)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
                  <Bell className="size-4" /> Send a reminder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markInvoicePaid(inv.id);
                    say('Marked as paid, and added to your money in.');
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30"
                >
                  <CircleCheck className="size-4" /> Mark as paid
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(payLink(inv)).catch(() => {});
                say('Payment link copied.');
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30"
            >
              <Link2 className="size-4" /> Copy link
            </button>
            <button type="button" onClick={() => window.print()} className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold text-graphite/65 hover:bg-graphite/5">
              <Printer className="size-4" /> Print
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/** A new invoice, with its total worked out as you type. */
function NewInvoice({ onClose, onDone, to, toEmail }: { onClose: () => void; onDone: (i: Invoice) => void; to?: string; toEmail?: string }) {
  const [customer, setCustomer] = useState(to ?? '');
  const [email, setEmail] = useState(toEmail ?? '');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [days, setDays] = useState(14);
  const [items, setItems] = useState<InvoiceItem[]>([{ desc: '', qty: 1, price: 0 }]);
  const [vat, setVat] = useState(false);
  const [note, setNote] = useState('');
  const { subtotal, vat: tax, total } = invoiceTotals({ items, vat });
  const ready = customer.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && items.some((i) => i.desc.trim() && i.qty > 0 && i.price > 0);
  const setItem = (n: number, change: Partial<InvoiceItem>) => setItems((xs) => xs.map((x, i) => (i === n ? { ...x, ...change } : x)));

  const save = (status: 'draft' | 'sent') => {
    const due = new Date(Date.now() + days * DAY).toISOString();
    onDone(
      saveInvoice({
        customer: customer.trim(),
        email: email.trim(),
        currency,
        items: items.filter((i) => i.desc.trim() && i.price > 0),
        vat,
        issued: new Date().toISOString(),
        due,
        status,
        note: note.trim() || undefined,
      }),
    );
  };

  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="New invoice"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
          <p className="text-[15px] font-semibold">New invoice</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Customer</span>
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Business or person" className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Their email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="accounts@company.com" className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Currency</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={field}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Due in</span>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={field}>
                {[7, 14, 30, 60].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Items</span>
            <div className="space-y-2">
              {items.map((it, n) => (
                <div key={n} className="grid grid-cols-[1fr_64px_120px_32px] gap-2">
                  <input value={it.desc} onChange={(e) => setItem(n, { desc: e.target.value })} placeholder="What it’s for" className={field} aria-label="Item" />
                  <input inputMode="numeric" value={it.qty || ''} onChange={(e) => setItem(n, { qty: Number(e.target.value.replace(/\D/g, '')) || 0 })} className={`${field} px-2 text-center font-ledger`} aria-label="Quantity" />
                  <input inputMode="decimal" value={it.price || ''} onChange={(e) => setItem(n, { price: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} placeholder="Price" className={`${field} font-ledger`} aria-label="Price" />
                  <button type="button" disabled={items.length === 1} onClick={() => setItems((xs) => xs.filter((_, i) => i !== n))} aria-label="Remove item" className="grid place-items-center text-graphite/40 hover:text-[#9a3a17] disabled:opacity-30">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setItems((xs) => [...xs, { desc: '', qty: 1, price: 0 }])} className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-graphite/65 hover:text-graphite">
              <Plus className="size-4" /> Add an item
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-[14px]">
            <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} className="size-4 accent-[#141c17]" />
            Add VAT at 7.5%
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">A note for them (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Thank you for your business." className={field} />
          </label>

          <dl className="space-y-1.5 rounded-lg bg-[#f5f4ef] p-4 text-[14px]">
            <div className="flex justify-between text-graphite/60">
              <dt>Subtotal</dt>
              <dd className="font-ledger">{money(subtotal, currency)}</dd>
            </div>
            {vat && (
              <div className="flex justify-between text-graphite/60">
                <dt>VAT 7.5%</dt>
                <dd className="font-ledger">{money(tax, currency)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd className="font-ledger">{money(total, currency)}</dd>
            </div>
          </dl>
        </div>
        <div className="flex gap-2 border-t border-graphite/10 px-6 py-5">
          <button type="button" disabled={!ready} onClick={() => save('draft')} className="h-11 flex-1 rounded-lg border border-graphite/15 text-[15px] font-semibold hover:border-graphite/30 disabled:opacity-40">
            Save as draft
          </button>
          <button type="button" disabled={!ready} onClick={() => save('sent')} className="h-11 flex-1 rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
            Send it
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/** Invoices: what customers owe, what's late, and what's been paid. */
export default function Invoices() {
  const { invoices } = useDash();
  const session = useSession();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>((params.get('f') as (typeof TABS)[number][0] | null) ?? 'all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(params.get('new') === '1');
  const [done, setDone] = useState<string | null>(null);

  const ngn = (i: Invoice) => invoiceTotals(i).total * RATES[i.currency];
  const outstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'viewed');
  const overdue = outstanding.filter(isOverdue);
  const paid30 = invoices.filter((i) => i.status === 'paid' && i.paidOn && Date.now() - new Date(i.paidOn).getTime() < 30 * DAY);
  const paidAll = invoices.filter((i) => i.status === 'paid' && i.paidOn);
  const avgDays = paidAll.length ? Math.round(paidAll.reduce((a, i) => a + (new Date(i.paidOn!).getTime() - new Date(i.issued).getTime()) / DAY, 0) / paidAll.length) : 0;

  const shown = useMemo(
    () =>
      invoices.filter((i) => {
        if (tab === 'outstanding' && !(i.status === 'sent' || i.status === 'viewed')) return false;
        if (tab === 'overdue' && !isOverdue(i)) return false;
        if (tab === 'paid' && i.status !== 'paid') return false;
        if (tab === 'draft' && i.status !== 'draft') return false;
        return !q || `${i.number} ${i.customer}`.toLowerCase().includes(q.toLowerCase());
      }),
    [invoices, tab, q],
  );
  const current = invoices.find((i) => i.id === open);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Invoices</h1>
          <p className="mt-1 text-[15px] text-graphite/55">What customers owe you, what’s late, and what’s been paid.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> New invoice
        </button>
      </div>

      <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Outstanding', value: money(outstanding.reduce((a, i) => a + ngn(i), 0)), sub: `${outstanding.length} invoices` },
          { label: 'Overdue', value: money(overdue.reduce((a, i) => a + ngn(i), 0)), sub: `${overdue.length} ${overdue.length === 1 ? 'invoice' : 'invoices'}`, tone: overdue.length ? 'text-[#9a3a17]' : '' },
          { label: 'Paid, last 30 days', value: money(paid30.reduce((a, i) => a + ngn(i), 0)), sub: `${paid30.length} invoices`, tone: 'text-[#1f6b33]' },
          { label: 'Usually paid in', value: avgDays ? `${avgDays} days` : '—', sub: 'From sending to paid' },
        ].map((s, i) => (
          <div key={s.label} className={`border-graphite/10 px-6 py-5 ${i ? 'border-t sm:border-t-0' : ''} ${i % 2 ? 'sm:border-l' : ''} ${i >= 2 ? 'sm:border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
            <p className="text-[13px] font-medium text-graphite/55">{s.label}</p>
            <p className={`mt-1 font-ledger text-[20px] font-semibold tracking-[-0.02em] ${s.tone ?? ''}`}>{s.value}</p>
            <p className="text-[12.5px] text-graphite/45">{s.sub}</p>
          </div>
        ))}
      </section>
      <p className="mt-2 text-[12.5px] text-graphite/45">In naira at today’s rate.</p>

      <AnimatePresence>
        {done && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex items-center gap-2 rounded-xl border border-[#cfe8c9] bg-[#eef8ea] px-4 py-3 text-[14px] font-medium text-[#1f6b33]">
            <Check className="size-4" /> {done}
          </motion.p>
        )}
      </AnimatePresence>

      <section className={`${panel} mt-6`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-graphite/10 p-4">
          <div className="flex flex-wrap rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium">
            {TABS.map(([k, l]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-md px-3 py-1 ${tab === k ? 'bg-white shadow-sm' : 'text-graphite/55 hover:text-graphite'}`}>
                {l}
                {k === 'overdue' && overdue.length ? <span className="ml-1.5 rounded bg-[#f6d9cc] px-1.5 text-[11px] font-semibold text-[#9a3a17]">{overdue.length}</span> : null}
              </button>
            ))}
          </div>
          <label className="ml-auto flex h-9 w-full items-center gap-2 rounded-lg border border-graphite/15 px-3 focus-within:border-graphite/40 sm:w-60">
            <Search className="size-4 text-graphite/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number or customer" aria-label="Search invoices" className="w-full bg-transparent text-[14px] outline-none placeholder:text-graphite/35" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                <th className="py-3 pl-5 pr-4 font-medium">Invoice</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Issued</th>
                <th className="py-3 pr-4 font-medium">Due</th>
                <th className="py-3 pr-4 text-right font-medium">Amount</th>
                <th className="py-3 pr-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => {
                const st = shownStatus(i);
                return (
                  <tr
                    key={i.id}
                    tabIndex={0}
                    onClick={() => setOpen(i.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setOpen(i.id)}
                    className="cursor-pointer border-b border-graphite/[0.06] outline-none transition-colors last:border-0 hover:bg-[#faf9f5] focus-visible:bg-[#faf9f5]"
                  >
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-4 font-medium">{i.number}</td>
                    <td className="py-3.5 pr-4">
                      <span className="block font-medium">{i.customer}</span>
                      <span className="block text-[12.5px] text-graphite/45">{i.email}</span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-graphite/60">{shortDate(i.issued)}</td>
                    <td className={`whitespace-nowrap py-3.5 pr-4 ${st === 'overdue' ? 'font-medium text-[#9a3a17]' : 'text-graphite/60'}`}>{i.status === 'draft' ? '—' : dueText(i)}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{money(invoiceTotals(i).total, i.currency)}</td>
                    <td className="py-3.5 pr-5">
                      <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${PILL[st].tone}`}>{PILL[st].label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shown.length === 0 && <p className="py-14 text-center text-[14px] text-graphite/50">Nothing here.</p>}
        </div>
      </section>

      <AnimatePresence>
        {current && <Paper key={current.id} inv={current} company={session?.business} onClose={() => setOpen(null)} />}
        {creating && (
          <NewInvoice
            to={params.get('to') ?? undefined}
            toEmail={params.get('email') ?? undefined}
            onClose={() => setCreating(false)}
            onDone={(i) => {
              setCreating(false);
              setDone(i.status === 'draft' ? `${i.number} saved as a draft.` : `${i.number} sent to ${i.email}.`);
              window.setTimeout(() => setDone(null), 4000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
