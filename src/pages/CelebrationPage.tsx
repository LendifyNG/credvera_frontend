import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Copy, Gift, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api/errors';
import PageHeader from '../components/editorial/PageHeader';
import { Card, Confirming, Expired, MethodPicker, naira, Pill, Transfer } from '../components/pay/PayFlow';
import SprayForm, { type SprayDraft } from '../components/spray/SprayForm';
import SprayNote from '../components/spray/SprayNote';
import SprayStage from '../components/spray/SprayStage';
import { celebrationsApi, keepWad, keptWads, KIND_LINE, monogram, recallGift, rememberGift, type Celebration, type GiftState, type Wad } from '../lib/celebrations';

const ease = [0.16, 1, 0.3, 1] as const;
const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const QUICK = [5000, 10000, 20000, 50000];

const INK = {
  ink: { bg: 'bg-background', fg: 'text-white', muted: 'text-white/55', amp: 'text-primary', rule: 'border-white/15' },
  lime: { bg: 'bg-primary', fg: 'text-ink', muted: 'text-ink/60', amp: 'text-ink', rule: 'border-ink/20' },
  paper: { bg: 'bg-white', fg: 'text-ink', muted: 'text-ink/55', amp: 'text-ink', rule: 'border-primary' },
} as const;

type Step = 'form' | 'transfer' | 'card' | 'thanks' | 'expired';
type GiftDraft = { kind?: 'gift'; amount: number; name: string; note: string; method: 'transfer' | 'card' };
type Draft = GiftDraft | SprayDraft;
type Mode = 'spray' | 'gift';
type OpenWad = { reference: string; key: string; wad: Wad };

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

      <MethodPicker method={method} onChange={setMethod} />

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

function Thanks({ e, gift, onAgain }: { e: Celebration; gift: Draft | null; onAgain: () => void }) {
  const note = gift && gift.kind !== 'spray' ? gift.note : '';
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
        {note ? ', along with your message' : ''}.
      </p>
      <button type="button" onClick={onAgain} className="mt-8 text-[15px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-4">
        Send another gift
      </button>
    </div>
  );
}

