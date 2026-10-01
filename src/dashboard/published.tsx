import { ArrowRight, Megaphone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBusinessContent, type PublishedItem } from '../api';

// What the Credvera team published for businesses, shown where it belongs:
// notices across the top, promos on Home, answers in Help.

/** A content button: an in-app path opens inside the dashboard, an https address in a new tab. */
function Go({ item, className, children }: { item: PublishedItem; className: string; children: React.ReactNode }) {
  const link = item.link?.trim();
  if (!link) return null;
  if (link.startsWith('https://')) {
    return (
      <a href={link} target="_blank" rel="noreferrer noopener" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={`/business/app${link === '/' ? '' : link}`} className={className}>
      {children}
    </Link>
  );
}

// Dismissed notices are a per-person convenience in this browser, keyed by
// version, so a changed notice shows again.
const DISMISSED_KEY = 'credvera.notices.dismissed';
const readDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
};

/** The team's notices for businesses, newest first, each dismissible. */
export function Notices() {
  const content = useBusinessContent();
  const [dismissed, setDismissed] = useState(readDismissed);
  const shown = (content.data?.notices ?? []).filter((n) => !dismissed.includes(`${n.id}@${n.version}`));
  if (!shown.length) return null;

  const dismiss = (n: PublishedItem) => {
    const next = [...dismissed, `${n.id}@${n.version}`].slice(-100);
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Hidden for this visit only.
    }
  };

  return (
    <div className="mx-auto mb-6 max-w-6xl space-y-2">
      {shown.map((n) => (
        <div key={n.id} role="status" className="flex items-start gap-3 rounded-xl border border-[#ecdcae] bg-[#fbf5e6] px-4 py-3 text-[14px]">
          <Megaphone className="mt-0.5 size-4 shrink-0 text-[#8a5a00]" />
          <p className="flex-1">
            <span className="font-semibold">{n.title}</span> <span className="text-graphite/65">{n.body}</span>
          </p>
          <button type="button" onClick={() => dismiss(n)} aria-label="Dismiss" className="shrink-0 text-graphite/40 hover:text-graphite">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/** The newest promo for businesses, as a card on Home. */
export function PromoCard() {
  const content = useBusinessContent();
  const promo = content.data?.promos[0];
  if (!promo) return null;

  return (
    <section className="mt-6 flex flex-wrap items-center gap-5 rounded-2xl bg-[#141c17] px-6 py-5 text-white">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-[16px] text-graphite">✦</span>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-semibold leading-snug">{promo.title}</p>
        <p className="mt-0.5 text-[14px] text-white/65">{promo.body}</p>
      </div>
      <Go item={promo} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-[14px] font-semibold text-graphite hover:brightness-95">
        {promo.cta} <ArrowRight className="size-4" />
      </Go>
    </section>
  );
}
