import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Check, Copy, CreditCard, Gift, Landmark, Loader2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api/errors';
import PageHeader from '../components/editorial/PageHeader';
import { celebrationsApi, KIND_LINE, recallGift, rememberGift, type Celebration, type GiftState } from '../lib/celebrations';

const ease = [0.16, 1, 0.3, 1] as const;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const QUICK = [5000, 10000, 20000, 50000];

const INK = {
  ink: { bg: 'bg-background', fg: 'text-white', muted: 'text-white/55', amp: 'text-primary', rule: 'border-white/15' },
  lime: { bg: 'bg-primary', fg: 'text-ink', muted: 'text-ink/60', amp: 'text-ink', rule: 'border-ink/20' },
  paper: { bg: 'bg-white', fg: 'text-ink', muted: 'text-ink/55', amp: 'text-ink', rule: 'border-primary' },
} as const;

type Step = 'form' | 'transfer' | 'card' | 'thanks' | 'expired';
type GiftDraft = { amount: number; name: string; note: string; method: 'transfer' | 'card' };

/** The site's pill button: dark, with a lime circle that turns on hover. */
function Pill({ children, disabled, onClick, type = 'button' }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-secondary py-2 pl-6 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-background disabled:opacity-40 sm:w-auto"
    >
      {children}
      <span className="grid size-9 place-items-center rounded-full bg-primary text-secondary transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight className="size-4" />
      </span>
    </button>
  );
}

/** The invitation, as on the organiser's share card. */
function Invitation({ e }: { e: Celebration }) {
  const c = INK[e.theme];
  const parts = e.title.split('&');
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, ease }}
      className={`relative overflow-hidden rounded-[28px] px-7 pb-8 pt-7 shadow-[0_30px_60px_-30px_rgba(21,23,26,0.45)] sm:px-9 ${c.bg} ${e.theme === 'paper' ? 'ring-1 ring-ink/10' : ''}`}
    >
      <div className={`pointer-events-none absolute inset-2 rounded-[22px] border ${c.rule}`} />
      <p className={`relative text-[11px] font-semibold uppercase tracking-[0.24em] ${c.muted}`}>{KIND_LINE[e.kind]}</p>
      <h1 className={`relative mt-4 text-[clamp(2.4rem,9vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] ${c.fg}`}>
        {parts.map((p, i) => (
          <span key={i}>
            {i > 0 && <span className={`font-normal ${c.amp}`}> & </span>}
            {p.trim()}
          </span>
        ))}
      </h1>
      <p className={`relative mt-3 text-[14px] font-medium ${c.muted}`}>{longDate(e.date)}</p>
      {e.message && <p className={`relative mt-5 max-w-sm text-[15px] leading-relaxed ${c.fg} opacity-85`}>{e.message}</p>}
    </motion.div>
  );
}

