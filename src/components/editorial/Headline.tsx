import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { Fragment, type ElementType } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

type Token = { text: string; serif?: boolean; mark?: boolean };

// "Your money, *home* and ==abroad==." → sans, serif italic, highlighted.
function tokens(line: string): Token[] {
  const out: Token[] = [];
  const re = /\*([^*]+)\*|==([^=]+)==/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ text: line.slice(last, m.index) });
    out.push(m[1] ? { text: m[1], serif: true } : { text: m[2] ?? '', mark: true });
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

type HeadlineProps = {
  /** Lines separated by \n; *serif italic*, ==highlighted==. */
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
};

/** Large editorial headline: each line rises into view, with serif and highlighted words. */
export default function Headline({ text, as: Tag = 'h2', className = '', delay = 0 }: HeadlineProps) {
  const reduce = useReducedMotion();
  const lines = text.split('\n');
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        // The line's own box (not the clipped text) decides when it's in view.
        <motion.span
          key={i}
          className="block overflow-hidden pb-[0.08em]"
          initial={reduce ? false : 'hidden'}
          whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        >
          <motion.span
            className="block"
            variants={{ hidden: { y: '105%' }, shown: { y: '0%' } }}
            transition={{ duration: 0.9, ease, delay: delay + i * 0.09 }}
          >
            {tokens(line).map((t, j) => (
              <Fragment key={j}>
                {t.serif ? (
                  // The script's lead-in strokes reach back over the space before
                  // it, so it gets a little room there (and a touch after).
                  <em className="font-serif ml-[0.15em] mr-[0.02em] font-normal italic">{t.text}</em>
                ) : t.mark ? (
                  <span className="mark">{t.text}</span>
                ) : (
                  t.text
                )}
              </Fragment>
            ))}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  );
}
