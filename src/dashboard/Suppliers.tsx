import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, CircleCheck, Plus, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { CURRENCIES } from './money';
import { addOrder, addSupplier, checkInvoice, money, shortDate, updateOrder, useDash, type Currency, type InvoiceCheck, type Order } from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';
const label = 'mb-1.5 block text-[13px] font-medium text-graphite/60';
const primary = 'inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40';
const secondary = 'inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30';

const COUNTRIES: [string, string, Currency][] = [
  ['Nigeria', 'ng', 'NGN'],
  ['China', 'cn', 'USD'],
  ['United States', 'us', 'USD'],
  ['United Kingdom', 'gb', 'GBP'],
  ['Germany', 'de', 'EUR'],
  ['Italy', 'it', 'EUR'],
  ['Turkey', 'tr', 'USD'],
  ['India', 'in', 'USD'],
];

const mask = (a: string) => `•••• ${a.replace(/\W/g, '').slice(-4)}`;

function Drawer({ label: title, onClose, children, footer }: { label: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
          <p className="text-[15px] font-semibold">{title}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-graphite/10 px-6 py-5">{footer}</div>}
      </motion.aside>
    </motion.div>
  );
}

/* ---------- Your suppliers ---------- */

function Directory() {
  const { suppliers, payments } = useDash();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState(COUNTRIES[1]!);
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const paid = (n: string) => payments.filter((p) => p.who === n && p.kind === 'out' && p.status === 'paid');

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite/10 p-5">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Your suppliers</h2>
          <p className="text-[13.5px] text-graphite/55">Their bank details are kept here, so every payment goes to the same place.</p>
        </div>
        <button type="button" onClick={() => setAdding(true)} className={secondary}>
          <Plus className="size-4" /> Add a supplier
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
              <th className="py-3 pl-5 pr-4 font-medium">Supplier</th>
              <th className="py-3 pr-4 font-medium">Paid in</th>
              <th className="py-3 pr-4 font-medium">Bank</th>
              <th className="py-3 pr-4 text-right font-medium">Paid so far</th>
              <th className="py-3 pr-5 font-medium">Last paid</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => {
              const ps = paid(s.name);
              return (
                <tr key={s.id} className="border-b border-graphite/[0.06] last:border-0">
                  <td className="py-3.5 pl-5 pr-4">
                    <span className="flex items-center gap-3">
                      <img src={`https://flagcdn.com/w80/${s.flag}.png`} alt="" className="size-7 rounded-full object-cover ring-1 ring-graphite/10" />
                      <span>
                        <span className="block font-medium">{s.name}</span>
                        <span className="block text-[12.5px] text-graphite/45">{s.country}</span>
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-graphite/65">{CURRENCIES.find((c) => c.code === s.currency)!.name}</td>
                  <td className="py-3.5 pr-4 text-graphite/65">
                    {s.bank} <span className="font-ledger">{mask(s.account)}</span>
                  </td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{ps.length ? money(ps.reduce((a, p) => a + p.amount, 0), s.currency) : '—'}</td>
                  <td className="whitespace-nowrap py-3.5 pr-5 text-graphite/60">{ps[0] ? shortDate(ps[0].date) : 'Not yet'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {adding && (
          <Drawer
            label="Add a supplier"
            onClose={() => setAdding(false)}
            footer={
              <button
                type="button"
                disabled={name.trim().length < 2 || !bank.trim() || account.replace(/\W/g, '').length < 6}
                onClick={() => {
                  addSupplier({ name: name.trim(), country: country[0], flag: country[1], currency: country[2], bank: bank.trim(), account: account.trim() });
                  setAdding(false);
                  setName('');
                  setBank('');
                  setAccount('');
                }}
                className={`${primary} h-11 w-full justify-center`}
              >
                Add them
              </button>
            }
          >
            <label className="block">
              <span className={label}>Business name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="As on their invoice" className={field} />
            </label>
            <label className="block">
              <span className={label}>Country</span>
              <select value={country[0]} onChange={(e) => setCountry(COUNTRIES.find((c) => c[0] === e.target.value)!)} className={field}>
                {COUNTRIES.map((c) => (
                  <option key={c[0]}>{c[0]}</option>
                ))}
              </select>
              <span className="mt-1.5 block text-[12.5px] text-graphite/50">You’ll pay them in {CURRENCIES.find((c) => c.code === country[2])!.name}.</span>
            </label>
            <label className="block">
              <span className={label}>Their bank</span>
              <input value={bank} onChange={(e) => setBank(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className={label}>{country[2] === 'EUR' ? 'IBAN' : 'Account number'}</span>
              <input value={account} onChange={(e) => setAccount(e.target.value)} className={`${field} font-ledger`} />
            </label>
          </Drawer>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- Protected orders ---------- */

const STAGES: { key: Order['stage']; label: string }[] = [
  { key: 'waiting', label: 'Money held' },
  { key: 'checking', label: 'Shipping documents checked' },
  { key: 'released', label: 'Paid to the supplier' },
];
const stageIndex = (s: Order['stage']) => (s === 'problem' ? 1 : STAGES.findIndex((x) => x.key === s));

function Orders() {
  const { orders, suppliers, balances } = useDash();
  const [creating, setCreating] = useState(false);
  const [pin, setPin] = useState<{ kind: 'new' } | { kind: 'release'; order: Order } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const [supplier, setSupplier] = useState(suppliers[0]?.name ?? '');
  const [what, setWhat] = useState('');
  const [text, setText] = useState('');
  const [deposit, setDeposit] = useState(30);
  const [days, setDays] = useState(21);
  const sup = suppliers.find((s) => s.name === supplier);
  const cur = sup?.currency ?? 'USD';
  const amount = Number(text.replace(/[^\d.]/g, '')) || 0;
  const held = orders.filter((o) => o.stage !== 'released');
  const ready = !!sup && what.trim().length > 1 && amount > 0 && amount <= balances[cur];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {done && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-xl border border-[#cfe8c9] bg-[#eef8ea] px-4 py-3 text-[14px] font-medium text-[#1f6b33]">
            <Check className="size-4" /> {done}
          </motion.p>
        )}
      </AnimatePresence>

      <section className={`${panel} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Protected orders</h2>
            <p className="mt-1 text-[14px] text-graphite/55">
              Pay a supplier without paying blind. A deposit goes now if you agree one; the rest is held until their shipping documents are checked, then released to them.
            </p>
          </div>
          <button type="button" onClick={() => setCreating(true)} className={primary}>
            <ShieldCheck className="size-4" /> Start a protected order
          </button>
        </div>
        <p className="mt-4 text-[13.5px] text-graphite/55">
          {held.length} {held.length === 1 ? 'order' : 'orders'} in progress
        </p>
      </section>

      {orders.length === 0 && (
        <p className="rounded-2xl border border-dashed border-graphite/20 px-6 py-10 text-center text-[14.5px] text-graphite/55">No protected orders yet. Start one when you next buy from a supplier abroad.</p>
      )}
      {orders.map((o) => {
        const i = stageIndex(o.stage);
        const dep = (o.amount * o.deposit) / 100;
        return (
          <section key={o.id} className={`${panel} p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[13px] text-graphite/50">
                  {o.number} · started {shortDate(o.created)}
                </p>
                <p className="mt-0.5 text-[16px] font-semibold">{o.supplier}</p>
                <p className="text-[14px] text-graphite/60">{o.what}</p>
              </div>
              <div className="text-right">
                <p className="font-ledger text-[20px] font-semibold">{money(o.amount, o.currency)}</p>
                {o.deposit > 0 && o.stage !== 'released' && (
                  <p className="text-[12.5px] text-graphite/55">
                    {money(dep, o.currency)} deposit paid · {money(o.amount - dep, o.currency)} held
                  </p>
                )}
              </div>
            </div>

            {/* Where the money is */}
            <ol className="mt-6 grid grid-cols-3 gap-2">
              {STAGES.map((s, n) => (
                <li key={s.key}>
                  <span className={`block h-1.5 rounded-full ${o.stage === 'problem' && n === 1 ? 'bg-[#c4542a]' : n <= i ? 'bg-[#1f6b33]' : 'bg-graphite/10'}`} />
                  <span className={`mt-2 block text-[12.5px] ${n <= i ? 'font-medium text-graphite' : 'text-graphite/45'}`}>{o.stage === 'problem' && n === 1 ? 'Problem raised' : s.label}</span>
                </li>
              ))}
            </ol>
            {o.note && <p className="mt-4 rounded-lg bg-[#f5f4ef] px-4 py-2.5 text-[13.5px] text-graphite/65">{o.note}</p>}

            {o.stage !== 'released' && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => setPin({ kind: 'release', order: o })} className={primary}>
                  <CircleCheck className="size-4" /> Goods are fine: release {money(o.amount - (o.stage === 'waiting' ? dep : 0), o.currency)}
                </button>
                {o.stage !== 'problem' && (
                  <button
                    type="button"
                    onClick={() => {
                      setProblem(o.id);
                      setNote('');
                    }}
                    className={secondary}
                  >
                    <AlertTriangle className="size-4" /> Raise a problem
                  </button>
                )}
                <span className="self-center text-[12.5px] text-graphite/50">Ships by {shortDate(o.shipBy)}</span>
              </div>
            )}
            {problem === o.id && (
              <form
                className="mt-4 flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  // TODO(credvera): opens a case with the team; the held money stays put.
                  updateOrder(o.id, { stage: 'problem', note: `Problem raised: ${note.trim()}. The money stays held while we sort it out with you.` });
                  setProblem(null);
                }}
              >
                <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="What’s wrong with the order?" className={field} />
                <button type="submit" className={`${primary} h-11 shrink-0`}>
                  Send
                </button>
              </form>
            )}
          </section>
        );
      })}

      <AnimatePresence>
        {creating && (
          <Drawer
            label="Start a protected order"
            onClose={() => setCreating(false)}
            footer={
              <button type="button" disabled={!ready} onClick={() => setPin({ kind: 'new' })} className={`${primary} h-11 w-full justify-center`}>
                Pay {deposit ? `the ${money((amount * deposit) / 100, cur)} deposit` : 'into protection'}
              </button>
            }
          >
            <label className="block">
              <span className={label}>Supplier</span>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className={field}>
                {suppliers.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>What you’re buying</span>
              <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Packaging machines, 2 units" className={field} />
            </label>
            <label className="block">
              <span className={label}>Order total</span>
              <span className="flex h-11 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 focus-within:border-graphite/50">
                <span className="font-medium text-graphite/45">{cur}</span>
                <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder="0" className="w-full bg-transparent font-ledger outline-none" />
              </span>
              <span className="mt-1.5 block text-[12.5px] text-graphite/50">
                From your {CURRENCIES.find((c) => c.code === cur)!.name} balance: {money(balances[cur], cur)}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={label}>Deposit now</span>
                <select value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} className={field}>
                  {[0, 20, 30, 50].map((d) => (
                    <option key={d} value={d}>
                      {d ? `${d}%` : 'None'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={label}>Ships within</span>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={field}>
                  {[14, 21, 30, 45].map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-lg bg-[#f5f4ef] p-4 text-[13.5px] text-graphite/65">
              {amount ? (
                <>
                  <span className="font-semibold text-graphite">{money((amount * deposit) / 100, cur)}</span> goes to {supplier} now.{' '}
                  <span className="font-semibold text-graphite">{money(amount - (amount * deposit) / 100, cur)}</span> is held until their shipping documents are checked.
                </>
              ) : (
                'Tell us the total, and we’ll show what goes now and what’s held.'
              )}
            </div>
          </Drawer>
        )}
      </AnimatePresence>

      <PinPrompt
        open={!!pin}
        title={pin?.kind === 'release' ? `Release to ${pin.order.supplier}` : 'Start the protected order'}
        detail={pin?.kind === 'release' ? pin.order.number : `${what.trim()} · ${money(amount, cur)}`}
        onClose={() => setPin(null)}
        onConfirm={() => {
          if (pin?.kind === 'release') {
            updateOrder(pin.order.id, { stage: 'released', note: undefined });
            setDone(`${pin.order.number} released to ${pin.order.supplier}.`);
          } else {
            const o = addOrder({ supplier, what: what.trim(), currency: cur, amount, deposit, shipBy: new Date(Date.now() + days * DAY).toISOString() });
            setCreating(false);
            setWhat('');
            setText('');
            setDone(`${o.number} started. The rest is held until ${supplier} ships.`);
          }
          setPin(null);
          window.setTimeout(() => setDone(null), 4000);
        }}
      />
    </div>
  );
}

/* ---------- Supplier invoice checks ---------- */

const RESULT: Record<InvoiceCheck['result'], { title: string; body: string; tone: string }> = {
  match: { title: 'Looks right', body: 'The bank details match the account you’ve paid before.', tone: 'border-[#cfe8c9] bg-[#eef8ea] text-[#1f6b33]' },
  changed: { title: 'The bank details have changed', body: 'This invoice asks you to pay a different account from before. Call the supplier on a number you already have before paying. Changed details are the most common invoice fraud.', tone: 'border-[#f0cdbf] bg-[#fcf0ea] text-[#9a3a17]' },
  new: { title: 'A new supplier', body: 'You haven’t paid them before, so there’s nothing to compare yet. Add them to your suppliers once you’re sure the details are right.', tone: 'border-[#ecdcae] bg-[#fbf5e6] text-[#8a5a00]' },
};

function Checks() {
  const { checks, suppliers } = useDash();
  const [supplier, setSupplier] = useState(suppliers[0]?.name ?? '');
  const [invoice, setInvoice] = useState('');
  const [account, setAccount] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<InvoiceCheck | null>(null);
  const cur = suppliers.find((s) => s.name === supplier)?.currency ?? 'USD';
  const ready = invoice.trim() && account.replace(/\W/g, '').length >= 6;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Check a supplier invoice</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Before you pay, copy the bank details from the invoice. We compare them with the account you’ve paid before.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            setResult(checkInvoice({ supplier, invoice: invoice.trim(), account: account.trim(), amount: Number(text.replace(/[^\d.]/g, '')) || 0, currency: cur }));
            setInvoice('');
            setAccount('');
            setText('');
          }}
        >
          <label className="block">
            <span className={label}>Supplier</span>
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className={field}>
              {suppliers.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>Invoice number</span>
              <input value={invoice} onChange={(e) => setInvoice(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className={label}>Amount ({cur})</span>
              <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} className={`${field} font-ledger`} />
            </label>
          </div>
          <label className="block">
            <span className={label}>Account number or IBAN on the invoice</span>
            <input value={account} onChange={(e) => setAccount(e.target.value)} className={`${field} font-ledger`} />
          </label>
          <button type="submit" disabled={!ready} className={primary}>
            Check it
          </button>
        </form>
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-6 rounded-xl border px-4 py-3.5 ${RESULT[result.result].tone}`}>
              <p className="flex items-center gap-2 text-[14.5px] font-semibold">
                {result.result === 'match' ? <CircleCheck className="size-4" /> : <AlertTriangle className="size-4" />} {RESULT[result.result].title}
              </p>
              <p className="mt-1 text-[13.5px] opacity-90">{RESULT[result.result].body}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Checked before</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {checks.map((k) => (
            <li key={k.id} className="flex items-start gap-3 py-3.5">
              <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${k.result === 'match' ? 'bg-[#e3f1e0] text-[#1f6b33]' : k.result === 'changed' ? 'bg-[#f6e7e0] text-[#9a3a17]' : 'bg-[#fbf0d6] text-[#8a5a00]'}`}>
                {k.result === 'match' ? <Check className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">
                  {k.supplier} · {k.invoice}
                </span>
                <span className="block text-[12.5px] text-graphite/50">
                  {RESULT[k.result].title} · {shortDate(k.checked)}
                </span>
              </span>
              {k.amount ? <span className="font-ledger text-[13.5px] font-medium">{money(k.amount, k.currency)}</span> : null}
            </li>
          ))}
          {checks.length === 0 && <li className="py-8 text-center text-[14px] text-graphite/50">Nothing checked yet.</li>}
        </ul>
      </section>
    </div>
  );
}

const SECTIONS = [
  { to: '/business/app/suppliers', label: 'Your suppliers', end: true },
  { to: '/business/app/suppliers/orders', label: 'Protected orders' },
  { to: '/business/app/suppliers/checks', label: 'Invoice checks' },
];

/** Suppliers: who you pay, orders paid safely, and invoices checked before paying. */
export default function Suppliers() {
  const { section } = useParams();
  const { session } = useDash();
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Suppliers</h1>
      <p className="mt-1 text-[15px] text-graphite/55">The businesses you buy from, here and abroad, paid safely.</p>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite/10" aria-label="Suppliers">
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
      <motion.div key={section ?? 'directory'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
        {section === 'orders' ? <Orders /> : section === 'checks' ? <Checks /> : <Directory />}
      </motion.div>
    </div>
  );
}
