import { AnimatePresence, motion } from 'framer-motion';
import { Archive, ArchiveRestore, BadgeCheck, Check, Landmark, Loader2, Pencil, Plus, Search, ShieldAlert, TriangleAlert, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  errorMessage,
  isApiError,
  useAccountName,
  useArchiveSupplier,
  useBanks,
  useChangeSupplierBank,
  useCreateSupplier,
  usePaySupplier,
  useSupplier,
  useSuppliers,
  useTransferQuote,
  useUpdateSupplier,
  type SupplierContact,
  type SupplierDetail,
  type SupplierDto,
} from '../api';
import { useActiveBusiness, useBalances } from './data';
import { money, shortDate } from './model';
import { field, initials, label, NairaInput, nairaFrom, paidText, panel, primary, useDebounced } from './pay/shared';
import { ComingSoon, Notice, PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const secondary = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold transition-colors hover:border-graphite/35 disabled:opacity-40';
const area = 'w-full resize-none rounded-lg border border-graphite/15 bg-white px-3.5 py-2.5 text-[15px] outline-none placeholder:text-graphite/35 focus:border-graphite/50';
const ago = (iso: string) => {
  const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  return h < 1 ? 'just now' : h < 24 ? `${h} ${h === 1 ? 'hour' : 'hours'} ago` : `${Math.round(h / 24)} days ago`;
};

/** A panel from the right, for adding a supplier or working with one. */
function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
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
            className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
              <p className="text-[15px] font-semibold">{title}</p>
              <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Your suppliers ---------- */

/**
 * The businesses you pay, each with a bank account the bank itself named.
 * Saving or changing bank details takes your PIN; the first payment to new
 * details asks you to confirm them; and every payment checks the bank still
 * names the account the same.
 */
function Directory({ closed }: { closed: boolean }) {
  const [archived, setArchived] = useState(false);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const list = useSuppliers(archived);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const rows = list.data ?? [];
    return t ? rows.filter((s) => `${s.name} ${s.category ?? ''} ${s.bank.accountName} ${s.bank.name}`.toLowerCase().includes(t)) : rows;
  }, [list.data, q]);

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite/10 p-5">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Your suppliers</h2>
          <p className="text-[13.5px] text-graphite/55">Their bank details are kept here, checked with the bank, so every payment goes to the same place.</p>
        </div>
        {!closed && (
          <button type="button" onClick={() => setAdding(true)} className={secondary}>
            <Plus className="size-4" /> Add a supplier
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-graphite/10 px-5 py-3">
        <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2.5 rounded-lg border border-graphite/15 bg-white px-3.5 focus-within:border-graphite/40 sm:max-w-sm">
          <Search className="size-4 text-graphite/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or what they supply" aria-label="Search suppliers" className="w-full bg-transparent text-[14.5px] outline-none placeholder:text-graphite/35" />
        </label>
        <div className="flex gap-1 rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium">
          {[false, true].map((a) => (
            <button key={String(a)} type="button" onClick={() => setArchived(a)} className={`rounded-md px-3 py-1 ${archived === a ? 'bg-white shadow-sm' : 'text-graphite/55'}`}>
              {a ? 'Archived' : 'Active'}
            </button>
          ))}
        </div>
      </div>
      {list.isLoading ? (
        <Loader2 className="mx-auto my-14 size-5 animate-spin text-graphite/40" aria-label="Loading" />
      ) : list.error ? (
        <p className="px-6 py-12 text-center text-[14px] text-[#a3261b]">{errorMessage(list.error)}</p>
      ) : shown.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <Landmark className="mx-auto size-6 text-graphite/35" />
          <p className="mt-2 text-[15px] font-medium">{q ? `No supplier matches “${q.trim()}”.` : archived ? 'Nothing archived.' : 'No suppliers yet.'}</p>
          {!q && !archived && !closed && <p className="mt-1 text-[14px] text-graphite/55">Add the businesses you pay, and pay them in two taps with their details checked every time.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                <th className="py-3 pl-5 pr-4 font-medium">Supplier</th>
                <th className="py-3 pr-4 font-medium">Bank</th>
                <th className="py-3 pr-4 text-right font-medium">Paid so far</th>
                <th className="py-3 pr-5 font-medium">Last paid</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <Row key={s.id} s={s} onOpen={() => setSelected(s.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddSupplier open={adding} onClose={() => setAdding(false)} onAdded={(id) => setSelected(id)} />
      <SupplierPanel id={selected} onClose={() => setSelected(null)} canPay={!closed} />
    </section>
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
  const business = useActiveBusiness();
  const closed = !!business?.closedAt || business?.status === 'rejected';

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{business?.name}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Suppliers</h1>
      <p className="mt-1 text-[15px] text-graphite/55">The businesses you buy from, paid safely. Naira accounts at Nigerian banks for now.</p>
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
        {section === 'orders' ? (
          <ComingSoon title="Protected orders">
            Pay a supplier without paying blind. A deposit goes now if you agree one; the rest is held until their shipping documents are checked, then released to them.
          </ComingSoon>
        ) : section === 'checks' ? (
          <ComingSoon title="Invoice checks">
            Check a supplier’s invoice before you pay it, with a warning when the bank details on it don’t match the ones you’ve paid before. Changed bank details are already flagged on each supplier.
          </ComingSoon>
        ) : (
          <Directory closed={closed} />
        )}
      </motion.div>
    </div>
  );
}

/** The warnings a supplier carries, in order of how much they matter. */
function Flags({ s }: { s: SupplierDto }) {
  return (
    <>
      {s.bank.recentlyChanged && (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#fbe9e7] px-2 py-0.5 text-[12px] font-medium text-[#a3261b]">
          <ShieldAlert className="size-3.5" /> Bank changed {ago(s.bank.changedAt!)}
        </span>
      )}
      {s.bank.unconfirmed && !s.bank.recentlyChanged && <span className="rounded-md bg-[#fbf5e6] px-2 py-0.5 text-[12px] font-medium text-[#8a5a00]">Not paid yet</span>}
      {s.cac?.matchesAccount === true && (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#e3f1e6] px-2 py-0.5 text-[12px] font-medium text-[#1f6b33]">
          <BadgeCheck className="size-3.5" /> CAC matches bank
        </span>
      )}
      {s.cac?.matchesAccount === false && <span className="rounded-md bg-[#fbf5e6] px-2 py-0.5 text-[12px] font-medium text-[#8a5a00]">Bank name differs from CAC</span>}
    </>
  );
}

function Row({ s, onOpen }: { s: SupplierDto; onOpen: () => void }) {
  return (
    <tr onClick={onOpen} className="cursor-pointer border-b border-graphite/[0.06] transition-colors last:border-0 hover:bg-[#fafaf7]">
      <td className="py-3.5 pl-5 pr-4">
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[12px] font-semibold">{initials(s.name)}</span>
          <span className="min-w-0">
            <button type="button" onClick={onOpen} className="block text-left font-medium hover:underline">
              {s.name}
            </button>
            <span className="block text-[12.5px] text-graphite/45">{s.category ?? 'Nigeria'}</span>
            <span className="mt-1 flex flex-wrap gap-1.5 empty:hidden">
              <Flags s={s} />
            </span>
          </span>
        </span>
      </td>
      <td className="py-3.5 pr-4 text-graphite/65">
        {s.bank.name} <span className="font-ledger">•••• {s.bank.accountLast4}</span>
        <span className="block text-[12.5px] text-graphite/45">{s.bank.accountName}</span>
      </td>
      <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{Number(s.stats.paid) ? money(Number(s.stats.paid)) : '—'}</td>
      <td className="whitespace-nowrap py-3.5 pr-5 text-graphite/60">{s.stats.lastPaidAt ? shortDate(s.stats.lastPaidAt) : 'Not yet'}</td>
    </tr>
  );
}

// ── Adding ───────────────────────────────────────────────────────────────────

/** Bank and account number, with the bank's name for it shown as soon as there are ten digits. */
function BankFields({ bankCode, setBankCode, accountNumber, setAccountNumber }: { bankCode: string; setBankCode: (v: string) => void; accountNumber: string; setAccountNumber: (v: string) => void }) {
  const banks = useBanks();
  const name = useAccountName(bankCode, accountNumber);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={label}>Bank</span>
        <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} disabled={banks.isLoading} className={field}>
          <option value="">{banks.isLoading ? 'Loading banks…' : 'Choose a bank'}</option>
          {banks.data?.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={label}>Account number</span>
        <input inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 digits" className={`${field} font-ledger tracking-wide`} />
      </label>
      <p className="flex items-center gap-2 text-[13.5px] sm:col-span-2">
        {name.isFetching ? (
          <>
            <Loader2 className="size-4 animate-spin text-graphite/50" /> <span className="text-graphite/55">Asking the bank for the name on this account…</span>
          </>
        ) : name.data ? (
          <>
            <Check className="size-4 text-[#1f6b33]" /> The bank names it <span className="font-semibold">{name.data.accountName}</span>
          </>
        ) : name.error ? (
          <span className="text-[#9a3a17]">{errorMessage(name.error)}</span>
        ) : (
          <span className="text-graphite/45">The name comes from the bank, so you can see it’s the right account.</span>
        )}
      </p>
    </div>
  );
}

function ContactFields({ v, set }: { v: SupplierContact; set: (patch: SupplierContact) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={label}>What they supply (optional)</span>
        <input value={v.category ?? ''} onChange={(e) => set({ category: e.target.value })} maxLength={60} placeholder="Paper and ink" className={field} />
      </label>
      <label className="block">
        <span className={label}>CAC number (optional)</span>
        <input value={v.rcNumber ?? ''} onChange={(e) => set({ rcNumber: e.target.value })} maxLength={20} placeholder="RC 1234567" className={field} />
      </label>
      <label className="block">
        <span className={label}>Email (optional)</span>
        <input type="email" value={v.email ?? ''} onChange={(e) => set({ email: e.target.value })} maxLength={254} placeholder="accounts@supplier.ng" className={field} />
      </label>
      <label className="block">
        <span className={label}>Phone (optional)</span>
        <input type="tel" value={v.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} maxLength={20} placeholder="0803 123 4567" className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Notes (optional)</span>
        <textarea value={v.notes ?? ''} onChange={(e) => set({ notes: e.target.value })} maxLength={500} rows={2} placeholder="How they invoice, who to call" className={area} />
      </label>
    </div>
  );
}

function AddSupplier({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (id: string) => void }) {
  const create = useCreateSupplier();
  const [name, setName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [contact, setContact] = useState<SupplierContact>({});
  const [pin, setPin] = useState(false);
  const verified = useAccountName(bankCode, accountNumber);

  const reset = () => {
    setName('');
    setBankCode('');
    setAccountNumber('');
    setContact({});
    create.reset();
  };
  const ready = name.trim().length >= 2 && !!verified.data && !create.isPending;

  const save = (code: string) => {
    setPin(false);
    create.mutate(
      { name: name.trim(), bankCode, accountNumber, pin: code, ...contact },
      {
        onSuccess: (s) => {
          reset();
          onClose();
          onAdded(s.id);
        },
      },
    );
  };

  return (
    <>
      <Drawer open={open && !pin} title="Add a supplier" onClose={onClose}>
        <div className="space-y-4">
          <label className="block">
            <span className={label}>Supplier</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Okafor Paper Supplies" className={field} autoFocus />
          </label>
          <BankFields bankCode={bankCode} setBankCode={setBankCode} accountNumber={accountNumber} setAccountNumber={setAccountNumber} />
          <ContactFields v={contact} set={(p) => setContact((c) => ({ ...c, ...p }))} />
          {create.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(create.error)}</p>}
          <div className="flex items-center justify-between gap-3 border-t border-graphite/10 pt-4">
            <p className="text-[12.5px] text-graphite/50">You’ll confirm with your PIN.</p>
            <button type="button" disabled={!ready} onClick={() => setPin(true)} className={primary}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />} Save supplier
            </button>
          </div>
        </div>
      </Drawer>
      <PinPrompt open={open && pin} title="Save this supplier" detail={verified.data ? `${verified.data.accountName} · ${verified.data.bankName}` : undefined} onClose={() => setPin(false)} onConfirm={save} />
    </>
  );
}

// ── One supplier ─────────────────────────────────────────────────────────────

type Mode = 'view' | 'edit' | 'bank' | 'pay';

function SupplierPanel({ id, onClose, canPay }: { id: string | null; onClose: () => void; canPay: boolean }) {
  const supplier = useSupplier(id);
  const [mode, setMode] = useState<Mode>('view');
  const [done, setDone] = useState<string | null>(null);
  const close = () => {
    setMode('view');
    setDone(null);
    onClose();
  };
  const s = supplier.data;
  const title = s ? (mode === 'pay' ? `Pay ${s.name}` : mode === 'bank' ? 'New bank details' : mode === 'edit' ? `Edit ${s.name}` : s.name) : 'Supplier';

  return (
    <Drawer open={!!id} title={title} onClose={close}>
      {!s ? (
        supplier.error ? <p className="text-[14px] text-[#a3261b]">{errorMessage(supplier.error)}</p> : <Loader2 className="mx-auto my-10 size-5 animate-spin text-graphite/40" />
      ) : mode === 'pay' ? (
        <PayForm
          s={s}
          onBack={() => setMode('view')}
          onPaid={(text) => {
            setDone(text);
            setMode('view');
          }}
        />
      ) : mode === 'bank' ? (
        <ChangeBank s={s} onDone={() => setMode('view')} />
      ) : mode === 'edit' ? (
        <EditContact s={s} onDone={() => setMode('view')} />
      ) : (
        <SupplierView
          s={s}
          done={done}
          clearDone={() => setDone(null)}
          canPay={canPay}
          setMode={(m) => {
            // A finished payment's message belongs to that payment only.
            setDone(null);
            setMode(m);
          }}
        />
      )}
    </Drawer>
  );
}

function SupplierView({ s, done, clearDone, canPay, setMode }: { s: SupplierDetail; done: string | null; clearDone: () => void; canPay: boolean; setMode: (m: Mode) => void }) {
  const archive = useArchiveSupplier(s.id);
  return (
    <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
      <AnimatePresence>
        {done && (
          <Notice tone="good" onClose={clearDone}>
            {done}
          </Notice>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-2">
        <Flags s={s} />
        {s.archivedAt && <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12px] font-medium text-graphite/60">Archived</span>}
      </div>

      {s.bank.recentlyChanged && (
        <p className="flex gap-2 rounded-lg border border-[#f0d3c5] bg-[#fcf1ec] px-3.5 py-3 text-[13.5px] text-[#9a3a17]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          These bank details changed {ago(s.bank.changedAt!)}. If a supplier tells you by email that their bank has changed, call them on a number you already have before you pay.
        </p>
      )}

      <section className="rounded-xl bg-[#f5f4ef] p-4 text-[14px]">
        <p className="text-[12.5px] font-medium text-graphite/55">Pays into</p>
        <p className="mt-1 font-semibold">{s.bank.accountName}</p>
        <p className="text-graphite/65">
          {s.bank.name} · <span className="font-ledger">{s.bank.accountNumber}</span>
        </p>
        <p className="mt-1 text-[12.5px] text-graphite/50">Named by the bank · {s.bank.changedAt ? `details changed ${shortDate(s.bank.changedAt)}` : `saved ${shortDate(s.createdAt)}`}</p>
      </section>

      {s.cac && (
        <section className="text-[14px]">
          <p className="text-[12.5px] font-medium text-graphite/55">CAC register</p>
          {s.cac.name ? (
            <p className="mt-1">
              RC {s.cac.rcNumber}: <span className="font-semibold">{s.cac.name}</span>
              {s.cac.status && <span className="text-graphite/55"> · {s.cac.status.toLowerCase()}</span>}
              <span className={`mt-0.5 block text-[13px] ${s.cac.matchesAccount ? 'text-[#1f6b33]' : 'text-[#8a5a00]'}`}>
                {s.cac.matchesAccount ? 'The bank account is in the registered company’s name.' : 'The bank account isn’t in the registered company’s name. Ask the supplier why before paying large sums.'}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-graphite/65">{s.cac.status === 'not_found' ? `RC ${s.cac.rcNumber} isn’t on the CAC register.` : `RC ${s.cac.rcNumber} couldn’t be checked just now. Save again later to retry.`}</p>
          )}
        </section>
      )}

      {(s.category || s.email || s.phone || s.notes) && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
          {[
            ['Supplies', s.category],
            ['Email', s.email],
            ['Phone', s.phone],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12.5px] text-graphite/50">{k}</dt>
                <dd className="break-words font-medium">{v}</dd>
              </div>
            ))}
          {s.notes && (
            <div className="col-span-2">
              <dt className="text-[12.5px] text-graphite/50">Notes</dt>
              <dd className="whitespace-pre-wrap">{s.notes}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="flex flex-wrap gap-2">
        {canPay && !s.archivedAt && (
          <button type="button" onClick={() => setMode('pay')} className={primary}>
            Pay {s.name}
          </button>
        )}
        <button type="button" onClick={() => setMode('edit')} className={secondary}>
          <Pencil className="size-4" /> Edit
        </button>
        <button type="button" onClick={() => setMode('bank')} className={secondary}>
          <Landmark className="size-4" /> Change bank details
        </button>
        <button type="button" onClick={() => archive.mutate(!s.archivedAt)} disabled={archive.isPending} className={secondary}>
          {s.archivedAt ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />} {s.archivedAt ? 'Restore' : 'Archive'}
        </button>
      </div>
      {archive.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(archive.error)}</p>}

      <section>
        <p className="text-[12.5px] font-medium text-graphite/55">
          Paid {money(Number(s.stats.paid))} in {s.stats.payments} {s.stats.payments === 1 ? 'payment' : 'payments'}
        </p>
        {s.payments.length ? (
          <ul className="mt-2 divide-y divide-graphite/[0.07] text-[14px]">
            {s.payments.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block">{shortDate(p.createdAt)}</span>
                  <span className="block truncate text-[12.5px] text-graphite/50">
                    {p.to} · {p.bankName} ••••{p.accountLast4}
                  </span>
                </span>
                <span className={`text-[12.5px] ${p.status === 'failed' || p.status === 'reversed' ? 'text-[#a3261b]' : p.status === 'pending' ? 'text-[#8a5a00]' : 'text-graphite/45'}`}>{p.status === 'success' ? 'Paid' : p.status === 'pending' ? 'On its way' : p.status === 'reversed' ? 'Returned' : 'Failed'}</span>
                <span className="w-28 text-right font-ledger font-medium">−{money(Number(p.amount))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[14px] text-graphite/50">Nothing paid yet.</p>
        )}
      </section>
    </div>
  );
}

function PayForm({ s, onBack, onPaid }: { s: SupplierDetail; onBack: () => void; onPaid: (text: string) => void }) {
  const pay = usePaySupplier(s.id);
  const { balances } = useBalances();
  const business = useActiveBusiness();
  const threshold = business?.approvalThreshold ? Number(business.approvalThreshold) : null;
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const [checked, setChecked] = useState(false);
  const [pin, setPin] = useState(false);
  const amount = nairaFrom(text);
  const quote = useTransferQuote(String(useDebounced(amount)));
  const total = quote.data && quote.data.amount === amount ? quote.data.total : null;
  const short = total !== null && total > balances.NGN;
  const needsCheck = s.bank.unconfirmed;
  const ready = amount > 0 && total !== null && !short && reason.trim().length > 1 && (!needsCheck || checked) && !pay.isPending;

  const send = (code: string) => {
    setPin(false);
    pay.mutate(
      { amount: String(amount), narration: reason.trim().slice(0, 100), pin: code, ...(needsCheck ? { confirmNewDetails: true } : {}) },
      {
        onSuccess: (r) => onPaid(paidText(r, amount)),
      },
    );
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-[#f5f4ef] px-3.5 py-3 text-[14px]">
        To <span className="font-semibold">{s.bank.accountName}</span> · {s.bank.name} ••••{s.bank.accountLast4}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Amount</span>
          <NairaInput value={amount} onChange={setText} />
        </label>
        <label className="block">
          <span className={label}>What it’s for</span>
          <input value={reason} maxLength={100} onChange={(e) => setReason(e.target.value)} placeholder="Invoice 0412" className={field} />
        </label>
      </div>

      {needsCheck && (
        <label className={`flex gap-3 rounded-lg border px-3.5 py-3 text-[13.5px] ${s.bank.recentlyChanged ? 'border-[#f0d3c5] bg-[#fcf1ec]' : 'border-[#ecdcae] bg-[#fbf5e6]'}`}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-graphite" />
          <span>
            {s.bank.recentlyChanged ? 'These bank details changed recently. ' : 'You haven’t paid these details before. '}I’ve checked them with {s.name} directly, on a number I already had, not only by email or message.
          </span>
        </label>
      )}

      <p className="text-[13.5px] text-graphite/55">
        {quote.error && amount ? (
          <span className="text-[#9a3a17]">{errorMessage(quote.error)}</span>
        ) : total !== null ? (
          <>
            Fee {money(quote.data!.fee)} · total <span className="font-semibold text-graphite">{money(total)}</span>
            {short && <span className="mt-1 block text-[#9a3a17]">More than the {money(balances.NGN)} in your naira account.</span>}
            {threshold !== null && amount >= threshold && <span className="mt-1 block text-graphite/70">Over {money(threshold)}: it waits for someone else on the team to approve it before it goes.</span>}
          </>
        ) : (
          'You’ll see the fee and the total before you pay.'
        )}
      </p>
      {pay.error && (
        <p className="flex gap-2 text-[13.5px] text-[#a3261b]">
          {isApiError(pay.error) && pay.error.code === 'SUPPLIER_DETAILS_CHANGED' && <ShieldAlert className="mt-0.5 size-4 shrink-0" />}
          {errorMessage(pay.error)}
        </p>
      )}
      <div className="flex justify-between gap-2 border-t border-graphite/10 pt-4">
        <button type="button" onClick={onBack} className={secondary}>
          Back
        </button>
        <button type="button" disabled={!ready} onClick={() => setPin(true)} className={primary}>
          {pay.isPending && <Loader2 className="size-4 animate-spin" />}
          {pay.isPending ? 'Sending…' : `Pay ${amount ? money(amount) : ''}`}
        </button>
      </div>
      <PinPrompt open={pin} title={`Pay ${money(amount)}`} detail={`To ${s.bank.accountName} · ${reason.trim()}`} onClose={() => setPin(false)} onConfirm={send} />
    </div>
  );
}

function ChangeBank({ s, onDone }: { s: SupplierDetail; onDone: () => void }) {
  const change = useChangeSupplierBank(s.id);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState(false);
  const verified = useAccountName(bankCode, accountNumber);

  const save = (code: string) => {
    setPin(false);
    change.mutate({ bankCode, accountNumber, pin: code }, { onSuccess: onDone });
  };

  return (
    <div className="space-y-4">
      <p className="flex gap-2 rounded-lg border border-[#ecdcae] bg-[#fbf5e6] px-3.5 py-3 text-[13.5px] text-[#6b4800]">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        Most invoice fraud is a message saying a supplier’s bank has changed. Before you save new details, call {s.name} on a number you already have.
      </p>
      <p className="text-[13.5px] text-graphite/60">
        Now: {s.bank.accountName} · {s.bank.name} ••••{s.bank.accountLast4}
      </p>
      <BankFields bankCode={bankCode} setBankCode={setBankCode} accountNumber={accountNumber} setAccountNumber={setAccountNumber} />
      {verified.data && s.cac?.name && (
        <p className="text-[13px] text-graphite/60">
          The registered company is {s.cac.name}. Compare it with the name the bank gives above.
        </p>
      )}
      {change.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(change.error)}</p>}
      <div className="flex justify-between gap-2 border-t border-graphite/10 pt-4">
        <button type="button" onClick={onDone} className={secondary}>
          Back
        </button>
        <button type="button" disabled={!verified.data || change.isPending} onClick={() => setPin(true)} className={primary}>
          {change.isPending && <Loader2 className="size-4 animate-spin" />} Save new details
        </button>
      </div>
      <PinPrompt open={pin} title="Save new bank details" detail={verified.data ? `${verified.data.accountName} · ${verified.data.bankName}` : undefined} onClose={() => setPin(false)} onConfirm={save} />
    </div>
  );
}

function EditContact({ s, onDone }: { s: SupplierDetail; onDone: () => void }) {
  const update = useUpdateSupplier(s.id);
  const [name, setName] = useState(s.name);
  const [v, setV] = useState<SupplierContact>({ category: s.category ?? '', email: s.email ?? '', phone: s.phone ?? '', notes: s.notes ?? '', rcNumber: s.cac?.rcNumber ?? '' });

  return (
    <div className="space-y-4">
      <label className="block">
        <span className={label}>Supplier</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={field} />
      </label>
      <ContactFields v={v} set={(p) => setV((c) => ({ ...c, ...p }))} />
      {update.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(update.error)}</p>}
      <div className="flex justify-between gap-2 border-t border-graphite/10 pt-4">
        <button type="button" onClick={onDone} className={secondary}>
          Cancel
        </button>
        <button type="button" disabled={name.trim().length < 2 || update.isPending} onClick={() => update.mutate({ name: name.trim(), ...v }, { onSuccess: onDone })} className={primary}>
          {update.isPending && <Loader2 className="size-4 animate-spin" />} Save
        </button>
      </div>
    </div>
  );
}
