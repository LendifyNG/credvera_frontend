import { animate, AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Lock, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MAX_QUANTITY, type AsoEbiOption, type AsoEbiPage, type OrderDraft } from '../../lib/asoEbi';
import { MethodPicker, naira, Pill } from '../pay/PayFlow';
import Swatch from './Swatch';

const field =
  'mt-1.5 w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] text-ink ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-ink';

const price = (o: AsoEbiOption) => Number(o.price);
/** Most of one fabric a guest can take: what's left of it, within what the order still has room for. */
const capFor = (o: AsoEbiOption, room: number) => Math.max(0, Math.min(o.left ?? MAX_QUANTITY, room));

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

function OptionCard({
  o,
  index,
  qty,
  cap,
  onToggle,
  onQty,
}: {
  o: AsoEbiOption;
  index: number;
  /** How many the guest has taken; 0 when not chosen. */
  qty: number;
  cap: number;
  onToggle: () => void;
  onQty: (n: number) => void;
}) {
  const soldOut = o.left === 0;
  const chosen = qty > 0;
  return (
    <div
      className={`relative rounded-[22px] transition-all duration-300 ${
        soldOut
          ? 'bg-white/60 text-ink/40 ring-1 ring-ink/[0.06]'
          : chosen
            ? 'bg-background text-white shadow-[0_18px_40px_-24px_rgba(21,23,26,0.7)]'
            : 'bg-white text-ink ring-1 ring-ink/10 hover:-translate-y-0.5 hover:ring-ink/30'
      }`}
    >
      <label className={`flex items-center gap-4 p-3 pr-4 ${soldOut ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input type="checkbox" name="option" value={o.id} checked={chosen} disabled={soldOut || (!chosen && cap === 0)} onChange={onToggle} className="sr-only" />
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
          className={`grid size-6 shrink-0 place-items-center rounded-[8px] transition-all ${chosen ? 'scale-100 bg-primary text-ink' : 'scale-90 ring-1 ring-ink/15'} ${soldOut ? 'opacity-0' : ''}`}
        >
          {chosen && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </label>
      <AnimatePresence initial={false}>
        {chosen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3">
              <span className="text-[13.5px] text-white/60">How many {o.name}</span>
              <Stepper value={qty} max={qty + cap} onChange={onQty} dark />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stepper({ value, max, onChange, dark = false }: { value: number; max: number; onChange: (n: number) => void; dark?: boolean }) {
  const btn = `grid size-10 place-items-center rounded-full transition-all active:scale-90 disabled:opacity-30 disabled:active:scale-100 ${
    dark ? 'text-white enabled:hover:bg-white/10' : 'text-ink enabled:hover:bg-ink/[0.06]'
  }`;
  return (
    <div className={`inline-flex items-center gap-1 rounded-full p-1 ${dark ? 'bg-white/[0.07] ring-1 ring-white/10' : 'bg-white ring-1 ring-ink/10'}`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="One fewer">
        <Minus className="size-4" />
      </button>
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className={`font-ledger text-[18px] font-semibold ${dark ? 'text-white' : 'text-ink'}`}
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

/** Pick one fabric or several, how many of each, who it's for, and how to pay. */
export default function OrderForm({ c, onNext, busy, error }: { c: AsoEbiPage; onNext: (d: OrderDraft) => void; busy: boolean; error: string | null }) {
  const firstFree = c.options.find((o) => o.left !== 0);
  const [picked, setPicked] = useState<Record<string, number>>(() => (firstFree ? { [firstFree.id]: 1 } : {}));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [size, setSize] = useState('');
  const [method, setMethod] = useState<OrderDraft['method']>('transfer');

  // What's left can change under the guest (someone else ordered): a choice
  // is trimmed to what's left of it, and dropped if it sold out.
  const lines = c.options
    .map((o, i) => ({ o, i, qty: Math.min(picked[o.id] ?? 0, o.left ?? MAX_QUANTITY) }))
    .filter((l) => l.qty > 0);
  const pieces = lines.reduce((n, l) => n + l.qty, 0);
  const room = MAX_QUANTITY - pieces;
  const total = lines.reduce((n, l) => n + price(l.o) * l.qty, 0);
  const qtyOf = (id: string) => lines.find((l) => l.o.id === id)?.qty ?? 0;
  const setQty = (id: string, n: number) =>
    setPicked((p) => {
      const next = { ...p };
      if (n > 0) next[id] = n;
      else delete next[id];
      return next;
    });

  const ready = pieces >= 1 && pieces <= MAX_QUANTITY && name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 10;
  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (ready)
      onNext({ items: lines.map((l) => ({ optionId: l.o.id, quantity: l.qty })), name: name.trim(), phone: phone.trim(), size: size.trim() || undefined, method });
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
        {c.options.length > 1 && <p className="mt-0.5 text-[13.5px] text-ink/45">Pick one or more. Up to {MAX_QUANTITY} pieces in one order.</p>}
        <div className="mt-2.5 grid gap-2.5">
          {c.options.map((o, i) => {
            const qty = qtyOf(o.id);
            // How many more of this one the guest can add.
            const more = capFor({ ...o, left: o.left === null ? null : o.left - qty }, room);
            return (
              <OptionCard
                key={o.id}
                o={o}
                index={i}
                qty={qty}
                cap={more}
                onToggle={() => setQty(o.id, qty > 0 ? 0 : Math.min(1, more))}
                onQty={(n) => setQty(o.id, Math.max(0, Math.min(n, qty + more)))}
              />
            );
          })}
        </div>
      </fieldset>

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

      {lines.length > 0 && (
        <div className="flex items-end justify-between gap-4 rounded-[24px] bg-ink/[0.04] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink/50">Total</p>
            {lines.map((l) => (
              <p key={l.o.id} className="mt-0.5 truncate text-[13.5px] text-ink/55">
                {l.qty} × {l.o.name} <span className="text-ink/35">·</span> <span className="font-ledger">{naira(price(l.o))}</span> each
              </p>
            ))}
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
