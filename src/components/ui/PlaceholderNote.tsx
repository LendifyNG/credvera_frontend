import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { PLACEHOLDER_CONTENT } from '../../lib/site';

type PlaceholderNoteProps = {
  children?: ReactNode;
  className?: string;
};

/** Shown only while `PLACEHOLDER_CONTENT` is true in lib/site.ts. */
export default function PlaceholderNote({
  children = 'Sample content — final details will be confirmed before launch.',
  className = '',
}: PlaceholderNoteProps) {
  if (!PLACEHOLDER_CONTENT) return null;
  return (
    <p
      className={`flex items-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-mist/60 px-4 py-3 text-sm text-ink/60 ${className}`}
    >
      <Info className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}
