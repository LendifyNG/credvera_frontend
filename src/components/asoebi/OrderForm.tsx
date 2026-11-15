import { animate, AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Lock, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MAX_QUANTITY, type AsoEbiOption, type AsoEbiPage, type OrderDraft } from '../../lib/asoEbi';
import { MethodPicker, naira, Pill } from '../pay/PayFlow';
import Swatch from './Swatch';

const field =
  'mt-1.5 w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] text-ink ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-ink';

const price = (o: AsoEbiOption) => Number(o.price);
const capFor = (o: AsoEbiOption | undefined) => (o ? Math.min(MAX_QUANTITY, o.left ?? MAX_QUANTITY) : 0);

/** A figure that rolls to its new value instead of jumping. */
function Rolling({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        from.current = v;
        setShown(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value]);
  return <>{naira(shown)}</>;
}

function OptionCard({ o, index, chosen, onChoose }: { o: AsoEbiOption; index: number; chosen: boolean; onChoose: () => void }) {
  const soldOut = o.left === 0;
  return (
    <label
      className={`group relative flex items-center gap-4 rounded-[22px] p-3 pr-4 transition-all duration-300 ${
        soldOut
          ? 'cursor-not-allowed bg-white/60 text-ink/40 ring-1 ring-ink/[0.06]'
          : chosen
            ? 'cursor-pointer bg-background text-white shadow-[0_18px_40px_-24px_rgba(21,23,26,0.7)]'
            : 'cursor-pointer bg-white text-ink ring-1 ring-ink/10 hover:-translate-y-0.5 hover:ring-ink/30'
      }`}
    >
      <input type="radio" name="option" value={o.id} checked={chosen} disabled={soldOut} onChange={onChoose} className="sr-only" />
      <Swatch pattern={index} tone={chosen ? 'lime' : 'ink'} moving={chosen} className={`size-16 shrink-0 rounded-[16px] ${soldOut ? 'opacity-40 grayscale' : ''}`} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold tracking-[-0.01em]">{o.name}</span>
        <span className={`mt-0.5 block font-ledger text-[15px] font-semibold ${chosen ? 'text-primary' : soldOut ? '' : 'text-ink/70'}`}>{naira(price(o))}</span>
      </span>
      {o.left !== null && (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            soldOut ? 'bg-ink/[0.06] text-ink/45' : chosen ? 'bg-white/10 text-white/80' : o.left <= 5 ? 'bg-primary text-ink' : 'bg-ink/[0.05] text-ink/60'
          }`}
        >
          {soldOut ? 'Sold out' : `${o.left.toLocaleString('en-NG')} left`}
        </span>
      )}
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full transition-all ${chosen ? 'scale-100 bg-primary text-ink' : 'scale-90 ring-1 ring-ink/15'} ${soldOut ? 'opacity-0' : ''}`}
      >
        {chosen && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </label>
  );
}

function Stepper({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  const btn =
    'grid size-11 place-items-center rounded-full text-ink transition-all active:scale-90 disabled:opacity-30 disabled:active:scale-100 enabled:hover:bg-ink/[0.06]';
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="One fewer">
        <Minus className="size-4" />
      </button>
      <span className="relative grid h-11 w-12 place-items-center overflow-hidden" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="font-ledger text-[20px] font-semibold text-ink"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="One more">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Pick the fabric, how many, who it's for, and how to pay. */
export default function OrderForm({ c, onNext, busy, error }: { c: AsoEbiPage; onNext: (d: OrderDraft) => void; busy: boolean; error: string | null }) {
  const firstFree = c.options.find((o) => o.left !== 0);
  const [optionId, setOptionId] = useState(firstFree?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [size, setSize] = useState('');
  const [method, setMethod] = useState<OrderDraft['method']>('transfer');

  // What's left can change under the guest (someone else ordered): a choice
  // that sold out falls back to the first option still free.
  const option = c.options.find((o) => o.id === optionId && o.left !== 0) ?? firstFree;
  const cap = capFor(option);
  const qty = Math.max(1, Math.min(quantity, cap || 1));
  const total = option ? price(option) * qty : 0;

  const ready = !!option && option.left !== 0 && qty >= 1 && qty <= cap && name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 10;
  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (ready && option) onNext({ optionId: option.id, quantity: qty, name: name.trim(), phone: phone.trim(), size: size.trim() || undefined, method });
  };

  if (!firstFree) {
    return (
      <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/10">
        <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">Everything is sold out</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">Every piece has been taken. Ask {c.organiser} if more is coming.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset>
        <legend className="text-[13px] font-semibold text-ink/50">{c.options.length > 1 ? 'Choose your fabric' : 'Your fabric'}</legend>
        <div className="mt-2.5 grid gap-2.5">
          {c.options.map((o, i) => (
            <OptionCard key={o.id} o={o} index={i} chosen={o.id === option?.id} onChoose={() => setOptionId(o.id)} />
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-ink/50">How many</p>
          <p className="mt-0.5 text-[13.5px] text-ink/45">{cap < MAX_QUANTITY ? `Only ${cap} left` : `Up to ${MAX_QUANTITY} in one order`}</p>
        </div>
        <Stepper value={qty} max={cap} onChange={(n) => setQuantity(Math.max(1, Math.min(n, cap)))} />
      </div>

      <div className="grid gap-4">
        <div>
          <label htmlFor="name" className="text-[13px] font-semibold text-ink/50">
            Your name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            placeholder="As the organiser knows you"
            autoComplete="name"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-[13px] font-semibold text-ink/50">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, '').slice(0, 20))}
            placeholder="0803 123 4567"
            autoComplete="tel"
            className={`${field} font-ledger`}
          />
        </div>
        <div>
          <label htmlFor="size" className="text-[13px] font-semibold text-ink/50">
            Sizes <span className="text-ink/40">· optional</span>
          </label>
          <textarea
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value.slice(0, 200))}
            rows={2}
            placeholder="e.g. Gele for me, cap size 58 for my husband"
            className={`${field} resize-none`}
          />
        </div>
        <p className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink/55">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          <span>Your phone number and sizes go only to {c.organiser}, so they can get your fabric to you.</span>
        </p>
      </div>

      <MethodPicker method={method} onChange={setMethod} />

      {option && (
        <div className="flex items-end justify-between gap-4 rounded-[24px] bg-ink/[0.04] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink/50">Total</p>
            <p className="mt-0.5 truncate text-[13.5px] text-ink/55">
              {qty} × {option.name} <span className="text-ink/35">·</span> <span className="font-ledger">{naira(price(option))}</span> each
            </p>
          </div>
          <p className="whitespace-nowrap font-ledger text-[clamp(1.6rem,6.5vw,2rem)] font-semibold tracking-[-0.03em] text-ink">
            <Rolling value={total} />
          </p>
        </div>
      )}

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="text-[14px] font-medium text-[#b42318]">
          {error}
        </motion.p>
      )}
      <Pill type="submit" disabled={!ready || busy}>
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Getting it ready…
          </span>
        ) : total > 0 ? (
          `Pay ${naira(total)}`
        ) : (
          'Continue'
        )}
      </Pill>
    </form>
  );
}
