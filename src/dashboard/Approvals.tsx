import { AnimatePresence, motion } from 'framer-motion';
import { Check, CornerUpLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, useApprovals, useApprove, useCancelApproval, useReject, type ApprovalDto, type ApprovalStatus } from '../api';
import { useActiveBusiness, useBalances } from './data';
import { money, shortDate } from './model';
import { Notice, PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;

const STATUS: Record<ApprovalStatus, { label: string; tone: string }> = {
  pending: { label: 'Waiting', tone: 'bg-[#fbf5e6] text-[#8a5a00]' },
  approved: { label: 'Approved', tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
  rejected: { label: 'Sent back', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
  cancelled: { label: 'Withdrawn', tone: 'bg-[#efeee7] text-graphite/55' },
  expired: { label: 'Lapsed', tone: 'bg-[#efeee7] text-graphite/55' },
  failed: { label: 'Approved, didn’t go', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
};

// Letters only, so "Tunde (Finance)" gives "TF".
const initials = (name: string) =>
  name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const naira = (v: string) => money(Number(v));
const payee = (p: ApprovalDto) => p.to.supplierName ?? p.to.accountName;
const asker = (p: ApprovalDto) => (p.requestedByYou ? 'you' : p.requestedBy);
const firstName = (p: ApprovalDto) => p.requestedBy.split(' ')[0];
const left = (iso: string) => {
  const h = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3_600_000));
  return h < 1 ? 'under an hour' : h < 48 ? `${h} hours` : `${Math.round(h / 24)} days`;
};

/** A quiet drawing for when nothing is waiting: a ledger with its line ticked off. */
function AllClear() {
  return (
    <svg viewBox="0 0 120 80" className="mx-auto h-16 w-auto" aria-hidden>
      <rect x="22" y="10" width="76" height="60" rx="6" fill="#f5f4ef" stroke="#141c17" strokeOpacity="0.15" />
      {[26, 38, 50].map((y) => (
        <line key={y} x1="34" x2="86" y1={y} y2={y} stroke="#141c17" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
      ))}
      <circle cx="92" cy="58" r="14" fill="#7fde80" />
      <path d="M85 58 l5 5 l9 -10" fill="none" stroke="#141c17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Big payments waiting for a second person. Nothing moves until it's
 * approved; then it's sent from the balance as it stands, with the approver's
 * PIN. Whoever asked can't approve their own.
 */
export default function Approvals() {
  const business = useActiveBusiness();
  const approvals = useApprovals(!!business);
  const { balances } = useBalances();
  const approve = useApprove();
  const [tab, setTab] = useState<'waiting' | 'decided'>('waiting');
  const [picked, setPicked] = useState<string[]>([]);
  const [pinFor, setPinFor] = useState<ApprovalDto[] | null>(null);
  const [done, setDone] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  const a = approvals.data;
  const waiting = a?.waiting ?? [];
  const decided = a?.history ?? [];
  const chosen = waiting.filter((p) => p.canDecide && picked.includes(p.id));
  const total = waiting.reduce((sum, p) => sum + Number(p.amount), 0);
  const oldest = waiting.length ? Math.max(...waiting.map((p) => Math.floor((Date.now() - new Date(p.createdAt).getTime()) / DAY))) : 0;
  const nairaAfter = balances.NGN - total;

  const toggle = (id: string) => setPicked((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));

  // One PIN covers the batch; each payment is approved in turn, so one that
  // can't go doesn't stop the rest.
  const confirm = async (pin: string) => {
    const batch = pinFor ?? [];
    setPinFor(null);
    let sent = 0;
    let problem: string | null = null;
    for (const p of batch) {
      try {
        const after = await approve.mutateAsync({ id: p.id, pin });
        const row = after.history.find((h) => h.id === p.id);
        if (row?.status === 'approved') sent++;
        else problem ??= `${naira(p.amount)} to ${payee(p)} was approved but didn’t go: ${row?.note ?? 'the transfer failed'}. Nothing was taken.`;
      } catch (error) {
        problem ??= errorMessage(error);
        break;
      }
    }
    setPicked([]);
    if (problem) setDone({ tone: 'bad', text: sent ? `Approved ${sent}. ${problem}` : problem });
    else if (batch.length === 1) setDone({ tone: 'good', text: `Approved. ${naira(batch[0]!.amount)} is on its way to ${payee(batch[0]!)}.` });
    else setDone({ tone: 'good', text: `Approved ${sent} payments.` });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{business?.name}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Approvals</h1>
          <p className="mt-1 text-[15px] text-graphite/55">
            {a?.threshold ? `Payments of ${naira(a.threshold).replace(/\.00$/, '')} or more wait here for a second person.` : 'Big payments, checked by a second person before they go.'}
          </p>
        </div>
        <Link to="/business/app/team/roles" className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold hover:border-graphite/30">
          <ShieldCheck className="size-4" /> Approval rules
        </Link>
      </div>

      {approvals.isLoading ? (
        <Loader2 className="mx-auto mt-14 size-5 animate-spin text-graphite/40" aria-label="Loading" />
      ) : approvals.error ? (
        <p className="mt-10 text-center text-[14px] text-[#a3261b]">{errorMessage(approvals.error)}</p>
      ) : a ? (
        <>
          {/* The picture in four numbers */}
          <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Waiting', value: `${waiting.length} ${waiting.length === 1 ? 'payment' : 'payments'}` },
              { label: 'In total', value: money(total) },
              { label: 'Oldest waiting', value: waiting.length ? (oldest === 0 ? 'Since today' : `${oldest} ${oldest === 1 ? 'day' : 'days'}`) : '—' },
              { label: 'Naira left after all', value: money(nairaAfter), tone: nairaAfter < 0 ? 'text-[#9a3a17]' : '' },
            ].map((s, i) => (
              <div key={s.label} className={`border-graphite/10 px-6 py-5 ${i ? 'border-t sm:border-t-0' : ''} ${i % 2 ? 'sm:border-l' : ''} ${i >= 2 ? 'sm:border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
                <p className="text-[13px] font-medium text-graphite/55">{s.label}</p>
                <p className={`mt-1 font-ledger text-[20px] font-semibold tracking-[-0.02em] ${s.tone ?? ''}`}>{s.value}</p>
              </div>
            ))}
          </section>

          <AnimatePresence>
            {done && (
              <div className="mt-6">
                <Notice tone={done.tone} onClose={() => setDone(null)}>
                  {done.text}
                </Notice>
              </div>
            )}
          </AnimatePresence>

          <section className="mt-6 rounded-2xl border border-graphite/10 bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-graphite/10 p-4">
              <div className="flex rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium">
                {(['waiting', 'decided'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-3 py-1 capitalize ${tab === t ? 'bg-white shadow-sm' : 'text-graphite/55 hover:text-graphite'}`}>
                    {t}
                    {t === 'waiting' && waiting.length ? <span className="ml-1.5 rounded bg-[#f5c451] px-1.5 text-[11px] font-semibold text-graphite">{waiting.length}</span> : null}
                  </button>
                ))}
              </div>
              {tab === 'waiting' && chosen.length > 0 && (
                <button type="button" disabled={approve.isPending} onClick={() => setPinFor(chosen)} className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black disabled:opacity-50">
                  {approve.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Approve {chosen.length} selected
                </button>
              )}
            </div>

            {tab === 'waiting' ? (
              waiting.length === 0 ? (
                <div className="py-14 text-center">
                  <AllClear />
                  <p className="mt-4 text-[16px] font-semibold">Nothing waiting</p>
                  <p className="mt-1 text-[14px] text-graphite/55">{a.threshold ? 'New requests appear here, and on Home.' : 'Approvals are off, so every payment goes as soon as it’s confirmed.'}</p>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {waiting.map((p) => (
                      <Waiting key={p.id} p={p} picked={picked.includes(p.id)} onPick={() => toggle(p.id)} onApprove={() => setPinFor([p])} busy={approve.isPending} inNaira={balances.NGN} onDone={setDone} />
                    ))}
                  </AnimatePresence>
                </ul>
              )
            ) : decided.length === 0 ? (
              <p className="py-14 text-center text-[14px] text-graphite/50">Decisions will show here.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                      <th className="py-3 pl-5 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">To</th>
                      <th className="py-3 pr-4 font-medium">Asked by</th>
                      <th className="py-3 pr-4 text-right font-medium">Amount</th>
                      <th className="py-3 pr-5 font-medium">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decided.map((p) => (
                      <tr key={p.id} className="border-b border-graphite/[0.06] last:border-0">
                        <td className="whitespace-nowrap py-3.5 pl-5 pr-4 text-graphite/60">{shortDate(p.createdAt)}</td>
                        <td className="py-3.5 pr-4 font-medium">{payee(p)}</td>
                        <td className="py-3.5 pr-4 text-graphite/65">{p.requestedByYou ? 'You' : p.requestedBy}</td>
                        <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{naira(p.amount)}</td>
                        <td className="py-3.5 pr-5">
                          <span className="text-[13px]">
                            <span className={`rounded-md px-2 py-0.5 font-medium ${STATUS[p.status].tone}`}>{STATUS[p.status].label}</span>
                            {p.decidedBy && <span className="ml-2 text-graphite/50">by {p.decidedBy}</span>}
                            {p.note && <span className="ml-2 text-graphite/55">“{p.note}”</span>}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <PinPrompt
        open={!!pinFor}
        title={pinFor ? (pinFor.length === 1 ? `Approve ${naira(pinFor[0]!.amount)}` : `Approve ${pinFor.length} payments`) : ''}
        detail={
          pinFor
            ? pinFor.length === 1
              ? `To ${payee(pinFor[0]!)}, asked by ${pinFor[0]!.requestedBy}`
              : `${money(pinFor.reduce((sum, p) => sum + Number(p.amount), 0))} in total`
            : undefined
        }
        onClose={() => setPinFor(null)}
        onConfirm={confirm}
      />

    </div>
  );
}

function Waiting({
  p,
  picked,
  onPick,
  onApprove,
  busy,
  inNaira,
  onDone,
}: {
  p: ApprovalDto;
  picked: boolean;
  onPick: () => void;
  onApprove: () => void;
  busy: boolean;
  inNaira: number;
  onDone: (n: { tone: 'good' | 'bad'; text: string }) => void;
}) {
  const reject = useReject();
  const cancel = useCancelApproval();
  const [back, setBack] = useState(false);
  const [note, setNote] = useState('');
  const working = busy || reject.isPending || cancel.isPending;

  return (
    <motion.li layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden border-b border-graphite/[0.07] last:border-0">
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <input type="checkbox" checked={picked} disabled={!p.canDecide} onChange={onPick} aria-label={`Select ${payee(p)}`} className="size-4 accent-[#141c17] disabled:opacity-30" />
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[11.5px] font-semibold" title={`Asked by ${p.requestedBy}`}>
          {initials(p.requestedBy)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium">
            {payee(p)} <span className="font-normal text-graphite/50">· {p.narration ?? `${p.to.bankName} ••••${p.to.accountLast4}`}</span>
          </span>
          <span className="block text-[13px] text-graphite/50">
            Asked by {asker(p)} · {shortDate(p.createdAt)} · lapses in {left(p.expiresAt)}
          </span>
        </span>
        <span className="font-ledger text-[17px] font-semibold">{naira(p.amount)}</span>
        {p.canDecide ? (
          <span className="flex gap-2">
            <button
              type="button"
              disabled={working}
              onClick={() => {
                setBack(!back);
                setNote('');
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-graphite/15 px-3 text-[13.5px] font-semibold hover:border-graphite/30 disabled:opacity-40"
            >
              <CornerUpLeft className="size-4" /> Send back
            </button>
            <button type="button" disabled={working} onClick={onApprove} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-graphite px-3.5 text-[13.5px] font-semibold text-white hover:bg-black disabled:opacity-40">
              <Check className="size-4" /> Approve
            </button>
          </span>
        ) : p.canCancel ? (
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-graphite/50">You asked for this one; someone else approves it.</span>
            <button
              type="button"
              disabled={working}
              onClick={() => cancel.mutate(p.id, { onSuccess: () => onDone({ tone: 'good', text: 'Withdrawn. Nothing was sent.' }) })}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-graphite/15 px-3 text-[13.5px] font-semibold hover:border-graphite/30 disabled:opacity-40"
            >
              Withdraw
            </button>
          </span>
        ) : (
          <span className="w-full text-[13px] text-graphite/50 sm:w-auto">Approved by the owner or an admin.</span>
        )}
      </div>
      {p.canDecide && Number(p.amount) > inNaira && <p className="-mt-2 px-5 pb-3 text-[13px] text-[#9a3a17] sm:pl-[4.75rem]">The naira account holds {money(inNaira)} now: not enough to send this.</p>}
      {cancel.error && <p className="-mt-2 px-5 pb-3 text-[13px] text-[#a3261b] sm:pl-[4.75rem]">{errorMessage(cancel.error)}</p>}
      <AnimatePresence>
        {back && (
          <motion.form
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-[#faf9f5]"
            onSubmit={(e) => {
              e.preventDefault();
              if (note.trim().length < 5) return;
              reject.mutate(
                { id: p.id, note: note.trim() },
                {
                  onSuccess: () => {
                    setBack(false);
                    onDone({ tone: 'good', text: `Sent back to ${p.requestedByYou ? 'you' : firstName(p)} with your note. Nothing was sent.` });
                  },
                },
              );
            }}
          >
            <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row">
              <input
                autoFocus
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`Why it's going back, for ${firstName(p)}`}
                aria-label="Why it's going back"
                className="h-10 flex-1 rounded-lg border border-graphite/15 bg-white px-3.5 text-[14.5px] outline-none focus:border-graphite/50"
              />
              <button type="submit" disabled={note.trim().length < 5 || reject.isPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black disabled:opacity-40">
                {reject.isPending && <Loader2 className="size-4 animate-spin" />} Send back
              </button>
            </div>
            {reject.error && <p className="px-5 pb-3 text-[13px] text-[#a3261b]">{errorMessage(reject.error)}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

