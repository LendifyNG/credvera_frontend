import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Gentle deceleration for panels arriving; smooth ease-in-out for them leaving. No overshoot.
const easeArrive = [0.22, 1, 0.36, 1] as const;
const easeLeave = [0.65, 0, 0.35, 1] as const;

// Timeline, in seconds.
const STAGGER = 0.15; // between panels
const MOVE = 0.75; // each panel's rise in / rise out
const HOLD = 0.75; // per panel; leaves ~0.3s with the whole screen filled
const PANEL_TOTAL = MOVE + HOLD + MOVE;
const STATEMENT_AT = 1.85; // as the first panels start to leave
const STATEMENT_HOLD = 0.5; // alone on screen after the last panel leaves
const FADE_OUT = 0.5;

// Each account's four panels, in its own colours, and the line left on screen after them.
const looks = {
  personal: {
    bg: '#011504',
    statement: 'Your money, home and abroad.',
    panels: [
      { word: 'Get paid', bg: '#7fde80', fg: '#011504' },
      { word: 'Pay bills', bg: '#063c1a', fg: '#7fde80' },
      { word: 'Save', bg: '#f5f7f2', fg: '#063c1a' },
      { word: 'Prove it', bg: '#011504', fg: '#7fde80' },
    ],
  },
  business: {
    bg: '#141c17',
    statement: 'Business money, in plain words.',
    panels: [
      { word: 'Collect', bg: '#141c17', fg: '#f0f2ef' },
      { word: 'Pay out', bg: '#f0f2ef', fg: '#141c17' },
      { word: 'Convert', bg: '#e4e8e2', fg: '#141c17' },
      { word: 'Trade', bg: '#26302a', fg: '#7fde80' },
    ],
  },
};

type IntroOverlayProps = {
  /** Called when the overlay starts fading, so the page can begin its entrance. */
  onReveal: () => void;
  /** Called once the overlay has fully faded and can be removed. */
  onFinish: () => void;
};

export default function IntroOverlay({ onReveal, onFinish }: IntroOverlayProps) {
  const { pathname } = useLocation();
  const look = pathname.startsWith('/business') ? looks.business : looks.personal;
  const [panelsDone, setPanelsDone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Hand over only after the last panel has actually left (animation-driven, so a backgrounded
  // tab pauses the whole sequence together), then a brief hold on the statement.
  useEffect(() => {
    if (!panelsDone || leaving) return;
    const t = setTimeout(() => {
      setLeaving(true);
      onReveal();
    }, STATEMENT_HOLD * 1000);
    return () => clearTimeout(t);
  }, [panelsDone, leaving, onReveal]);

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ backgroundColor: look.bg }}
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE_OUT, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (leaving) onFinish();
      }}
    >
      {/* The account's line, uncovered as the panels leave. */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <motion.p
          className="max-w-3xl text-center text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STATEMENT_AT, duration: 0.7, ease: easeArrive }}
        >
          {look.statement}
        </motion.p>
      </div>

      <div className="absolute inset-0 grid grid-cols-4">
        {look.panels.map((panel, i) => (
          <motion.div
            key={panel.word}
            className="relative h-full"
            style={{ backgroundColor: panel.bg }}
            initial={{ y: '100%' }}
            animate={{ y: ['100%', '0%', '0%', '-100%'] }}
            transition={{
              duration: PANEL_TOTAL,
              times: [0, MOVE / PANEL_TOTAL, (MOVE + HOLD) / PANEL_TOTAL, 1],
              ease: [easeArrive, 'linear', easeLeave],
              delay: i * STAGGER,
            }}
            onAnimationComplete={i === look.panels.length - 1 ? () => setPanelsDone(true) : undefined}
          >
            {/* Vertical text reading bottom-to-top, anchored near the lower-left edge. */}
            <span
              className="absolute bottom-[5vh] left-[12%] select-none whitespace-nowrap font-extrabold uppercase leading-none tracking-tight"
              style={{
                color: panel.fg,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: 'min(10.5vw, 11vh)',
              }}
            >
              {panel.word}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
