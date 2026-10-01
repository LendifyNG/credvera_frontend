import { Check } from 'lucide-react';

// Pieces shared by the open-an-account screens.

export const ease = [0.16, 1, 0.3, 1] as const;
export const label = 'text-[13px] font-medium text-graphite/55';
export const field = 'w-full border-b-2 border-graphite/15 bg-transparent py-2.5 text-[17px] outline-none transition-colors placeholder:text-graphite/30 focus:border-graphite disabled:text-graphite/50';
export const primary = 'group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-graphite px-6 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/20 disabled:text-graphite/45';
export const secondary = 'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black disabled:bg-graphite/20 disabled:text-graphite/45';

/** One numbered section of a form that fills itself in as you go. */
export function Step({ n, title, done, active, children }: { n: number; title: string; done: boolean; active: boolean; children: React.ReactNode }) {
  return (
    <section className={`border-t border-graphite/15 py-8 transition-opacity ${active || done ? 'opacity-100' : 'pointer-events-none opacity-35'}`}>
      <div className="flex items-center gap-4">
        <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors ${done ? 'bg-primary text-graphite' : active ? 'bg-graphite text-white' : 'ring-1 ring-graphite/25 text-graphite/50'}`}>
          {done ? <Check className="size-4" /> : n}
        </span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="mt-6 pl-12">{children}</div>
    </section>
  );
}

/** An error line under a form, in the backend's own words. */
export function Problem({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-3 text-[14px] text-[#b42318]">
      {children}
    </p>
  );
}

/**
 * Nigerian numbers as people type them -> E.164, which the API requires:
 * `0803 000 0000`, `803 000 0000` and `+234 803…` all become `+2348030000000`.
 */
export function toE164(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (input.trim().startsWith('+')) return `+${digits}`;
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return input.trim();
}
