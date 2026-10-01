import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Eye, EyeOff, PackageCheck, Plus, Snowflake, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CardArt from './CardArt';
import { CURRENCIES } from './money';
import { addCard, money, settled, shortDate, updateCard, useDash, type Card, type Currency, type Payment } from './store';
import { usePayments, useSession } from './data';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const REVEAL_S = 30;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

// The photo behind each card, by currency: the business at work.
const SCENE: Record<Currency, string> = {
  NGN: '/video/trade-lagos.jpg',
  USD: '/video/trade-abroad.jpg',
  GBP: '/video/port-night.jpg',
  EUR: '/video/business-open.jpg',
};

const last4 = (c: Card) => c.number.slice(-4);
const cardPayments = (payments: Payment[], c: Card) => payments.filter((p) => p.what.includes(`••${last4(c)}`));

/**
 * The card in its scene: over a softly blurred photo, turned a little, and
 * tilting towards the pointer with the light moving across it.
 */
function Scene({ card, company, details }: { card: Card; company?: string; details: Card | null }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={() => setTilt({ x: 0, y: 0 })} className="relative isolate grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl bg-graphite">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={card.currency}
          src={SCENE[card.currency]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover blur-[8px] brightness-[0.85] saturate-[0.9]"
        />
      </AnimatePresence>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,14,12,0.35))]" />
      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 24, rotate: -9 }}
        animate={{ opacity: 1, y: 0, rotate: -5 }}
        transition={{ duration: 0.7, ease }}
        className="w-[64%] min-w-[240px]"
        style={{ perspective: 1000 }}
      >
        <div
          className="transition-transform duration-200 ease-out [filter:drop-shadow(0_30px_40px_rgba(0,0,0,0.5))]"
          style={{ transform: `rotateY(${tilt.x * 14}deg) rotateX(${-tilt.y * 12}deg)` }}
        >
          <CardArt
            currency={card.currency}
            kind={card.kind}
            holder={card.holder}
            company={company}
            last4={last4(card)}
            frozen={card.frozen}
            details={details && details.id === card.id ? { number: card.number, expiry: card.expiry, cvv: card.cvv } : null}
            light={0.35 + tilt.x * 0.9}
          />
        </div>
      </motion.div>
    </div>
  );
}

