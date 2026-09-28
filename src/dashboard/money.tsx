import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { convert, money, nairaAccount, RATES, RATES_UPDATED, type Currency } from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;

export const CURRENCIES: { code: Currency; name: string; flag: string }[] = [
  { code: 'NGN', name: 'Naira', flag: 'ng' },
  { code: 'USD', name: 'US Dollar', flag: 'us' },
  { code: 'GBP', name: 'British Pound', flag: 'gb' },
  { code: 'EUR', name: 'Euro', flag: 'eu' },
];

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-graphite/40 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-7 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold tracking-tight">{title}</p>
              <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/40 hover:text-graphite">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AddMoney({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(nairaAccount.number).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <Modal open={open} title="Add money" onClose={onClose}>
      <p className="mt-1 text-[14px] text-graphite/55">Send naira from any Nigerian bank to these details. It arrives in seconds.</p>
      <dl className="mt-6 divide-y divide-graphite/10 rounded-2xl bg-ledger px-5">
        {[
          ['Account name', nairaAccount.name],
          ['Bank', nairaAccount.bank],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3.5 text-[14px]">
            <dt className="text-graphite/55">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 py-3.5">
          <dt className="text-[14px] text-graphite/55">Account number</dt>
          <dd className="flex items-center gap-3">
            <span className="font-ledger text-[17px] font-semibold tracking-wide">{nairaAccount.number}</span>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-graphite px-3 py-1.5 text-[12px] font-semibold text-white">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? 'Copied' : 'Copy'}
            </button>
          </dd>
        </div>
      </dl>
    </Modal>
  );
}

/**
 * Converting between the business's own balances at today's rate, confirmed
 * with the PIN. Used on the FX page and in the Convert pop-up.
 */
export function ConvertForm({ balances, onClose }: { balances: Record<Currency, number>; onClose?: () => void }) {
  const [from, setFrom] = useState<Currency>('USD');
  const [to, setTo] = useState<Currency>('NGN');
  const [text, setText] = useState('');
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const amount = Number(text.replace(/[^\d.]/g, '')) || 0;
  const rate = RATES[from] / RATES[to];
  const receive = amount * rate;
  const valid = amount > 0 && from !== to && amount <= balances[from];
  const select = 'h-12 rounded-lg border border-graphite/15 bg-white px-3 text-[15px] font-medium outline-none';
  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  if (done)
    return (
      <div className="py-4 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-graphite">
          <Check className="size-6" />
        </span>
        <p className="mt-4 text-[17px] font-semibold">
          {done} is in your {CURRENCIES.find((w) => w.code === to)!.name} balance.
        </p>
        <button
          type="button"
          onClick={() => {
            setText('');
            setDone(null);
            onClose?.();
          }}
          className="mt-6 h-11 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white"
        >
          {onClose ? 'Done' : 'Convert again'}
        </button>
      </div>
    );

  return (
    <div>
      <div className="space-y-3">
        <span className="block text-[13px] font-medium text-graphite/60">You convert</span>
        <div className="flex gap-2">
          <select value={from} onChange={(e) => setFrom(e.target.value as Currency)} className={select} aria-label="From">
            {CURRENCIES.map((w) => (
              <option key={w.code}>{w.code}</option>
            ))}
          </select>
          <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder="Amount" className="h-12 min-w-0 flex-1 rounded-lg border border-graphite/15 bg-white px-4 font-ledger text-[17px] outline-none focus:border-graphite/50" aria-label="Amount" />
        </div>
        <p className="text-[13px] text-graphite/50">
          Available {money(balances[from], from)}
          {amount > balances[from] ? <span className="text-[#9a3a17]"> · more than you have</span> : null}
        </p>
        <button type="button" onClick={swap} className="mx-auto flex items-center gap-1.5 rounded-full border border-graphite/15 px-3 py-1 text-[12.5px] font-medium text-graphite/60 hover:border-graphite/35">
          <ArrowUpDown className="size-3.5" /> Swap
        </button>
        <span className="block text-[13px] font-medium text-graphite/60">You get</span>
        <div className="flex items-center gap-2">
          <select value={to} onChange={(e) => setTo(e.target.value as Currency)} className={select} aria-label="To">
            {CURRENCIES.map((w) => (
              <option key={w.code}>{w.code}</option>
            ))}
          </select>
          <span className="flex h-12 flex-1 items-center rounded-lg bg-[#f5f4ef] px-4 font-ledger text-[17px]">{amount > 0 && from !== to ? money(receive, to) : '—'}</span>
        </div>
        <p className="text-[13px] text-graphite/50">
          {from === to ? 'Pick two different currencies.' : `${rate >= 1 ? `1 ${from} = ${money(rate, to)}` : `1 ${to} = ${money(1 / rate, from)}`} · no markup · updated ${RATES_UPDATED}`}
        </p>
      </div>
      <button type="button" disabled={!valid} onClick={() => setPin(true)} className="mt-6 h-12 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
        Convert
      </button>
      <PinPrompt
        open={pin}
        title={`Convert ${money(amount, from)}`}
        detail={`You get ${money(receive, to)}`}
        onClose={() => setPin(false)}
        onConfirm={() => {
          setPin(false);
          setDone(money(convert(from, to, amount), to));
        }}
      />
    </div>
  );
}

export function Convert({ open, onClose, balances }: { open: boolean; onClose: () => void; balances: Record<Currency, number> }) {
  return (
    <Modal open={open} title="Convert" onClose={onClose}>
      <p className="mb-6 mt-1 text-[14px] text-graphite/55">Between your own balances, at today’s rate.</p>
      <ConvertForm balances={balances} onClose={onClose} />
    </Modal>
  );
}
