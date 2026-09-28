import { Snowflake } from 'lucide-react';
import { useId } from 'react';
import logo from '../assets/logo.png';
import type { Currency } from './store';

type Finish = 'metal' | 'matte';
type Recipe = { from: string; to: string; tone: string; finish: Finish };

/**
 * Each card's look, from who it's for and its currency. Business cards are
 * metal and ink; personal cards are warmer and softer. Each currency has its
 * own colourway, so a dollar card never looks like a euro card.
 */
const RECIPES: Record<'business' | 'personal', Record<Currency, Recipe>> = {
  business: {
    NGN: { from: '#123f28', to: '#07201a', tone: '#7fde80', finish: 'matte' },
    USD: { from: '#474d49', to: '#191d1b', tone: '#a9cbb1', finish: 'metal' },
    GBP: { from: '#232b3d', to: '#0b1019', tone: '#dcc79d', finish: 'metal' },
    EUR: { from: '#15296a', to: '#081232', tone: '#e3bb4f', finish: 'matte' },
  },
  personal: {
    NGN: { from: '#0d5a2c', to: '#063c1a', tone: '#b6f0b6', finish: 'matte' },
    USD: { from: '#2f4a7a', to: '#12213f', tone: '#cfe0ff', finish: 'matte' },
    GBP: { from: '#6a2a3a', to: '#2c0f18', tone: '#f4c7d0', finish: 'matte' },
    EUR: { from: '#27407e', to: '#101d44', tone: '#ffe08a', finish: 'matte' },
  },
};

// The Credvera symbol, measured from the logo: a disc with a diamond at its
// centre whose half-diagonal is 17/40 of the disc's radius.
const CX = 640;
const CY = 330;
const R = 300;
const D = (17 / 40) * R;

// Twelve five-pointed stars in a ring, as on the EU flag.
const STARS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const cx = 100 + Math.cos(a) * 78;
  const cy = 120 + Math.sin(a) * 78;
  return Array.from({ length: 10 }, (_, k) => {
    const t = (k / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = k % 2 ? 4.4 : 11;
    return `${k ? 'L' : 'M'}${(cx + Math.cos(t) * rr).toFixed(1)} ${(cy + Math.sin(t) * rr).toFixed(1)}`;
  }).join(' ') + 'Z';
}).join(' ');

/**
 * A line drawing of each currency's country, pressed into the card like the
 * symbol: Nigeria's talking drum, the torch of the Statue of Liberty, the
 * Elizabeth Tower in London, and the ring of stars on the European flag.
 * Drawn in a 200 × 240 box.
 */
function CountryMark({ currency }: { currency: Currency }) {
  switch (currency) {
    case 'NGN': {
      // The gángan: two drumheads, the waist, the tension strings and the curved stick.
      const strings = Array.from({ length: 7 }, (_, i) => {
        const x = 52 + i * 16;
        return `M${x} 40 Q100 122 ${x} 204`;
      }).join(' ');
      return (
        <>
          <ellipse cx="100" cy="34" rx="56" ry="14" />
          <ellipse cx="100" cy="210" rx="56" ry="14" />
          <path d="M44 34 C68 100 68 144 44 210 M156 34 C132 100 132 144 156 210" />
          <path d={strings} strokeWidth="2.5" />
          <path d="M172 150 C196 128 200 96 186 70 L178 64" />
        </>
      );
    }
    case 'USD':
      // The torch: flame, cup, bands and handle.
      return (
        <>
          <path d="M100 8 C78 44 82 70 100 86 C118 70 122 44 100 8 Z" />
          <path d="M100 34 C92 52 93 66 100 74 C107 66 108 52 100 34 Z" strokeWidth="2.5" />
          <path d="M72 92 H128 L116 124 H84 Z" />
          <path d="M80 104 H120" strokeWidth="2.5" />
          <path d="M90 124 V210 M110 124 V210 M84 210 H116 L110 232 H90 Z" />
          <path d="M90 150 H110 M90 176 H110" strokeWidth="2.5" />
        </>
      );
    case 'GBP':
      // The Elizabeth Tower: spire, belfry, the clock and the long shaft.
      return (
        <>
          <path d="M100 4 L118 50 H82 Z" />
          <path d="M100 4 V-6" />
          <rect x="74" y="50" width="52" height="64" rx="2" />
          <circle cx="100" cy="82" r="19" />
          <path d="M100 82 V70 M100 82 L109 87" strokeWidth="2.5" />
          <path d="M80 114 H120 V236 H80 Z" />
          <path d="M92 130 V222 M108 130 V222" strokeWidth="2.5" />
        </>
      );
    case 'EUR':
      return <path d={STARS} />;
  }
}

