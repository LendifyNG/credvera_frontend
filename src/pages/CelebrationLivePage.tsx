import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { Crown, Expand, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import QrCode from '../components/spray/QrCode';
import SprayNote from '../components/spray/SprayNote';
import { naira } from '../components/pay/PayFlow';
import { celebrationsApi, KIND_LINE, monogram, type LiveState, type SprayEvent, type SprayNoteValue } from '../lib/celebrations';

const POLL = 1500;
/** A spray this big takes over the screen for a moment. */
const BIG = 20_000;
const MAX_FALLING = 90;
const MAX_PILE = 130;

type Falling = { id: number; note: SprayNoteValue; x: number; land: number; delay: number; fall: number; spin: number; sway: number; size: number };
type Landed = { id: number; note: SprayNoteValue; x: number; bottom: number; rot: number; size: number };
type Toast = SprayEvent & { id: number };

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

/** The running total, rolling up to each new figure. */
function Total({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 60, damping: 20, mass: 1 });
  const text = useTransform(spring, (v) => naira(Math.round(v)));
  useEffect(() => spring.set(value), [spring, value]);
  return <motion.span>{text}</motion.span>;
}

/**
 * credvera.co/c/:slug/live — the big screen at the party. Put it on a
 * projector or TV: every note a guest flicks from their phone rains down
 * here and lands on a growing pile, with their name, the running total and
 * the top sprayers. The QR in the corner opens the page to spray from.
 */
