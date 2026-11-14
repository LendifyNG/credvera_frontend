import { useId } from 'react';
import type { SprayNoteValue } from '../../lib/celebrations';

/**
 * A Credvera spray note: the party's own money, printed with the couple's
 * monogram. Deliberately not a naira note (no portraits, crests or CBN
 * marks): it's a token on a screen, in the brand's colours.
 */
export const NOTE_STYLE: Record<SprayNoteValue, { bg: string; ink: string; line: string; seal: string; label: string }> = {
  200: { bg: '#dcf17e', ink: '#15171a', line: 'rgba(21,23,26,0.16)', seal: '#15171a', label: 'Lime' },
  500: { bg: '#cdbdff', ink: '#1d1640', line: 'rgba(29,22,64,0.18)', seal: '#1d1640', label: 'Lilac' },
  1000: { bg: '#15171a', ink: '#dcf17e', line: 'rgba(220,241,126,0.2)', seal: '#dcf17e', label: 'Ink' },
};

export default function SprayNote({ value, mark, className, shadow = true }: { value: SprayNoteValue; mark: string; className?: string; shadow?: boolean }) {
  const s = NOTE_STYLE[value];
  const id = useId().replace(/:/g, '');
  const digits = value.toLocaleString('en-NG');
  return (
    <svg viewBox="0 0 240 112" className={className} role="img" aria-label={`₦${digits} spray note`} style={shadow ? { filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.28))' } : undefined}>
      <defs>
        <clipPath id={`c${id}`}>
          <rect width="240" height="112" rx="9" />
        </clipPath>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <rect width="240" height="112" fill={s.bg} />
        {/* Guilloche: rings off the right edge and waves across, like an engraved note. */}
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx="176" cy="56" rx={14 + i * 9} ry={10 + i * 6.5} fill="none" stroke={s.line} strokeWidth="1" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${78 + i * 6} C 30 ${70 + i * 6}, 60 ${88 + i * 6}, 90 ${78 + i * 6} S 150 ${70 + i * 6}, 240 ${80 + i * 6}`}
            fill="none"
            stroke={s.line}
            strokeWidth="0.9"
          />
        ))}
        <rect x="6" y="6" width="228" height="100" rx="5" fill="none" stroke={s.ink} strokeOpacity="0.35" strokeWidth="1" />
        {/* The value */}
        <text x="18" y="30" fill={s.ink} fontSize="11" fontWeight="700" letterSpacing="2.4" opacity="0.7">
          SPRAY
        </text>
        <text x="16" y="70" fill={s.ink} fontSize="40" fontWeight="700" letterSpacing="-1.5">
          <tspan fontSize="22" dy="-12" fontWeight="600">₦</tspan>
          <tspan dy="12">{digits}</tspan>
        </text>
        {/* The monogram seal */}
        <circle cx="176" cy="56" r="25" fill={s.bg} stroke={s.seal} strokeWidth="1.6" />
        <circle cx="176" cy="56" r="20" fill="none" stroke={s.seal} strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="1.6 2.2" />
        <text x="176" y="56" textAnchor="middle" dominantBaseline="central" fill={s.seal} fontSize={mark.length > 2 ? 14 : 17} fontWeight="700" letterSpacing="-0.4">
          {mark || 'C'}
        </text>
        {/* The tick wordmark */}
        <text x="18" y="97" fill={s.ink} fontSize="10.5" fontWeight="600" letterSpacing="-0.1" opacity="0.75">
          credvera
        </text>
        <text x="222" y="97" textAnchor="end" fill={s.ink} fontSize="10.5" fontWeight="700" opacity="0.55">
          {digits}
        </text>
        <rect width="240" height="112" fill={`url(#g${id})`} />
      </g>
    </svg>
  );
}
