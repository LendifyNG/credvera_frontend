import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, Check, Copy, Share2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { errorMessage, isApiError, useConversionQuote, useConvert, useOpenWallet, useProvisionVirtualAccount, type ConversionQuoteDto, type ConversionResultDto, type ConvertibleCurrency } from '../api';
import { useBalances, usePayInAccount } from './data';
import { money, type Currency } from './model';
import { field, label, primary } from './pay/shared';
import { Loading, Notice, PinPrompt } from './ui';
import { Spinner } from '../components/ui/Loader';

const ease = [0.16, 1, 0.3, 1] as const;

export const CURRENCIES: { code: Currency; name: string; flag: string }[] = [
  { code: 'NGN', name: 'Naira', flag: 'ng' },
  { code: 'USD', name: 'US Dollar', flag: 'us' },
  { code: 'GBP', name: 'British Pound', flag: 'gb' },
  { code: 'EUR', name: 'Euro', flag: 'eu' },
];

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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

/** Each account's pay-in details: who can pay into it, in a line. */
const TAKES: Record<Currency, string> = {
  NGN: 'Send naira from any Nigerian bank. It arrives in seconds.',
  USD: 'For clients, marketplaces and banks paying you in US dollars.',
  GBP: 'For clients and banks paying you in pounds from the UK.',
  EUR: 'For clients and banks paying you in euros from Europe.',
};

/** The account to pay into, for whichever currency is picked. */
export function AddMoney({ open, onClose, currency = 'NGN' }: { open: boolean; onClose: () => void; currency?: Currency }) {
  const [code, setCode] = useState<Currency>(currency);
  useEffect(() => {
    if (open) setCode(currency);
  }, [open, currency]);

  return (
    <Modal open={open} title="Add money" onClose={onClose}>
      <div className="mt-4 flex rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium" role="tablist" aria-label="Currency">
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            type="button"
            role="tab"
            aria-selected={code === c.code}
            onClick={() => setCode(c.code)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 ${code === c.code ? 'bg-white shadow-sm' : 'text-graphite/55'}`}
          >
            <img src={`https://flagcdn.com/w40/${c.flag}.png`} alt="" className="size-4 rounded-full object-cover" />
            {c.code}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-graphite/55">{TAKES[code]}</p>
      <PayInDetails key={code} code={code} />
    </Modal>
  );
}

/**
 * The details to share with a payer, or what stands in the way: no wallet in
 * this currency yet, or a pay-in account the provider hasn't issued.
 */
export function PayInDetails({ code }: { code: Currency }) {
  const c = CURRENCIES.find((x) => x.code === code)!;
  const { wallet, account, ready, isLoading } = usePayInAccount(code);
  const open = useOpenWallet();
  const provision = useProvisionVirtualAccount();
  const [shared, setShared] = useState(false);

  if (isLoading) return <Loading label="Getting your account details…" />;

  if (!wallet) {
    return (
      <div className="mt-4 text-[14px] text-graphite/60">
        <p>You don’t have a {c.name.toLowerCase()} account yet. It’s free to open.</p>
        <button type="button" disabled={open.isPending} onClick={() => open.mutate(code)} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-graphite text-[14px] font-semibold text-white hover:bg-black disabled:opacity-50">
          {open.isPending ? 'Opening…' : `Open a ${c.name} account`}
        </button>
        {open.error && <p className="mt-3 text-[#9a3a17]">{errorMessage(open.error)}</p>}
      </div>
    );
  }

  if (!ready || !account) {
    return (
      <div className="mt-4 text-[14px] text-graphite/60">
        <p>{account?.unavailableReason ?? 'The bank details for this account are still being issued.'}</p>
        <button type="button" disabled={provision.isPending} onClick={() => provision.mutate(wallet.id)} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg border border-graphite/15 text-[14px] font-semibold hover:border-graphite/30 disabled:opacity-50">
          {provision.isPending ? 'Asking the bank…' : 'Try again'}
        </button>
        {provision.error && <p className="mt-3 text-[#9a3a17]">{errorMessage(provision.error)}</p>}
      </div>
    );
  }

  const rows: [string, string][] = [
    ['Account name', account.accountName ?? ''],
    ['Account number', account.accountNumber ?? ''],
    ['Bank', account.bankName ?? ''],
    ...(account.rails?.iban ? ([['IBAN', account.rails.iban]] as [string, string][]) : []),
    ...(account.rails?.sortCode ? ([['Sort code', account.rails.sortCode]] as [string, string][]) : []),
    ...(account.rails?.routingNumber ? ([['Routing number', account.rails.routingNumber]] as [string, string][]) : []),
    ...(account.rails?.swiftBic ? ([['SWIFT / BIC', account.rails.swiftBic]] as [string, string][]) : []),
    ['Currency', `${c.name} (${code})`],
  ];
  const all = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `${c.name} account details`, text: all });
      else throw new Error('no share');
    } catch {
      navigator.clipboard?.writeText(all).catch(() => {});
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    }
  };

  return (
    <>
      <dl className="mt-4 divide-y divide-graphite/[0.08] text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-graphite/55">{k}</dt>
            <dd className="flex items-center gap-1 text-right font-medium">
              <span className={k === 'Account number' || k === 'IBAN' ? 'font-ledger tracking-wide' : ''}>{v}</span>
              {k === 'Account number' && <CopyButton text={v} label="" />}
            </dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={share} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-graphite text-[14px] font-semibold text-white hover:bg-black">
        {shared ? <Check className="size-4" /> : <Share2 className="size-4" />} {shared ? 'Details copied' : 'Share details'}
      </button>
    </>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      aria-label={`${label} ${text}`}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-graphite/55 hover:bg-graphite/5 hover:text-graphite"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? 'Copied' : label}
    </button>
  );
}

