import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { useRef, type ReactNode } from 'react';

// Billers the app supports today, with what you pay each one.
const billers: [string, string][] = [
  ['MTN', 'Airtime · data'],
  ['Airtel', 'Airtime · data'],
  ['Glo', 'Airtime · data'],
  ['9mobile', 'Airtime · data'],
  ['Ikeja Electric', 'Prepaid · postpaid'],
  ['Eko Electric', 'Prepaid · postpaid'],
  ['Abuja Electric', 'Prepaid · postpaid'],
  ['DStv', 'Renew · upgrade'],
  ['GOtv', 'Renew · upgrade'],
  ['StarTimes', 'Renew'],
  ['Remita', 'Government · school fees'],
];

const things = ['airtime', 'data', 'electricity', 'TV', 'school fees', 'government bills', 'any Nigerian bank', 'online, in dollars'];

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * One row that drifts on its own and speeds up with your scroll, reversing
 * when you scroll back up. The content is repeated so the loop never shows.
 */
function Row({ children, speed }: { children: ReactNode; speed: number }) {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);
  const paused = useRef(false);

  useAnimationFrame((_, delta) => {
    if (reduce || paused.current) return;
    const b = boost.get();
    if (b < 0) dir.current = -1;
    else if (b > 0) dir.current = 1;
    base.set(base.get() + dir.current * speed * (delta / 1000) * (1 + Math.abs(b)));
  });

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <motion.div className="flex w-max" style={{ x }}>
        {children}
        <div aria-hidden className="flex">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/** Who you can pay, on a moving rail between the opening and the story. */
export default function BillerRail() {
  return (
    <section className="relative overflow-hidden bg-secondary py-14 text-white lg:py-20" aria-label="Billers you can pay in the app">
      <div className="mx-auto mb-10 flex max-w-7xl items-baseline justify-between gap-6 px-6 lg:px-8">
        <p className="text-[13px] font-semibold text-primary">Pay in the app</p>
        <p className="text-sm text-white/45">
          <span className="font-semibold tabular-nums text-white">{billers.length}</span> billers, one app
        </p>
      </div>

      {/* Billers, big */}
      <Row speed={-2.2}>
        <ul className="flex shrink-0 items-center pb-8 pt-2">
          {billers.map(([name, note]) => (
            <li key={name} className="group flex shrink-0 items-center">
              <span className="relative px-6 text-[clamp(2.6rem,7vw,6.2rem)] font-semibold leading-none tracking-[-0.04em] text-white/90 transition-colors duration-300 group-hover:text-primary lg:px-10">
                {name}
                <span className="absolute -bottom-6 left-6 whitespace-nowrap text-[13px] font-semibold text-white/35 transition-colors duration-300 group-hover:text-primary/80 lg:left-10">
                  {note}
                </span>
              </span>
              <span aria-hidden className="font-serif text-[clamp(2rem,5vw,4.4rem)] italic text-primary/60">
                ✦
              </span>
            </li>
          ))}
        </ul>
      </Row>

      {/* What you pay, the other way */}
      <div className="mt-14 border-t border-white/10 pt-8 lg:mt-16">
        <Row speed={1.6}>
          <ul className="flex shrink-0 items-center">
            {things.map((t) => (
              <li key={t} className="flex shrink-0 items-center gap-8 px-8 font-serif text-[clamp(1.6rem,3.2vw,2.8rem)] italic text-white/55">
                {t}
                <span aria-hidden className="size-1.5 rounded-full bg-primary/70" />
              </li>
            ))}
          </ul>
        </Row>
      </div>
    </section>
  );
}