/** A new card, with its design changing live as you choose. */
function NewCard({ onClose, onCreated, company }: { onClose: () => void; onCreated: (c: Card) => void; company?: string }) {
  const TEAM = useDash().team.filter((m) => m.status === 'active').map((m) => m.name);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'virtual' | 'physical'>('virtual');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [holder, setHolder] = useState(TEAM[0] ?? '');
  const [text, setText] = useState('');
  const [pin, setPin] = useState(false);
  const limit = Number(text.replace(/\D/g, '')) || 0;
  // Physical cards are naira debit cards, for shops and cash in Nigeria.
  const cur = kind === 'physical' ? 'NGN' : currency;
  const ready = name.trim().length > 1 && limit > 0;

  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="New card"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
          <p className="text-[15px] font-semibold">New card</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="mx-auto w-[88%] -rotate-3 [filter:drop-shadow(0_18px_24px_rgba(20,28,23,0.35))]">
            <CardArt currency={cur} kind={kind} holder={holder} company={company} last4="••••" />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">What it’s for</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ads, travel, office supplies" className={field} />
          </label>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Type</span>
            <div className="flex rounded-lg bg-[#efeee7] p-1 text-[14px] font-medium">
              {(['virtual', 'physical'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={k === 'physical'}
                  onClick={() => setKind(k)}
                  className={`flex-1 rounded-md py-1.5 capitalize disabled:cursor-not-allowed disabled:opacity-50 ${kind === k ? 'bg-white shadow-sm' : 'text-graphite/55'}`}
                >
                  {k}
                  {k === 'physical' && <span className="ml-1.5 text-[11.5px] normal-case">· coming soon</span>}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[12.5px] text-graphite/50">Ready straight away, for paying online. Physical business cards for shops and cash are coming soon.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Currency</span>
              <select value={cur} disabled={kind === 'physical'} onChange={(e) => setCurrency(e.target.value as Currency)} className={field}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">For</span>
              <select value={holder} onChange={(e) => setHolder(e.target.value)} className={field}>
                {TEAM.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Monthly limit</span>
            <span className="flex h-11 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 focus-within:border-graphite/50">
              <span className="font-medium text-graphite/45">{CURRENCIES.find((c) => c.code === cur)!.code}</span>
              <input inputMode="numeric" value={limit ? limit.toLocaleString('en-NG') : ''} onChange={(e) => setText(e.target.value)} placeholder="0" className="w-full bg-transparent font-ledger outline-none" />
            </span>
          </label>
        </div>
        <div className="border-t border-graphite/10 px-6 py-5">
          <button type="button" disabled={!ready} onClick={() => setPin(true)} className="h-11 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
            {kind === 'physical' ? 'Order the card' : 'Create the card'}
          </button>
        </div>
      </motion.aside>
      <PinPrompt
        open={pin}
        title={kind === 'physical' ? 'Order a physical card' : 'Create a virtual card'}
        detail={`${name.trim()} · ${money(limit, cur)} a month`}
        onClose={() => setPin(false)}
        onConfirm={() => {
          setPin(false);
          onCreated(addCard({ name: name.trim(), currency: cur, kind, holder, limit }));
        }}
      />
    </motion.div>
  );
}

/** Cards: virtual for online spending, physical for the team, each drawn for its own currency. */
export default function Cards() {
  const { cards } = useDash();
  const { payments } = usePayments();
  const session = useSession();
  const [selected, setSelected] = useState(cards[0]?.id ?? '');
  const [creating, setCreating] = useState(false);
  const [pin, setPin] = useState<'reveal' | 'activate' | null>(null);
  const [shown, setShown] = useState<Card | null>(null);
  const [left, setLeft] = useState(REVEAL_S);
  const [editing, setEditing] = useState(false);
  const [limitText, setLimitText] = useState('');
  const card = cards.find((c) => c.id === selected) ?? cards[0];

  // Details hide themselves after thirty seconds, or when you switch cards.
  useEffect(() => {
    if (!shown) return;
    if (left <= 0) {
      setShown(null);
      return;
    }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [shown, left]);
  useEffect(() => setShown(null), [selected]);

  if (!card) return null;
  const spent = cardPayments(payments, card)
    .filter((p) => settled(p) && Date.now() - new Date(p.date).getTime() < 30 * 86400000)
    .reduce((a, p) => a + p.amount, 0);
  const used = Math.min(100, (spent / card.limit) * 100);
  const recent = cardPayments(payments, card).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Cards</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Virtual cards for paying online, physical cards for the team. Each spends straight from its account.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> New card
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Every card, each in its own design */}
        <section className={`${panel} h-fit p-2`}>
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${c.id === card.id ? 'bg-[#f1f0ea]' : 'hover:bg-[#faf9f5]'}`}
            >
              <div className="w-[76px] shrink-0 overflow-hidden rounded-md shadow-sm">
                <CardArt currency={c.currency} kind={c.kind} holder="" last4={last4(c)} frozen={c.frozen} />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-semibold">{c.name}</span>
                <span className="block truncate text-[12.5px] text-graphite/50">
                  <span className="capitalize">{c.kind}</span> · {c.currency} ••{last4(c)}
                </span>
              </span>
              {c.status === 'on its way' ? (
                <span className="rounded-md bg-[#e6ecf7] px-1.5 py-0.5 text-[11px] font-medium text-[#2b4a86]">On its way</span>
              ) : c.frozen ? (
                <span className="rounded-md bg-[#e8eef3] px-1.5 py-0.5 text-[11px] font-medium text-graphite/60">Frozen</span>
              ) : null}
            </button>
          ))}
        </section>

        <div className="space-y-6">
          <Scene card={card} company={session?.business} details={shown} />

          <section className={`${panel} p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{card.name}</h2>
                <p className="mt-0.5 text-[14px] text-graphite/55">
                  <span className="capitalize">{card.kind}</span> · {CURRENCIES.find((c) => c.code === card.currency)!.name} · {card.holder}
                </p>
              </div>
              {card.status === 'on its way' ? (
                <button type="button" onClick={() => setPin('activate')} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-[14px] font-semibold text-graphite hover:brightness-95">
                  <PackageCheck className="size-4" /> It’s arrived: activate
                </button>
              ) : (
                <div className="flex gap-2">
                  {card.kind === 'virtual' && (
                    <button
                      type="button"
                      disabled={card.frozen}
                      onClick={() => (shown ? setShown(null) : setPin('reveal'))}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30 disabled:opacity-40"
                    >
                      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {shown ? `Hide details · ${left}s` : 'Show details'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      updateCard(card.id, { frozen: !card.frozen });
                      setShown(null);
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30"
                  >
                    <Snowflake className="size-4" /> {card.frozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                </div>
              )}
            </div>
            {card.status === 'on its way' && <p className="mt-4 rounded-lg bg-[#f5f4ef] px-4 py-3 text-[14px] text-graphite/65">It’s being made and posted, and usually arrives in 3 to 5 working days. When it does, activate it here with your PIN.</p>}

            {/* This month against the limit */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                <span>
                  <span className="font-ledger font-semibold">{money(spent, card.currency)}</span> <span className="text-graphite/55">of {money(card.limit, card.currency)} this month</span>
                </span>
                {editing ? (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const n = Number(limitText.replace(/\D/g, ''));
                      if (n > 0) updateCard(card.id, { limit: n });
                      setEditing(false);
                    }}
                  >
                    <input autoFocus inputMode="numeric" value={limitText} onChange={(e) => setLimitText(e.target.value)} className="h-8 w-32 rounded-md border border-graphite/20 px-2 font-ledger text-[13.5px] outline-none" aria-label="New monthly limit" />
                    <button type="submit" className="text-[13.5px] font-semibold">
                      Save
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setLimitText(String(card.limit));
                      setEditing(true);
                    }}
                    className="text-[13.5px] font-semibold text-graphite/60 hover:text-graphite"
                  >
                    Change limit
                  </button>
                )}
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#efeee7]">
                <div className="h-full rounded-full bg-graphite transition-[width] duration-500" style={{ width: `${used}%` }} />
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[14px] font-semibold">Card payments</p>
              <ul className="mt-2 divide-y divide-graphite/[0.07]">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <span className="grid size-7 place-items-center rounded-full border border-graphite/15">
                      <ArrowUpRight className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{p.who}</span>
                      <span className="block text-[12.5px] text-graphite/50">{shortDate(p.date)}</span>
                    </span>
                    <span className="font-ledger text-[14px] font-medium">−{money(p.amount, p.currency)}</span>
                  </li>
                ))}
                {recent.length === 0 && <li className="py-6 text-[14px] text-graphite/50">Payments with this card will show here.</li>}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {creating && (
          <NewCard
            company={session?.business}
            onClose={() => setCreating(false)}
            onCreated={(c) => {
              setCreating(false);
              setSelected(c.id);
            }}
          />
        )}
      </AnimatePresence>

      <PinPrompt
        open={!!pin}
        title={pin === 'activate' ? 'Activate your card' : 'Show card details'}
        detail={pin === 'activate' ? `${card.name} ••${last4(card)}` : 'Shown for 30 seconds'}
        onClose={() => setPin(null)}
        onConfirm={() => {
          if (pin === 'activate') updateCard(card.id, { status: 'active' });
          else {
            setShown(card);
            setLeft(REVEAL_S);
          }
          setPin(null);
        }}
      />
    </div>
  );
}
