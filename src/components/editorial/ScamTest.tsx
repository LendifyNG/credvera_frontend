import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

type Attempt = {
  move: string;
  /** What happens, line by line: who says it, and what. */
  lines: [('them' | 'app' | 'you'), string][];
  verdict: string;
  why: string;
  blackout?: boolean;
};

// Each attack answered by something the app really does.
const attempts: Attempt[] = [
  {
    move: 'Call pretending to be Credvera',
    lines: [
      ['them', 'Hello, this is Credvera support. There’s a problem with your account.'],
      ['them', 'To fix it, please read me your PIN and the code we just sent.'],
      ['you', 'Credvera told me they never ask for that.'],
    ],
    verdict: 'Nothing to steal',
    why: 'We never ask for your PIN, password or codes, by phone, chat or email. Anyone who does isn’t us.',
  },
  {
    move: 'Steal the phone and open the app',
    lines: [
      ['them', 'Opens Credvera on the stolen phone'],
      ['app', 'Face ID or PIN needed to open'],
      ['them', 'Doesn’t know the PIN'],
      ['app', 'Nothing opens. Nothing is sent.'],
    ],
    verdict: 'Locked out',
    why: 'Opening the app and every payment need your PIN or Face ID, so a phone on its own gets them nowhere.',
  },
  {
    move: 'Swap the SIM, sign in on a new phone',
    lines: [
      ['them', 'Gets a new SIM for your number'],
      ['them', 'Signs in on their own phone'],
      ['app', 'New phone and SIM change noticed'],
      ['app', 'Payments capped at ₦20,000 a day for 72 hours'],
    ],
    verdict: 'Slowed right down',
    why: 'After a new phone or a SIM change, payments are capped for a while, and you’re told, so there’s time to stop it.',
  },
  {
    move: 'Screenshot the card details',
    lines: [
      ['them', 'Opens your dollar card'],
      ['app', 'PIN or Face ID needed to show details'],
      ['them', 'Takes a screenshot'],
    ],
    verdict: 'Nothing captured',
    why: 'Card details show only after your PIN, hide again on their own, alert you every time, and screenshots come out black.',
    blackout: true,
  },
  {
    move: 'Get you to pay the wrong account',
    lines: [
      ['them', 'Sends you “new account details” for your landlord'],
      ['you', 'Types in the number'],
      ['app', 'This account belongs to IBRAHIM MUSA BELLO'],
      ['you', 'That’s not my landlord.'],
    ],
    verdict: 'Caught before sending',
    why: 'The name on the account shows before every transfer, so a swapped number stands out.',
  },
];

const LINE_MS = 900;

/**
 * Security as a game: pick an attack and watch it play out against the app
 * until it's stopped. Runs through them on its own until someone picks one.
 */
export default function ScamTest() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const [which, setWhich] = useState(0);
  const [shown, setShown] = useState(0); // lines showing
  const [touched, setTouched] = useState(false);
  const a = attempts[which]!;
  const done = shown > a.lines.length;

  // Play the lines, then the verdict; move on by itself until someone picks.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setShown(a.lines.length + 1);
      return;
    }
    if (!done) {
      const t = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 400 : LINE_MS);
      return () => clearTimeout(t);
    }
    if (touched) return;
    const t = window.setTimeout(() => {
      setWhich((w) => (w + 1) % attempts.length);
      setShown(0);
    }, 3600);
    return () => clearTimeout(t);
  }, [inView, reduce, shown, done, touched, a.lines.length]);

  const pick = (i: number) => {
    setTouched(true);
    setWhich(i);
    setShown(0);
  };

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* The attacks */}
      <ol className="space-y-2">
        {attempts.map((x, i) => (
          <li key={x.move}>
            <button
              type="button"
              onClick={() => pick(i)}
              className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-colors ${
                i === which ? 'bg-white text-ink' : 'text-white/70 ring-1 ring-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-xs font-semibold tabular-nums ${i === which ? 'text-background' : 'text-white/35'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-[15px] font-semibold">{x.move}</span>
              {i === which && done ? <ShieldCheck className="size-5 text-background" /> : null}
            </button>
          </li>
        ))}
      </ol>

      {/* The attempt, playing out */}
      <div className="relative min-h-[440px] overflow-hidden rounded-[1.75rem] bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
        <p className="text-[13px] font-semibold text-white/35">Attempt {String(which + 1).padStart(2, '0')}</p>
        <div className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {a.lines.slice(0, shown).map(([who, text], i) => (
              <motion.div
                key={`${which}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[15px] ${
                  who === 'them'
                    ? 'bg-red-500/15 text-red-100 ring-1 ring-red-400/25'
                    : who === 'app'
                      ? 'ml-auto bg-primary/15 font-medium text-primary ring-1 ring-primary/30'
                      : 'ml-auto bg-white/10 text-white'
                }`}
              >
                <span className="mb-0.5 block text-[12px] font-semibold opacity-60">
                  {who === 'them' ? 'Scammer' : who === 'app' ? 'Credvera' : 'You'}
                </span>
                {text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* The screenshot that comes out black */}
        <AnimatePresence>
          {a.blackout && shown >= a.lines.length && (
            <motion.div
              key="black"
              className="absolute inset-0 grid place-items-center bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.6, times: [0, 0.1, 0.7, 1] }}
            >
              <span className="text-sm text-white/50">Screenshot: blank</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The verdict */}
        <AnimatePresence>
          {done && (
            <motion.div
              key={`v-${which}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease, delay: a.blackout ? 1.2 : 0 }}
              className="absolute inset-x-6 bottom-6 rounded-2xl bg-primary p-5 text-secondary sm:inset-x-8 sm:bottom-8"
            >
              <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <ShieldCheck className="size-5" /> {a.verdict}
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-secondary/80">{a.why}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