/** The celebration's own number, for guests who'd rather transfer any amount from their bank app. */
function DirectAccount({ account }: { account: NonNullable<Celebration['account']> }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(account.number).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="mt-5 rounded-[24px] bg-ink/[0.04] px-6 py-5">
      <p className="text-[13.5px] text-ink/55">Or transfer any amount straight to</p>
      <div className="mt-1.5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="whitespace-nowrap font-ledger text-[1.45rem] font-semibold tracking-[0.01em] text-ink">{account.number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</p>
          {(account.bank || account.name) && <p className="mt-0.5 truncate text-[13.5px] text-ink/60">{[account.bank, account.name].filter(Boolean).join(' · ')}</p>}
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy account number"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-ink transition-transform active:scale-95"
        >
          {copied ? <Check className="size-[18px]" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function GiftForm({ onNext, busy, error }: { onNext: (d: GiftDraft) => void; busy: boolean; error: string | null }) {
  const [digits, setDigits] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<GiftDraft['method']>('transfer');
  const amount = Number(digits) || 0;
  const ready = amount >= 100 && name.trim().length > 1;
  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (ready) onNext({ amount, name: name.trim(), note: note.trim(), method });
  };

  return (
    <form onSubmit={submit} className="space-y-7">
      <div>
        <label htmlFor="amount" className="text-[13px] font-semibold text-ink/50">
          Your gift
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
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setDigits(String(q))}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${amount === q ? 'bg-background text-white' : 'bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30'}`}
            >
              {naira(q)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label htmlFor="name" className="text-[13px] font-semibold text-ink/50">
            Your name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 40))}
            placeholder="So they know who it’s from"
            autoComplete="name"
            className="mt-1.5 h-13 w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] text-ink ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
        <div>
          <label htmlFor="note" className="text-[13px] font-semibold text-ink/50">
            A message <span className="text-ink/40">· optional</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 120))}
            rows={2}
            placeholder="Happy married life!"
            className="mt-1.5 w-full resize-none rounded-2xl bg-white px-4 py-3.5 text-[16px] text-ink ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
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
        ) : amount >= 100 ? (
          `Continue with ${naira(amount)}`
        ) : (
          'Continue'
        )}
      </Pill>
    </form>
  );
}

function useCountdown(until: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, until - now);
  return `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
}

/** Asks the API every few seconds until the gift is paid or can't be any more. */
function useGiftStatus(reference: string | null, onDone: (status: 'paid' | 'expired') => void) {
  useEffect(() => {
    if (!reference) return;
    let stopped = false;
    const ask = async () => {
      try {
        const g = await celebrationsApi.gift(reference);
        if (!stopped && g.status !== 'pending') {
          stopped = true;
          onDone(g.status);
        }
      } catch {
        // Asked again on the next tick.
      }
    };
    ask();
    const t = window.setInterval(ask, 5000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);
}

/** The one-time account for this gift, with the exact amount and a clock. */
function Transfer({ gift, state, onDone }: { gift: GiftDraft; state: GiftState; onDone: (status: 'paid' | 'expired') => void }) {
  const account = state.account!;
  const left = useCountdown(account.expiresAt ? new Date(account.expiresAt).getTime() : Date.now());
  const [copied, setCopied] = useState(false);
  const [waiting, setWaiting] = useState(false);
  useGiftStatus(state.reference, onDone);
  const copy = async () => {
    await navigator.clipboard?.writeText(account.number).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div>
      <p className="text-[15px] text-ink/65">
        Transfer exactly <span className="font-semibold text-ink">{naira(gift.amount)}</span> from your bank app to:
      </p>
      <div className="mt-4 rounded-[24px] bg-background p-6 text-white">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/45">Account number</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="whitespace-nowrap font-ledger text-[clamp(1.6rem,7.4vw,2.1rem)] font-semibold tracking-[0.01em]">{account.number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</p>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy account number"
            className="grid size-11 place-items-center rounded-full bg-primary text-ink transition-transform active:scale-95"
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-[18px]" />}
          </button>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-[14px]">
          <div>
            <dt className="text-white/45">Bank</dt>
            <dd className="mt-0.5 font-medium">{account.bank}</dd>
          </div>
          <div>
            <dt className="text-white/45">Name</dt>
            <dd className="mt-0.5 font-medium">{account.name}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[13.5px] text-ink/55">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7a8f1a] opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-[#7a8f1a]" />
        </span>
        This number is just for your gift and works for the next {left}.
      </p>
      <div className="mt-8">
        <Pill onClick={() => setWaiting(true)} disabled={waiting}>
          {waiting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Looking for your transfer…
            </span>
          ) : (
            'I’ve sent it'
          )}
        </Pill>
        {waiting && <p className="mt-3 text-[13.5px] text-ink/55">This page updates as soon as it arrives, usually within a minute.</p>}
      </div>
    </div>
  );
}

/** Card goes through Monnify's secure checkout, which sends the guest back here. */
function Card({ gift, state }: { gift: GiftDraft; state: GiftState }) {
  const [opening, setOpening] = useState(false);
  const pay = () => {
    if (!state.checkoutUrl) return;
    setOpening(true);
    window.location.assign(state.checkoutUrl);
  };
  return (
    <div>
      <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/10">
        <CreditCard className="size-6 text-ink" />
        <p className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">Pay {naira(gift.amount)} by card</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">
          You’ll enter your card on our payment partner’s secure page, then come straight back here.
        </p>
      </div>
      <div className="mt-8">
        <Pill onClick={pay} disabled={opening || !state.checkoutUrl}>
          {opening ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Opening secure checkout…
            </span>
          ) : (
            `Pay ${naira(gift.amount)}`
          )}
        </Pill>
      </div>
    </div>
  );
}

/** Back from card checkout: waiting for Monnify to confirm. */
function Confirming({ reference, onDone }: { reference: string; onDone: (status: 'paid' | 'expired') => void }) {
  useGiftStatus(reference, onDone);
  return (
    <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/10">
      <Loader2 className="size-6 animate-spin text-ink" />
      <p className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">Confirming your payment…</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">This takes a few seconds. Please keep this page open.</p>
    </div>
  );
}

function Expired({ onAgain }: { onAgain: () => void }) {
  return (
    <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/10">
      <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">This gift didn’t go through</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">
        The time to pay ran out, or the payment wasn’t completed. If you sent a transfer after the time ran out, it goes back to your account automatically.
      </p>
      <button type="button" onClick={onAgain} className="mt-6 text-[15px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-4">
        Start again
      </button>
    </div>
  );
}

function Thanks({ e, gift, onAgain }: { e: Celebration; gift: GiftDraft | null; onAgain: () => void }) {
  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid size-20 place-items-center rounded-full bg-primary"
      >
        <Gift className="size-9 text-ink" strokeWidth={1.8} />
      </motion.div>
      <h2 className="mt-7 text-[clamp(1.9rem,7vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-ink">
        Thank you{gift ? `, ${gift.name.split(' ')[0]}` : ''}.
      </h2>
      <p className="mt-3 max-w-sm text-lg leading-relaxed text-ink/65">
        Your {gift ? `${naira(gift.amount)} ` : ''}gift is with {e.title}
        {gift?.note ? ', along with your message' : ''}.
      </p>
      <button type="button" onClick={onAgain} className="mt-8 text-[15px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-4">
        Send another gift
      </button>
    </div>
  );
}

