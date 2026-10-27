import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, KeyRound, Loader2, MessageSquareText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { errorMessage, isApiError, useCodeSignIn, useSignedIn, useSignIn } from '../api';
import logo from '../assets/logo.png';
import ankara from '../assets/signin-ankara.webp';
import ClothBand from '../components/business/ClothBand';

const ease = [0.16, 1, 0.3, 1] as const;
const RESEND_S = 30;

type Mode = 'phone' | 'code' | 'pin' | 'others' | 'password';

const field =
  'h-14 w-full rounded-2xl bg-white px-4 text-[17px] outline-none ring-1 ring-graphite/15 transition-shadow placeholder:text-graphite/35 focus:ring-graphite/50';

/**
 * Six (or four) boxes over one hidden input, styled like the app's own:
 * soft rounded squares, the next one lit, the rest quiet.
 */
function Boxes({ length, value, onChange, secret = false, disabled = false }: { length: number; value: string; onChange: (v: string) => void; secret?: boolean; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), [disabled]);
  return (
    <label className="relative block">
      <input
        ref={ref}
        inputMode="numeric"
        autoComplete={secret ? 'off' : 'one-time-code'}
        maxLength={length}
        value={value}
        disabled={disabled}
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

function Problem({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="mt-3 text-[14px] text-[#b42318]">
      {errorMessage(error)}
    </p>
  ) : null;
}

/**
 * Sign in to the business dashboard, in the same order as the app's login:
 * a code texted to the phone on the account, finished with the app PIN. Under
 * "Other ways to sign in", the password. Scanning a code with the app, and
 * Google or Apple, come back here once they're connected.
 */
export default function SignIn() {
  const signedIn = useSignedIn();
  // Back to where they came from, but only within the dashboard: never an open redirect.
  const requested = new URLSearchParams(useLocation().search).get('next');
  const next = requested?.startsWith('/business/app') ? requested : '/business/app';
  const code = useCodeSignIn();
  const password = useSignIn();
  const [mode, setMode] = useState<Mode>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_S);
  const [pinStep, setPinStep] = useState('');
  const [pin, setPin] = useState('');
  const [who, setWho] = useState('');
  const [secret, setSecret] = useState('');

  const local = phone.replace(/\D/g, '').replace(/^234/, '').replace(/^0/, '');

  const send = () =>
    code.send.mutate(`0${local}`, {
      onSuccess: () => {
        setDigits('');
        setResendIn(RESEND_S);
        setMode('code');
      },
    });

  // "Send a new code" countdown while the code step is open.
  useEffect(() => {
    if (mode !== 'code' || resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, resendIn]);

  // Like the app, the code and the PIN go on their last digit.
  useEffect(() => {
    if (mode === 'code' && digits.length === 6 && !code.check.isPending) {
      code.check.mutate(
        { phone: `0${local}`, code: digits },
        {
          onSuccess: (r) => {
            setPinStep(r.pinStep);
            setPin('');
            setMode('pin');
          },
          onError: () => setDigits(''),
        },
      );
    }
    if (mode === 'pin' && pin.length === 4 && !code.finish.isPending) {
      code.finish.mutate(
        { pinStep, pin },
        {
          onError: (e) => {
            setPin('');
            // The pass has run out or been used up: back to a fresh code.
            if (isApiError(e) && e.code === 'OTP_EXPIRED') setMode('phone');
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, pin, mode]);

  if (signedIn) return <Navigate to={next} replace />;

  const go = (to: Mode) => {
    code.send.reset();
    code.check.reset();
    code.finish.reset();
    password.reset();
    setMode(to);
  };
  const back = () => go(mode === 'code' ? 'phone' : mode === 'pin' ? 'phone' : mode === 'password' ? 'others' : 'phone');

  return (
    <div className="grid min-h-screen bg-ledger text-graphite lg:grid-cols-[1fr_auto_1.1fr]">
      {/* Left: two business owners at work, and how signing in works */}
      <aside className="relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden bg-graphite p-8 text-white lg:min-h-0 lg:p-14">
        <img src={ankara} alt="Two business owners in ankara working at a laptop" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_30%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(28,30,33,0.95)_0%,rgba(28,30,33,0.75)_40%,rgba(28,30,33,0.15)_75%,rgba(28,30,33,0.45)_100%)]" />
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
              ['Enter your phone number', 'The one on your business account.'],
              ['Type the code we text you', 'It comes from Credvera in seconds.'],
              ['Finish with your app PIN', 'The dashboard opens here.'],
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

      {/* Right: the phone, the code, the PIN, or another way in */}
      <main className="flex items-center justify-center p-6 py-14 lg:p-14">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {mode === 'phone' ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (local.length === 10 && !code.send.isPending) send();
                }}
              >
                <StepHead title="Welcome back" sub="We’ll text a code to the phone on your business account." />
                <div className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-graphite/15 focus-within:ring-graphite/50">
                  <span className="text-[17px] font-medium text-graphite/50">+234</span>
                  <span className="h-6 w-px bg-graphite/15" />
                  <input autoFocus type="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="803 000 0000" className="w-full bg-transparent text-[17px] outline-none" />
                </div>
                <Problem error={code.send.error} />
                <button
                  type="submit"
                  disabled={local.length !== 10 || code.send.isPending}
                  className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-graphite text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/20 disabled:text-graphite/50"
                >
                  {code.send.isPending && <Loader2 className="size-4 animate-spin" />}
                  Send me a code {!code.send.isPending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />}
                </button>
                <button type="button" onClick={() => go('others')} className="mt-7 w-full text-center text-[15px] font-semibold text-graphite hover:underline hover:underline-offset-4">
                  Other ways to sign in
                </button>
              </motion.form>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
                <button type="button" onClick={back} className="mb-8 inline-flex items-center gap-2 text-[14px] font-semibold text-graphite/60 hover:text-graphite">
                  <ArrowLeft className="size-4" /> Back
                </button>

                {mode === 'others' && (
                  <div>
                    <StepHead title="Other ways to sign in" sub="With the same details you use in the app." />
                    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-graphite/10">
                      {[
                        { key: 'phone' as const, label: 'Text me a code', sub: 'To the phone on your business account, then your PIN', icon: <MessageSquareText className="size-5 text-graphite/70" /> },
                        { key: 'password' as const, label: 'Use my password', sub: 'With your email or phone number', icon: <KeyRound className="size-5 text-graphite/70" /> },
                      ].map((o, i) => (
                        <button key={o.key} type="button" onClick={() => go(o.key)} className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ledger ${i ? 'border-t border-graphite/10' : ''}`}>
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

                {mode === 'code' && (
                  <div>
                    <StepHead title="Enter your code" sub={`If +234 ${local} has an account, we’ve texted it a 6-digit code.`} />
                    <Boxes length={6} value={digits} onChange={setDigits} disabled={code.check.isPending} />
                    <Problem error={code.check.error} />
                    <p className="mt-5 text-[14px] text-graphite/55">
                      {code.check.isPending ? (
                        'Checking…'
                      ) : resendIn > 0 ? (
                        <span className="tabular-nums">Send a new code in 0:{String(resendIn).padStart(2, '0')}</span>
                      ) : (
                        <button type="button" onClick={send} disabled={code.send.isPending} className="font-semibold text-graphite hover:underline">
                          Send a new code
                        </button>
                      )}
                    </p>
                  </div>
                )}

                {mode === 'pin' && (
                  <div className="text-center">
                    <StepHead title="Enter your PIN" sub="The same four digits you use in the app." />
                    <Boxes length={4} value={pin} onChange={setPin} secret disabled={code.finish.isPending} />
                    <Problem error={code.finish.error} />
                    {code.finish.isPending && <p className="mt-3 text-[13px] text-graphite/50">Signing you in…</p>}
                  </div>
                )}

                {mode === 'password' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (who.trim() && secret) password.mutate({ method: 'password', emailOrPhone: who.trim(), password: secret });
                    }}
                    className="space-y-4"
                  >
                    <StepHead title="Use my password" sub="The email or phone number and password on your account." />
                    <input autoFocus autoComplete="username" value={who} onChange={(e) => setWho(e.target.value)} placeholder="you@business.com or 0803 000 0000" aria-label="Email or phone number" className={field} />
                    <input type="password" autoComplete="current-password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Password" aria-label="Password" className={field} />
                    <Problem error={password.error} />
                    <button
                      type="submit"
                      disabled={!who.trim() || !secret || password.isPending}
                      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-graphite text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/20 disabled:text-graphite/50"
                    >
                      {password.isPending && <Loader2 className="size-4 animate-spin" />}
                      Sign in {!password.isPending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />}
                    </button>
                  </form>
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
