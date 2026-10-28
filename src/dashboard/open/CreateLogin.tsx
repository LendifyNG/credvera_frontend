import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, type FinishProgress, isApiError, useFinishSignUp, useRegister, useResendCode, useVerifyCode } from '../../api';
import { ease, field, label, primary, Problem, toE164 } from './parts';

type Channel = 'sms' | 'email';
type Stage = { name: 'details' } | { name: 'code'; token: string; sentTo: string; channel: Channel } | { name: 'secure'; token: string };

/** The password rules the API enforces, shown before they're broken. */
const passwordRules = (value: string) => [
  { ok: value.length >= 8, text: '8 or more characters' },
  { ok: /[A-Z]/.test(value), text: 'An uppercase letter' },
  { ok: /\d/.test(value), text: 'A number' },
];

/** PINs the API refuses as too easy to guess; the same list and rules, so it's caught before anything is sent. */
const COMMON_PINS = new Set([
  '1212', '1122', '1313', '2000', '2001', '2580', '0852', '1004', '1010', '2020',
  '2121', '6969', '4545', '5683', '1478', '7410', '1369', '9630', '1590', '0007',
  '0101', '2222', '1221', '0110', '1001', '4321', '1100', '0011', '2525', '5252',
]);

const guessablePin = (pin: string) => {
  const year = Number(pin) >= 1940 && Number(pin) <= 2029;
  return /^(\d)\1{3}$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin) || pin.slice(0, 2) === pin.slice(2) || year || COMMON_PINS.has(pin);
};

/**
 * Creating the login a business account hangs off, in the app's order: who
 * you are and a password, your phone and then your email confirmed with a
 * code each, then a PIN and your home address. The same login works in the
 * Credvera app.
 */
