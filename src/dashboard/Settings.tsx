import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileCheck2, FileSearch, KeyRound, Laptop, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { setNotify, signOut, updateProfile, useDash, type Profile } from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors focus:border-graphite/50';

function Saved({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[13.5px] font-medium text-[#1f6b33]">
          <Check className="size-4" /> {children}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ---------- Business ---------- */

function Business() {
  const { profile, session } = useDash();
  const [draft, setDraft] = useState<Profile>(profile);
  const [pin, setPin] = useState(false);
  const [saved, setSaved] = useState(false);
  const changed = (['email', 'phone', 'address', 'industry'] as const).some((k) => draft[k] !== profile[k]);
  const edit = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [k]: e.target.value });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className={`${panel} h-fit p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">From the CAC register</h2>
        <p className="mt-1 text-[13.5px] text-graphite/55">These come from your company record, so they can only change there.</p>
        <dl className="mt-5 divide-y divide-graphite/[0.08] text-[14px]">
          {[
            ['Registered name', session?.business ?? ''],
            ['Registration number', profile.rc],
            ['Type', profile.type],
            ['Incorporated', profile.registered],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-3">
              <dt className="text-graphite/55">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Contact details</h2>
        <p className="mt-1 text-[13.5px] text-graphite/55">Where we reach you, and what customers see on invoices.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Email</span>
            <input type="email" value={draft.email} onChange={edit('email')} className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Phone</span>
            <input type="tel" value={draft.phone} onChange={edit('phone')} className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Business address</span>
            <input value={draft.address} onChange={edit('address')} className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">What the business does</span>
            <input value={draft.industry} onChange={edit('industry')} className={field} />
          </label>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button type="button" disabled={!changed} onClick={() => setPin(true)} className="inline-flex h-10 items-center rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
            Save changes
          </button>
          <Saved show={saved}>Saved</Saved>
        </div>
      </section>

      <PinPrompt
        open={pin}
        title="Save your contact details"
        onClose={() => setPin(false)}
        onConfirm={() => {
          updateProfile({ email: draft.email.trim(), phone: draft.phone.trim(), address: draft.address.trim(), industry: draft.industry.trim() });
          setPin(false);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        }}
      />
    </div>
  );
}

/* ---------- Security ---------- */

function Security() {
  const navigate = useNavigate();
  const [phoneOut, setPhoneOut] = useState(false);
  // TODO(credvera): the real list of signed-in devices from the API.
  const sessions = [
    { icon: Laptop, name: 'This browser', where: 'Lagos · now', current: true },
    ...(phoneOut ? [] : [{ icon: Smartphone, name: 'iPhone, Credvera app', where: 'Lagos · today', current: false }]),
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Where you’re signed in</h2>
        <ul className="mt-4 divide-y divide-graphite/[0.08]">
          {sessions.map((s) => (
            <li key={s.name} className="flex items-center gap-3 py-3.5">
              <span className="grid size-9 place-items-center rounded-full bg-[#efeee7]">
                <s.icon className="size-4 text-graphite/70" />
              </span>
              <span className="flex-1">
                <span className="block text-[14.5px] font-medium">{s.name}</span>
                <span className="block text-[12.5px] text-graphite/50">{s.where}</span>
              </span>
              {s.current ? (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    navigate('/business/app/sign-in', { replace: true });
                  }}
                  className="text-[13.5px] font-semibold text-graphite/60 hover:text-graphite"
                >
                  Sign out
                </button>
              ) : (
                <button type="button" onClick={() => setPhoneOut(true)} className="text-[13.5px] font-semibold text-[#9a3a17] hover:underline">
                  Sign it out
                </button>
              )}
            </li>
          ))}
        </ul>
        {phoneOut && <p className="mt-3 text-[13px] text-graphite/55">The phone is signed out. Sign in again there with your PIN.</p>}
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">How your account is kept safe</h2>
        <ul className="mt-4 space-y-4 text-[14px]">
          {[
            { icon: QrCode, title: 'Signing in here', body: 'You scan a code with the Credvera app and approve on your phone, or use a code by text and your PIN. There’s no password to steal.' },
            { icon: KeyRound, title: 'Every payment needs your PIN', body: 'Moving money, approving, and changing these settings all ask for it. Change your PIN in the app.' },
            { icon: ShieldCheck, title: 'Big payments need two people', body: 'Payments over your approval limit wait for a second person. Set it in Team.' },
          ].map((r) => (
            <li key={r.title} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-graphite text-primary">
                <r.icon className="size-4" />
              </span>
              <span>
                <span className="block font-semibold">{r.title}</span>
                <span className="block text-graphite/60">{r.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Notifications ---------- */

const NOTICES: [string, string, string][] = [
  ['in', 'Money comes in', 'Every payment you receive'],
  ['out', 'Money goes out', 'Every payment, card payment and bill'],
  ['approvals', 'Something needs approving', 'A payment waiting for you'],
  ['overdue', 'An invoice is overdue', 'The day after it was due'],
  ['rates', 'A rate alert is reached', 'The rates you asked about'],
  ['weekly', 'Your week in one email', 'Money in and out, every Monday'],
];

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-6 w-10 rounded-full transition-colors ${on ? 'bg-graphite' : 'bg-graphite/20'}`}>
      <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-1'}`} />
    </button>
  );
}

