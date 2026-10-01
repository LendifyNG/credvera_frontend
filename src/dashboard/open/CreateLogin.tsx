import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, useFinishSignUp, useRegister, useResendCode, useSignIn, useVerifyCode } from '../../api';
import { ease, field, label, primary, Problem, toE164 } from './parts';

type Stage = { name: 'details' } | { name: 'code'; token: string; sentTo: string } | { name: 'secure'; token: string };

/** The password rules the API enforces, shown before they're broken. */
const passwordRules = (value: string) => [
  { ok: value.length >= 8, text: '8 or more characters' },
  { ok: /[A-Z]/.test(value), text: 'An uppercase letter' },
  { ok: /\d/.test(value), text: 'A number' },
];

const guessablePin = (pin: string) => /^(\d)\1{3}$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin);

/**
 * Creating the login a business account hangs off: who you are, your phone
 * confirmed with a code, then a password, a PIN and your home address. The
 * same login works in the Credvera app.
 */
export default function CreateLogin() {
  const [stage, setStage] = useState<Stage>({ name: 'details' });
  const [email, setEmail] = useState('');

  return (
    <div className="mt-14 border-t border-graphite/15 pt-8">
      <p className="text-[15px] text-graphite/60">
        First, a login for you. It’s the same one the Credvera app uses.{' '}
        <Link to="/business/app/sign-in?next=/business/app/open" className="font-semibold text-graphite underline-offset-4 hover:underline">
          Already have one? Sign in
        </Link>
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={stage.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }} className="mt-8">
          {stage.name === 'details' && (
            <Details
              onDone={(token, sentTo, typedEmail) => {
                setEmail(typedEmail);
                setStage({ name: 'code', token, sentTo });
              }}
            />
          )}
          {stage.name === 'code' && <Code token={stage.token} sentTo={stage.sentTo} onDone={(token) => setStage({ name: 'secure', token })} onRetarget={(token) => setStage({ ...stage, token })} />}
          {stage.name === 'secure' && <Secure token={stage.token} email={email} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Details({ onDone }: { onDone: (token: string, sentTo: string, email: string) => void }) {
  const register = useRegister();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const ready = form.firstName.trim() && form.lastName.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.replace(/\D/g, '').length >= 10;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        const input = { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phoneNumber: toE164(form.phone) };
        register.mutate(input, { onSuccess: (r) => onDone(r.onboardingToken, r.maskedContact, input.email) });
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>First name</span>
          <input autoComplete="given-name" value={form.firstName} onChange={set('firstName')} className={field} />
        </label>
        <label className="block">
          <span className={label}>Last name</span>
          <input autoComplete="family-name" value={form.lastName} onChange={set('lastName')} className={field} />
        </label>
        <label className="block">
          <span className={label}>Email</span>
          <input type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@business.com" className={field} />
        </label>
        <label className="block">
          <span className={label}>Phone</span>
          <input type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="0803 000 0000" className={field} />
        </label>
      </div>
      <Problem>{register.error && errorMessage(register.error)}</Problem>
      <button type="submit" disabled={!ready || register.isPending} className={`${primary} mt-8`}>
        {register.isPending && <Loader2 className="size-4 animate-spin" />} Text me a code <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}

function Code({ token, sentTo, onDone, onRetarget }: { token: string; sentTo: string; onDone: (token: string) => void; onRetarget: (token: string) => void }) {
  const verify = useVerifyCode();
  const resend = useResendCode();
  const [code, setCode] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 6) verify.mutate({ token, code }, { onSuccess: (r) => onDone(r.onboardingToken) });
      }}
    >
      <label className="block max-w-xs">
        <span className={label}>The 6-digit code we texted to {sentTo}</span>
        <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`${field} font-ledger tracking-[0.4em]`} />
      </label>
      <Problem>{(verify.error && errorMessage(verify.error)) || (resend.error && errorMessage(resend.error))}</Problem>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button type="submit" disabled={code.length !== 6 || verify.isPending} className={primary}>
          {verify.isPending && <Loader2 className="size-4 animate-spin" />} Confirm my phone
        </button>
        <button
          type="button"
          disabled={resend.isPending}
          // A new code comes with a new token; the old one points at the old code.
          onClick={() => resend.mutate({ token, channel: 'sms' }, { onSuccess: (r) => onRetarget(r.onboardingToken) })}
          className="text-[14px] font-semibold text-graphite/60 hover:text-graphite disabled:opacity-50"
        >
          {resend.isSuccess ? 'Sent again' : 'Send a new code'}
        </button>
      </div>
    </form>
  );
}

function Secure({ token, email }: { token: string; email: string }) {
  const finish = useFinishSignUp();
  const signIn = useSignIn();
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', nearestLandmark: '' });
  const setAddr = (key: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, [key]: e.target.value });

  const rules = passwordRules(password);
  const pinProblem = pin.length === 4 && guessablePin(pin) ? 'Choose a less predictable PIN.' : null;
  const ready = rules.every((r) => r.ok) && pin.length === 4 && !pinProblem && Object.values(address).every((v) => v.trim());
  const busy = finish.isPending || signIn.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        finish.mutate(
          { token, password, pin, address: { ...address, nearestLandmark: address.nearestLandmark.trim() } },
          // Signing in flips the page over to the business application.
          { onSuccess: () => signIn.mutate({ method: 'password', emailOrPhone: email, password }) },
        );
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Password</span>
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
            {rules.map((r) => (
              <li key={r.text} className={r.ok ? 'text-[#1f6b33]' : 'text-graphite/45'}>
                {r.ok ? '✓' : '·'} {r.text}
              </li>
            ))}
          </ul>
        </label>
        <label className="block">
          <span className={label}>4-digit PIN, to confirm payments</span>
          <input type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className={`${field} font-ledger tracking-[0.4em]`} />
          {pinProblem && <span className="mt-2 block text-[12.5px] text-[#b42318]">{pinProblem}</span>}
        </label>
      </div>

      <p className={`${label} mt-10`}>Your home address</p>
      <div className="mt-2 grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Street and number</span>
          <input autoComplete="street-address" value={address.street} onChange={setAddr('street')} className={field} />
        </label>
        <label className="block">
          <span className={label}>Nearest landmark</span>
          <input value={address.nearestLandmark} onChange={setAddr('nearestLandmark')} className={field} />
        </label>
        <label className="block">
          <span className={label}>City</span>
          <input autoComplete="address-level2" value={address.city} onChange={setAddr('city')} className={field} />
        </label>
        <label className="block">
          <span className={label}>State</span>
          <input autoComplete="address-level1" value={address.state} onChange={setAddr('state')} className={field} />
        </label>
      </div>

      <Problem>{(finish.error && errorMessage(finish.error)) || (signIn.error && errorMessage(signIn.error))}</Problem>
      <button type="submit" disabled={!ready || busy} className={`${primary} mt-8`}>
        {busy && <Loader2 className="size-4 animate-spin" />} Create my login <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
