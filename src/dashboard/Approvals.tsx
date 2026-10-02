import { AnimatePresence } from 'framer-motion';
import { CheckCheck, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, useApprovals, useApprove, useCancelApproval, useReject, useSetThreshold, type ApprovalDto, type ApprovalStatus } from '../api';
import { useActiveBusiness, useBalances } from './data';
import { money, shortDate } from './model';
import { Modal } from './money';
import { label, NairaInput, nairaFrom, panel, primary } from './pay/shared';
import { Notice, PinPrompt } from './ui';

const secondary = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold transition-colors hover:border-graphite/35 disabled:opacity-40';

const STATUS: Record<ApprovalStatus, { label: string; tone: string }> = {
  pending: { label: 'Waiting', tone: 'bg-[#fbf5e6] text-[#8a5a00]' },
  approved: { label: 'Approved and sent', tone: 'bg-[#e3f1e6] text-[#1f6b33]' },
  rejected: { label: 'Rejected', tone: 'bg-[#fbe9e7] text-[#a3261b]' },
  cancelled: { label: 'Withdrawn', tone: 'bg-[#efeee7] text-graphite/55' },
  expired: { label: 'Lapsed', tone: 'bg-[#efeee7] text-graphite/55' },
  failed: { label: 'Approved, didn’t go', tone: 'bg-[#fbe9e7] text-[#a3261b]' },
};

const left = (iso: string) => {
  const h = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3_600_000));
  return h < 1 ? 'under an hour' : h < 48 ? `${h} hours` : `${Math.round(h / 24)} days`;
};
const naira = (v: string) => money(Number(v));

/**
 * Approvals: payments over the limit, waiting for someone else on the team.
 * Nothing moves until it's approved; then it's sent from the balance as it
 * stands, with the approver's PIN.
 */
