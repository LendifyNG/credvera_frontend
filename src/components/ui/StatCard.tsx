import type { Stat } from '../../lib/site';
import CountUp from './CountUp';

type StatCardProps = {
  stat: Stat;
  tone?: 'light' | 'dark';
};

/**
 * A published market figure with an animated number and a link to its source.
 * The number always sits on one line; word units ("billion") are set smaller
 * beside it so every card in a row lines up.
 */
export default function StatCard({ stat, tone = 'light' }: StatCardProps) {
  const dark = tone === 'dark';
  return (
    <figure className={`flex h-full flex-col rounded-3xl p-8 ${dark ? 'bg-white/5 ring-1 ring-white/10' : 'border border-ink/10 bg-white'}`}>
      <p className={`flex min-h-[3.5rem] items-baseline gap-2 whitespace-nowrap sm:min-h-[4rem] ${dark ? 'text-primary' : 'text-background'}`}>
        <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
          <CountUp value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
        </span>
        {stat.unit && <span className="text-lg font-medium tracking-tight opacity-80 sm:text-xl">{stat.unit}</span>}
      </p>
      <figcaption className="mt-4 flex grow flex-col justify-between gap-6">
        <span className={`leading-relaxed ${dark ? 'text-white/75' : 'text-ink/70'}`}>{stat.label}</span>
        <a
          href={stat.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs font-medium underline-offset-4 hover:underline ${dark ? 'text-white/40' : 'text-ink/40'}`}
        >
          Source: {stat.source}
        </a>
      </figcaption>
    </figure>
  );
}
