import { useReducedMotion } from '../../lib/motion';
import { useEffect, useRef } from 'react';

type LoopVideoProps = {
  /** Base name in /public/video: plays name.mp4, shows name.jpg first. */
  name: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
  /** Start straight away (the opening), rather than when scrolled into view. */
  eager?: boolean;
};

/**
 * A short silent clip on a loop, like a living photo. It only plays while on
 * screen, and people who ask for less motion see the still frame instead.
 */
export default function LoopVideo({ name, label, className = '', style, eager = false }: LoopVideoProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    // Phones only autoplay silent video, and some check the muted attribute
    // itself, which React doesn't write; set both before anything plays.
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    if (eager) v.play().catch(() => {});
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce, eager]);

  return (
    <video
      ref={ref}
      src={reduce ? undefined : `/video/${name}.mp4`}
      poster={`/video/${name}.jpg`}
      aria-label={label}
      role="img"
      muted
      loop
      playsInline
      autoPlay={eager && !reduce}
      preload={eager ? 'auto' : 'none'}
      className={className}
      style={style}
    />
  );
}
