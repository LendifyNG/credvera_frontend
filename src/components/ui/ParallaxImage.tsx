import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

type ParallaxImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Maximum drift in pixels, up or down. */
  strength?: number;
  priority?: boolean;
};

/**
 * Photo that drifts slightly slower than the page as you scroll past it.
 * The image is made exactly `strength` px taller on each side instead of being
 * scaled up, so it never shows an edge and stays as sharp as possible.
 */
export default function ParallaxImage({ src, alt, className = '', strength = 30, priority = false }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-mist ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={reduce ? undefined : { y, top: -strength, height: `calc(100% + ${strength * 2}px)` }}
        className="absolute left-0 top-0 h-full w-full object-cover"
      />
    </div>
  );
}