function Notifications() {
  const { notify, profile } = useDash();
  return (
    <section className={`${panel} p-6`}>
      <h2 className="text-[18px] font-semibold tracking-[-0.02em]">What we tell you about</h2>
      <p className="mt-1 text-[13.5px] text-graphite/55">Emails go to {profile.email}. App notifications go to everyone signed in to the app.</p>
      <table className="mt-5 w-full text-[14px]">
        <thead>
          <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/50">
            <th className="py-2.5 text-left font-medium" />
            <th className="w-20 py-2.5 text-center font-medium">Email</th>
            <th className="w-20 py-2.5 text-center font-medium">App</th>
          </tr>
        </thead>
        <tbody>
          {NOTICES.map(([k, title, sub]) => (
            <tr key={k} className="border-b border-graphite/[0.06] last:border-0">
              <td className="py-3.5 pr-3">
                <span className="block font-medium">{title}</span>
                <span className="block text-[12.5px] text-graphite/50">{sub}</span>
              </td>
              {(['email', 'app'] as const).map((ch) => (
                <td key={ch} className="py-3.5 text-center">
                  <span className="inline-flex">
                    <Toggle on={notify[k]![ch]} onChange={() => setNotify(k, ch, !notify[k]![ch])} label={`${title} by ${ch}`} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ---------- Documents ---------- */

function Documents() {
  const { documents } = useDash();
  const checking = documents === 'checking';
  const docs = [
    { name: 'Certificate of incorporation', from: 'CAC', state: 'Checked' },
    { name: 'CAC status report', from: 'CAC', state: checking ? 'Being checked' : 'Checked' },
    { name: 'Directors’ BVNs', from: 'Adaeze Okafor, Tunde Bakare', state: 'Checked' },
    { name: 'Proof of business address', from: 'Utility bill', state: checking ? 'Being checked' : 'Checked' },
  ];
  return (
    <section className={`${panel} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Company documents</h2>
          <p className="mt-1 text-[13.5px] text-graphite/55">
            {checking ? 'We’re checking the last two. This usually takes one or two working days, and everything works meanwhile.' : 'Everything is checked. Your account has no limits from verification.'}
          </p>
        </div>
        {checking && (
          <span className="inline-flex items-center gap-2 rounded-md bg-[#fbf0d6] px-2.5 py-1 text-[13px] font-medium text-[#8a5a00]">
            <FileSearch className="size-4" /> Being checked
          </span>
        )}
      </div>
      <ul className="mt-5 divide-y divide-graphite/[0.08] border-t border-graphite/10">
        {docs.map((d) => (
          <li key={d.name} className="flex items-center gap-3 py-3.5">
            <span className={`grid size-9 place-items-center rounded-full ${d.state === 'Checked' ? 'bg-[#e3f1e0] text-[#1f6b33]' : 'bg-[#fbf0d6] text-[#8a5a00]'}`}>
              {d.state === 'Checked' ? <FileCheck2 className="size-4" /> : <FileSearch className="size-4" />}
            </span>
            <span className="flex-1">
              <span className="block text-[14.5px] font-medium">{d.name}</span>
              <span className="block text-[12.5px] text-graphite/50">{d.from}</span>
            </span>
            <span className={`text-[13px] font-medium ${d.state === 'Checked' ? 'text-[#1f6b33]' : 'text-[#8a5a00]'}`}>{d.state}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const SECTIONS = [
  { to: '/business/app/settings', label: 'Business', end: true },
  { to: '/business/app/settings/security', label: 'Security' },
  { to: '/business/app/settings/notifications', label: 'Notifications' },
  { to: '/business/app/settings/documents', label: 'Documents' },
];

/** Settings: the business's details, how it's kept safe, what we tell you about, and its documents. */
export default function Settings() {
  const { section } = useParams();
  const { session } = useDash();
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Settings</h1>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite/10" aria-label="Settings">
        {SECTIONS.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            end={s.end}
            className={({ isActive }) => `-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[14.5px] font-medium transition-colors ${isActive ? 'border-graphite text-graphite' : 'border-transparent text-graphite/50 hover:text-graphite'}`}
          >
            {s.label}
          </NavLink>
        ))}
      </nav>
      <motion.div key={section ?? 'business'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
        {section === 'security' ? <Security /> : section === 'notifications' ? <Notifications /> : section === 'documents' ? <Documents /> : <Business />}
      </motion.div>
    </div>
  );
}
