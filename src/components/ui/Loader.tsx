// Credvera's loader, drawn from the logo: the lime tile, the dark coin and the
// diamond at its heart. While something loads, the diamond turns a quarter at
// a time and a ring circles the coin, like a coin being struck. People who
// ask for less motion get a slow breath instead (see index.css).
//
// Three ways to use it:
//   <Spinner />    inline, in the text colour: buttons, fields, small waits
//   <LoaderMark /> the full mark: a panel or a section that's loading
//   <PageLoader /> the whole screen, while an app or a page starts

type Props = { className?: string; label?: string };

/**
 * Inline spinner in `currentColor`, sized by its class (default 1rem), so it
 * sits in a button or a line of text the way an icon would.
 */
export function Spinner({ className = 'size-4', label = 'Loading' }: Props) {
  return (
    <svg viewBox="0 0 24 24" role="status" aria-label={label} className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.25" />
      <g className="cv-loader-orbit">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeDasharray="15 63" />
      </g>
      <g transform="rotate(45 12 12)">
        <rect className="cv-loader-tick" x="9.6" y="9.6" width="4.8" height="4.8" rx="0.8" fill="currentColor" />
      </g>
    </svg>
  );
}

/** The full brand mark, animated. `size` is in pixels. */
export function LoaderMark({ size = 40, className = '', label = 'Loading' }: Props & { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role="status" aria-label={label} className={`block shrink-0 ${className}`}>
      <rect width="48" height="48" rx="14" fill="var(--color-primary)" />
      <circle cx="24" cy="24" r="12.5" fill="var(--color-background)" />
      <g className="cv-loader-orbit">
        <circle cx="24" cy="24" r="17.5" fill="none" stroke="var(--color-background)" strokeWidth="2.25" strokeLinecap="round" strokeDasharray="24 110" />
      </g>
      <g transform="rotate(45 24 24)">
        <rect className="cv-loader-tick" x="20.4" y="20.4" width="7.2" height="7.2" rx="1.1" fill="var(--color-primary)" />
      </g>
    </svg>
  );
}

/**
 * Fills the screen while an app or page gets ready. It waits a beat before
 * showing, so a quick load never flashes a loader at all.
 */
export function PageLoader({ label = 'Loading…', tone = 'business' }: { label?: string; tone?: 'business' | 'personal' }) {
  const look = tone === 'business' ? 'bg-[#f5f4ef] text-graphite' : 'bg-paper text-ink';
  return (
    <div className={`grid min-h-screen place-items-center px-6 ${look}`}>
      <div className="cv-loader-appear flex flex-col items-center gap-4">
        <LoaderMark size={56} label={label} />
        <p className="text-[14px] font-medium opacity-55">{label}</p>
      </div>
    </div>
  );
}
