import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronUp, CloudRain, MonitorPlay, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, isApiError } from '../../api/errors';
import { celebrationsApi, type Wad } from '../../lib/celebrations';
import { naira } from '../pay/PayFlow';
import { fwip, primeSound, tap } from './feel';
import SprayNote, { NOTE_STYLE } from './SprayNote';

type Flying = { id: number; x: number; y: number; drift: number; spin: number };

/** Notes flicked but not yet sent go to the server together, a few times a second. */
const SEND_EVERY = 500;
const RAIN_EVERY = 115;

/**
 * Spray mode: the guest's wad at the bottom of the screen. Swipe a note up
 * (or tap it) and it flies off; hold "Make it rain" to throw them in a
 * stream. Each note lands on the celebration's live screen. The money is
 * already theirs to give: a flick only moves it from the wad to the screen.
 */
export default function SprayStage({
  slug,
  title,
  mark,
  reference,
  sprayKey,
  wad: start,
  onClose,
  onMore,
}: {
  slug: string;
  title: string;
  mark: string;
  reference: string;
  sprayKey: string;
  wad: Wad;
  onClose: () => void;
  onMore: () => void;
}) {
  const [wad, setWad] = useState(start);
  const [unsent, setUnsent] = useState(0);
  const [flying, setFlying] = useState<Flying[]>([]);
  const [raining, setRaining] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [flicks, setFlicks] = useState(0);
  const queued = useRef(0);
  const sending = useRef(0);
  const stopped = useRef(false);
  const seq = useRef(0);

  const left = Math.max(0, wad.left - unsent);
  const sprayedNow = (wad.notes - left) * wad.note;
  const done = left === 0 && unsent === 0;
  const style = NOTE_STYLE[wad.note];

  // Sending: whatever's been flicked since the last send, at most 50 a time.
  const flush = useCallback(async () => {
    if (sending.current || !queued.current || stopped.current) return;
    const n = Math.min(50, queued.current);
    queued.current -= n;
    sending.current = n;
    try {
      const w = await celebrationsApi.spray(reference, sprayKey, n);
      setWad({ note: w.note, notes: w.notes, sprayed: w.sprayed, left: w.left });
      setUnsent(queued.current);
      setProblem(null);
    } catch (err) {
      const status = isApiError(err) ? err.status : 0;
      if (status >= 400 && status < 500 && status !== 429) {
        // Not this phone's money, or nothing left: stop and say so.
        stopped.current = true;
        queued.current = 0;
        setUnsent(0);
        setProblem(errorMessage(err));
      } else {
        // The network dropped: keep the notes and send them on the next tick.
        queued.current += n;
        setProblem('Reconnecting… your notes are safe.');
      }
    } finally {
      sending.current = 0;
    }
  }, [reference, sprayKey]);

  useEffect(() => {
    const t = window.setInterval(flush, SEND_EVERY);
    return () => clearInterval(t);
  }, [flush]);

  // Send anything still unsent when the guest leaves this screen.
  useEffect(() => () => void flush(), [flush]);

  // Spray mode takes the whole screen: the page underneath doesn't scroll.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const flick = useCallback(
    (from: { x: number; y: number; vx: number } = { x: 0, y: 0, vx: 0 }) => {
      if (stopped.current) return false;
      if (wad.left - queued.current - sending.current <= 0) return false;
      queued.current += 1;
      setUnsent((u) => u + 1);
      setFlicks((f) => f + 1);
      const id = ++seq.current;
      setFlying((f) => [...f.slice(-24), { id, x: from.x, y: from.y, drift: from.vx * 220 + (Math.random() - 0.5) * 160, spin: (Math.random() - 0.5) * 70 }]);
      fwip(0.7 + Math.random() * 0.4);
      tap(10);
      return true;
    },
    [wad.left],
  );

  // Make it rain: a stream of notes while the button is held.
  useEffect(() => {
    if (!raining) return;
    const t = window.setInterval(() => {
      if (!flick({ x: (Math.random() - 0.5) * 60, y: 0, vx: (Math.random() - 0.5) * 1.6 })) setRaining(false);
    }, RAIN_EVERY);
    return () => clearInterval(t);
  }, [raining, flick]);

  // The top note follows the finger; let go moving up and it flies.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-160, 160], [-14, 14]);
  const lift = useTransform(y, [-160, 0], [1.06, 1]);
  const grab = useRef<{ x: number; y: number; t: number; lastY: number; lastT: number } | null>(null);

  const down = (e: ReactPointerEvent) => {
    primeSound();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    grab.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, lastY: e.clientY, lastT: e.timeStamp };
  };
  const move = (e: ReactPointerEvent) => {
    const g = grab.current;
    if (!g) return;
    x.set(e.clientX - g.x);
    y.set(Math.min(40, e.clientY - g.y));
    g.lastY = e.clientY;
    g.lastT = e.timeStamp;
  };
  const up = (e: ReactPointerEvent) => {
    const g = grab.current;
    grab.current = null;
    if (!g) return;
    const dy = e.clientY - g.y;
    const dx = e.clientX - g.x;
    const dt = Math.max(1, e.timeStamp - g.t);
    const speed = dy / dt; // px per ms, negative is up
    const tapped = Math.abs(dy) < 8 && Math.abs(dx) < 8 && dt < 300;
    if (dy < -50 || speed < -0.45 || tapped) {
      flick({ x: dx, y: dy, vx: dx / dt });
      x.set(0);
      y.set(0);
    } else {
      void animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      void animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  const layers = Math.max(0, Math.min(7, Math.ceil((left / Math.max(1, wad.notes)) * 7)) - 1);

  return (
    <motion.div
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-background text-white"
      style={{ touchAction: 'none' }}
    >
      {/* Light from the wad */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-20vh] mx-auto h-[70vh] w-[140vw] max-w-[900px] rounded-full opacity-40 blur-[90px]" style={{ background: style.bg === '#15171a' ? '#dcf17e' : style.bg }} />

      <header className="relative flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} aria-label="Close spray mode" className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
          <X className="size-5" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white/10 py-2 pl-3 pr-4 text-[13px] font-semibold">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff5a4e] opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-[#ff5a4e]" />
          </span>
          Live at {title}
        </div>
        <Link to={`/c/${slug}/live`} target="_blank" aria-label="Open the big screen" className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
          <MonitorPlay className="size-5" />
        </Link>
      </header>

      <div className="relative mt-[6vh] px-6 text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-white/45">{done ? 'All sprayed' : 'Left to spray'}</p>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={done ? 'done' : left}
            initial={{ y: 22, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="mt-2 font-ledger text-[clamp(3rem,15vw,5.5rem)] font-semibold leading-none tracking-[-0.05em]"
          >
            {naira(done ? wad.notes * wad.note : left * wad.note)}
          </motion.p>
        </AnimatePresence>
        <div className="mx-auto mt-5 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(sprayedNow / Math.max(1, wad.notes * wad.note)) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} />
        </div>
        <p className="mt-3 text-[14px] text-white/55">
          {done ? `Every note is on the screen at ${title}.` : `${left.toLocaleString('en-NG')} of ${wad.notes.toLocaleString('en-NG')} notes · ${naira(sprayedNow)} sprayed`}
        </p>
        {problem && <p className="mt-3 text-[13.5px] font-medium text-[#ffb4a8]">{problem}</p>}
      </div>

      <div className="relative mt-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {done ? (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto flex max-w-sm flex-col gap-3 px-6 pb-6">
            <button type="button" onClick={onMore} className="h-14 rounded-full bg-primary text-[16px] font-semibold text-ink transition-transform active:scale-[0.98]">
              Get more spray money
            </button>
            <Link to={`/c/${slug}/live`} target="_blank" className="grid h-14 place-items-center rounded-full bg-white/10 text-[16px] font-semibold">
              Watch the big screen
            </Link>
          </motion.div>
        ) : (
          <>
            {flicks === 0 && (
              <motion.div className="mb-3 flex flex-col items-center text-[14px] font-semibold text-white/70" animate={{ y: [0, -8, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
                <ChevronUp className="size-5" />
                <ChevronUp className="-mt-3 size-5 opacity-50" />
                Swipe up to spray
              </motion.div>
            )}
            {/* The wad */}
            <div className="relative mx-auto h-[min(36vw,160px)] w-[min(74vw,330px)]">
              {Array.from({ length: layers }, (_, i) => (
                <div key={i} className="absolute inset-x-0 bottom-0" style={{ transform: `translateY(${(layers - i) * 4}px) rotate(${(i % 2 ? 1 : -1) * (1.2 + (i % 3) * 0.8)}deg)` }}>
                  <SprayNote value={wad.note} mark={mark} className="w-full" shadow={false} />
                </div>
              ))}
              {/* Notes in flight leave from the top of the wad */}
              <AnimatePresence>
                {flying.map((f) => (
                  <motion.div
                    key={f.id}
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
                    initial={{ x: f.x, y: f.y, rotate: 0, scale: 1, opacity: 1 }}
                    animate={{ x: f.x + f.drift, y: -window.innerHeight * 0.95, rotate: f.spin, scale: 0.72, opacity: [1, 1, 0] }}
                    transition={{ duration: 0.75, ease: [0.2, 0.7, 0.3, 1] }}
                    onAnimationComplete={() => setFlying((all) => all.filter((n) => n.id !== f.id))}
                  >
                    <SprayNote value={wad.note} mark={mark} className="w-full" />
                  </motion.div>
                ))}
              </AnimatePresence>
              {left > 0 && (
                <motion.button
                  type="button"
                  aria-label={`Spray a ${naira(wad.note)} note`}
                  onPointerDown={down}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerCancel={up}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      primeSound();
                      flick();
                    }
                  }}
                  style={{ x, y, rotate, scale: lift, touchAction: 'none' }}
                  className="absolute inset-x-0 bottom-0 z-10 cursor-grab active:cursor-grabbing"
                >
                  <SprayNote value={wad.note} mark={mark} className="pointer-events-none w-full" />
                </motion.button>
              )}
            </div>
            <div className="mx-auto mt-7 max-w-sm px-6">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  primeSound();
                  setRaining(true);
                }}
                onPointerUp={() => setRaining(false)}
                onPointerLeave={() => setRaining(false)}
                onPointerCancel={() => setRaining(false)}
                onContextMenu={(e) => e.preventDefault()}
                className={`flex h-14 w-full select-none items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition-all ${raining ? 'scale-[0.98] bg-white text-ink' : 'bg-primary text-ink'}`}
              >
                <CloudRain className="size-5" />
                {raining ? 'Raining…' : 'Hold to make it rain'}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