export default function Approvals() {
  const business = useActiveBusiness();
  const approvals = useApprovals(!!business);
  const [done, setDone] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const a = approvals.data;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{business?.name}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Approvals</h1>
      <p className="mt-1 text-[15px] text-graphite/55">Big payments, checked by a second person before they go.</p>

      <AnimatePresence>
        {done && (
          <div className="mt-5">
            <Notice tone={done.tone} onClose={() => setDone(null)}>
              {done.text}
            </Notice>
          </div>
        )}
      </AnimatePresence>

      {approvals.isLoading ? (
        <Loader2 className="mx-auto mt-14 size-5 animate-spin text-graphite/40" aria-label="Loading" />
      ) : approvals.error ? (
        <p className="mt-10 text-center text-[14px] text-[#a3261b]">{errorMessage(approvals.error)}</p>
      ) : a ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <section className={`${panel} overflow-hidden`}>
              <h2 className="border-b border-graphite/[0.07] px-5 py-4 text-[16px] font-semibold">
                Waiting {a.waiting.length > 0 && <span className="ml-1 font-ledger text-graphite/50">{a.waiting.length}</span>}
              </h2>
              {a.waiting.length ? (
                <ul className="divide-y divide-graphite/[0.07]">
                  {a.waiting.map((p) => (
                    <Waiting key={p.id} p={p} onDone={setDone} />
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <CheckCheck className="mx-auto size-6 text-graphite/35" />
                  <p className="mt-2 text-[14.5px] text-graphite/55">{a.threshold ? 'Nothing waiting.' : 'Nothing waits while approvals are off.'}</p>
                </div>
              )}
            </section>

            {a.history.length > 0 && (
              <section className={`${panel} overflow-hidden`}>
                <h2 className="border-b border-graphite/[0.07] px-5 py-4 text-[16px] font-semibold">Decided</h2>
                <ul className="divide-y divide-graphite/[0.07]">
                  {a.history.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-start gap-3 px-5 py-3.5 text-[14px]">
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {naira(p.amount)} to {p.to.supplierName ?? p.to.accountName}
                        </span>
                        <span className="block text-[12.5px] text-graphite/50">
                          Asked by {p.requestedByYou ? 'you' : p.requestedBy} · {shortDate(p.createdAt)}
                          {p.decidedBy && ` · ${p.status === 'cancelled' ? 'withdrawn' : 'decided'} by ${p.decidedBy}`}
                          {p.transferReference && ` · ${p.transferReference}`}
                        </span>
                        {p.note && <span className="mt-0.5 block text-[13px] text-graphite/70">“{p.note}”</span>}
                      </span>
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[12px] font-medium ${STATUS[p.status].tone}`}>{STATUS[p.status].label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside>
            <Limit threshold={a.threshold} approvers={a.approvers} canManage={a.you.canManage} closed={!!business?.closedAt} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function Waiting({ p, onDone }: { p: ApprovalDto; onDone: (n: { tone: 'good' | 'bad'; text: string }) => void }) {
  const approve = useApprove();
  const reject = useReject();
  const cancel = useCancelApproval();
  const { balances } = useBalances();
  const [pin, setPin] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const busy = approve.isPending || reject.isPending || cancel.isPending;
  const error = approve.error ?? cancel.error;
  const to = p.to.supplierName ? `${p.to.supplierName} (${p.to.accountName})` : p.to.accountName;

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-ledger text-[20px] font-semibold tracking-[-0.02em]">{naira(p.amount)}</p>
          <p className="mt-0.5 text-[14.5px]">
            To <span className="font-semibold">{to}</span> · {p.to.bankName} ••••{p.to.accountLast4}
          </p>
          {p.narration && <p className="text-[13.5px] text-graphite/60">For: {p.narration}</p>}
          <p className="mt-1 text-[12.5px] text-graphite/50">
            Asked by {p.requestedByYou ? 'you' : p.requestedBy} · {shortDate(p.createdAt)} · lapses in {left(p.expiresAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.canDecide && (
            <>
              <button type="button" disabled={busy} onClick={() => setRejecting(true)} className={secondary}>
                Reject
              </button>
              <button type="button" disabled={busy} onClick={() => setPin(true)} className={primary}>
                {approve.isPending && <Loader2 className="size-4 animate-spin" />} Approve and send
              </button>
            </>
          )}
          {p.canCancel && (
            <button type="button" disabled={busy} onClick={() => cancel.mutate(p.id, { onSuccess: () => onDone({ tone: 'good', text: 'Withdrawn. Nothing was sent.' }) })} className={secondary}>
              Withdraw
            </button>
          )}
        </div>
      </div>
      {!p.canDecide && !p.canCancel && <p className="mt-2 text-[13px] text-graphite/55">Waiting for the owner or an admin.</p>}
      {p.canCancel && <p className="mt-2 text-[13px] text-graphite/55">Waiting for someone else to approve it.</p>}
      {p.canDecide && Number(p.amount) + 10 > balances.NGN && <p className="mt-2 text-[13px] text-[#9a3a17]">The naira account holds {money(balances.NGN)} now: not enough to send this.</p>}
      {error && <p className="mt-2 text-[13px] text-[#a3261b]">{errorMessage(error)}</p>}

      <PinPrompt
        open={pin}
        title={`Approve ${naira(p.amount)}`}
        detail={`To ${to} · asked by ${p.requestedBy}`}
        onClose={() => setPin(false)}
        onConfirm={(code) => {
          setPin(false);
          approve.mutate(
            { id: p.id, pin: code },
            {
              onSuccess: (data) => {
                const after = [...data.history].find((h) => h.id === p.id);
                onDone(
                  after?.status === 'approved'
                    ? { tone: 'good', text: `Approved. ${naira(p.amount)} is on its way to ${p.to.accountName}.` }
                    : { tone: 'bad', text: `Approved, but the payment didn’t go: ${after?.note ?? 'the transfer failed'}. Nothing was taken.` },
                );
              },
            },
          );
        }}
      />

      <Modal open={rejecting} title={`Reject ${naira(p.amount)}?`} onClose={() => setRejecting(false)}>
        <p className="text-[14.5px] text-graphite/65">Nothing is sent. {p.requestedBy} sees your reason.</p>
        <textarea autoFocus value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} placeholder="For example: we paid this invoice last week" aria-label="Reason" className="mt-3 w-full resize-none rounded-lg border border-graphite/15 px-3.5 py-2.5 text-[15px] outline-none placeholder:text-graphite/35 focus:border-graphite/50" />
        {reject.error && <p className="mt-2 text-[13.5px] text-[#a3261b]">{errorMessage(reject.error)}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setRejecting(false)} className={secondary}>
            Cancel
          </button>
          <button
            type="button"
            disabled={note.trim().length < 5 || reject.isPending}
            onClick={() =>
              reject.mutate(
                { id: p.id, note: note.trim() },
                {
                  onSuccess: () => {
                    setRejecting(false);
                    onDone({ tone: 'good', text: 'Rejected. Nothing was sent.' });
                  },
                },
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#a3261b] px-4 text-[14px] font-semibold text-white hover:bg-[#8f1c13] disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      </Modal>
    </li>
  );
}

function Limit({ threshold, approvers, canManage, closed }: { threshold: string | null; approvers: number; canManage: boolean; closed: boolean }) {
  const set = useSetThreshold();
  const [text, setText] = useState(threshold ? String(Math.round(Number(threshold))) : '500000');
  const amount = nairaFrom(text);
  const on = threshold !== null;

  return (
    <section className={`${panel} p-5`}>
      <div className="flex items-center gap-2">
        <ShieldCheck className={`size-5 ${on ? 'text-[#1f6b33]' : 'text-graphite/35'}`} />
        <h2 className="text-[16px] font-semibold">{on ? 'Approvals are on' : 'Approvals are off'}</h2>
      </div>
      <p className="mt-1.5 text-[14px] text-graphite/60">
        {on
          ? `Naira payments of ${naira(threshold!)} or more wait for the owner or an admin. Whoever asked can’t approve their own.`
          : 'Every payment goes as soon as it’s confirmed.'}
      </p>

      {approvers < 2 ? (
        <p className="mt-4 rounded-lg bg-[#f5f4ef] px-3.5 py-3 text-[13.5px] text-graphite/70">
          Approvals need two people who can approve, so neither waits on themselves: the owner and at least one admin.{' '}
          <Link to="/business/app/team" className="font-semibold text-graphite underline-offset-4 hover:underline">
            Invite an admin
          </Link>
        </p>
      ) : canManage && !closed ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className={label}>{on ? 'Limit' : 'Turn on for payments of'}</span>
            <NairaInput value={amount} onChange={setText} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={amount < 1000 || set.isPending || (on && amount === Number(threshold))} onClick={() => set.mutate(String(amount))} className={primary}>
              {set.isPending && <Loader2 className="size-4 animate-spin" />} {on ? 'Change the limit' : 'Turn on'}
            </button>
            {on && (
              <button type="button" disabled={set.isPending} onClick={() => set.mutate(null)} className={secondary}>
                Turn off
              </button>
            )}
          </div>
          {amount > 0 && amount < 1000 && <p className="text-[13px] text-graphite/55">The limit is ₦1,000 at least.</p>}
          {set.error && <p className="text-[13px] text-[#a3261b]">{errorMessage(set.error)}</p>}
        </div>
      ) : (
        !canManage && <p className="mt-3 text-[13px] text-graphite/50">The owner or an admin sets the limit.</p>
      )}
      <p className="mt-4 text-[12.5px] text-graphite/45">Bank transfers and supplier payments. Airtime, data and electricity aren’t held.</p>
    </section>
  );
}