export default function CreateLogin() {
  const [stage, setStage] = useState<Stage>({ name: 'details' });
  const [login, setLogin] = useState({ email: '', password: '' });

  return (
    <div>
      <p className="text-[15px] text-graphite/60">
        A login for you, the same one the Credvera app uses.{' '}
        <Link to="/business/app/sign-in?next=/business/app/open" className="font-semibold text-graphite underline-offset-4 hover:underline">
          Already have one? Sign in
        </Link>
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={stage.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
          {stage.name === 'details' && (
            <Details
              onDone={(token, sentTo, typed) => {
                setLogin(typed);
                setStage({ name: 'code', token, sentTo, channel: 'sms' });
              }}
            />
          )}
          {stage.name === 'code' && (
            <Code
              // A new key per channel, so the email code starts on a clean box.
              key={stage.channel}
              token={stage.token}
              sentTo={stage.sentTo}
              channel={stage.channel}
              onNext={(next) => setStage(next.channel ? { name: 'code', token: next.token, sentTo: next.sentTo, channel: next.channel } : { name: 'secure', token: next.token })}
              onRetarget={(token) => setStage({ ...stage, token })}
            />
          )}
          {stage.name === 'secure' && <Secure token={stage.token} email={login.email} password={login.password} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Details({ onDone }: { onDone: (token: string, sentTo: string, login: { email: string; password: string }) => void }) {
  const register = useRegister();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const rules = passwordRules(form.password);
  // Details that already have a finished account: said here, with a way to sign in.
  const fields = isApiError(register.error) && !register.error.details?.inProgress ? (register.error.details?.fields as string[] | undefined) : undefined;
  const taken = fields?.length
    ? `${fields.length > 1 ? 'This email and phone number already have' : fields[0] === 'email' ? 'This email already has' : 'This phone number already has'} a Credvera account.`
    : null;
  const ready = form.firstName.trim() && form.lastName.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.replace(/\D/g, '').length >= 10 && rules.every((r) => r.ok);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        const input = { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phoneNumber: toE164(form.phone), password: form.password };
        register.mutate(input, { onSuccess: (r) => onDone(r.onboardingToken, r.maskedContact, { email: input.email, password: input.password }) });
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>First name</span>
          <input autoComplete="given-name" maxLength={100} value={form.firstName} onChange={set('firstName')} className={field} />
        </label>
        <label className="block">
          <span className={label}>Last name</span>
          <input autoComplete="family-name" maxLength={100} value={form.lastName} onChange={set('lastName')} className={field} />
        </label>
        <label className="block">
          <span className={label}>Email</span>
          <input type="email" autoComplete="email" maxLength={254} value={form.email} onChange={set('email')} placeholder="you@business.com" className={field} />
        </label>
        <label className="block">
          <span className={label}>Phone</span>
          <input type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="0803 000 0000" className={field} />
        </label>
        <label className="block">
          <span className={label}>Password</span>
          <input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} className={field} />
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
            {rules.map((r) => (
              <li key={r.text} className={r.ok ? 'text-[#1f6b33]' : 'text-graphite/45'}>
                {r.ok ? '✓' : '·'} {r.text}
              </li>
            ))}
          </ul>
        </label>
      </div>
      <Problem>{register.error && !taken && errorMessage(register.error)}</Problem>
      {taken && (
        <p className="mt-4 text-[14px] text-[#b42318]">
          {taken}{' '}
          <Link to="/business/app/sign-in?next=/business/app/open" className="font-semibold underline underline-offset-4">
            Sign in instead
          </Link>
        </p>
      )}
      <button type="submit" disabled={!ready || register.isPending} className={`${primary} mt-8`}>
        {register.isPending && <Loader2 className="size-4 animate-spin" />} Text me a code <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}

function Code({
  token,
  sentTo,
  channel,
  onNext,
  onRetarget,
}: {
  token: string;
  sentTo: string;
  channel: Channel;
  onNext: (next: { token: string; sentTo: string; channel?: Channel }) => void;
  onRetarget: (token: string) => void;
}) {
  const verify = useVerifyCode();
  const resend = useResendCode();
  const [code, setCode] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // After the phone, the answer carries the emailed code's token.
        if (code.length === 6) verify.mutate({ token, code }, { onSuccess: (r) => onNext({ token: r.onboardingToken, ...('channel' in r ? { sentTo: r.maskedContact, channel: r.channel } : { sentTo: '' }) }) });
      }}
    >
      <label className="block max-w-xs">
        <span className={label}>
          The 6-digit code we {channel === 'sms' ? 'texted' : 'emailed'} to {sentTo}
        </span>
        <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`${field} font-ledger tracking-[0.4em]`} />
      </label>
      <Problem>{(verify.error && errorMessage(verify.error)) || (resend.error && errorMessage(resend.error))}</Problem>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button type="submit" disabled={code.length !== 6 || verify.isPending} className={primary}>
          {verify.isPending && <Loader2 className="size-4 animate-spin" />} Confirm my {channel === 'sms' ? 'phone' : 'email'}
        </button>
        <button
          type="button"
          disabled={resend.isPending}
          // A new code comes with a new token; the old one points at the old code.
          onClick={() => resend.mutate({ token }, { onSuccess: (r) => onRetarget(r.onboardingToken) })}
          className="text-[14px] font-semibold text-graphite/60 hover:text-graphite disabled:opacity-50"
        >
          {resend.isSuccess ? 'Sent again' : 'Send a new code'}
        </button>
      </div>
    </form>
  );
}

function Secure({ token, email, password }: { token: string; email: string; password: string }) {
  const progress = useRef<FinishProgress>({ done: 'none', token });
  const finish = useFinishSignUp(progress);
  const [pin, setPin] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', nearestLandmark: '' });
  const setAddr = (key: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, [key]: e.target.value });

  const pinProblem = pin.length === 4 && guessablePin(pin) ? 'Too easy to guess. Avoid repeats, runs like 1234, and years.' : null;
  const ready = pin.length === 4 && !pinProblem && Object.values(address).every((v) => v.trim());
  const busy = finish.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        // Ends signed in, which flips the page over to the business application.
        finish.mutate({ email, password, pin, address: { ...address, nearestLandmark: address.nearestLandmark.trim() } });
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
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

      <Problem>{finish.error && errorMessage(finish.error)}</Problem>
      <button type="submit" disabled={!ready || busy} className={`${primary} mt-8`}>
        {busy && <Loader2 className="size-4 animate-spin" />} Create my login <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