/**
 * credvera.co/c/:slug — a celebration's page, in the site's frame: the
 * header, then the invitation beside the gift form. Guests pay with a
 * one-time account number by bank transfer, or by card; a gift counts only
 * once the API has Monnify's confirmation.
 */
export default function CelebrationPage() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const returning = params.get('gift');
  const [e, setEvent] = useState<Celebration | null | undefined>(undefined);
  const [step, setStep] = useState<Step>('form');
  const [gift, setGift] = useState<GiftDraft | null>(null);
  const [state, setState] = useState<GiftState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    celebrationsApi.find(slug).then(setEvent).catch(() => setEvent(null));
  }, [slug]);

  // Back from card checkout with ?gift=: what they typed, and wait for Monnify.
  useEffect(() => {
    if (returning) setGift(recallGift<GiftDraft>(returning));
  }, [returning]);

  const start = async (d: GiftDraft) => {
    setBusy(true);
    setError(null);
    try {
      const s = await celebrationsApi.startGift(slug, d);
      rememberGift(s.reference, d);
      setGift(d);
      setState(s);
      setStep(d.method);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const done = (status: 'paid' | 'expired') => {
    setStep(status === 'paid' ? 'thanks' : 'expired');
    if (returning) setParams({}, { replace: true });
  };
  const again = () => {
    setState(null);
    setStep('form');
    if (returning) setParams({}, { replace: true });
  };

  if (e === undefined) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-ink/40" />
      </div>
    );
  }

  if (!e) {
    return (
      <PageHeader
        label="Celebrations"
        title={'We can’t find\n*this celebration*.'}
        lede="Check the link with whoever sent it to you. Celebration links look like credvera.co/c/their-names."
      />
    );
  }

  const back: Partial<Record<Step, Step>> = { transfer: 'form', card: 'form' };
  const confirming = !!returning && step === 'form';

  return (
    <>
      <PageHeader
        label="Celebrations"
        title={`Send a gift to\n*${e.title}*.`}
        lede={
          e.closed && !confirming
            ? 'This celebration has ended and isn’t taking gifts any more. Thank you for thinking of them.'
            : 'Pay by bank transfer from any bank app, or by card. Your gift and your message go straight to them.'
        }
      />

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="grid gap-12 border-t border-ink/15 pt-12 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Invitation e={e} />
            {!e.closed && e.account && <DirectAccount account={e.account} />}
          </div>

          {e.closed && !confirming && step === 'form' ? null : (
            <div className="max-w-lg">
              {back[step] && (
                <button
                  type="button"
                  onClick={again}
                  className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink/55 hover:text-ink"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={confirming ? 'confirming' : step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease }}>
                  {confirming ? (
                    <Confirming reference={returning!} onDone={done} />
                  ) : step === 'form' ? (
                    <GiftForm onNext={start} busy={busy} error={error} />
                  ) : step === 'transfer' && gift && state?.account ? (
                    <Transfer gift={gift} state={state} onDone={done} />
                  ) : step === 'card' && gift && state ? (
                    <Card gift={gift} state={state} />
                  ) : step === 'expired' ? (
                    <Expired onAgain={again} />
                  ) : (
                    <Thanks e={e} gift={gift} onAgain={again} />
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