/** "1 USD = ₦1,350.43", written the way round people read it: naira per unit when naira is involved. */
function rateLine(q: ConversionQuoteDto) {
  if (q.from.currency === 'NGN') return `1 ${q.to.currency} = ${money(Number(q.inverseRate), 'NGN')}`;
  if (q.to.currency === 'NGN') return `1 ${q.from.currency} = ${money(Number(q.rate), 'NGN')}`;
  return `1 ${q.from.currency} = ${Number(q.rate).toFixed(4)} ${q.to.currency}`;
}

/** Seconds left on a held rate, ticking. */
function useSecondsLeft(expiresAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [expiresAt]);
  return expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000)) : 0;
}

/**
 * Converting between your own balances: pick two currencies and an amount,
 * get a rate held for a few seconds, confirm with your PIN. Nothing moves
 * until the PIN is checked, and it moves at exactly the rate shown.
 */
export function ConvertPanel({ onDone }: { onDone?: () => void }) {
  const { balances } = useBalances();
  const quote = useConversionQuote();
  const convert = useConvert();
  const [from, setFrom] = useState<Currency>('NGN');
  const [to, setTo] = useState<Currency>('USD');
  const [side, setSide] = useState<'sell' | 'buy'>('sell');
  const [text, setText] = useState('');
  const [held, setHeld] = useState<ConversionQuoteDto | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<ConversionResultDto | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const left = useSecondsLeft(held?.expiresAt);
  const expired = !!held && left === 0;

  const amount = text.replace(/,/g, '');
  const valid = /^\d+(\.\d{1,2})?$/.test(amount) && Number(amount) > 0 && from !== to;
  const amountCurrency = side === 'sell' ? from : to;
  const short = held ? Number(held.from.amount) > balances[from] : false;

  const reset = () => {
    setHeld(null);
    setProblem(null);
  };

  const getRate = () => {
    if (!valid) return;
    setProblem(null);
    quote.mutate(
      { from: from as ConvertibleCurrency, to: to as ConvertibleCurrency, side, amount },
      { onSuccess: setHeld, onError: (e) => { setHeld(null); setProblem(errorMessage(e)); } },
    );
  };

  const confirm = useCallback(
    (pin: string) => {
      if (!held) return;
      setConfirming(false);
      setProblem(null);
      convert.mutate(
        { quoteId: held.quoteId, pin },
        {
          onSuccess: (result) => {
            setDone(result);
            setHeld(null);
            setText('');
          },
          onError: (e) => {
            setProblem(errorMessage(e));
            // A used or lapsed quote can't be retried; a wrong PIN can.
            if (isApiError(e) && e.code === 'FX_QUOTE_EXPIRED') setHeld(null);
          },
        },
      );
    },
    [held, convert],
  );

  if (done) {
    const f = done.from.currency as Currency;
    const t = done.to.currency as Currency;
    return (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e3f1e0] text-[#1f6b33]">
          <Check className="size-6" />
        </span>
        <p className="mt-4 text-[18px] font-semibold tracking-tight">Converted</p>
        <p className="mt-1 text-[14.5px] text-graphite/60">
          {money(Number(done.from.amount), f)} from your {f} balance is now {money(Number(done.to.amount), t)} in your {t} balance.
        </p>
        <p className="mt-3 font-ledger text-[12.5px] text-graphite/45">Ref {done.reference}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button type="button" onClick={() => setDone(null)} className="inline-flex h-10 items-center rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30">
            Convert again
          </button>
          {onDone && (
            <button type="button" onClick={onDone} className={primary}>
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  const select = (value: Currency, onChange: (c: Currency) => void, labelText: string) => (
    <label className="block">
      <span className={label}>{labelText}</span>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value as Currency);
          reset();
        }}
        className={field}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} · {c.name}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-[12.5px] text-graphite/50">Balance {money(balances[value], value)}</span>
    </label>
  );

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        {select(from, (c) => { setFrom(c); if (c === to) setTo(from); }, 'From')}
        <button
          type="button"
          aria-label="Swap currencies"
          onClick={() => {
            setFrom(to);
            setTo(from);
            reset();
          }}
          className="mt-[30px] grid size-9 place-items-center rounded-lg border border-graphite/15 text-graphite/60 hover:border-graphite/30 hover:text-graphite"
        >
          <ArrowLeftRight className="size-4" />
        </button>
        {select(to, (c) => { setTo(c); if (c === from) setFrom(to); }, 'To')}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className={label.replace('mb-1.5 block', '')}>Amount in {amountCurrency}</span>
          <div className="flex rounded-md bg-[#efeee7] p-0.5 text-[12px] font-medium">
            {(['sell', 'buy'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSide(s);
                  reset();
                }}
                className={`rounded px-2 py-0.5 ${side === s ? 'bg-white shadow-sm' : 'text-graphite/55'}`}
              >
                {s === 'sell' ? 'I convert' : 'I receive'}
              </button>
            ))}
          </div>
        </div>
        <input
          inputMode="decimal"
          placeholder="0.00"
          aria-label={`Amount in ${amountCurrency}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value.replace(/[^\d.,]/g, ''));
            reset();
          }}
          onKeyDown={(e) => e.key === 'Enter' && !held && getRate()}
          className={`${field} font-ledger text-[17px]`}
        />
      </div>

      {problem && (
        <div className="mt-4">
          <Notice tone="bad" onClose={() => setProblem(null)}>
            {problem}
          </Notice>
        </div>
      )}

      {held ? (
        <div className="mt-5 rounded-xl bg-[#f5f4ef] p-5">
          <dl className="space-y-2.5 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-graphite/55">You convert</dt>
              <dd className="font-ledger font-semibold">{money(Number(held.from.amount), held.from.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-graphite/55">You receive</dt>
              <dd className="font-ledger text-[17px] font-semibold text-[#1f6b33]">{money(Number(held.to.amount), held.to.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-graphite/10 pt-2.5">
              <dt className="text-graphite/55">Rate</dt>
              <dd className="font-ledger">{rateLine(held)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12.5px] text-graphite/50">
            Includes our {Number((held.spreadBps / 100).toFixed(2))}% margin on the mid-market rate. No other fee.
          </p>
          {short && <p className="mt-3 text-[13px] font-medium text-[#9a3a17]">Your {held.from.currency} balance isn’t enough for this.</p>}
          {expired ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[13.5px] font-medium text-graphite/60">This rate has expired.</p>
              <button type="button" onClick={getRate} disabled={quote.isPending} className={primary}>
                {quote.isPending ? <Spinner className="size-4" /> : null} Get a new rate
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[13.5px] text-graphite/60">
                Rate held for <span className="font-ledger font-semibold text-graphite">{left}s</span>
              </p>
              <button type="button" onClick={() => setConfirming(true)} disabled={short || convert.isPending} className={primary}>
                {convert.isPending ? <Spinner className="size-4" /> : null} Convert
              </button>
            </div>
          )}
        </div>
      ) : (
        <button type="button" onClick={getRate} disabled={!valid || quote.isPending} className={`${primary} mt-5 w-full`}>
          {quote.isPending ? <Spinner className="size-4" /> : null} See rate
        </button>
      )}

      <PinPrompt
        open={confirming}
        title={held ? `Convert ${money(Number(held.from.amount), held.from.currency)}` : 'Convert'}
        detail={held ? `You’ll receive ${money(Number(held.to.amount), held.to.currency)}` : undefined}
        onClose={() => setConfirming(false)}
        onConfirm={confirm}
      />
    </div>
  );
}

export function Convert({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="Convert" onClose={onClose}>
      <p className="mt-1 text-[14px] text-graphite/55">Move money between your balances at a rate held while you confirm.</p>
      <div className="mt-5">
        <ConvertPanel onDone={onClose} />
      </div>
    </Modal>
  );
}
