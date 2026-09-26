import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

type FigureProps = {
  src: string;
  alt: string;
  /** The photo's own size, so it's shown whole and never cropped. */
  width: number;
  height: number;
  caption?: string;
  credit?: string;
  className?: string;
  priority?: boolean;
};

/** A photo shown whole, like a print on the page, with a caption and the photographer's credit. */
export default function Figure({ src, alt, width, height, caption, className = '', priority }: FigureProps) {
  const reduce = useReducedMotion();
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[1.25rem] bg-mist">
        <motion.img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          className="block h-auto w-full"
          initial={reduce ? false : { scale: 1.06, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-5% 0px' }}
          transition={{ duration: 1.3, ease }}
        />
      </div>
      {/* Photographers are credited in lib/photos.ts, not on the page. */}
      {caption ? <figcaption className="mt-3 text-[12px] leading-snug text-ink/50">{caption}</figcaption> : null}
    </figure>
  );
}
