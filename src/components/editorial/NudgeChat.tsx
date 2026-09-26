import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Bell, Check, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logo from '../../assets/logo-dark.png';
import Reveal from '../ui/Reveal';
import Headline from './Headline';

const ease = [0.16, 1, 0.3, 1] as const;

// The awkward message nobody wants to send, typed and then deleted.
const DRAFT = 'Hey Ada, abeg about that ₦13,000 from Saturday…';

type Stage = {
  draft: number; // characters of the draft showing
  pressing?: boolean;
  request?: boolean;
  typing?: boolean;
  reply?: boolean;
  paid?: boolean;
};

// The script: [how long to hold, what shows].
function script(): [number, Stage][] {
  const s: [number, Stage][] = [[900, { draft: 0 }]];
  for (let i = 1; i <= DRAFT.length; i++) s.push([55, { draft: i }]);
  s.push([1100, { draft: DRAFT.length }]);
  for (let i = DRAFT.length - 1; i >= 0; i -= 2) s.push([22, { draft: Math.max(0, i) }]);
  s.push([700, { draft: 0 }]);
  s.push([260, { draft: 0, pressing: true }]);
  s.push([1500, { draft: 0, request: true }]);
  s.push([1400, { draft: 0, request: true, typing: true }]);
  s.push([1300, { draft: 0, request: true, reply: true }]);
  s.push([4200, { draft: 0, request: true, reply: true, paid: true }]);
  return s;
}

/**
 * Split bills, told through the message you'd rather not send: you start
 * typing it, delete it, and let Credvera ask instead. Ada pays, and the
 * request updates itself. Ada's ₦13,000 is what she still owed from dinner.
 */
export default function NudgeChat() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px' });
  const final: Stage = { draft: 0, request: true, reply: true, paid: true };
  const [st, setSt] = useState<Stage>(reduce ? final : { draft: 0 });

  useEffect(() => {
    if (!inView || reduce) return;
    const frames = script();
    let i = 0;
    let t = 0;
    const next = () => {
      const f = frames[i % frames.length]!;
      setSt(f[1]);
      i++;
      t = window.setTimeout(next, f[0]);
    };
    next();
    return () => clearTimeout(t);
  }, [inView, reduce]);

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1fr_minmax(0,430px)] lg:gap-24 lg:px-8 lg:py-36">
      <div>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-background">
            <span className="mr-3 tabular-nums">02</span>Split bills
          </p>
        </Reveal>
        <Headline
          text={'The reminder you\n*don’t* have to send.'}
          className="mt-5 text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
        />
        <Reveal delay={0.15}>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/65">
            Split any bill, or a payment you’ve already made. Credvera keeps track of who has paid, who paid part and who
            hasn’t, and sends the reminder for you, with a link to pay in one tap.
          </p>
        </Reveal>
      </div>

      {/* The chat, drawn */}
      <div ref={ref} className="relative rounded-[1.75rem] bg-white shadow-[0_40px_80px_-40px_rgba(1,21,4,0.4)] ring-1 ring-ink/5">
        <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
          <span className="grid size-9 place-items-center rounded-full bg-[#f3c08f] text-sm font-semibold text-ink">A</span>
          <span>
            <span className="block text-[15px] font-semibold leading-tight">Ada</span>
            <span className="block text-xs text-ink/45">{st.typing ? 'typing…' : 'online'}</span>
          </span>
        </div>

        <div className="flex h-[400px] flex-col justify-end gap-2.5 bg-paper/60 px-4 py-5">
          <div className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-[14px] shadow-sm">
            Saturday was too sweet! We must do it again
          </div>
          <div className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-secondary px-3.5 py-2 text-[14px] text-white">
            Anytime o
          </div>

          {/* The request Credvera sends */}
          <AnimatePresence>
            {st.request && (
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease }}
                className="w-[82%] self-end overflow-hidden rounded-2xl rounded-br-md bg-white shadow-[0_12px_30px_-16px_rgba(1,21,4,0.4)] ring-1 ring-ink/10"
              >
                <div className="flex items-center justify-between bg-paper px-3.5 py-2">
                  <img src={logo} alt="Credvera" className="h-4 w-auto" />
                  <span className="text-[11px] text-ink/45">Payment request</span>
                </div>
                <div className="px-3.5 py-3">
                  <p className="text-[13px] text-ink/55">Dinner · Victoria Island</p>
                  <p className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-tight">
                    {st.paid ? '₦0.00 left' : '₦13,000.00 left'}
                  </p>
                  <p className="text-[12px] text-ink/50">Your share ₦28,000 · {st.paid ? '₦28,000' : '₦15,000'} paid</p>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mist">
                    <motion.div
                      className="h-full rounded-full bg-background"
                      initial={{ width: '54%' }}
                      animate={{ width: st.paid ? '100%' : '54%' }}
                      transition={{ duration: 1, ease }}
                    />
                  </div>
                  <div
                    className={`mt-3 flex h-10 items-center justify-center gap-2 rounded-full text-[13px] font-semibold transition-colors duration-500 ${
                      st.paid ? 'bg-primary text-secondary' : 'bg-secondary text-white'
                    }`}
                  >
                    {st.paid ? (
                      <>
                        <Check className="size-4" /> Paid in full
                      </>
                    ) : (
                      'Pay ₦13,000'
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ada, typing, then replying */}
          <AnimatePresence mode="popLayout">
            {st.typing && (
              <motion.div
                key="dots"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm"
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="size-1.5 rounded-full bg-ink/40"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
            {st.reply && (
              <motion.div
                key="reply"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-[14px] shadow-sm"
              >
                Ahh sorry o! Sending now
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Your side: the draft you delete, or the button that asks for you */}
        <div className="flex items-center gap-2 border-t border-ink/10 p-3">
          <div className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-paper px-4 text-[14px]">
            {st.draft > 0 ? (
              <span className="truncate">
                {DRAFT.slice(0, st.draft)}
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-background" />
              </span>
            ) : (
              <span className="text-ink/35">Message</span>
            )}
          </div>
          <motion.span
            className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors ${
              st.request ? 'bg-ink/5 text-ink/40' : 'bg-primary text-secondary'
            }`}
            animate={{ scale: st.pressing ? 0.92 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {st.draft > 0 ? <Send className="size-4" /> : <><Bell className="size-4" /> Remind Ada</>}
          </motion.span>
        </div>

        {/* The money arriving */}
        <AnimatePresence>
          {st.paid && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.5 }}
              className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-[13px] font-semibold text-white shadow-xl"
            >
              <Check className="size-4 text-primary" /> Ada paid you ₦13,000
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
