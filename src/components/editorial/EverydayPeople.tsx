import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { useRef, type ReactNode } from 'react';
import { photos, type Photo } from '../../lib/photos';
import Reveal from '../ui/Reveal';
import Headline from './Headline';
import LoopVideo from './LoopVideo';

type Tile = {
  key: string;
  /** Position and width on large screens, around the headline. */
  place: string;
  /** Width over height, so every photo shows whole. */
  ratio: number;
  /** How far it drifts as you scroll; different speeds give depth. */
  drift: number;
  photo?: Photo;
  video?: { name: string; label: string };
};

// Everyday Nigerian life: the market, the commute, the working day.
const tiles: Tile[] = [
  { key: 'seller', place: 'left-0 top-[9%] w-[24%]', ratio: 16 / 9, drift: 60, video: { name: 'market-seller', label: 'A trader carrying her goods through a busy market' } },
  { key: 'tomatoes', place: 'left-[31%] top-0 w-[15%]', ratio: photos.marketTomatoes.width / photos.marketTomatoes.height, drift: 110, photo: photos.marketTomatoes },
  { key: 'onions', place: 'right-[3%] top-[3%] w-[14%]', ratio: photos.marketOnions.width / photos.marketOnions.height, drift: 80, photo: photos.marketOnions },
  { key: 'work', place: 'left-[5%] bottom-[5%] w-[13%]', ratio: photos.manWorkWatch.width / photos.manWorkWatch.height, drift: 130, photo: photos.manWorkWatch },
  { key: 'bus', place: 'left-[36%] bottom-0 w-[18%]', ratio: photos.menYellowBus.width / photos.menYellowBus.height, drift: 50, photo: photos.menYellowBus },
  { key: 'walk', place: 'right-[9%] bottom-[3%] w-[13%]', ratio: 9 / 16, drift: 100, video: { name: 'walk-to-work', label: 'A woman on a phone call, walking to work' } },
];

function Media({ tile, className = '' }: { tile: Tile; className?: string }) {
  const box = `overflow-hidden rounded-[1.25rem] bg-mist shadow-[0_30px_60px_-35px_rgba(1,21,4,0.45)] ${className}`;
  if (tile.video)
    return (
      <div className={box} style={{ aspectRatio: tile.ratio }}>
        <LoopVideo name={tile.video.name} label={tile.video.label} className="h-full w-full object-cover" />
      </div>
    );
  const p = tile.photo!;
  return (
    <div className={box} style={{ aspectRatio: tile.ratio }}>
      <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>
  );
}

function Drifting({ progress, drift, className, children }: { progress: MotionValue<number>; drift: number; className: string; children: ReactNode }) {
  const y = useTransform(progress, [0, 1], [drift, -drift]);
  return (
    <motion.div className={`absolute ${className}`} style={{ y }}>
      {children}
    </motion.div>
  );
}

/**
 * The people Credvera is for, in the middle of their day. On large screens
 * the photos and clips float around the headline and drift at different
 * speeds as you scroll; on phones they sit in a row you can swipe.
 */
export default function EverydayPeople() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const words = (
    <div className="relative z-10 mx-auto max-w-[40rem] text-center">
      <Reveal>
        <p className="text-[13px] font-semibold text-background">Made for everyday Nigerians</p>
      </Reveal>
      <Headline
        text={'For the market stall,\nthe *morning bus* and\nthe ==midnight== invoice.'}
        className="mt-6 text-[clamp(2.3rem,4.6vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.035em]"
      />
      <Reveal delay={0.2}>
        <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-ink/65">
          Traders, nine-to-fivers, freelancers and students. Credvera fits into the day you already have.
        </p>
      </Reveal>
    </div>
  );

  return (
    <section ref={ref} className="overflow-hidden py-24 lg:py-16">
      {/* Large screens: the collage around the words */}
      <div className="relative mx-auto hidden h-[min(100vh,900px)] max-w-7xl items-center px-8 lg:flex">
        {tiles.map((t) =>
          reduce ? (
            <div key={t.key} className={`absolute ${t.place}`}>
              <Media tile={t} />
            </div>
          ) : (
            <Drifting key={t.key} progress={scrollYProgress} drift={t.drift} className={t.place}>
              <Media tile={t} />
            </Drifting>
          ),
        )}
        {words}
      </div>

      {/* Phones and tablets: words first, then a row to swipe */}
      <div className="lg:hidden">
        <div className="px-6">{words}</div>
        <div className="mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none]">
          {tiles.map((t) => (
            <Media key={t.key} tile={t} className="h-72 shrink-0 snap-center" />
          ))}
        </div>
      </div>
    </section>
  );
}
