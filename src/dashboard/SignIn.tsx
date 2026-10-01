import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, ScanLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { errorMessage, useSignedIn, useSignIn, type SignInInput } from '../api';
import logo from '../assets/logo.png';
import ankara from '../assets/signin-ankara.webp';
import ClothBand from '../components/business/ClothBand';

const ease = [0.16, 1, 0.3, 1] as const;

type Method = SignInInput['method'];

const field =
  'h-14 w-full rounded-2xl bg-white px-4 text-[16px] outline-none ring-1 ring-graphite/15 transition-shadow placeholder:text-graphite/35 focus:ring-graphite/50';

/**
 * Four boxes over one hidden input, styled like the app's own:
 * soft rounded squares, the next one lit, the rest quiet.
 */
function PinBoxes({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <label className="relative block">
      <input
        ref={ref}
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        className="absolute inset-0 opacity-0"
        aria-label="Your 4-digit PIN"
      />
      <span className="flex justify-center gap-3" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => {
          const filled = i < value.length;
          const next = i === value.length;
          return (
            <span
              key={i}
              className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors ${filled || next ? 'bg-white ring-1 ring-graphite/15' : 'bg-graphite/[0.05]'} ${next ? 'ring-graphite/40' : ''}`}
            >
              {filled && <span className="size-2.5 rounded-full bg-graphite" />}
            </span>
          );
        })}
      </span>
    </label>
  );
}

/**
 * Sign in to the business dashboard with the same details as the app: the
 * email or phone on the account, then the password or the 4-digit app PIN.
 * Signing in by scanning a code with the app is on its way.
 */
export default function SignIn() {
  const signedIn = useSignedIn();
  // Back to where they came from, but only within the dashboard: never an open redirect.
  const requested = new URLSearchParams(useLocation().search).get('next');
  const next = requested?.startsWith('/business/app') ? requested : '/business/app';
  const signIn = useSignIn();
  const [method, setMethod] = useState<Method>('password');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');

  const who = emailOrPhone.trim();

  const submit = (input: SignInInput) =>
    signIn.mutate(input, {
      // A wrong PIN clears the boxes, ready for another go.
      onError: () => setPin(''),
    });

  // Like the app, a PIN submits itself on the fourth digit.
  useEffect(() => {
    if (method === 'pin' && pin.length === 4 && who && !signIn.isPending) submit({ method: 'pin', emailOrPhone: who, pin });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  if (signedIn) return <Navigate to={next} replace />;

  const switchTo = (to: Method) => {
    setMethod(to);
    setPin('');
    signIn.reset();
  };

  return (
    <div className="grid min-h-screen bg-ledger text-graphite lg:grid-cols-[1fr_auto_1.1fr]">
      {/* Left: two business owners at work */}
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
          <p className="mt-8 hidden max-w-sm text-[15px] leading-relaxed text-white/65 lg:block">
            Sign in with the same details you use in the Credvera app. After five wrong tries the account locks for 15 minutes, to keep it safe.
          </p>
        </div>
      </aside>

      {/* A strip of woven cloth where the two halves meet */}
      <ClothBand className="h-9 w-full lg:hidden" vertical={false} />
      <ClothBand className="hidden h-full w-9 lg:block" />

      {/* Right: the form */}
      <main className="flex items-center justify-center p-6 py-14 lg:p-14">
        <div className="w-full max-w-sm">
          <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.03em]">Welcome back</h2>
          <p className="mt-1.5 text-[15px] text-graphite/55">Sign in with your password or your app PIN.</p>

          <div className="mt-7 flex rounded-xl bg-graphite/[0.06] p-1 text-[14px] font-semibold" role="tablist" aria-label="How to sign in">
            {(['password', 'pin'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={method === m}
                onClick={() => switchTo(m)}
                className={`flex-1 rounded-lg py-2 transition-colors ${method === m ? 'bg-white shadow-sm' : 'text-graphite/55 hover:text-graphite'}`}
              >
                {m === 'password' ? 'Password' : 'PIN'}
              </button>
            ))}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (method === 'password' && who && password) submit({ method: 'password', emailOrPhone: who, password });
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Email or phone number</span>
              <input
                autoFocus
                autoComplete="username"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="you@business.com or 0803 000 0000"
                className={field}
              />
            </label>

            <AnimatePresence mode="wait">
              {method === 'password' ? (
                <motion.div key="password" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease }} className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Password</span>
                    <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
                  </label>
                  <button
                    type="submit"
                    disabled={!who || !password || signIn.isPending}
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-graphite text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/20 disabled:text-graphite/50"
                  >
                    {signIn.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Sign in {!signIn.isPending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="pin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease }}>
                  <span className="mb-3 block text-[13px] font-medium text-graphite/60">Your 4-digit app PIN</span>
                  <PinBoxes value={pin} onChange={setPin} disabled={signIn.isPending || !who} />
                  <p className="mt-3 text-center text-[13px] text-graphite/50">
                    {signIn.isPending ? 'Checking…' : who ? 'It signs you in on the fourth digit.' : 'Enter your email or phone first.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {signIn.error && (
              <p role="alert" className="text-[14px] text-[#b42318]">
                {errorMessage(signIn.error)}
              </p>
            )}
          </form>

          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-dashed border-graphite/20 px-4 py-3 text-[13.5px] text-graphite/55">
            <ScanLine className="size-4 shrink-0" />
            <span>Scan to sign in with the Credvera app is coming soon.</span>
          </div>

          <p className="mt-10 text-center text-[14px] text-graphite/55">
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
