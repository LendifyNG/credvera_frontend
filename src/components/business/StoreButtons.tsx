import { links } from '../../lib/site';

/**
 * The app on both stores, as plain buttons (not the stores' own badge
 * artwork, which comes with strict usage rules).
 */
export default function StoreButtons({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const cls =
    tone === 'dark'
      ? 'bg-graphite text-white ring-1 ring-white/10 hover:bg-black'
      : 'bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/15';
  const stores = [
    { href: links.appStore, small: 'Download on the', big: 'App Store' },
    { href: links.playStore, small: 'Get it on', big: 'Google Play' },
  ];
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {stores.map((s) => (
        <a key={s.big} href={s.href} target="_blank" rel="noopener noreferrer" className={`inline-flex h-11 flex-col justify-center rounded-md px-4 leading-none transition-colors ${cls}`}>
          <span className="text-[10.5px] opacity-70">{s.small}</span>
          <span className="mt-0.5 text-[15px] font-semibold tracking-tight">{s.big}</span>
        </a>
      ))}
    </div>
  );
}
