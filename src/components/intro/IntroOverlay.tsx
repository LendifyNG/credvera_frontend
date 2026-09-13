import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { heroImage } from '../../lib/hero';
import { pillars } from '../../lib/site';

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
const IMAGE_WAIT_CAP = 4.7; // from mount: never hold the intro longer than this for the hero image
const FADE_OUT = 0.5;

type IntroOverlayProps = {
  /** Called when the overlay starts fading, so the hero can begin its entrance. */
  onReveal: () => void;
  /** Called once the overlay has fully faded and can be removed. */
  onFinish: () => void;
};

export default function IntroOverlay({ onReveal, onFinish }: IntroOverlayProps) {
  const [panelsDone, setPanelsDone] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Decode the hero image while the intro plays, capped so a slow network never stalls it.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    // Same candidates as the hero <img>, so the browser decodes the file it will actually show.
    img.sizes = heroImage.sizes;
    img.srcset = heroImage.srcSet;
    img.src = heroImage.src;
    const cap = setTimeout(() => !cancelled && setImageReady(true), IMAGE_WAIT_CAP * 1000);
    img
      .decode()
      .catch(() => undefined)
      .then(() => !cancelled && setImageReady(true));
    return () => {
      cancelled = true;
      clearTimeout(cap);
    };
  }, []);

  // Hand over only after the last panel has actually left (animation-driven, so a backgrounded
  // tab pauses the whole sequence together), then a brief hold on the brand statement.
  useEffect(() => {
    if (!panelsDone || !imageReady || leaving) return;
    const t = setTimeout(() => {
      setLeaving(true);
      onReveal();
    }, STATEMENT_HOLD * 1000);
    return () => clearTimeout(t);
  }, [panelsDone, imageReady, leaving, onReveal]);

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[100] overflow-hidden bg-secondary"
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE_OUT, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (leaving) onFinish();
      }}
    >
      {/* Brand statement on the near-black screen, uncovered as the panels leave. */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <motion.p
          className="max-w-3xl text-center text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STATEMENT_AT, duration: 0.7, ease: easeArrive }}
        >
          Payments, built for Nigerian business.
        </motion.p>
      </div>

      <div className="absolute inset-0 grid grid-cols-4">
        {pillars.map((pillar, i) => (
          <motion.div
            key={pillar.word}
            className="relative h-full"
            style={{ backgroundColor: pillar.bg }}
            initial={{ y: '100%' }}
            animate={{ y: ['100%', '0%', '0%', '-100%'] }}
            transition={{
              duration: PANEL_TOTAL,
              times: [0, MOVE / PANEL_TOTAL, (MOVE + HOLD) / PANEL_TOTAL, 1],
              ease: [easeArrive, 'linear', easeLeave],
              delay: i * STAGGER,
            }}
            onAnimationComplete={i === pillars.length - 1 ? () => setPanelsDone(true) : undefined}
          >
            {/* Vertical text reading bottom-to-top, anchored near the lower-left edge. */}
            <span
              className="absolute bottom-[5vh] left-[12%] select-none whitespace-nowrap font-extrabold uppercase leading-none tracking-tight"
              style={{
                color: pillar.fg,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: 'min(10.5vw, 11vh)',
              }}
            >
              {pillar.word}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
