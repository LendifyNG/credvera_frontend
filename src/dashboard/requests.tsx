import { AnimatePresence, motion } from 'framer-motion';
import { Ban, Check, Copy, ExternalLink, Plus, Printer, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
  errorMessage,
  useCancelPaymentLink,
  useCreatePaymentLink,
  usePaymentLinkCurrencies,
  type PaymentLinkDto,
  type PaymentLinkStatus,
} from '../api';
import logoDark from '../assets/logo-dark.png';
import { useActiveBusiness, useBalances, usePayInAccount, useSession } from './data';
import { CURRENCIES } from './money';
import { money, shortDate, type Currency } from './model';

// Payment requests, as Invoices, Payment links and Customers all show them:
// one record from the API, an invoice with a link the customer pays through.

const ease = [0.16, 1, 0.3, 1] as const;
export const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

const VAT_RATE = 0.075;
const VAT_LINE = 'VAT (7.5%)';

export const PILL: Record<PaymentLinkStatus, { label: string; tone: string }> = {
  pending: { label: 'Waiting', tone: 'bg-[#e6ecf7] text-[#2b4a86]' },
  paid: { label: 'Paid', tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
  expired: { label: 'Expired', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
  cancelled: { label: 'Cancelled', tone: 'bg-[#efeee7] text-graphite/60' },
};

export function StatusPill({ status }: { status: PaymentLinkStatus }) {
  return <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${PILL[status].tone}`}>{PILL[status].label}</span>;
}

/** What a request is worth: what was paid once it's paid, else what was asked. */
export const valueOf = (l: PaymentLinkDto) => Number(l.status === 'paid' ? (l.paidAmount ?? l.amount) : l.amount);

/** Formats in the request's currency; the API only offers the dashboard's four. */
export const amount = (n: number, currency: string) => money(n, currency as Currency);

/**
 * Totals kept apart by currency, e.g. "₦930,000.00 · £1,200.00". Nothing is
 * converted: a rate made up here would put a wrong number on the screen.
 */
export function byCurrency(rows: { currency: string; value: number }[]): string {
  const sums = new Map<string, number>();
  for (const r of rows) sums.set(r.currency, (sums.get(r.currency) ?? 0) + r.value);
  if (sums.size === 0) return amount(0, 'NGN');
  return [...sums].map(([c, v]) => amount(v, c)).join(' · ');
}

/** "Pay by 12 Nov", "Expired 3 Nov", "Paid 1 Nov". */
export function whenText(l: PaymentLinkDto) {
  if (l.status === 'paid') return l.paidAt ? `Paid ${shortDate(l.paidAt)}` : 'Paid';
  if (l.status === 'cancelled') return '—';
  if (!l.expiresAt) return '—';
  return `${l.status === 'expired' ? 'Expired' : 'Pay by'} ${shortDate(l.expiresAt)}`;
}

export function CopyLink({ url, big = false }: { url: string; big?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(url).catch(() => {});
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      className={
        big
          ? 'inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black'
          : 'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-graphite/60 hover:bg-graphite/5 hover:text-graphite'
      }
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />} {done ? 'Copied' : big ? 'Copy link' : 'Copy'}
    </button>
  );
}

function Drawer({ label, wide = false, tint = false, onClose, children, footer }: { label: string; wide?: boolean; tint?: boolean; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className={`ml-auto flex h-full w-full flex-col shadow-2xl ${wide ? 'max-w-xl' : 'max-w-md'} ${tint ? 'bg-[#f5f4ef]' : 'bg-white'}`}
      >
        <div className="flex items-center justify-between border-b border-graphite/10 bg-white px-6 py-4">
          <p className="flex items-center gap-3 text-[15px] font-semibold">{label}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="border-t border-graphite/10 bg-white px-6 py-4">{footer}</div>}
      </motion.aside>
    </motion.div>
  );
}

type Line = { description: string; quantity: number; rate: number };

/** The next free number in the INV-0001 series. */
function nextNumber(existing: PaymentLinkDto[]) {
  const taken = new Set(existing.map((l) => l.invoiceName));
  for (let n = existing.length + 1; ; n++) {
    const name = `INV-${String(n).padStart(4, '0')}`;
    if (!taken.has(name)) return name;
  }
}

/**
 * A new payment request: who pays, for what, and how much. Creating it gives
 * the link to share; the customer pays on it by card or bank transfer.
 */
export function NewRequest({ existing, to, toEmail, onClose, onDone }: { existing: PaymentLinkDto[]; to?: string; toEmail?: string; onClose: () => void; onDone: (l: PaymentLinkDto) => void }) {
  const create = useCreatePaymentLink();
  const supported = usePaymentLinkCurrencies();
  const { wallets } = useBalances();
  // Only currencies the business has an account in: that's where the money lands.
  const currencies = CURRENCIES.filter((c) => wallets[c.code] && (supported.data ?? ['NGN']).includes(c.code));

  const [number, setNumber] = useState(() => nextNumber(existing));
  const [customer, setCustomer] = useState(to ?? '');
  const [email, setEmail] = useState(toEmail ?? '');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [lines, setLines] = useState<Line[]>([{ description: '', quantity: 1, rate: 0 }]);
  const [vat, setVat] = useState(false);
  const [note, setNote] = useState('');

  const filled = lines.filter((l) => l.description.trim() && l.quantity > 0 && l.rate > 0);
  const subtotal = filled.reduce((a, l) => a + l.quantity * l.rate, 0);
  const tax = vat ? Math.round(subtotal * VAT_RATE * 100) / 100 : 0;
  const ready = number.trim() && customer.trim().length > 1 && (!email.trim() || /\S+@\S+\.\S+/.test(email)) && filled.length > 0 && !create.isPending;
  const setLine = (n: number, change: Partial<Line>) => setLines((xs) => xs.map((x, i) => (i === n ? { ...x, ...change } : x)));

  const submit = () =>
    create.mutate(
      {
        invoiceName: number.trim(),
        currency,
        recipientName: customer.trim(),
        recipientEmail: email.trim() || undefined,
        note: note.trim() || undefined,
        // VAT goes on as its own line, so the customer sees it and the total adds up.
        items: [...filled.map((l) => ({ description: l.description.trim(), quantity: l.quantity, rate: l.rate })), ...(tax ? [{ description: VAT_LINE, quantity: 1, rate: tax }] : [])],
      },
      { onSuccess: onDone },
    );

  return (
    <Drawer
      label="New payment request"
      wide
      onClose={onClose}
      footer={
        <>
          {create.error && <p className="mb-3 text-[13.5px] text-[#9a3a17]">{errorMessage(create.error)}</p>}
          <button type="button" disabled={!ready} onClick={submit} className="h-11 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
            {create.isPending ? 'Creating…' : 'Create and get the link'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Customer</span>
            <input autoFocus value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Business or person" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Their email (optional)</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="accounts@company.com" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Invoice number</span>
            <input value={number} onChange={(e) => setNumber(e.target.value.slice(0, 150))} className={`${field} font-ledger`} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={field}>
              {(currencies.length ? currencies : CURRENCIES.slice(0, 1)).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Items</span>
          <div className="space-y-2">
            {lines.map((it, n) => (
              <div key={n} className="grid grid-cols-[1fr_64px_120px_32px] gap-2">
                <input value={it.description} onChange={(e) => setLine(n, { description: e.target.value })} placeholder="What it’s for" className={field} aria-label="Item" />
                <input inputMode="numeric" value={it.quantity || ''} onChange={(e) => setLine(n, { quantity: Number(e.target.value.replace(/\D/g, '')) || 0 })} className={`${field} px-2 text-center font-ledger`} aria-label="Quantity" />
                <input inputMode="decimal" value={it.rate || ''} onChange={(e) => setLine(n, { rate: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} placeholder="Price" className={`${field} font-ledger`} aria-label="Price" />
                <button type="button" disabled={lines.length === 1} onClick={() => setLines((xs) => xs.filter((_, i) => i !== n))} aria-label="Remove item" className="grid place-items-center text-graphite/40 hover:text-[#9a3a17] disabled:opacity-30">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setLines((xs) => [...xs, { description: '', quantity: 1, rate: 0 }])} className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-graphite/65 hover:text-graphite">
            <Plus className="size-4" /> Add an item
          </button>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-[14px]">
          <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} className="size-4 accent-[#141c17]" />
          Add VAT at 7.5%
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">A note for them (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} placeholder="Thank you for your business." className={field} />
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
            <dd className="font-ledger">{money(subtotal + tax, currency)}</dd>
          </div>
        </dl>
        <p className="text-[12.5px] text-graphite/50">The link stays open for 30 days. Your customer pays on it by card or bank transfer, and the money comes into your account.</p>
      </div>
    </Drawer>
  );
}

/** One request as the customer receives it: the invoice on paper, with its link. */
export function RequestDetail({ link, onClose }: { link: PaymentLinkDto; onClose: () => void }) {
  const session = useSession();
  const business = useActiveBusiness();
  const payIn = usePayInAccount(link.currency as Currency);
  const cancel = useCancelPaymentLink();
  const [confirming, setConfirming] = useState(false);
  const open = link.status === 'pending';

  return (
    <Drawer
      label={link.invoiceName}
      wide
      tint
      onClose={onClose}
      footer={
        <>
          {cancel.error && <p className="mb-3 text-[13.5px] text-[#9a3a17]">{errorMessage(cancel.error)}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {open && <CopyLink url={link.url} big />}
            {open && (
              <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30">
                <ExternalLink className="size-4" /> Open
              </a>
            )}
            {open &&
              (confirming ? (
                <button type="button" disabled={cancel.isPending} onClick={() => cancel.mutate(link.reference, { onSuccess: () => setConfirming(false) })} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#9a3a17] px-4 text-[14px] font-semibold text-white hover:bg-[#7d2f12]">
                  <Ban className="size-4" /> {cancel.isPending ? 'Cancelling…' : 'Yes, cancel it'}
                </button>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold text-[#9a3a17] hover:bg-[#9a3a17]/5">
                  <Ban className="size-4" /> Cancel
                </button>
              ))}
            <button type="button" onClick={() => window.print()} className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold text-graphite/65 hover:bg-graphite/5">
              <Printer className="size-4" /> Print
            </button>
          </div>
          {confirming && <p className="mt-2 text-[13px] text-graphite/55">Anyone opening the link is told it’s no longer taking payments.</p>}
        </>
      }
    >
      <div className="mb-4 flex items-center gap-2">
        <StatusPill status={link.status} />
        {link.status !== 'cancelled' && <span className="text-[13px] text-graphite/55">{whenText(link)}</span>}
      </div>
      <article className="rounded-sm bg-white p-8 text-[13.5px] shadow-[0_1px_2px_rgba(20,28,23,0.08),0_12px_32px_-16px_rgba(20,28,23,0.25)]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <img src={logoDark} alt="Credvera" className="h-5 w-auto opacity-80" />
            <p className="mt-4 text-[15px] font-semibold">{session?.business}</p>
            {business?.registeredAddress && <p className="text-graphite/50">{business.registeredAddress}</p>}
          </div>
          <div className="text-right">
            <p className="text-[22px] font-semibold tracking-[-0.02em]">Invoice</p>
            <p className="text-graphite/55">{link.invoiceName}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[12px] text-graphite/45">Billed to</p>
            <p className="mt-0.5 font-medium">{link.recipient.name}</p>
            {link.recipient.email && <p className="text-graphite/55">{link.recipient.email}</p>}
          </div>
          <div>
            <p className="text-[12px] text-graphite/45">Issued</p>
            <p className="mt-0.5 font-medium">{shortDate(link.createdAt)}</p>
          </div>
          <div>
            <p className="text-[12px] text-graphite/45">Pay by</p>
            <p className="mt-0.5 font-medium">{link.expiresAt ? shortDate(link.expiresAt) : '—'}</p>
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
            {link.items.map((it, n) => (
              <tr key={n} className="border-b border-graphite/[0.07]">
                <td className="py-2.5">{it.description}</td>
                <td className="py-2.5 text-right font-ledger">{it.quantity}</td>
                <td className="py-2.5 text-right font-ledger">{amount(Number(it.rate), link.currency)}</td>
                <td className="py-2.5 text-right font-ledger">{amount(Number(it.subtotal), link.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-4 w-64">
          <div className="flex justify-between border-t border-graphite/15 pt-2 text-[15px] font-semibold">
            <dt>Total</dt>
            <dd className="font-ledger">{amount(Number(link.amount), link.currency)}</dd>
          </div>
          {link.status === 'paid' && link.paidAmount && (
            <div className="mt-1.5 flex justify-between text-[#1f6b33]">
              <dt>Paid{link.payerName ? ` by ${link.payerName}` : ''}</dt>
              <dd className="font-ledger">{amount(Number(link.paidAmount), link.currency)}</dd>
            </div>
          )}
        </dl>

        {open && (
          <div className="mt-8 rounded-lg bg-[#f5f4ef] p-4">
            <p className="font-semibold">How to pay</p>
            <p className="mt-1 break-all text-graphite/60">
              Pay online at <span className="font-medium text-graphite">{link.url.replace(/^https?:\/\//, '')}</span>
              {payIn.ready && payIn.account ? `, or transfer to ${payIn.account.accountName}, account ${payIn.account.accountNumber}, ${payIn.account.bankName}.` : '.'}
            </p>
          </div>
        )}
        {link.note && <p className="mt-5 text-graphite/55">{link.note}</p>}
      </article>
    </Drawer>
  );
}

/** A one-line confirmation after a request is made, with its link to hand. */
export function Made({ link, onClose }: { link: PaymentLinkDto | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {link && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[#cfe8c9] bg-[#eef8ea] px-4 py-3 text-[14px]">
          <Check className="size-4 text-[#1f6b33]" />
          <span className="flex-1 font-medium text-[#1f6b33]">
            {link.invoiceName} for {link.recipient.name} is ready. Share the link to get paid.
          </span>
          <CopyLink url={link.url} />
          <button type="button" onClick={onClose} aria-label="Dismiss" className="text-[#1f6b33]/60">
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
