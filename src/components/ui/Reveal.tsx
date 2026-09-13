import { motion, useReducedMotion } from 'framer-motion';
import { Fragment, type ReactNode } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/** Fades and lifts content into view once, the first time it scrolls on screen. */
export default function Reveal({ children, delay = 0, y = 28, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

type RevealTextProps = {
  /** Use "\n" to force a line break. */
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  /** When set, animate on this signal instead of when scrolled into view. */
  play?: boolean;
};

/** Headline reveal: each word slides up from behind a mask, staggered. */
export function RevealText({ text, className, delay = 0, as = 'h2', play }: RevealTextProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const lines = text.split('\n');
  const multiline = lines.length > 1;

  if (reduce) {
    const Plain = as;
    return (
      <Plain className={className}>
        {lines.map((line, i) => (
          <span key={i} className={multiline ? 'block' : undefined}>
            {line}
          </span>
        ))}
      </Plain>
    );
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      {...(play === undefined
        ? { whileInView: 'visible', viewport: { once: true, amount: 0.4 } }
        : { animate: play ? 'visible' : 'hidden' })}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
      aria-label={lines.join(' ')}
    >
      {lines.map((line, li) => {
        const words = line.split(' ');
        return (
          <span key={li} className={multiline ? 'block' : undefined}>
            {words.map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                <span
                  aria-hidden
                  className="-mb-[0.18em] -mt-[0.08em] inline-block overflow-hidden pb-[0.18em] pt-[0.08em] align-bottom"
                >
                  <motion.span
                    className="inline-block"
                    variants={{ hidden: { y: '130%' }, visible: { y: '0%' } }}
                    transition={{ duration: 0.9, ease }}
                  >
                    {word}
                  </motion.span>
                </span>
                {/* The space lives between the masks: a trailing space inside an inline-block collapses. */}
                {i < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
