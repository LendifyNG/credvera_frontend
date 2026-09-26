import { motion } from 'framer-motion';
import { useAudience, type Audience } from '../../lib/audience';

const options: { value: Audience; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
];

/** Personal | Business. The whole site follows this choice. */
export default function AudienceSwitch({ className = '', light = false }: { className?: string; light?: boolean }) {
  const { audience, switchTo } = useAudience();
  return (
    <div
      role="tablist"
      aria-label="Personal or business"
      className={`relative inline-flex rounded-full p-1 ring-1 ${light ? 'bg-ink/[0.04] ring-ink/10' : 'bg-white/10 ring-white/15'} ${className}`}
    >
      {options.map((o) => {
        const on = o.value === audience;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => switchTo(o.value)}
            className={`relative rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-300 sm:px-4 sm:text-[13px] ${
              on ? 'text-secondary' : light ? 'text-ink/60 hover:text-ink' : 'text-white/75 hover:text-white'
            }`}
          >
            {on && (
              <motion.span
                layoutId="audience-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
