import { AnimatePresence } from 'framer-motion';
import { Check, Loader2, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage, useAccountName, useBanks, useSendMoney, useTransferQuote } from '../../api';
import { recentRecipients, useActiveBusiness, useBalances, usePayments } from '../data';
import { money, shortDate, type Recipient } from '../model';
import { Notice, PinPrompt } from '../ui';
import { field, initials, label, NairaInput, nairaFrom, paidText, panel, primary, useDebounced } from './shared';

type Outcome = { tone: 'good' | 'bad'; text: string };

/**
 * A naira transfer to any Nigerian bank.
 *
 * The bank's own name for the account is checked before anything can be sent,
 * the fee and total come from the API, and the PIN is checked by the API when
 * the payment goes.
 */
export default function PaySomeone() {
  const [params] = useSearchParams();
  const { payments } = usePayments();
  const { balances } = useBalances();
  const business = useActiveBusiness();
  const threshold = business?.approvalThreshold ? Number(business.approvalThreshold) : null;
  const banks = useBanks();
  const send = useSendMoney();

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [text, setText] = useState(params.get('amount') ?? '');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const recipients = useMemo(() => recentRecipients(payments), [payments]);
  const amount = nairaFrom(text);
  const name = useAccountName(bankCode, accountNumber);
  const settledAmount = useDebounced(amount);
  const quote = useTransferQuote(String(settledAmount));

  const choose = (r: Recipient) => {
    setBankCode(r.bankCode);
    setAccountNumber(r.accountNumber);
  };

  // "Pay Ada 50k" from the command bar arrives as ?to=Ada: pick her if she's been paid before.
  const appliedTo = useRef(false);
  useEffect(() => {
    const to = params.get('to')?.toLowerCase();
    if (!to || appliedTo.current || recipients.length === 0) return;
    appliedTo.current = true;
    const match = recipients.find((r) => r.name.toLowerCase().startsWith(to));
    if (match) choose(match);
  }, [params, recipients]);

  const payee = name.data?.accountName;
  const total = quote.data && quote.data.amount === amount ? quote.data.total : null;
  const short = total !== null && total > balances.NGN;
  const ready = !!payee && amount > 0 && total !== null && !short && reason.trim().length > 1 && !send.isPending;
  const recent = payments.filter((p) => p.recipient && p.status !== 'failed').slice(0, 4);

  const pay = (pin: string) => {
    setConfirming(false);
    send.mutate(
      { bankCode, accountNumber, amount: String(amount), narration: reason.trim().slice(0, 100), pin },
      {
        onSuccess: (result) => {
          setOutcome({ tone: 'good', text: paidText(result, amount) });
          setText('');
          setReason('');
          setAccountNumber('');
          setBankCode('');
        },
        onError: (error) => setOutcome({ tone: 'bad', text: errorMessage(error) }),
      },
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className={`${panel} p-6`}>
        <AnimatePresence>
          {outcome && (
            <Notice tone={outcome.tone} onClose={() => setOutcome(null)}>
              {outcome.text}
            </Notice>
          )}
        </AnimatePresence>
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Pay someone</h2>
        <p className="mt-1 text-[14px] text-graphite/55">In naira, to any Nigerian bank. For businesses you pay often, save them in Suppliers.</p>

        <div className="mt-6 space-y-5">
          {recipients.length > 0 && (
            <div>
              <span className={label}>Paid before</span>
              <div className="flex flex-wrap gap-2">
                {recipients.map((r) => {
                  const active = r.bankCode === bankCode && r.accountNumber === accountNumber;
                  return (
                    <button
                      key={`${r.bankCode}:${r.accountNumber}`}
                      type="button"
                      onClick={() => choose(r)}
                      className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13.5px] font-medium transition-colors ${active ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 hover:border-graphite/35'}`}
                    >
                      <span className={`grid size-6 place-items-center rounded-full text-[10.5px] font-semibold ${active ? 'bg-primary text-graphite' : 'bg-[#efeee7]'}`}>{initials(r.name)}</span>
                      {r.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setBankCode('');
                    setAccountNumber('');
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-graphite/30 px-3 py-1 text-[13.5px] font-medium hover:border-graphite/50"
                >
                  <Plus className="size-3.5" /> Someone new
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
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
                  <Loader2 className="size-4 animate-spin text-graphite/50" /> <span className="text-graphite/55">Checking the name on this account…</span>
                </>
              ) : payee ? (
                <>
                  <Check className="size-4 text-[#1f6b33]" /> <span className="font-semibold">{payee}</span>
                </>
              ) : name.error ? (
                <span className="text-[#9a3a17]">{errorMessage(name.error)}</span>
              ) : (
                <span className="text-graphite/45">We check the name on the account before you pay.</span>
              )}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Amount</span>
              <NairaInput value={amount} onChange={setText} />
            </label>
            <label className="block">
              <span className={label}>What it’s for</span>
              <input value={reason} maxLength={100} onChange={(e) => setReason(e.target.value)} placeholder="Deliveries, September" className={field} />
            </label>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-graphite/10 pt-5">
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
          <button type="button" disabled={!ready} onClick={() => setConfirming(true)} className={primary}>
            {send.isPending && <Loader2 className="size-4 animate-spin" />}
            {send.isPending ? 'Sending…' : `Pay ${amount ? money(amount) : ''}`}
          </button>
        </div>
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Recently paid</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[11px] font-semibold">{initials(p.who)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{p.who}</span>
                <span className="block text-[12.5px] text-graphite/50">{shortDate(p.date)}</span>
              </span>
              <span className="font-ledger text-[14px] font-medium">−{money(p.amount, p.currency)}</span>
            </li>
          ))}
          {recent.length === 0 && <li className="py-6 text-[14px] text-graphite/50">No transfers yet.</li>}
        </ul>
        <Link to="/business/app/payments?f=out" className="mt-3 inline-block text-[13.5px] font-semibold text-graphite/60 hover:text-graphite">
          All money out
        </Link>
      </section>

      <PinPrompt open={confirming} title={`Pay ${money(amount)}`} detail={`To ${payee ?? ''} · ${reason.trim()}`} onClose={() => setConfirming(false)} onConfirm={pay} />
    </div>
  );
}
