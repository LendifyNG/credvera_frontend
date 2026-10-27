import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, CircleCheck, Loader2, ShieldCheck, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { errorMessage, useOrderAction, useProtectedOrders, useSuppliers, type ProtectedOrderDto } from '../../api';
import { useBalances } from '../data';
import { money, shortDate } from '../model';
import { field, label, NairaInput, nairaFrom, panel, primary } from '../pay/shared';
import { Notice, PinPrompt } from '../ui';
import { Drawer } from './Drawer';

const secondary = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold transition-colors hover:border-graphite/35 disabled:opacity-40';

const STAGES: { key: ProtectedOrderDto['stage']; label: string }[] = [
  { key: 'waiting', label: 'Money held' },
  { key: 'problem', label: 'Shipping documents checked' },
  { key: 'released', label: 'Paid to the supplier' },
];
const stageIndex = (s: ProtectedOrderDto['stage']) => (s === 'waiting' ? 0 : s === 'problem' ? 1 : s === 'released' ? 2 : -1);

type Pin = { kind: 'new' } | { kind: 'release' | 'return'; order: ProtectedOrderDto };

/**
 * Pay a supplier without paying blind: the deposit goes now, the rest waits in
 * a holding account until someone says the goods are fine, or calls it off.
 */
export default function Orders({ closed }: { closed: boolean }) {
  const orders = useProtectedOrders();
  const suppliers = useSuppliers();
  const { balances } = useBalances();
  const act = useOrderAction();
  const [creating, setCreating] = useState(false);
  const [pin, setPin] = useState<Pin | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  const list = orders.data ?? [];
  const choices = suppliers.data ?? [];
  const [supplierId, setSupplierId] = useState('');
  const [what, setWhat] = useState('');
  const [text, setText] = useState('');
  const [deposit, setDeposit] = useState(30);
  const [days, setDays] = useState(21);
  const [checked, setChecked] = useState(false);
  const sup = choices.find((s) => s.id === supplierId) ?? choices[0];
  const amount = nairaFrom(text);
  const dep = Math.floor((amount * deposit) / 100);
  const needsCheck = !!sup?.bank.unconfirmed && deposit > 0;
  const held = list.filter((o) => o.stage === 'waiting' || o.stage === 'problem');
  const ready = !!sup && what.trim().length > 1 && amount > 0 && amount <= balances.NGN && (!needsCheck || checked) && !act.isPending;

  const done = (text: string) => setOutcome({ tone: 'good', text });
  const failed = (error: unknown) => setOutcome({ tone: 'bad', text: errorMessage(error) });

  const confirm = (code: string) => {
    const p = pin;
    setPin(null);
    if (!p) return;
    if (p.kind === 'new') {
      act.mutate(
        { kind: 'start', input: { supplierId: sup!.id, description: what.trim(), amount: String(amount), depositPercent: deposit, shipWithinDays: days, pin: code, ...(needsCheck ? { confirmNewDetails: true } : {}) } },
        {
          onSuccess: (o) => {
            setCreating(false);
            setWhat('');
            setText('');
            setChecked(false);
            done(`${o.number} started. The rest is held until ${o.supplierName} ships.`);
          },
          onError: failed,
        },
      );
    } else {
      act.mutate(
        { kind: p.kind, id: p.order.id, pin: code },
        {
          onSuccess: (o) => done(p.kind === 'release' ? `${o.number} released to ${o.supplierName}.` : `${o.number} called off. ${money(Number(o.heldAmount))} is back in your balance.`),
          onError: failed,
        },
      );
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {outcome && (
          <Notice tone={outcome.tone} onClose={() => setOutcome(null)}>
            {outcome.text}
          </Notice>
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
          <button type="button" disabled={closed || !choices.length} onClick={() => setCreating(true)} className={primary}>
            <ShieldCheck className="size-4" /> Start a protected order
          </button>
        </div>
        <p className="mt-4 text-[13.5px] text-graphite/55">
          {held.length} {held.length === 1 ? 'order' : 'orders'} in progress
          {!choices.length && !suppliers.isLoading ? ' · Save a supplier first to start one.' : ''}
        </p>
      </section>

      {!orders.isLoading && list.length === 0 && (
        <p className="rounded-2xl border border-dashed border-graphite/20 px-6 py-10 text-center text-[14.5px] text-graphite/55">No protected orders yet. Start one when you next buy from a supplier.</p>
      )}
      {list.map((o) => {
        const i = stageIndex(o.stage);
        const open = o.stage === 'waiting' || o.stage === 'problem';
        return (
          <section key={o.id} className={`${panel} p-6 ${o.stage === 'returned' ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[13px] text-graphite/50">
                  {o.number} · started {shortDate(o.createdAt)}
                </p>
                <p className="mt-0.5 text-[16px] font-semibold">{o.supplierName}</p>
                <p className="text-[14px] text-graphite/60">{o.description}</p>
              </div>
              <div className="text-right">
                <p className="font-ledger text-[20px] font-semibold">{money(Number(o.amount))}</p>
                {Number(o.depositAmount) > 0 && open && (
                  <p className="text-[12.5px] text-graphite/55">
                    {money(Number(o.depositAmount))} deposit paid · {money(Number(o.heldAmount))} held
                  </p>
                )}
                {o.stage === 'returned' && <p className="text-[12.5px] text-graphite/55">Called off · {money(Number(o.heldAmount))} back in your balance</p>}
              </div>
            </div>

            {/* Where the money is */}
            {o.stage !== 'returned' && (
              <ol className="mt-6 grid grid-cols-3 gap-2">
                {STAGES.map((s, n) => (
                  <li key={s.key}>
                    <span className={`block h-1.5 rounded-full ${o.stage === 'problem' && n === 1 ? 'bg-[#c4542a]' : n <= i && !(o.stage === 'problem' && n === 1) ? 'bg-[#1f6b33]' : 'bg-graphite/10'}`} />
                    <span className={`mt-2 block text-[12.5px] ${n <= i ? 'font-medium text-graphite' : 'text-graphite/45'}`}>{o.stage === 'problem' && n === 1 ? 'Problem raised' : s.label}</span>
                  </li>
                ))}
              </ol>
            )}
            {o.note && <p className="mt-4 rounded-lg bg-[#f5f4ef] px-4 py-2.5 text-[13.5px] text-graphite/65">{o.note}</p>}

            {open && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" disabled={act.isPending || closed} onClick={() => setPin({ kind: 'release', order: o })} className={primary}>
                  <CircleCheck className="size-4" /> Goods are fine: release {money(Number(o.heldAmount))}
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
                <button type="button" disabled={act.isPending} onClick={() => setPin({ kind: 'return', order: o })} className={secondary}>
                  <Undo2 className="size-4" /> Call it off
                </button>
                <span className="self-center text-[12.5px] text-graphite/50">Ships by {shortDate(o.shipBy)}</span>
              </div>
            )}
            {problem === o.id && (
              <form
                className="mt-4 flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  act.mutate({ kind: 'problem', id: o.id, note: note.trim() }, { onError: failed });
                  setProblem(null);
                }}
              >
                <input autoFocus value={note} maxLength={400} onChange={(e) => setNote(e.target.value)} placeholder="What’s wrong with the order?" className={field} />
                <button type="submit" className={`${primary} h-11 shrink-0`}>
                  Send
                </button>
              </form>
            )}
          </section>
        );
      })}

      <Drawer open={creating} title="Start a protected order" onClose={() => setCreating(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className={label}>Supplier</span>
            <select value={sup?.id ?? ''} onChange={(e) => (setSupplierId(e.target.value), setChecked(false))} className={field}>
              {choices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>What you’re buying</span>
            <input value={what} maxLength={200} onChange={(e) => setWhat(e.target.value)} placeholder="Packaging machines, 2 units" className={field} />
          </label>
          <label className="block">
            <span className={label}>Order total</span>
            <NairaInput value={amount} onChange={setText} />
            <span className="mt-1.5 block text-[12.5px] text-graphite/50">From your naira balance: {money(balances.NGN)}</span>
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
            {amount && sup ? (
              <>
                <span className="font-semibold text-graphite">{money(dep)}</span> goes to {sup.name} now. <span className="font-semibold text-graphite">{money(amount - dep)}</span> is held until their shipping documents are checked.
              </>
            ) : (
              'Tell us the total, and we’ll show what goes now and what’s held.'
            )}
          </div>
          {needsCheck && sup && (
            <label className={`flex gap-3 rounded-lg border px-3.5 py-3 text-[13.5px] ${sup.bank.recentlyChanged ? 'border-[#f0d3c5] bg-[#fcf1ec]' : 'border-[#ecdcae] bg-[#fbf5e6]'}`}>
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-graphite" />
              <span>
                {sup.bank.recentlyChanged ? 'These bank details changed recently. ' : 'You haven’t paid these details before. '}I’ve checked them with {sup.name} directly, on a number I already had, not only by email or message.
              </span>
            </label>
          )}
          <button type="button" disabled={!ready} onClick={() => setPin({ kind: 'new' })} className={`${primary} h-11 w-full justify-center`}>
            {act.isPending && <Loader2 className="size-4 animate-spin" />}
            Pay {deposit ? `the ${money(dep)} deposit` : 'into protection'}
          </button>
        </div>
      </Drawer>

      <PinPrompt
        open={!!pin}
        title={pin?.kind === 'release' ? `Release to ${pin.order.supplierName}` : pin?.kind === 'return' ? `Call off ${pin.order.number}` : 'Start the protected order'}
        detail={pin && pin.kind !== 'new' ? `${pin.order.number} · ${money(Number(pin.order.heldAmount))}` : `${what.trim()} · ${money(amount)}`}
        onClose={() => setPin(null)}
        onConfirm={confirm}
      />
    </div>
  );
}
