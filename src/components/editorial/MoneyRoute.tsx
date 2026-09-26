import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import SplitFlap from './SplitFlap';

// One real-looking payment making its way home: $850 from a client in San
// Francisco, arriving in the customer's USD account in Lagos, then converted
// at our rate (today ₦1,535 to the dollar, the same as the market rate).
// TODO(credvera): use the live rate once the rates API is connected.
const RATE = 1535;
const USD = 850;

const steps = [
  { board: 'CLIENT PAYS · SFO', title: 'Your client pays', body: 'They send dollars to your own US account details, like any payment inside the US.' },
  { board: 'IN TRANSIT · USD 850.00', title: 'On its way', body: 'It travels to the account in your name, and the app tells you the moment it lands.' },
  { board: 'ARRIVED · YOUR USD ACCOUNT', title: 'It lands in your name', body: 'The dollars sit in your Credvera USD account. Keep them in dollars for as long as you like.' },
  { board: 'CONVERTED · NAIRA READY', title: 'You convert, when you choose', body: 'Our rate beside the market rate, held while you confirm. Then spend, send or save.' },
];

// Where in the scroll each step begins (0 to 1).
const STARTS = [0, 0.14, 0.6, 0.78];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * "The route of a dollar": the section pins to the screen and, as you scroll,
 * a payment travels from San Francisco to Lagos, arrives, and turns into naira.
 */
export default function MoneyRoute() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [p, setP] = useState(0);
  const [len, setLen] = useState(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', setP);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);

  const travel = clamp((p - 0.1) / 0.5); // reaches Lagos at 60%
  const step = STARTS.reduce((acc, s, i) => (p >= s ? i : acc), 0);
  const converted = step === 3;
  const point = pathRef.current?.getPointAtLength(travel * len) ?? { x: 110, y: 330 };
  const current = steps[step] ?? steps[0]!;

  return (
    <section ref={ref} className="relative h-[300vh] px-3 sm:px-6">
      {/* A contained panel within the page margins, pinned while the payment travels. */}
      <div className="sticky top-0 flex h-screen items-center pt-20">
      <div className="relative mx-auto flex h-[86vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-secondary text-white lg:h-[78vh]">
        {/* A fine grid of dots, like a chart at night */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{ backgroundImage: 'radial-gradient(rgba(127,222,128,0.5) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />

        <div className="relative flex w-full flex-1 flex-col px-6 pb-8 pt-8 sm:px-10 lg:px-14 lg:pt-10">
          {/* The arrivals board */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[13px] font-semibold text-primary">The route of a dollar</p>
              <div className="mt-4 text-[14px] sm:text-[20px] lg:text-[24px]">
                <SplitFlap text={current.board} length={26} />
              </div>
            </div>
            <p className="hidden font-mono text-xs leading-relaxed text-white/40 md:block">
              SFO 37.77°N 122.42°W
              <br />
              LOS 6.52°N 3.38°E
            </p>
          </div>

          {/* The route */}
          <div className="relative mt-6 flex-1">
            <svg viewBox="0 0 1000 420" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
              <path
                ref={pathRef}
                d="M 110 330 C 300 40, 700 30, 890 300"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />
              <path
                d="M 110 330 C 300 40, 700 30, 890 300"
                fill="none"
                stroke="#7fde80"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={len * (1 - travel)}
              />
              {/* Cities */}
              {[
                { x: 110, y: 330, name: 'San Francisco', code: 'SFO', lit: true },
                { x: 890, y: 300, name: 'Lagos', code: 'LOS', lit: travel >= 1 },
              ].map((c) => (
                <g key={c.code}>
                  <circle cx={c.x} cy={c.y} r={c.lit ? 16 : 10} fill={c.lit ? 'rgba(127,222,128,0.18)' : 'rgba(255,255,255,0.06)'} />
                  <circle cx={c.x} cy={c.y} r="5" fill={c.lit ? '#7fde80' : 'rgba(255,255,255,0.5)'} />
                  <text x={c.x} y={c.y + 42} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="18" fontWeight="600">
                    {c.name}
                  </text>
                  <text x={c.x} y={c.y + 64} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="13" letterSpacing="3">
                    {c.code}
                  </text>
                </g>
              ))}
              {/* The payment itself */}
              <g transform={`translate(${point.x} ${point.y})`}>
                <circle r="22" fill="rgba(127,222,128,0.25)">
                  <animate attributeName="r" values="14;26;14" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r="7" fill="#7fde80" />
                <g transform="translate(0 -46)">
                  {/* At Lagos the naira tag grows to the left, so it stays on screen. */}
                  <rect x={converted ? -196 : -62} y="-22" width={converted ? 236 : 124} height="40" rx="20" fill="#f5f7f2" />
                  <text x={converted ? -78 : 0} y="5" textAnchor="middle" fill="#011504" fontSize="18" fontWeight="700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {converted ? `₦${(USD * RATE).toLocaleString('en-NG')}.00` : `$${USD.toFixed(2)}`}
                  </text>
                </g>
              </g>
            </svg>
            <AnimatePresence>
              {converted && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-2 right-0 text-right text-sm text-white/55"
                >
                  $850.00 at ₦1,535.00 · market ₦1,535.00
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* The stops */}
          <div className="relative mt-4">
            <div className="absolute left-0 right-0 top-[7px] h-px bg-white/15" />
            <div className="absolute left-0 top-[7px] h-px bg-primary transition-[width] duration-150" style={{ width: `${p * 100}%` }} />
            <ol className="relative grid grid-cols-4 gap-4">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className={`block size-[15px] rounded-full border-2 transition-colors duration-300 ${i <= step ? 'border-primary bg-primary' : 'border-white/30 bg-secondary'}`} />
                  <p className={`mt-4 text-sm font-semibold transition-colors duration-300 sm:text-base ${i === step ? 'text-white' : 'text-white/40'}`}>{s.title}</p>
                  <AnimatePresence mode="wait">
                    {i === step && (
                      <motion.p
                        key={s.title}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mt-2 hidden max-w-[16rem] text-sm leading-relaxed text-white/60 md:block"
                      >
                        {s.body}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ol>
            {/* Phones: the current step's sentence under the stops */}
            <p className="mt-5 text-sm leading-relaxed text-white/65 md:hidden">{current.body}</p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
