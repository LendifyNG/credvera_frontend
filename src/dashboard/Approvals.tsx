import { AnimatePresence, motion } from 'framer-motion';
import { Check, CornerUpLeft, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { approve, money, RATES, sendBack, shortDate, TRANSFER_FEE, useDash, type Payment } from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;

// Letters only, so "Tunde (Finance)" gives "TF".
const initials = (name: string) =>
  name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

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

/** Big payments waiting for a second person. Whoever asked can't approve their own. */
export default function Approvals() {
  const { payments, session, balances, rules } = useDash();
  const waiting = payments.filter((p) => p.status === 'waiting');
  const decided = payments.filter((p) => p.requestedBy && p.status !== 'waiting');
  const [tab, setTab] = useState<'waiting' | 'decided'>('waiting');
  const [picked, setPicked] = useState<string[]>([]);
  const [pinFor, setPinFor] = useState<Payment[] | null>(null);
  const [backFor, setBackFor] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const mine = (p: Payment) => !!session && (p.requestedBy ?? '').startsWith(session.person);
  // Only the roles chosen in Team can approve.
  const canDecide = !!session && rules.approvers.includes(session.role);
  const canApprove = canDecide ? waiting.filter((p) => !mine(p)) : [];
  const total = waiting.reduce((a, p) => a + p.amount * RATES[p.currency], 0);
  const oldest = waiting.length ? Math.max(...waiting.map((p) => Math.floor((Date.now() - new Date(p.date).getTime()) / DAY))) : 0;
  const nairaAfter = balances.NGN - waiting.filter((p) => p.currency === 'NGN').reduce((a, p) => a + p.amount + TRANSFER_FEE, 0);
  const chosen = canApprove.filter((p) => picked.includes(p.id));

  const toggle = (id: string) => setPicked((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Approvals</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Payments of {money(rules.over).replace(/\.00$/, '')} or more wait here for a second person.</p>
        </div>
        <Link to="/business/app/team/roles" className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold hover:border-graphite/30">
          <ShieldCheck className="size-4" /> Approval rules
        </Link>
      </div>

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
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex items-center gap-2 rounded-xl border border-[#cfe8c9] bg-[#eef8ea] px-4 py-3 text-[14px] font-medium text-[#1f6b33]">
            <Check className="size-4" /> {done}
          </motion.p>
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
            <button type="button" onClick={() => setPinFor(chosen)} className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
              <Check className="size-4" /> Approve {chosen.length} selected
            </button>
          )}
        </div>

        {tab === 'waiting' ? (
          waiting.length === 0 ? (
            <div className="py-14 text-center">
              <AllClear />
              <p className="mt-4 text-[16px] font-semibold">Nothing waiting</p>
              <p className="mt-1 text-[14px] text-graphite/55">New requests appear here, and on Home.</p>
            </div>
          ) : (
            <ul>
              <AnimatePresence initial={false}>
                {waiting.map((p) => (
                  <motion.li key={p.id} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden border-b border-graphite/[0.07] last:border-0">
                    <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={picked.includes(p.id)}
                        disabled={mine(p) || !canDecide}
                        onChange={() => toggle(p.id)}
                        aria-label={`Select ${p.who}`}
                        className="size-4 accent-[#141c17] disabled:opacity-30"
                      />
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[11.5px] font-semibold" title={`Asked by ${p.requestedBy}`}>
                        {initials(p.requestedBy ?? '?')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium">
                          {p.who} <span className="font-normal text-graphite/50">· {p.reason}</span>
                        </span>
                        <span className="block text-[13px] text-graphite/50">
                          Asked by {p.requestedBy} · {shortDate(p.date)}
                        </span>
                      </span>
                      <span className="font-ledger text-[17px] font-semibold">{money(p.amount, p.currency)}</span>
                      {!canDecide ? (
                        <span className="w-full text-[13px] text-graphite/50 sm:w-auto">Approved by {rules.approvers.join(' or ')}.</span>
                      ) : mine(p) ? (
                        <span className="w-full text-[13px] text-graphite/50 sm:w-auto">You asked for this one; someone else approves it.</span>
                      ) : (
                        <span className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBackFor(backFor === p.id ? null : p.id);
                              setNote('');
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-graphite/15 px-3 text-[13.5px] font-semibold hover:border-graphite/30"
                          >
                            <CornerUpLeft className="size-4" /> Send back
                          </button>
                          <button type="button" onClick={() => setPinFor([p])} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-graphite px-3.5 text-[13.5px] font-semibold text-white hover:bg-black">
                            <Check className="size-4" /> Approve
                          </button>
                        </span>
                      )}
                    </div>
                    <AnimatePresence>
                      {backFor === p.id && (
                        <motion.form
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-[#faf9f5]"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!note.trim()) return;
                            sendBack(p.id, note.trim());
                            setBackFor(null);
                            setDone(`Sent back to ${p.requestedBy?.split(' ')[0]} with your note.`);
                          }}
                        >
                          <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row">
                            <input
                              autoFocus
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder={`Why it's going back, for ${p.requestedBy?.split(' ')[0]}`}
                              aria-label="Why it's going back"
                              className="h-10 flex-1 rounded-lg border border-graphite/15 bg-white px-3.5 text-[14.5px] outline-none focus:border-graphite/50"
                            />
                            <button type="submit" className="h-10 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
                              Send back
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.li>
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
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-4 text-graphite/60">{shortDate(p.date)}</td>
                    <td className="py-3.5 pr-4 font-medium">{p.who}</td>
                    <td className="py-3.5 pr-4 text-graphite/65">{p.requestedBy}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger font-medium">{money(p.amount, p.currency)}</td>
                    <td className="py-3.5 pr-5">
                      {p.status === 'sent back' ? (
                        <span className="text-[13px]">
                          <span className="rounded-md bg-[#f6e7e0] px-2 py-0.5 font-medium text-[#9a3a17]">Sent back</span>
                          {p.note && <span className="ml-2 text-graphite/55">“{p.note}”</span>}
                        </span>
                      ) : (
                        <span className="rounded-md bg-[#e3f1e0] px-2 py-0.5 text-[13px] font-medium text-[#1f6b33]">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PinPrompt
        open={!!pinFor}
        title={pinFor ? (pinFor.length === 1 ? `Approve ${money(pinFor[0]!.amount, pinFor[0]!.currency)}` : `Approve ${pinFor.length} payments`) : ''}
        detail={
          pinFor
            ? pinFor.length === 1
              ? `To ${pinFor[0]!.who}, asked by ${pinFor[0]!.requestedBy}`
              : `${money(pinFor.reduce((a, p) => a + p.amount * RATES[p.currency], 0))} in total`
            : undefined
        }
        onClose={() => setPinFor(null)}
        onConfirm={() => {
          if (!pinFor) return;
          pinFor.forEach((p) => approve(p.id));
          setDone(pinFor.length === 1 ? `Approved. ${money(pinFor[0]!.amount, pinFor[0]!.currency)} is on its way to ${pinFor[0]!.who}.` : `Approved ${pinFor.length} payments.`);
          setPicked([]);
          setPinFor(null);
        }}
      />
    </div>
  );
}