export type CardArtProps = {
  currency: Currency;
  kind: 'virtual' | 'physical';
  audience?: 'business' | 'personal';
  holder: string;
  company?: string;
  last4: string;
  frozen?: boolean;
  // Revealed details, shown on the face for a short while.
  details?: { number: string; expiry: string; cvv: string } | null;
  // Where the light falls, 0 to 1 across the card.
  light?: number;
  className?: string;
};

/** A card that looks like the real thing: its material, the pressed-in symbol, a chip, and light across it. */
export default function CardArt({ currency, kind, audience = 'business', holder, company, last4, frozen, details, light = 0.35, className = '' }: CardArtProps) {
  const id = useId().replace(/:/g, '');
  const r = RECIPES[audience][currency];
  const physical = kind === 'physical';
  const diamond = `M${CX} ${CY - D} L${CX + D} ${CY} L${CX} ${CY + D} L${CX - D} ${CY} Z`;

  return (
    <div className={`relative aspect-[1.586] w-full select-none overflow-hidden rounded-[4.2%/6.6%] text-white ${className}`} style={{ containerType: 'inline-size' }}>
      <svg viewBox="0 0 856 540" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}base`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={r.from} />
            <stop offset="1" stopColor={r.to} />
          </linearGradient>
          {/* Brushed metal: long fine streaks. Matte: an even, soft grain. */}
          <filter id={`${id}tex`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={r.finish === 'metal' ? '0.002 0.55' : '0.85'} numOctaves={r.finish === 'metal' ? 2 : 3} seed="7" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <radialGradient id={`${id}glow`} cx="0.2" cy="0" r="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="856" height="540" fill={`url(#${id}base)`} />
        <rect width="856" height="540" filter={`url(#${id}tex)`} opacity={r.finish === 'metal' ? 0.16 : 0.1} style={{ mixBlendMode: 'overlay' }} />
        <rect width="856" height="540" fill={`url(#${id}glow)`} />

        {/* The country, drawn into the card on the left, in the same pressed tone */}
        <g transform="translate(46 118) scale(1.18)" fill="none" strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(2.5 2.5)" stroke="#000" opacity="0.4" fill={currency === 'EUR' ? '#000' : 'none'}>
            <CountryMark currency={currency} />
          </g>
          <g stroke={r.tone} opacity="0.55" fill={currency === 'EUR' ? r.tone : 'none'}>
            <CountryMark currency={currency} />
          </g>
        </g>

        {/* The symbol pressed into the card: a dark lip on one side, light on the other */}
        <g>
          <circle cx={CX + 3} cy={CY + 3} r={R} fill="#000" opacity="0.22" />
          <circle cx={CX - 2} cy={CY - 2} r={R} fill="#fff" opacity="0.06" />
          <circle cx={CX} cy={CY} r={R} fill={r.tone} opacity="0.12" />
          <path d={diamond} transform="translate(3 3)" fill="#000" opacity="0.25" />
          <path d={diamond} fill={r.tone} opacity="0.34" />
        </g>

        {/* A fine lit edge all round */}
        <rect x="1" y="1" width="854" height="538" rx="36" fill="none" stroke="#fff" strokeOpacity={physical ? 0.14 : 0.3} strokeWidth="2" />
      </svg>

      {/* Virtual cards are frosted, like glass */}
      {!physical && <div aria-hidden className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0)_50%,rgba(255,255,255,0.05))]" />}

      {/* The light across the surface */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background-position] duration-300 ease-out"
        style={{
          backgroundImage: `linear-gradient(112deg, transparent 32%, rgba(255,255,255,${r.finish === 'metal' ? 0.2 : 0.12}) 46%, transparent 60%)`,
          backgroundSize: '250% 100%',
          backgroundPosition: `${100 - light * 100}% 0`,
        }}
      />

      {/* Printing */}
      <div className="absolute inset-0 flex flex-col justify-between p-[6.2cqw]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-[2cqw]">
            <img src={logo} alt="Credvera" className="h-[5.2cqw] w-auto" draggable={false} />
            {audience === 'business' && <span className="border-l border-white/30 pl-[2cqw] text-[3cqw] font-medium text-white/75">Business</span>}
          </div>
          <span className="text-[3cqw] font-medium text-white/70">{physical ? 'debit' : 'virtual'}</span>
        </div>

        {physical ? (
          <div className="flex items-center gap-[3cqw]">
            {/* The chip, in champagne gold, with its contact plates */}
            <svg viewBox="0 0 44 34" className="w-[11.5cqw]" aria-hidden>
              <defs>
                <linearGradient id={`${id}chip`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f2e3b3" />
                  <stop offset="0.5" stopColor="#cfb271" />
                  <stop offset="1" stopColor="#9c7c3a" />
                </linearGradient>
              </defs>
              <rect x="0.6" y="0.6" width="42.8" height="32.8" rx="6" fill={`url(#${id}chip)`} stroke="#7d6128" strokeWidth="0.7" />
              <path d="M0.6 11.6H14.5M0.6 22.4H14.5M29.5 11.6H43.4M29.5 22.4H43.4M14.5 0.6V9M14.5 25V33.4M29.5 0.6V9M29.5 25V33.4" stroke="#7d6128" strokeWidth="0.7" fill="none" />
              <rect x="14.5" y="9" width="15" height="16" rx="4" fill="none" stroke="#7d6128" strokeWidth="0.7" />
            </svg>
            <svg viewBox="0 0 26 26" className="w-[5cqw] opacity-80" aria-hidden>
              {[5, 9, 13, 17].map((a) => {
                const x = 2 + a * 0.766;
                return <path key={a} d={`M${x} ${13 - a * 0.643}A${a} ${a} 0 0 1 ${x} ${13 + a * 0.643}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />;
              })}
            </svg>
          </div>
        ) : details ? (
          <p className="font-ledger text-[5.6cqw] font-medium tracking-[0.08em]">{details.number}</p>
        ) : (
          <span />
        )}

        <div className="flex items-end justify-between gap-[3cqw]">
          <div className="min-w-0">
            <p className="truncate text-[3.3cqw] font-medium uppercase tracking-[0.12em] text-white/90">{holder}</p>
            {company && <p className="truncate text-[2.8cqw] text-white/60">{company}</p>}
          </div>
          <div className="text-right">
            {details ? (
              <p className="font-ledger text-[3cqw] text-white/85">
                {details.expiry} · CVV {details.cvv}
              </p>
            ) : (
              <p className="font-ledger text-[3.3cqw] tracking-wide text-white/85">•• {last4}</p>
            )}
            <p className="text-[2.8cqw] font-medium text-white/60">{currency}</p>
          </div>
        </div>
      </div>

      {frozen && (
        <div className="absolute inset-0 grid place-items-center bg-[#dfe7ee]/35 backdrop-blur-[3px]">
          <span className="flex items-center gap-[1.5cqw] rounded-full bg-white/85 px-[3cqw] py-[1.2cqw] text-[3.2cqw] font-semibold text-graphite">
            <Snowflake className="size-[3.6cqw]" /> Frozen
          </span>
        </div>
      )}
    </div>
  );
}
