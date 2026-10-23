import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Clock3, ShieldX } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/editorial/PageHeader';
import Reveal from '../components/ui/Reveal';
import { checkCard, normaliseId, type CardCheck } from '../lib/staff';

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const ease = [0.16, 1, 0.3, 1] as const;

const STATUS = {
  valid: { label: 'Verified staff', Icon: BadgeCheck, chip: 'bg-primary text-background', tone: 'bg-primary' },
  expired: { label: 'Card expired', Icon: Clock3, chip: 'bg-[#f5c451] text-background', tone: 'bg-[#f5c451]' },
  cancelled: { label: 'Card cancelled', Icon: ShieldX, chip: 'bg-[#f0705a] text-background', tone: 'bg-[#f0705a]' },
} as const;

const TITLE = {
  valid: (name: string) => `${name}\n*works at Credvera.*`,
  expired: (name: string) => `${name}’s card\n*has expired.*`,
  cancelled: () => 'This card\n*has been cancelled.*',
} as const;

/** The holder's photo inside the ring and diamond, as on the card itself. */
function Portrait({ src, name, tone, dim }: { src: string; name: string; tone: string; dim: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease }}
      className={`relative grid aspect-square w-full max-w-[420px] place-items-center rounded-[34%] ${tone}`}
    >
      <div className="aspect-square w-[78%] rounded-full bg-background p-[3.5%]">
        <img src={src} alt={name} className={`size-full rounded-full object-cover object-[50%_28%] ${dim ? 'grayscale opacity-60' : 'grayscale-[0.15]'}`} />
      </div>
      <span className={`absolute bottom-[6%] left-1/2 size-[8%] -translate-x-1/2 rotate-45 border-[4px] bg-background ${tone.replace('bg-', 'border-')}`} />
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
      <PageHeader label="Staff card check" title={TITLE[state](card.name)} lede={`${card.role}, ${card.team} team.`}>
        <p className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${s.chip}`}>
          <s.Icon className="size-4" strokeWidth={2.4} />
          {s.label}
        </p>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="grid gap-12 border-t border-ink/15 pt-12 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <Portrait src={card.photo} name={card.name} tone={s.tone} dim={state !== 'valid'} />

          <Reveal>
            <dl className="border-t border-ink/15 text-lg">
              {[
                ['Card number', card.id],
                ['Team', card.team],
                ['Issued', longDate(card.issued)],
                [state === 'expired' ? 'Expired' : 'Valid until', longDate(card.expires)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-6 border-b border-ink/15 py-5">
                  <dt className="text-[13px] font-semibold text-ink/40">{k}</dt>
                  <dd className="font-ledger font-semibold text-background">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 flex items-center gap-2 text-[14px] text-ink/55">
              {state === 'valid' && (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-background opacity-40" />
                  <span className="relative inline-flex size-2 rounded-full bg-background" />
                </span>
              )}
              Checked with Credvera on {checkedAt}
            </p>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/65">
              {state === 'valid'
                ? 'Make sure the face in front of you matches this photo. If it doesn’t, don’t rely on the card and '
                : 'Don’t accept this card as proof that the holder works at Credvera. If someone is using it, please '}
              <Link to="/contact" className="font-semibold text-background underline decoration-primary decoration-2 underline-offset-4">
                tell us
              </Link>
              .
            </p>

            <Link to="/verify" className="mt-10 inline-flex text-[15px] font-semibold text-ink/60 hover:text-background">
              Check another card
            </Link>
          </Reveal>
        </div>
      </section>
    </>
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
    <PageHeader
      label="Staff card check"
      title={'Check a\n*staff card*.'}
      lede="Scan the code on the back of a Credvera staff card, or type the card number printed under the barcode."
    >
      <form onSubmit={submit} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
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
          className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-6 py-3.5 text-lg font-semibold tracking-[0.04em] text-background outline-none transition-colors placeholder:font-normal placeholder:text-ink/30 focus:border-background"
        />
        <button
          type="submit"
          disabled={!id}
          className="group inline-flex items-center justify-between gap-3 rounded-full bg-secondary py-2 pl-6 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-background disabled:opacity-40"
        >
          Check
          <span className="grid size-9 place-items-center rounded-full bg-primary text-secondary transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </button>
      </form>
    </PageHeader>
  );
}

/**
 * credvera.co/verify/:id — where the QR code on the back of a staff card
 * lands. Shows whether the card is valid, with the holder's photo to compare
 * against the person, in the site's own frame.
 */
export default function VerifyPage() {
  const { id = '' } = useParams();
  if (!id) return <Lookup />;
  const check = checkCard(id);
  if (check.state !== 'unknown') return <Result check={check} />;
  return (
    <PageHeader
      label="Staff card check"
      title={'We can’t verify\n*this card*.'}
      lede={`There’s no Credvera staff card numbered ${check.id}. Don’t accept it as proof that the holder works for us, and let us know through the contact page.`}
    >
      <Link to="/verify" className="mt-6 inline-flex text-[15px] font-semibold text-background underline decoration-primary decoration-2 underline-offset-4">
        Check another card
      </Link>
    </PageHeader>
  );
}
