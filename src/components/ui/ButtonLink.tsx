import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'outline-light' | 'outline-dark' | 'dark';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-secondary hover:bg-[#9aeb9b]',
  'outline-light': 'border border-white/25 text-white hover:bg-white/10',
  'outline-dark': 'border border-ink/15 text-ink hover:bg-ink/5',
  dark: 'bg-secondary text-white hover:bg-background',
};

type ButtonLinkProps = {
  to: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

/** Pill button. External URLs open in a new tab; internal paths use the router. */
export default function ButtonLink({ to, children, variant = 'primary', className = '' }: ButtonLinkProps) {
  const cls = `group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-300 ${variants[variant]} ${className}`;

  const inner = (
    <>
      {children}
      <span className="relative grid size-5 place-items-center overflow-hidden" aria-hidden>
        <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-5 group-hover:translate-x-5" />
        <ArrowUpRight className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </>
  );

  if (/^https?:\/\//.test(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  );
}
