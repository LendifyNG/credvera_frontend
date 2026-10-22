import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, CircleAlert, Clock3, ShieldX } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { checkCard, normaliseId, type CardCheck } from '../lib/staff';

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease },
});

// The Credvera mark: lime square, ink ring, lime diamond.
function Mark({ size = 26 }: { size?: number }) {
  return (
    <span className="grid place-items-center rounded-[28%] bg-primary" style={{ width: size, height: size }}>
      <span className="grid place-items-center rounded-full bg-background" style={{ width: size * 0.46, height: size * 0.46 }}>
        <span className="rotate-45 bg-primary" style={{ width: size * 0.16, height: size * 0.16 }} />
      </span>
    </span>
  );
}

const STATUS = {
  valid: { label: 'Verified staff', Icon: BadgeCheck, chip: 'bg-primary text-background', ring: 'bg-primary' },
  expired: { label: 'Card expired', Icon: Clock3, chip: 'bg-[#f5c451] text-background', ring: 'bg-[#f5c451]' },
  cancelled: { label: 'Card cancelled', Icon: ShieldX, chip: 'bg-[#f0705a] text-background', ring: 'bg-[#f0705a]' },
} as const;

const HEADLINE = {
  valid: 'works at Credvera.',
  expired: 'held a Credvera card that has expired.',
  cancelled: 'no longer holds a valid Credvera card.',
} as const;

/** The holder's photo inside the ring and diamond, as on the card itself. */
function Portrait({ src, name, tone, dim }: { src: string; name: string; tone: string; dim: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease }}
      className={`relative mx-auto grid size-[260px] place-items-center rounded-[34%] sm:size-[300px] ${tone}`}
    >
      <div className="size-[204px] rounded-full bg-background p-[10px] sm:size-[236px] sm:p-3">
        <img
          src={src}
          alt={name}
          className={`size-full rounded-full object-cover object-[50%_28%] ${dim ? 'grayscale opacity-60' : 'grayscale-[0.15]'}`}
        />
      </div>
      <span className={`absolute bottom-[17px] left-1/2 size-7 -translate-x-1/2 rotate-45 border-[4px] bg-background sm:bottom-[21px] ${tone.replace('bg-', 'border-')}`} />
    </motion.div>
  );
}

function Result({ check }: { check: Exclude<CardCheck, { state: 'unknown' }> }) {
  const { card, state } = check;
  const s = STATUS[state];
  const checkedAt = useMemo(
    () => new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    [],
  );

  return (
    <>
      <Portrait src={card.photo} name={card.name} tone={s.ring} dim={state !== 'valid'} />

      <motion.div {...rise(0.25)} className="mt-9 flex justify-center">
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold ${s.chip}`}>
          <s.Icon className="size-4" strokeWidth={2.4} />
          {s.label}
        </span>
      </motion.div>

      <motion.h1 {...rise(0.35)} className="mt-6 text-balance text-center text-[clamp(2rem,6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
        {card.name} <span className="text-white/45">{HEADLINE[state]}</span>
      </motion.h1>
      <motion.p {...rise(0.42)} className="mt-3 text-center text-[16px] text-white/60">
        {card.role}
      </motion.p>

      <motion.dl {...rise(0.5)} className="mt-10 divide-y divide-white/10 border-y border-white/10 text-[15px]">
        {[
          ['Card number', card.id],
          ['Team', card.team],
          ['Issued', longDate(card.issued)],
          [state === 'expired' ? 'Expired' : 'Valid until', longDate(card.expires)],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-6 py-4">
            <dt className="text-white/50">{k}</dt>
            <dd className="font-ledger font-medium text-white">{v}</dd>
          </div>
        ))}
      </motion.dl>

      <motion.p {...rise(0.58)} className="mt-6 flex items-center justify-center gap-2 text-[13px] text-white/45">
        <span className={`relative flex size-2 ${state === 'valid' ? '' : 'hidden'}`}>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        Checked with Credvera on {checkedAt}
      </motion.p>

      <motion.p {...rise(0.64)} className="mx-auto mt-8 max-w-sm text-center text-[14px] leading-relaxed text-white/55">
        {state === 'valid'
          ? 'Make sure the face in front of you matches this photo. If it doesn’t, don’t rely on the card and '
          : 'Don’t accept this card as proof that the holder works at Credvera. If someone is using it, please '}
        <Link to="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
          tell us
        </Link>
        .
      </motion.p>
    </>
  );
}

function Unknown({ id }: { id: string }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease }}
        className="mx-auto grid size-[180px] place-items-center rounded-[34%] bg-white/[0.06] ring-1 ring-white/10"
      >
        <CircleAlert className="size-14 text-[#f0705a]" strokeWidth={1.6} />
      </motion.div>
      <motion.h1 {...rise(0.2)} className="mt-9 text-[clamp(2rem,6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
        We can’t verify this card.
      </motion.h1>
      <motion.p {...rise(0.3)} className="mx-auto mt-4 max-w-sm text-[16px] leading-relaxed text-white/60">
        There’s no Credvera staff card numbered <span className="font-ledger font-medium text-white">{id}</span>. Don’t accept it
        as proof that the holder works for us, and{' '}
        <Link to="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
          let us know
        </Link>
        .
      </motion.p>
    </div>
  );
}

/** No card number in the link: ask for the one printed on the card. */
function Lookup() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const id = normaliseId(value);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (id) navigate(`/verify/${id}`);
  };

  return (
    <div className="text-center">
      <motion.h1 {...rise(0)} className="text-[clamp(2.2rem,7vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
        Check a Credvera <br />
        staff card.
      </motion.h1>
      <motion.p {...rise(0.1)} className="mx-auto mt-4 max-w-sm text-[16px] leading-relaxed text-white/60">
        Scan the code on the back of the card, or type the card number printed under the barcode.
      </motion.p>
      <motion.form {...rise(0.2)} onSubmit={submit} className="mx-auto mt-10 flex max-w-sm flex-col gap-3 sm:flex-row">
        <label htmlFor="card-id" className="sr-only">
          Card number
        </label>
        <input
          id="card-id"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="CRV-0001"
          autoComplete="off"
          autoCapitalize="characters"
          className="h-14 flex-1 rounded-2xl bg-white/[0.06] px-5 text-[17px] font-medium tracking-[0.06em] text-white ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!id}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[15px] font-semibold text-background transition-opacity disabled:opacity-40"
        >
          Check <ArrowRight className="size-4" />
        </button>
      </motion.form>
    </div>
  );
}

/**
 * credvera.co/verify/:id — where the QR code on the back of a staff card
 * lands. Shows whether the card is valid, with the holder's photo to compare
 * against the person. Stands alone, without the site's menu and footer.
 */
export default function VerifyPage() {
  const { id = '' } = useParams();
  const check = id ? checkCard(id) : null;

  return (
    <div className="min-h-screen bg-background px-5 pb-16 pt-8 text-white sm:pt-12">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2.5" aria-label="Credvera home">
          <Mark />
          <span className="text-[19px] font-semibold tracking-[-0.02em]">Credvera</span>
        </Link>
        <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">Staff card check</p>

        <div className="mt-12 sm:mt-14">
          {!check ? <Lookup /> : check.state === 'unknown' ? <Unknown id={check.id} /> : <Result check={check} />}
        </div>

        {check ? (
          <p className="mt-14 text-center text-[13px] text-white/40">
            <Link to="/verify" className="text-white/60 underline-offset-4 hover:text-white hover:underline">
              Check another card
            </Link>
            {'  ·  '}Credvera Technologies Limited · RC 9894055
          </p>
        ) : null}
      </div>
    </div>
  );
}
