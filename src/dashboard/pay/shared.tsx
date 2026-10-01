import { useEffect, useState } from 'react';

// Styles and helpers shared by the payment forms.

export const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50 disabled:bg-[#f5f4ef]';
export const label = 'mb-1.5 block text-[13px] font-medium text-graphite/60';
export const panel = 'rounded-2xl border border-graphite/10 bg-white';
export const primary = 'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-graphite px-5 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40';

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Whole naira typed into a text box: "650,000" -> 650000. */
export const nairaFrom = (text: string) => Number(text.replace(/\D/g, '')) || 0;

/** The value once it has stopped changing for `ms`, so typing doesn't call the API per keystroke. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return settled;
}

/** A naira amount box that shows thousands separators as you type. */
export function NairaInput({ value, onChange, disabled, id }: { value: number; onChange: (text: string) => void; disabled?: boolean; id?: string }) {
  return (
    <span className="flex h-11 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 focus-within:border-graphite/50">
      <span className="text-[16px] font-medium text-graphite/40">₦</span>
      <input
        id={id}
        inputMode="numeric"
        value={value ? value.toLocaleString('en-NG') : ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="0"
        className="w-full bg-transparent font-ledger text-[16px] outline-none"
      />
    </span>
  );
}
