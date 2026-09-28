import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MessageSquareText, ScanLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import ankara from '../assets/signin-ankara.webp';
import ClothBand from '../components/business/ClothBand';
import { signIn } from './store';
import { QrPattern } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const REFRESH_S = 30;
const RESEND_S = 30;

// The example account holder.
// TODO(credvera): the real session comes from the API once the phone approves.
const PERSON = { business: 'Okafor Studios Limited', person: 'Adaeze', role: 'Owner' as const };

type Mode = 'scan' | 'others' | 'phone' | 'code' | 'pin';

// Google's "G" in its four colours and Apple's mark, as each company draws them.
const GOOGLE: [string, string][] = [
  ['#EA4335', 'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'],
  ['#4285F4', 'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'],
  ['#FBBC05', 'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'],
  ['#34A853', 'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'],
];
const APPLE =
  'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';

/**
 * Six (or four) boxes over one hidden input, styled like the app's own:
 * soft rounded squares, the next one lit, the rest quiet.
 */
function Boxes({ length, value, onChange, secret = false }: { length: number; value: string; onChange: (v: string) => void; secret?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <label className="relative block">
      <input
        ref={ref}
        inputMode="numeric"
        autoComplete={secret ? 'off' : 'one-time-code'}
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        className="absolute inset-0 opacity-0"
        aria-label={secret ? 'Your PIN' : 'The code we sent'}
      />
      <span className={`flex ${length === 4 ? 'justify-center gap-3' : 'gap-2'}`} aria-hidden>
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length;
          const next = i === value.length;
          return (
            <span
              key={i}
              className={`grid h-14 place-items-center rounded-2xl text-xl font-semibold transition-colors ${length === 4 ? 'w-14' : 'flex-1'} ${
                filled || next ? 'bg-white ring-1 ring-graphite/15' : 'bg-graphite/[0.05]'
              } ${next ? 'ring-graphite/40' : ''}`}
            >
              {filled ? secret ? <span className="size-2.5 rounded-full bg-graphite" /> : value[i] : ''}
            </span>
          );
        })}
      </span>
    </label>
  );
}

/** Heading for each step on the right, worded like the app's login. */
function StepHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.03em]">{title}</h2>
      <p className="mt-1.5 text-[15px] text-graphite/55">{sub}</p>
    </div>
  );
}

/**
 * Sign in to the business dashboard, in the same order as the app's login:
 * the quickest way first (scan the code with the Credvera app and approve with
 * Face ID or the PIN there), then "Other ways to sign in": a code by text,
 * Google or Apple, each finished with the PIN.
 */
