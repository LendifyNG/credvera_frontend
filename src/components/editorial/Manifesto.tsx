import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { useRef } from 'react';

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}

/** A paragraph that reads itself: each word lights up as you scroll past. */
export default function Manifesto({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');

  return (
    <p ref={ref} className="text-[clamp(1.8rem,4vw,3.4rem)] font-semibold leading-[1.15] tracking-[-0.025em]">
      {reduce
        ? text
        : words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
    </p>
  );
}
