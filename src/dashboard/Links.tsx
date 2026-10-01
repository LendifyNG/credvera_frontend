import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Check, Copy, CreditCard, Lock, Pause, Play, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { CURRENCIES } from './money';
import { addLink, linkUrl, money, RATES, shortDate, updateLink, useDash, type Currency, type PayLink, type Payment } from './store';
import { usePayments, useSession } from './data';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

/** Payments that came in through a link. */
const paidThrough = (payments: Payment[], l: PayLink) => payments.filter((p) => p.kind === 'in' && /payment link/i.test(p.what) && p.currency === l.currency && l.paidBy.includes(p.who));

/** A link is done once a one-time link has been paid. */
const linkState = (l: PayLink) => (l.paused ? 'Paused' : !l.reusable && l.paidBy.length ? 'Paid' : 'Active');
const STATE_TONE: Record<string, string> = {
  Active: 'bg-[#e3f1e0] text-[#1f6b33]',
  Paid: 'bg-[#efeee7] text-graphite/65',
  Paused: 'bg-[#fbf0d6] text-[#8a5a00]',
};

function CopyLink({ url, big = false }: { url: string; big?: boolean }) {
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

/** What the customer sees when they open the link. */
function Checkout({ company, title, note, currency, amount }: { company?: string; title: string; note?: string; currency: Currency; amount: number | null }) {
  return (
    <div className="overflow-hidden rounded-xl border border-graphite/10 bg-white shadow-[0_12px_32px_-18px_rgba(20,28,23,0.35)]">
      <div className="flex items-center gap-3 border-b border-graphite/10 bg-[#faf9f5] px-5 py-3.5">
        <span className="grid size-8 place-items-center rounded-lg bg-graphite text-[12px] font-bold text-primary">
          {(company ?? 'C')
            .replace(/\b(Ltd|Limited)\b/g, '')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')}
        </span>
        <span className="text-[14px] font-semibold">{company}</span>
      </div>
      <div className="px-5 py-5">
        <p className="text-[15px] font-semibold">{title || 'Your link’s title'}</p>
        {note && <p className="mt-1 text-[13px] text-graphite/55">{note}</p>}
        {amount ? (
          <p className="mt-4 font-ledger text-[26px] font-semibold tracking-[-0.02em]">{money(amount, currency)}</p>
        ) : (
          <div className="mt-4">
            <p className="text-[12.5px] text-graphite/50">Amount to pay</p>
            <div className="mt-1 flex h-11 items-center rounded-lg border border-graphite/15 px-3 font-ledger text-graphite/35">{CURRENCIES.find((c) => c.code === currency)!.code} 0.00</div>
          </div>
        )}
        <div className="mt-5 space-y-2">
          <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-graphite text-[13.5px] font-semibold text-white">
            <CreditCard className="size-4" /> Pay with card
          </div>
          <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-graphite/15 text-[13.5px] font-semibold">
            <Building2 className="size-4" /> Pay by bank transfer
          </div>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-graphite/45">
          <Lock className="size-3" /> Secure checkout by Credvera
        </p>
      </div>
    </div>
  );
}

function Drawer({ label, onClose, children, footer }: { label: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
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
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
          <p className="text-[15px] font-semibold">{label}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-graphite/10 px-6 py-5">{footer}</div>}
      </motion.aside>
    </motion.div>
  );
}

/** Payment links: share one, and your customer pays by card or bank transfer. */
export default function Links() {
  const { links } = useDash();
  const { payments } = usePayments();
  const session = useSession();
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [made, setMade] = useState<PayLink | null>(null);

  // New link form
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [fixed, setFixed] = useState(true);
  const [text, setText] = useState('');
  const [reusable, setReusable] = useState(false);
  const amount = Number(text.replace(/[^\d.]/g, '')) || 0;
  const ready = title.trim().length > 1 && (!fixed || amount > 0);

  const collected = (l: PayLink) => paidThrough(payments, l).reduce((a, p) => a + p.amount, 0);
  const month = links.reduce((a, l) => a + paidThrough(payments, l).filter((p) => Date.now() - new Date(p.date).getTime() < 30 * DAY).reduce((b, p) => b + p.amount * RATES[p.currency], 0), 0);
  const paidCount = links.reduce((a, l) => a + paidThrough(payments, l).length, 0);
  const current = links.find((l) => l.id === open);

  const reset = () => {
    setTitle('');
    setNote('');
    setText('');
    setFixed(true);
    setReusable(false);
    setCurrency('NGN');
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Payment links</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Share a link on WhatsApp, email or anywhere. Your customer pays by card or bank transfer.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> New link
        </button>
      </div>

      <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-graphite/10">
        {[
          { label: 'Collected, last 30 days', value: money(month), tone: 'text-[#1f6b33]' },
          { label: 'Active links', value: String(links.filter((l) => linkState(l) === 'Active').length) },
          { label: 'Payments received', value: String(paidCount) },
        ].map((s, i) => (
          <div key={s.label} className={`px-6 py-5 ${i ? 'border-t border-graphite/10 sm:border-t-0' : ''}`}>
            <p className="text-[13px] font-medium text-graphite/55">{s.label}</p>
            <p className={`mt-1 font-ledger text-[22px] font-semibold tracking-[-0.02em] ${s.tone ?? ''}`}>{s.value}</p>
          </div>
        ))}
      </section>

      <AnimatePresence>
        {made && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[#cfe8c9] bg-[#eef8ea] px-4 py-3 text-[14px]">
            <Check className="size-4 text-[#1f6b33]" />
            <span className="flex-1 font-medium text-[#1f6b33]">“{made.title}” is ready to share.</span>
            <CopyLink url={linkUrl(made)} />
            <button type="button" onClick={() => setMade(null)} aria-label="Dismiss" className="text-[#1f6b33]/60">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className={`${panel} mt-6 overflow-x-auto`}>
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
              <th className="py-3 pl-5 pr-4 font-medium">Link</th>
              <th className="py-3 pr-4 text-right font-medium">Amount</th>
              <th className="py-3 pr-4 font-medium">Type</th>
              <th className="py-3 pr-4 text-right font-medium">Collected</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-5" />
            </tr>
          </thead>
          <tbody>
            {links.map((l) => {
              const st = linkState(l);
              return (
                <tr
                  key={l.id}
                  tabIndex={0}
                  onClick={() => setOpen(l.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setOpen(l.id)}
                  className="cursor-pointer border-b border-graphite/[0.06] outline-none transition-colors last:border-0 hover:bg-[#faf9f5] focus-visible:bg-[#faf9f5]"
                >
                  <td className="py-3.5 pl-5 pr-4">
                    <span className="block font-medium">{l.title}</span>
                    <span className="block text-[12.5px] text-graphite/45">Made {shortDate(l.created)}</span>
                  </td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger">{l.amount ? money(l.amount, l.currency) : <span className="font-sans text-graphite/55">Customer chooses</span>}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-graphite/65">{l.reusable ? 'Reusable' : 'One-time'}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right">
                    <span className="font-ledger font-medium">{money(collected(l), l.currency)}</span>
                    <span className="block text-[12px] text-graphite/45">
                      {l.paidBy.length} {l.paidBy.length === 1 ? 'payment' : 'payments'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${STATE_TONE[st]}`}>{st}</span>
                  </td>
                  <td className="py-3.5 pr-5 text-right">{st !== 'Paid' && <CopyLink url={linkUrl(l)} />}</td>
                </tr>
              );
            })}
            {links.length === 0 && (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <p className="text-[15px] font-medium">No payment links yet</p>
                  <p className="mt-1 text-[14px] text-graphite/50">Make one and share it; your customer pays by card or bank transfer.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <AnimatePresence>
        {current && (
          <Drawer key={current.id} label={current.title} onClose={() => setOpen(null)}>
            <p className="text-[13px] font-medium text-graphite/55">Link</p>
            <p className="mt-1 break-all rounded-lg bg-[#f5f4ef] px-3.5 py-2.5 font-ledger text-[13px]">{linkUrl(current)}</p>
            <div className="mt-3 flex gap-2">
              {linkState(current) !== 'Paid' && <CopyLink url={linkUrl(current)} big />}
              {linkState(current) !== 'Paid' && (
                <button
                  type="button"
                  onClick={() => updateLink(current.id, { paused: !current.paused })}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30"
                >
                  {current.paused ? <Play className="size-4" /> : <Pause className="size-4" />} {current.paused ? 'Turn back on' : 'Pause'}
                </button>
              )}
            </div>
            {current.paused && <p className="mt-2 text-[13px] text-[#8a5a00]">Paused: anyone opening it is told it isn’t taking payments.</p>}

            <p className="mb-2 mt-7 text-[13px] font-medium text-graphite/55">What your customer sees</p>
            <Checkout company={session?.business} title={current.title} note={current.note} currency={current.currency} amount={current.amount} />

            <p className="mt-7 text-[14px] font-semibold">Paid through this link</p>
            <ul className="mt-2 divide-y divide-graphite/[0.07]">
              {paidThrough(payments, current).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                  <span>
                    <span className="block font-medium">{p.who}</span>
                    <span className="block text-[12.5px] text-graphite/50">{shortDate(p.date)} · card</span>
                  </span>
                  <span className="font-ledger font-medium text-[#1f6b33]">+{money(p.amount, p.currency)}</span>
                </li>
              ))}
              {current.paidBy.length === 0 && <li className="py-5 text-[14px] text-graphite/50">No payments yet. Share the link to get paid.</li>}
            </ul>
          </Drawer>
        )}
        {creating && (
          <Drawer
            key="new"
            label="New payment link"
            onClose={() => setCreating(false)}
            footer={
              <button
                type="button"
                disabled={!ready}
                onClick={() => {
                  // TODO(credvera): the API creates the checkout page.
                  const l = addLink({ title: title.trim(), note: note.trim() || undefined, currency, amount: fixed ? amount : null, reusable });
                  setCreating(false);
                  setMade(l);
                  reset();
                }}
                className="h-11 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40"
              >
                Create the link
              </button>
            }
          >
            <div className="space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">What it’s for</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Wedding catering deposit" className={field} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">A line for the customer (optional)</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivered on Saturday" className={field} />
              </label>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Amount</span>
                <div className="flex rounded-lg bg-[#efeee7] p-1 text-[14px] font-medium">
                  {[
                    [true, 'Set amount'],
                    [false, 'Customer chooses'],
                  ].map(([v, l]) => (
                    <button key={String(v)} type="button" onClick={() => setFixed(v as boolean)} className={`flex-1 rounded-md py-1.5 ${fixed === v ? 'bg-white shadow-sm' : 'text-graphite/55'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-[110px_1fr] gap-2">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={field} aria-label="Currency">
                    {CURRENCIES.map((c) => (
                      <option key={c.code}>{c.code}</option>
                    ))}
                  </select>
                  {fixed && <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder="0" className={`${field} font-ledger`} aria-label="Amount" />}
                </div>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-[14px]">
                <input type="checkbox" checked={reusable} onChange={(e) => setReusable(e.target.checked)} className="mt-0.5 size-4 accent-[#141c17]" />
                <span>
                  Reusable
                  <span className="block text-[12.5px] text-graphite/50">Anyone can pay it any number of times, like a price list. Otherwise it closes after one payment.</span>
                </span>
              </label>
              <div>
                <p className="mb-2 text-[13px] font-medium text-graphite/55">What your customer sees</p>
                <Checkout company={session?.business} title={title.trim()} note={note.trim()} currency={currency} amount={fixed ? amount || 0 : null} />
              </div>
            </div>
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
}