export default function SignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('scan');
  const [seed, setSeed] = useState(1);
  const [left, setLeft] = useState(REFRESH_S);
  const [approved, setApproved] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_S);
  const [pin, setPin] = useState('');
  const [via, setVia] = useState<'code' | 'google' | 'apple'>('code');

  const finish = () => {
    signIn(PERSON);
    navigate('/business/app', { replace: true });
  };

  // The code refreshes every thirty seconds, so an old photo of it is useless.
  useEffect(() => {
    if (mode !== 'scan' || approved) return;
    const t = window.setTimeout(() => {
      if (left <= 1) {
        setSeed((s) => s + 1);
        setLeft(REFRESH_S);
      } else setLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [left, mode, approved]);

  // TODO(credvera): approval arrives from the app over the API and calls
  // setApproved(true). Until that's connected, the code simply waits.

  useEffect(() => {
    if (!approved) return;
    const t = window.setTimeout(finish, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved]);

  // "Send a new code" countdown while the code step is open.
  useEffect(() => {
    if (mode !== 'code' || resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, resendIn]);

  // TODO(credvera): send and check the code with the API, then check the PIN
  // and call finish() when both pass. Google and Apple hand over to the PIN
  // the same way once their sign-in is connected. Until then, a full PIN
  // simply waits here, like the scan.
  useEffect(() => {
    if (mode === 'code' && code.length === 6) {
      const t = window.setTimeout(() => setMode('pin'), 400);
      return () => clearTimeout(t);
    }
    // On a local copy only (npm run dev), a full PIN signs in, so the
    // dashboard can be reviewed. The live site keeps waiting for the API.
    if (import.meta.env.DEV && mode === 'pin' && pin.length === 4) {
      const t = window.setTimeout(finish, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, pin, mode]);

  const back = () =>
    setMode(mode === 'others' ? 'scan' : mode === 'phone' ? 'others' : mode === 'code' ? 'phone' : via === 'code' ? 'code' : 'others');

  const ring = 2 * Math.PI * 9;

  return (
    <div className="grid min-h-screen bg-ledger text-graphite lg:grid-cols-[1fr_auto_1.1fr]">
      {/* Left: two business owners at work, and how signing in works */}
      <aside className="relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden bg-graphite p-8 text-white lg:min-h-0 lg:p-14">
        <img src={ankara} alt="Two business owners in ankara working at a laptop" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_30%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,28,23,0.95)_0%,rgba(20,28,23,0.75)_40%,rgba(20,28,23,0.15)_75%,rgba(20,28,23,0.45)_100%)]" />
        <Link to="/business" className="w-fit">
          <img src={logo} alt="Credvera" className="h-7 w-auto" />
        </Link>
        <div>
          <p className="text-[13px] font-medium text-white/60">Business dashboard</p>
          <h1 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            Your business,
            <br />
            <span className="text-white/55">on a bigger screen.</span>
          </h1>
          <ol className="mt-8 hidden space-y-4 lg:block">
            {[
              ['Open Credvera on your phone', 'In your business account.'],
              ['Tap Scan to sign in', 'Point your camera at the code.'],
              ['Approve with Face ID or your PIN', 'The dashboard opens here.'],
            ].map(([t, b], i) => (
              <li key={t} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-[13px] font-medium tabular-nums ring-1 ring-white/20 backdrop-blur">{i + 1}</span>
                <span>
                  <span className="block text-[15px] font-semibold">{t}</span>
                  <span className="block text-[14px] text-white/60">{b}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      {/* A strip of woven cloth where the two halves meet */}
      <ClothBand className="h-9 w-full lg:hidden" vertical={false} />
      <ClothBand className="hidden h-full w-9 lg:block" />

      {/* Right: the code, or another way in */}
      <main className="flex items-center justify-center p-6 py-14 lg:p-14">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {mode === 'scan' ? (
              <motion.div key="scan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
                <StepHead title="Welcome back" sub="Scan with the Credvera app, then approve on your phone." />
                <div className="relative rounded-3xl bg-white p-7 shadow-[0_40px_80px_-40px_rgba(20,28,23,0.4)] ring-1 ring-graphite/10">
                  <div className="relative aspect-square">
                    <AnimatePresence mode="wait">
                      <motion.div key={seed} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: approved ? 0.12 : 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                        <QrPattern seed={seed} className="h-full w-full" />
                      </motion.div>
                    </AnimatePresence>
                    {!approved && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-primary/35 to-transparent"
                        animate={{ top: ['-10%', '90%', '-10%'] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <AnimatePresence>
                      {approved && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 grid place-items-center text-center">
                          <div>
                            <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-graphite">
                              <Check className="size-7" />
                            </span>
                            <p className="mt-4 text-lg font-semibold">Approved on your phone</p>
                            <p className="text-[14px] text-graphite/55">Opening your dashboard…</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-graphite/60">
                      <ScanLine className="size-4" /> {approved ? 'Signed in' : 'Waiting for your phone'}
                    </span>
                    {!approved && (
                      <span className="flex items-center gap-2 text-graphite/50 tabular-nums">
                        <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90" aria-hidden>
                          <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(20,28,23,0.12)" strokeWidth="2" />
                          <circle cx="11" cy="11" r="9" fill="none" stroke="#141c17" strokeWidth="2" strokeDasharray={ring} strokeDashoffset={ring * (1 - left / REFRESH_S)} />
                        </svg>
                        New code in {left}s
                      </span>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => setMode('others')} className="mt-7 w-full text-center text-[15px] font-semibold text-graphite hover:underline hover:underline-offset-4">
                  Other ways to sign in
                </button>
              </motion.div>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
                <button type="button" onClick={back} className="mb-8 inline-flex items-center gap-2 text-[14px] font-semibold text-graphite/60 hover:text-graphite">
                  <ArrowLeft className="size-4" /> Back
                </button>

                {mode === 'others' && (
                  <div>
                    <StepHead title="Other ways to sign in" sub="Each one finishes with your Credvera PIN." />
                    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-graphite/10">
                      {[
                        { key: 'code', label: 'Text me a code', sub: 'To the phone on your business account', icon: <MessageSquareText className="size-5 text-graphite/70" /> },
                        {
                          key: 'google',
                          label: 'Continue with Google',
                          sub: 'The Google account you linked in the app',
                          icon: (
                            <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
                              {GOOGLE.map(([fill, d]) => (
                                <path key={fill} d={d} fill={fill} />
                              ))}
                            </svg>
                          ),
                        },
                        {
                          key: 'apple',
                          label: 'Continue with Apple',
                          sub: 'The Apple ID you linked in the app',
                          icon: (
                            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                              <path d={APPLE} fill="currentColor" />
                            </svg>
                          ),
                        },
                      ].map((o, i) => (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => {
                            if (o.key === 'code') setMode('phone');
                            else {
                              // TODO(credvera): the Google / Apple sign-in window opens here.
                              setVia(o.key as 'google' | 'apple');
                              setPin('');
                              setMode('pin');
                            }
                          }}
                          className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ledger ${i ? 'border-t border-graphite/10' : ''}`}
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ledger">{o.icon}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold">{o.label}</span>
                            <span className="block text-[13px] text-graphite/55">{o.sub}</span>
                          </span>
                          <ArrowRight className="size-4 text-graphite/35" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mode === 'phone' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (phone.replace(/\D/g, '').length < 10) return;
                      setVia('code');
                      setCode('');
                      setResendIn(RESEND_S);
                      setMode('code');
                    }}
                  >
                    <StepHead title="Text me a code" sub="The phone number on your business account." />
                    <div className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-graphite/15 focus-within:ring-graphite/50">
                      <span className="text-[17px] font-medium text-graphite/50">+234</span>
                      <span className="h-6 w-px bg-graphite/15" />
                      <input autoFocus type="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="803 000 0000" className="w-full bg-transparent text-[17px] outline-none" aria-label="Phone number" />
                    </div>
                    <button type="submit" className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-graphite text-[15px] font-semibold text-white hover:bg-black">
                      Send me a code <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>
                )}

                {mode === 'code' && (
                  <div>
                    <StepHead title="Enter your code" sub={`We texted a 6-digit code to +234 ${phone}.`} />
                    <Boxes length={6} value={code} onChange={setCode} />
                    <p className="mt-5 text-[14px] text-graphite/55">
                      {resendIn > 0 ? (
                        <span className="tabular-nums">Send a new code in 0:{String(resendIn).padStart(2, '0')}</span>
                      ) : (
                        <button type="button" onClick={() => setResendIn(RESEND_S)} className="font-semibold text-graphite hover:underline">
                          Send a new code
                        </button>
                      )}
                    </p>
                  </div>
                )}

                {mode === 'pin' && (
                  <div className="text-center">
                    <StepHead
                      title="Enter your PIN"
                      sub={via === 'code' ? 'The same four digits you use in the app.' : `Signed in with ${via === 'google' ? 'Google' : 'Apple'}. Now your app PIN.`}
                    />
                    <Boxes length={4} value={pin} onChange={setPin} secret />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-12 text-center text-[14px] text-graphite/55">
            New to Credvera Business?{' '}
            <Link to="/business/app/open" className="font-semibold text-graphite underline-offset-4 hover:underline">
              Open an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
