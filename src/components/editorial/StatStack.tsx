import type { Photo } from '../../lib/photos';
import type { Stat } from '../../lib/site';
import CountUp from '../ui/CountUp';
import LoopVideo from './LoopVideo';

export type StatCardMedia = { stat: Stat; photo?: Photo; video?: { name: string; label: string } };

/**
 * The numbers as full-screen cards with real footage behind them. Each card
 * sticks a little lower than the last, so they stack up as you scroll.
 */
export default function StatStack({ cards }: { cards: StatCardMedia[] }) {
  return (
    <div className="px-3 sm:px-6">
      {cards.map(({ stat, photo, video }, i) => (
        <div
          key={stat.label}
          className="sticky mx-auto mb-6 max-w-7xl"
          style={{ top: `calc(5.5rem + ${i * 18}px)` }}
        >
          <div className="relative h-[min(78vh,760px)] min-h-[480px] overflow-hidden rounded-[2rem] bg-secondary text-white shadow-[0_-20px_60px_-30px_rgba(1,21,4,0.6)]">
            {video ? (
              <LoopVideo name={video.name} label={video.label} className="absolute inset-0 h-full w-full object-cover" />
            ) : photo ? (
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(1,21,4,0.9),rgba(1,21,4,0.35)_50%,rgba(1,21,4,0.15))]" />

            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-14">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary tabular-nums">
                {String(i + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
              </p>
              <p className="mt-4 flex flex-wrap items-baseline gap-x-4">
                <span className="text-[clamp(4rem,13vw,11rem)] font-semibold leading-[0.85] tracking-[-0.05em]">
                  <CountUp value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
                </span>
                {stat.unit ? <span className="font-serif text-[clamp(1.8rem,4vw,3.4rem)] italic">{stat.unit}</span> : null}
              </p>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">{stat.label}</p>
              <a
                href={stat.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-xs text-white/45 underline-offset-4 hover:text-white/70 hover:underline"
              >
                Source: {stat.source}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
