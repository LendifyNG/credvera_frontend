import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ScanLine, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import ClothBand from '../components/business/ClothBand';
import { signIn } from './store';
import { QrPattern } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const REFRESH_S = 30;

// The example account holder.
// TODO(credvera): the real session comes from the API once the phone approves.
const PERSON = { business: 'Adeola Foods Ltd', person: 'Funmi', role: 'Owner' as const };

type Mode = 'scan' | 'phone' | 'code' | 'pin';

/** Six (or four) single-digit boxes over one hidden input. */
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
      <span className="flex gap-2" aria-hidden>
        {Array.from({ length }, (_, i) => (
          <span key={i} className={`grid h-14 flex-1 place-items-center rounded-lg text-xl font-semibold ring-1 ${i < value.length ? 'ring-graphite' : 'ring-graphite/20'}`}>
            {i < value.length ? (secret ? <span className="size-2.5 rounded-full bg-graphite" /> : value[i]) : ''}
          </span>
        ))}
      </span>
    </label>
  );
}

/** Sign in to the business dashboard: scan with the Credvera app, or use your phone number. */
export default function SignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('scan');
  const [seed, setSeed] = useState(1);
  const [left, setLeft] = useState(REFRESH_S);
  const [approved, setApproved] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');

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

  // TODO(credvera): send and check the code with the API, then check the PIN
  // and call finish() when both pass. Until that's connected, a full PIN
  // simply waits here, like the scan.
  useEffect(() => {
    if (mode === 'code' && code.length === 6) {
      const t = window.setTimeout(() => setMode('pin'), 400);
      return () => clearTimeout(t);
    }
  }, [code, mode]);

  const ring = 2 * Math.PI * 9;

  return (
    <div className="grid min-h-screen bg-ledger text-graphite lg:grid-cols-[1fr_auto_1.1fr]">
      {/* Left: what's happening */}
      <aside className="flex flex-col justify-between bg-graphite p-8 text-white lg:p-14">
        <Link to="/business" className="w-fit">
          <img src={logo} alt="Credvera" className="h-7 w-auto" />
        </Link>
        <div className="my-16 lg:my-0">
          <p className="text-[13px] font-medium text-white/50">Business dashboard</p>
          <h1 className="mt-4 text-[clamp(2.4rem,4.4vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            Sign in with
            <br />
            <span className="text-white/45">your phone.</span>
          </h1>
          <ol className="mt-10 space-y-5">
            {[
              ['Open Credvera on your phone', 'Switch to your business account.'],
              ['Tap Scan to sign in', 'Point your camera at the code.'],
              ['Approve with your PIN or Face ID', 'The dashboard opens here.'],
            ].map(([t, b], i) => (
              <li key={t} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="grid size-7 place-items-center rounded-full ring-1 ring-white/25 text-[13px] font-medium tabular-nums">{i + 1}</span>
                <span>
                  <span className="block text-[16px] font-semibold">{t}</span>
                  <span className="block text-[14px] text-white/55">{b}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-[13px] text-white/45">No password to remember, and nothing for anyone to steal.</p>
      </aside>

      {/* A strip of woven cloth where the two halves meet */}
      <ClothBand className="h-9 w-full lg:hidden" vertical={false} />
      <ClothBand className="hidden h-full w-9 lg:block" />

      {/* Right: the code, or the phone-number route */}
      <main className="flex items-center justify-center p-6 py-16 lg:p-14">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {mode === 'scan' ? (
              <motion.div key="scan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
                <div className="relative rounded-2xl bg-white p-7 shadow-[0_40px_80px_-40px_rgba(20,28,23,0.4)] ring-1 ring-graphite/10">
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
                <button type="button" onClick={() => setMode('phone')} className="mt-8 flex w-full items-center justify-center gap-2 text-[14px] font-semibold text-graphite/65 hover:text-graphite">
                  <Smartphone className="size-4" /> Can’t scan? Use your phone number
                </button>
              </motion.div>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
                <button type="button" onClick={() => setMode(mode === 'phone' ? 'scan' : mode === 'code' ? 'phone' : 'code')} className="mb-8 inline-flex items-center gap-2 text-[14px] font-semibold text-graphite/60 hover:text-graphite">
                  <ArrowLeft className="size-4" /> Back
                </button>
                {mode === 'phone' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (phone.replace(/\D/g, '').length >= 10) setMode('code');
                    }}
                  >
                    <p className="text-2xl font-semibold tracking-tight">Your phone number</p>
                    <p className="mt-1 text-[14px] text-graphite/55">The one on your Credvera business account.</p>
                    <div className="mt-6 flex items-center gap-3 border-b-2 border-graphite/20 pb-2 focus-within:border-graphite">
                      <span className="text-lg font-medium text-graphite/50">+234</span>
                      <input autoFocus type="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="803 000 0000" className="w-full bg-transparent text-lg outline-none" aria-label="Phone number" />
                    </div>
                    <button type="submit" className="group mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-graphite text-[15px] font-semibold text-white hover:bg-black">
                      Send me a code <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>
                )}
                {mode === 'code' && (
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">Enter the code</p>
                    <p className="mt-1 mb-6 text-[14px] text-graphite/55">We sent six digits to +234 {phone}.</p>
                    <Boxes length={6} value={code} onChange={setCode} />
                  </div>
                )}
                {mode === 'pin' && (
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">Your PIN</p>
                    <p className="mt-1 mb-6 text-[14px] text-graphite/55">The same four digits you use in the app.</p>
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