export default function CelebrationLivePage() {
  const { slug = '' } = useParams();
  const [live, setLive] = useState<LiveState | null | undefined>(undefined);
  const [falling, setFalling] = useState<Falling[]>([]);
  const [pile, setPile] = useState<Landed[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [spotlight, setSpotlight] = useState<SprayEvent | null>(null);
  const [chrome, setChrome] = useState(true);
  const ids = useRef(0);
  const mark = live ? monogram(live.title) : '';
  const link = `${typeof window === 'undefined' ? 'https://credvera.co' : window.location.origin}/c/${slug}`;
  const shortLink = link.replace(/^https?:\/\//, '');

  const pileLevel = (count: number) => Math.min(17, 1.5 + count / 9);

  // Notes for one spray: some rain, then settle on the pile.
  const rain = (e: SprayEvent, burst = 1) => {
    const h = window.innerHeight;
    const count = Math.min(Math.max(1, e.notes) * burst, 26 * burst);
    setFalling((now) => {
      const room = Math.max(0, MAX_FALLING - now.length);
      const add: Falling[] = Array.from({ length: Math.min(count, room) }, (_, i) => ({
        id: ++ids.current,
        note: e.note,
        x: 4 + Math.random() * 88,
        land: h * (0.82 + Math.random() * 0.12),
        delay: (i / Math.max(1, count)) * 1.1 + Math.random() * 0.25,
        fall: 2.6 + Math.random() * 1.8,
        spin: (Math.random() - 0.5) * 540,
        sway: 30 + Math.random() * 60,
        size: 7 + Math.random() * 4,
      }));
      return [...now, ...add];
    });
  };

  const land = (f: Falling) => {
    setFalling((all) => all.filter((n) => n.id !== f.id));
    setPile((p) => [...p.slice(-(MAX_PILE - 1)), { id: f.id, note: f.note, x: f.x, bottom: Math.random() * pileLevel(p.length), rot: (Math.random() - 0.5) * 70, size: f.size }]);
  };

  // Asking for new sprays every second and a half.
  useEffect(() => {
    let after = 0;
    let first = true;
    let stopped = false;
    let timer = 0;
    const tick = async () => {
      try {
        const s = await celebrationsApi.live(slug, after);
        if (stopped) return;
        setLive(s);
        if (first) {
          // Opening the screen mid-party: the pile is already there.
          const seeded = s.events.flatMap((e) => Array.from({ length: Math.min(3, e.notes) }, () => e.note));
          setPile(seeded.slice(-MAX_PILE).map((note, i) => ({ id: ++ids.current, note, x: 3 + Math.random() * 90, bottom: Math.random() * pileLevel(i), rot: (Math.random() - 0.5) * 70, size: 7 + Math.random() * 4 })));
        } else {
          s.events.forEach((e, i) => {
            window.setTimeout(() => {
              rain(e, e.amount >= BIG ? 2 : 1);
              const t = { ...e, id: ++ids.current };
              setToasts((all) => [...all.slice(-3), t]);
              window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== t.id)), 6500);
              if (e.amount >= BIG) {
                setSpotlight(e);
                window.setTimeout(() => setSpotlight((cur) => (cur?.seq === e.seq ? null : cur)), 3400);
              }
            }, i * (POLL / Math.max(1, s.events.length)));
          });
        }
        after = s.last;
        first = false;
      } catch (err) {
        if (first && (err as { status?: number }).status === 404) {
          setLive(null);
          return;
        }
      }
      if (!stopped) timer = window.setTimeout(tick, POLL);
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // A projector shouldn't go to sleep mid-party.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const ask = () =>
      (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock
        ?.request('screen')
        .then((l) => (lock = l))
        .catch(() => {});
    void ask();
    const again = () => document.visibilityState === 'visible' && ask();
    document.addEventListener('visibilitychange', again);
    return () => {
      document.removeEventListener('visibilitychange', again);
      void lock?.release().catch(() => {});
    };
  }, []);

  // The full-screen button shows while the mouse moves, then gets out of the way.
  useEffect(() => {
    let t = window.setTimeout(() => setChrome(false), 4000);
    const show = () => {
      setChrome(true);
      clearTimeout(t);
      t = window.setTimeout(() => setChrome(false), 3000);
    };
    window.addEventListener('mousemove', show);
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', show);
    };
  }, []);

  if (live === undefined) {
    return (
      <div className="grid h-[100svh] place-items-center bg-background">
        <Loader2 className="size-7 animate-spin text-white/40" />
      </div>
    );
  }
  if (!live) {
    return (
      <div className="grid h-[100svh] place-items-center bg-background px-8 text-center text-white">
        <p className="text-3xl font-semibold tracking-[-0.03em]">We can’t find this celebration.</p>
      </div>
    );
  }

  const parts = live.title.split('&');
  const waiting = !live.sprayOn && !live.closed;

  return (
    <div className="relative h-[100svh] w-full select-none overflow-hidden bg-background text-white" style={{ cursor: chrome ? 'default' : 'none' }}>
      {/* Slow light across the room */}
      <motion.div
        className="pointer-events-none absolute -left-[20vw] -top-[30vh] size-[80vw] rounded-full bg-primary/[0.13] blur-[120px]"
        animate={{ x: ['0vw', '30vw', '0vw'], y: ['0vh', '12vh', '0vh'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-[40vh] -right-[20vw] size-[70vw] rounded-full bg-[#cdbdff]/[0.12] blur-[120px]"
        animate={{ x: ['0vw', '-25vw', '0vw'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* The pile */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30vh]">
        {pile.map((n) => (
          <div key={n.id} className="absolute" style={{ left: `${n.x}%`, bottom: `${n.bottom - 2}vh`, width: `${n.size}vw`, transform: `rotate(${n.rot}deg)` }}>
            <SprayNote value={n.note} mark={mark} className="w-full" shadow={false} />
          </div>
        ))}
      </div>

      {/* Title and total */}
      <div className="relative z-10 flex h-full flex-col px-[5vw] pt-[5vh]">
        <p className="text-[clamp(0.8rem,1.1vw,1.2rem)] font-semibold uppercase tracking-[0.3em] text-white/50">{KIND_LINE[live.kind]}</p>
        <h1 className="mt-[1vh] text-[clamp(2.4rem,5.2vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {parts.map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="font-serif font-normal text-primary"> & </span>}
              {p.trim()}
            </span>
          ))}
        </h1>

        <div className="mt-[7vh] max-w-[62vw]">
          {waiting ? (
            <>
              <p className="text-[clamp(1rem,1.6vw,1.8rem)] font-medium text-white/55">Spraying opens on</p>
              <p className="mt-2 text-[clamp(2.4rem,6vw,7rem)] font-semibold leading-none tracking-[-0.05em]">{longDate(live.date)}</p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-3 text-[clamp(1rem,1.5vw,1.7rem)] font-medium text-white/55">
                {!live.closed && (
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff5a4e] opacity-70" />
                    <span className="relative inline-flex size-3 rounded-full bg-[#ff5a4e]" />
                  </span>
                )}
                {live.closed ? 'Sprayed in all' : 'Sprayed so far'}
              </p>
              <p className="mt-[1.5vh] font-ledger text-[clamp(3.6rem,11vw,13rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-primary">
                <Total value={live.total} />
              </p>
              <p className="mt-[2vh] text-[clamp(1rem,1.5vw,1.7rem)] text-white/55">
                {live.sprayers === 0 ? 'Scan the code to be the first to spray.' : `${live.sprayers.toLocaleString('en-NG')} ${live.sprayers === 1 ? 'guest has' : 'guests have'} sprayed`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Top sprayers */}
      {live.top.length > 0 && (
        <div className="absolute right-[4vw] top-[5vh] z-10 w-[24vw] min-w-[240px]">
          <p className="text-[clamp(0.8rem,1vw,1.1rem)] font-semibold uppercase tracking-[0.26em] text-white/45">Top sprayers</p>
          <ol className="mt-[2vh] space-y-[1.2vh]">
            <AnimatePresence initial={false}>
              {live.top.map((t, i) => (
                <motion.li
                  key={t.name}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur ${i === 0 ? 'bg-primary text-ink' : 'bg-white/[0.07]'}`}
                >
                  <span className={`grid size-[2.2vw] min-h-8 min-w-8 shrink-0 place-items-center rounded-full text-[clamp(0.85rem,1vw,1.1rem)] font-bold ${i === 0 ? 'bg-ink text-primary' : 'bg-white/10'}`}>
                    {i === 0 ? <Crown className="size-[55%]" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[clamp(1rem,1.35vw,1.5rem)] font-semibold">{t.name}</span>
                  <span className={`font-ledger text-[clamp(0.95rem,1.25vw,1.4rem)] font-semibold ${i === 0 ? '' : 'text-white/70'}`}>{naira(t.amount)}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </div>
      )}

      {/* Who just sprayed */}
      <div className="absolute bottom-[5vh] left-[5vw] z-20 flex w-[34vw] min-w-[260px] flex-col gap-[1.2vh]">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: -40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="flex items-center gap-4 rounded-[20px] bg-white/[0.09] p-3 pr-5 backdrop-blur-xl"
            >
              <div className="w-[5.5vw] min-w-16 shrink-0 -rotate-6">
                <SprayNote value={t.note} mark={mark} className="w-full" />
              </div>
              <p className="min-w-0 text-[clamp(1rem,1.4vw,1.6rem)] leading-tight">
                <span className="block truncate font-semibold">{t.name}</span>
                <span className="text-white/60">sprayed {naira(t.amount)}</span>
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scan to spray */}
      {!live.closed && (
        <div className={`absolute z-20 flex items-center gap-4 rounded-[24px] bg-white p-3 pr-6 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ${waiting ? 'bottom-1/2 right-[5vw] translate-y-1/2 flex-col p-5 pr-5' : 'bottom-[5vh] right-[4vw]'}`}>
          <QrCode value={link} className={waiting ? 'size-[min(26vw,40vh)]' : 'size-[min(9vw,15vh)] min-h-24 min-w-24'} />
          <div className={waiting ? 'text-center' : ''}>
            <p className="text-[clamp(1rem,1.4vw,1.6rem)] font-semibold tracking-[-0.02em]">{waiting ? 'Scan to send a gift' : 'Scan to spray'}</p>
            <p className="mt-0.5 text-[clamp(0.8rem,0.95vw,1.05rem)] text-ink/55">{shortLink}</p>
          </div>
        </div>
      )}

      {/* Notes in the air */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {falling.map((f) => (
          <motion.div
            key={f.id}
            className="absolute top-0"
            style={{ left: `${f.x}%`, width: `${f.size}vw` }}
            initial={{ y: -160, rotate: 0, x: 0 }}
            animate={{ y: f.land, rotate: f.spin, x: [0, f.sway, -f.sway * 0.7, f.sway * 0.4, 0] }}
            transition={{ duration: f.fall, delay: f.delay, ease: [0.35, 0.05, 0.55, 1], x: { duration: f.fall, delay: f.delay, ease: 'easeInOut' } }}
            onAnimationComplete={() => land(f)}
          >
            <SprayNote value={f.note} mark={mark} className="w-full" />
          </motion.div>
        ))}
      </div>

      {/* A big spray takes the screen */}
      <AnimatePresence>
        {spotlight && (
          <motion.div
            key={spotlight.seq}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-background/70 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }} className="px-[6vw] text-center">
              <p className="text-[clamp(1rem,1.8vw,2rem)] font-semibold uppercase tracking-[0.3em] text-primary">Big spray</p>
              <p className="mt-[2vh] text-[clamp(3rem,9vw,11rem)] font-semibold leading-[0.95] tracking-[-0.05em]">{spotlight.name}</p>
              <p className="mt-[2vh] font-ledger text-[clamp(2rem,5vw,6rem)] font-semibold tracking-[-0.04em] text-primary">{naira(spotlight.amount)}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full screen */}
      <AnimatePresence>
        {chrome && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})}
            className="absolute right-[4vw] top-[1.5vh] z-50 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/80 hover:bg-white/20"
          >
            <Expand className="size-4" /> Full screen
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
