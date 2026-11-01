import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Landmark, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api/errors';
import PageHeader from '../components/editorial/PageHeader';
import { Card, Confirming, Expired, naira, Pill, Transfer, type PaymentState } from '../components/pay/PayFlow';
import { splitsApi, type SplitShare } from '../lib/splits';

const ease = [0.16, 1, 0.3, 1] as const;
const first = (name: string) => name.split(' ')[0];

type Step = 'form' | 'transfer' | 'card' | 'thanks' | 'expired';
type Draft = { amount: number; method: 'transfer' | 'card' };

/** The share as a card: what it is, what's been paid, what's left. */
function ShareCard({ s }: { s: SplitShare }) {
  const amount = Number(s.amount);
  const paid = Math.min(Number(s.paid), amount);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, ease }}
      className="relative overflow-hidden rounded-[28px] bg-background px-7 pb-8 pt-7 shadow-[0_30px_60px_-30px_rgba(21,23,26,0.45)] sm:px-9"
    >
      <div className="pointer-events-none absolute inset-2 rounded-[22px] border border-white/15" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">{s.title}</p>
      <p className="relative mt-4 font-ledger text-[clamp(2.4rem,9vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">{naira(amount)}</p>
      <p className="relative mt-3 text-[14px] font-medium text-white/55">
        {first(s.name)}’s share, for {s.from}
      </p>
      <div className="relative mt-7">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${amount ? (paid / amount) * 100 : 0}%` }}
            transition={{ duration: 1, ease, delay: 0.3 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <p className="mt-3 text-[14px] text-white/70">
          {s.settled ? 'Paid in full' : paid > 0 ? `${naira(paid)} paid · ${naira(Number(s.left))} left` : 'Nothing paid yet'}
        </p>
      </div>
    </motion.div>
  );
}

function PayForm({ s, onNext, busy, error }: { s: SplitShare; onNext: (d: Draft) => void; busy: boolean; error: string | null }) {
  const left = Number(s.left);
  const least = Math.min(100, left);
  const [digits, setDigits] = useState(String(Math.round(left)));
  const [method, setMethod] = useState<Draft['method']>('transfer');
  const amount = Number(digits) || 0;
  const ready = amount >= least && amount <= left;
  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (ready) onNext({ amount, method });
  };

  return (
    <form onSubmit={submit} className="space-y-7">
      <div>
        <label htmlFor="amount" className="text-[13px] font-semibold text-ink/50">
          You’re paying
        </label>
        <div className="mt-2 flex items-center gap-2 border-b-2 border-primary pb-2">
          <span className="text-[28px] font-semibold text-ink/45">₦</span>
          <input
            id="amount"
            inputMode="numeric"
            autoComplete="off"
            value={digits ? Number(digits).toLocaleString('en-NG') : ''}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="0"
            className="w-full bg-transparent font-ledger text-[40px] font-semibold tracking-[-0.03em] text-ink placeholder:text-ink/25 focus:outline-none"
          />
        </div>
        <p className="mt-3 text-[13.5px] text-ink/55">
          {amount > left ? `That’s more than the ${naira(left)} left.` : amount < left && amount > 0 ? `You can pay the other ${naira(left - amount)} later from this link.` : 'Pay it all now, or part of it and the rest later.'}
        </p>
      </div>

      <fieldset>
        <legend className="text-[13px] font-semibold text-ink/50">How you’ll pay</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {([
            ['transfer', 'Bank transfer', 'From any bank app', Landmark],
            ['card', 'Card', 'Debit or credit', CreditCard],
          ] as const).map(([key, title, sub, Icon]) => (
            <label
              key={key}
              className={`flex cursor-pointer flex-col gap-3 rounded-2xl p-4 transition-all ${method === key ? 'bg-background text-white' : 'bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30'}`}
            >
              <input type="radio" name="method" value={key} checked={method === key} onChange={() => setMethod(key)} className="sr-only" />
              <Icon className={`size-5 ${method === key ? 'text-primary' : ''}`} />
              <span>
                <span className="block text-[15px] font-semibold">{title}</span>
                <span className={`block text-[13px] ${method === key ? 'text-white/55' : 'text-ink/50'}`}>{sub}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-[14px] font-medium text-[#b42318]">{error}</p>}
      <Pill type="submit" disabled={!ready || busy}>
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Getting it ready…
          </span>
        ) : ready ? (
          `Continue with ${naira(amount)}`
        ) : (
          'Continue'
        )}
      </Pill>
    </form>
  );
}

function Thanks({ s, amount }: { s: SplitShare; amount: number | null }) {
  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid size-20 place-items-center rounded-full bg-primary"
      >
        <Check className="size-9 text-ink" strokeWidth={2} />
      </motion.div>
      <h2 className="mt-7 text-[clamp(1.9rem,7vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-ink">Thank you, {first(s.name)}.</h2>
      <p className="mt-3 max-w-sm text-lg leading-relaxed text-ink/65">
        {s.settled
          ? `You’re all paid up for ${s.title}. ${s.from} has your money.`
          : `${s.from} has your ${amount ? `${naira(amount)} ` : ''}payment. You can pay the ${naira(Number(s.left))} left from this link any time.`}
      </p>
    </div>
  );
}

/**
 * credvera.co/s/:token — one person's share of a split bill, in the site's
 * frame: the share beside the way to pay it. A payment counts only once the
 * API has Monnify's confirmation; the page then shows what's left.
 */
export default function SplitPayPage() {
  const { token = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const returning = params.get('payment');
  const [s, setShare] = useState<SplitShare | null | undefined>(undefined);
  const [step, setStep] = useState<Step>('form');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [state, setState] = useState<PaymentState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => splitsApi.find(token).then(setShare).catch(() => setShare(null)), [token]);
  useEffect(() => {
    load();
  }, [load]);
  const ask = useCallback((reference: string) => splitsApi.payment(token, reference), [token]);

  const start = async (d: Draft) => {
    setBusy(true);
    setError(null);
    try {
      const started = await splitsApi.pay(token, d);
      setDraft(d);
      setState(started);
      setStep(d.method);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const done = (status: 'paid' | 'expired') => {
    setStep(status === 'paid' ? 'thanks' : 'expired');
    if (status === 'paid') load();
    if (returning) setParams({}, { replace: true });
  };
  const again = () => {
    setState(null);
    setStep('form');
    if (returning) setParams({}, { replace: true });
  };

  if (s === undefined) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-ink/40" />
      </div>
    );
  }

  if (!s) {
    return (
      <PageHeader
        label="Split bill"
        title={'We can’t find\n*this request*.'}
        lede="Check the link in the text you were sent, or ask whoever split the bill to send it again."
      />
    );
  }

  const confirming = !!returning && step === 'form';
  const nothingToPay = (s.closed || s.settled) && !confirming && step === 'form';
  const back: Partial<Record<Step, Step>> = { transfer: 'form', card: 'form' };

  return (
    <>
      <PageHeader
        label="Split bill"
        title={`Pay your share of\n*${s.title}*.`}
        lede={
          s.settled && !confirming
            ? `You’ve paid your share. Thank you.`
            : s.closed && !confirming
              ? `${s.from} has closed this split, so it isn’t taking payments any more.`
              : `${s.from} asked you to pay ${naira(Number(s.left))}. Pay by bank transfer from any bank app, or by card. It goes straight to them.`
        }
      />

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="grid gap-12 border-t border-ink/15 pt-12 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ShareCard s={s} />
          </div>

          {nothingToPay ? null : (
            <div className="max-w-lg">
              {back[step] && (
                <button type="button" onClick={again} className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink/55 hover:text-ink">
                  <ArrowLeft className="size-4" /> Back
                </button>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={confirming ? 'confirming' : step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease }}>
                  {confirming ? (
                    <Confirming reference={returning!} ask={ask} onDone={done} />
                  ) : step === 'form' ? (
                    <PayForm s={s} onNext={start} busy={busy} error={error} />
                  ) : step === 'transfer' && draft && state?.account ? (
                    <Transfer amount={draft.amount} what="payment" state={state} ask={ask} onDone={done} />
                  ) : step === 'card' && draft && state ? (
                    <Card amount={draft.amount} state={state} />
                  ) : step === 'expired' ? (
                    <Expired what="payment" onAgain={again} />
                  ) : (
                    <Thanks s={s} amount={draft?.amount ?? null} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
