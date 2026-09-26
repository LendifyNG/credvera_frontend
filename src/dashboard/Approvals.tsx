import { AnimatePresence, motion } from 'framer-motion';
import { Check, CornerUpLeft } from 'lucide-react';
import { useState } from 'react';
import { approve, money, sendBack, shortDate, useDash, type Payment } from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;

/** Big payments waiting for a second person. The one who asked can't approve their own. */
export default function Approvals() {
  const { payments, session } = useDash();
  const waiting = payments.filter((p) => p.status === 'waiting');
  const decided = payments.filter((p) => p.requestedBy && p.status !== 'waiting').slice(0, 8);
  const [pinFor, setPinFor] = useState<Payment | null>(null);
  const [backFor, setBackFor] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const mine = (p: Payment) => !!session && (p.requestedBy ?? '').startsWith(session.person);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.04em]">Approvals</h1>
      <p className="mt-2 max-w-xl text-[16px] text-graphite/60">Big payments wait here for a second person. Approve with your PIN, or send one back with a note.</p>

      <ul className="mt-10 space-y-4">
        <AnimatePresence initial={false}>
          {waiting.length === 0 && (
            <motion.li key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white p-10 text-center ring-1 ring-graphite/10">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/30 text-[#1f5c30]">
                <Check className="size-6" />
              </span>
              <p className="mt-4 text-lg font-semibold">Nothing waiting</p>
              <p className="text-[14px] text-graphite/55">New requests will appear here.</p>
            </motion.li>
          )}
          {waiting.map((p) => (
            <motion.li key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden rounded-2xl bg-white ring-1 ring-graphite/10">
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-[13px] font-medium text-graphite/50">
                    Asked by {p.requestedBy} · {shortDate(p.date)}
                  </p>
                  <p className="mt-2 font-ledger text-[clamp(1.6rem,3vw,2.2rem)] font-medium tabular-nums tracking-[-0.03em]">{money(p.amount, p.currency)}</p>
                  <p className="mt-1 text-[15px]">
                    To <span className="font-semibold">{p.who}</span> · {p.reason}
                  </p>
                </div>
                {mine(p) ? (
                  <p className="text-[14px] text-graphite/55 md:text-right">You asked for this one.<br />Someone else has to approve it.</p>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setBackFor(backFor === p.id ? null : p.id); setNote(''); }} className="inline-flex h-11 items-center gap-2 rounded-md px-4 text-[14px] font-semibold ring-1 ring-graphite/20 hover:bg-ledger">
                      <CornerUpLeft className="size-4" /> Send back
                    </button>
                    <button type="button" onClick={() => setPinFor(p)} className="inline-flex h-11 items-center gap-2 rounded-md bg-graphite px-5 text-[14px] font-semibold text-white hover:bg-black">
                      <Check className="size-4" /> Approve
                    </button>
                  </div>
                )}
              </div>
              <AnimatePresence>
                {backFor === p.id && (
                  <motion.form
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-graphite/10 bg-ledger"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!note.trim()) return;
                      sendBack(p.id, note.trim());
                      setBackFor(null);
                    }}
                  >
                    <div className="flex flex-col gap-3 p-5 sm:flex-row">
                      <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder={`A note for ${p.requestedBy?.split(' ')[0]}`} aria-label="Why it's going back" className="h-11 flex-1 rounded-md bg-white px-4 text-[15px] outline-none ring-1 ring-graphite/15 focus:ring-graphite" />
                      <button type="submit" className="h-11 rounded-md bg-graphite px-5 text-[14px] font-semibold text-white hover:bg-black">Send back</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {decided.length > 0 && (
        <section className="mt-16">
          <p className="text-[15px] font-semibold">Decided</p>
          <ul className="mt-3 divide-y divide-graphite/[0.08] border-y border-graphite/10">
            {decided.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                <span>
                  <span className="block text-[15px] font-medium">{p.who}</span>
                  <span className="block text-[13px] text-graphite/50">{p.status === 'sent back' ? `Sent back · “${p.note}”` : `Approved and paid · ${shortDate(p.date)}`}</span>
                </span>
                <span className="font-ledger text-[14px] tabular-nums">{money(p.amount, p.currency)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PinPrompt
        open={!!pinFor}
        title={pinFor ? `Approve ${money(pinFor.amount, pinFor.currency)}` : ''}
        detail={pinFor ? `To ${pinFor.who}, asked by ${pinFor.requestedBy}` : undefined}
        onClose={() => setPinFor(null)}
        onConfirm={() => {
          if (pinFor) approve(pinFor.id);
          setPinFor(null);
        }}
      />
    </div>
  );
}