/** On the day: spray (the default) or send a gift. */
function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="mb-8 inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10" role="tablist">
      {([
        ['spray', 'Spray'],
        ['gift', 'Send a gift'],
      ] as const).map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={mode === key}
          onClick={() => onChange(key)}
          className={`relative rounded-full px-5 py-2.5 text-[14.5px] font-semibold transition-colors ${mode === key ? 'text-white' : 'text-ink/60 hover:text-ink'}`}
        >
          {mode === key && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-background" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative inline-flex items-center gap-2">
            {key === 'spray' && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff5a4e] opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-[#ff5a4e]" />
              </span>
            )}
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Spray money this phone bought and hasn't finished flicking. */
function Resume({ wad, mark, onOpen }: { wad: Wad; mark: string; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex w-full items-center gap-4 rounded-[24px] bg-background p-4 pr-5 text-left text-white transition-transform active:scale-[0.99]"
    >
      <div className="relative w-24 shrink-0 -rotate-6">
        <SprayNote value={wad.note} mark={mark} className="w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">{naira(wad.left * wad.note)} still in your hand</p>
        <p className="mt-0.5 text-[13.5px] text-white/55">{wad.left.toLocaleString('en-NG')} notes left. Tap to keep spraying.</p>
      </div>
      <Sparkles className="size-5 shrink-0 text-primary" />
    </motion.button>
  );
}

/**
 * credvera.co/c/:slug — a celebration's page, in the site's frame: the
 * header, then the invitation beside the gift form. Guests pay with a
 * one-time account number by bank transfer, or by card; a gift counts only
 * once the API has Monnify's confirmation. On the day itself the page opens
 * on spraying: guests buy spray money the same way, then flick it from their
 * phone onto the celebration's live screen (/c/:slug/live).
 */
export default function CelebrationPage() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const returning = params.get('gift');
  const [e, setEvent] = useState<Celebration | null | undefined>(undefined);
  const [step, setStep] = useState<Step>('form');
  const [gift, setGift] = useState<Draft | null>(null);
  const [mode, setMode] = useState<Mode>('gift');
  const [stage, setStage] = useState<OpenWad | null>(null);
  const [resume, setResume] = useState<OpenWad | null>(null);
  const [state, setState] = useState<GiftState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    celebrationsApi
      .find(slug)
      .then((c) => {
        setEvent(c);
        if (c.sprayOn) setMode('spray');
      })
      .catch(() => setEvent(null));
  }, [slug]);

  // Spray money bought on this phone and not all flicked yet.
  const findOpenWad = async (only?: string): Promise<OpenWad | null> => {
    for (const k of keptWads(slug).filter((w) => !only || w.reference === only).slice(0, 4)) {
      try {
        const g = await celebrationsApi.gift(k.reference);
        if (g.status === 'paid' && g.spray && g.spray.left > 0) return { reference: k.reference, key: k.key, wad: g.spray };
      } catch {
        // Gone or unreachable: look at the next one.
      }
    }
    return null;
  };
  useEffect(() => {
    if (e?.sprayOn && !returning) findOpenWad().then(setResume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e?.sprayOn, returning]);

  // Back from card checkout with ?gift=: what they typed, and wait for Monnify.
  useEffect(() => {
    if (returning) setGift(recallGift<Draft>(returning));
  }, [returning]);

  const start = async (d: Draft) => {
    setBusy(true);
    setError(null);
    try {
      const s =
        d.kind === 'spray'
          ? await celebrationsApi.startGift(slug, { amount: d.amount, name: d.name, method: d.method, kind: 'spray', noteValue: d.note })
          : await celebrationsApi.startGift(slug, d);
      if (d.kind === 'spray' && s.sprayKey) keepWad(slug, { reference: s.reference, key: s.sprayKey, name: d.name });
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
  const done = async (status: 'paid' | 'expired') => {
    const reference = returning ?? state?.reference;
    if (status === 'paid' && gift?.kind === 'spray' && reference) {
      // Paid spray money goes straight into the guest's hand.
      const open = await findOpenWad(reference);
      if (open) {
        setStage(open);
        setState(null);
        setStep('form');
        if (returning) setParams({}, { replace: true });
        return;
      }
    }
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
  const spraying = mode === 'spray' && !!e.sprayOn;
  const mark = monogram(e.title);
  const what = gift?.kind === 'spray' ? 'spray money' : 'gift';

  return (
    <>
      <PageHeader
        label="Celebrations"
        title={spraying ? `Spray\n*${e.title}*.` : `Send a gift to\n*${e.title}*.`}
        lede={
          e.closed && !confirming
            ? 'This celebration has ended and isn’t taking gifts any more. Thank you for thinking of them.'
            : spraying
              ? 'It’s the day. Get spray money by transfer or card, then flick it from your phone onto the big screen. Every note goes straight to them.'
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
              {e.sprayOn && !e.closed && step === 'form' && !confirming && <ModeSwitch mode={mode} onChange={setMode} />}
              {spraying && step === 'form' && !confirming && resume && <Resume wad={resume.wad} mark={mark} onOpen={() => setStage(resume)} />}
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
                <motion.div key={confirming ? 'confirming' : `${step}-${mode}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease }}>
                  {confirming ? (
                    <Confirming reference={returning!} ask={celebrationsApi.gift} onDone={done} />
                  ) : step === 'form' ? (
                    spraying ? <SprayForm mark={mark} onNext={start} busy={busy} error={error} /> : <GiftForm onNext={start} busy={busy} error={error} />
                  ) : step === 'transfer' && gift && state?.account ? (
                    <Transfer amount={gift.amount} what={what} state={state} ask={celebrationsApi.gift} onDone={done} />
                  ) : step === 'card' && gift && state ? (
                    <Card amount={gift.amount} state={state} />
                  ) : step === 'expired' ? (
                    <Expired what={what} onAgain={again} />
                  ) : (
                    <Thanks e={e} gift={gift} onAgain={again} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {stage && (
          <SprayStage
            key={stage.reference}
            slug={e.slug}
            title={e.title}
            mark={mark}
            reference={stage.reference}
            sprayKey={stage.key}
            wad={stage.wad}
            onClose={() => {
              setStage(null);
              findOpenWad().then(setResume);
            }}
            onMore={() => {
              setStage(null);
              setResume(null);
              setMode('spray');
              again();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
