import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileCheck2, FileSearch, KeyRound, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { errorMessage, useChangePassword, useChangePin, useProfile, useSignOut, useSignOutEverywhere, type BusinessDto } from '../api';
import { nameCase, useActiveBusiness, useSession } from './data';

const ease = [0.16, 1, 0.3, 1] as const;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors focus:border-graphite/50';
const label = 'mb-1.5 block text-[13px] font-medium text-graphite/60';
const primary = 'inline-flex h-10 items-center rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40';

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

function Facts({ rows }: { rows: [string, string | null | undefined][] }) {
  return (
    <dl className="mt-5 divide-y divide-graphite/[0.08] text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 py-3">
          <dt className="shrink-0 text-graphite/55">{k}</dt>
          <dd className="text-right font-medium">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

const TURNOVER: Record<string, string> = {
  under_10m: 'Under ₦10m',
  '10m_50m': '₦10m to ₦50m',
  '50m_100m': '₦50m to ₦100m',
  '100m_500m': '₦100m to ₦500m',
  over_500m: 'Over ₦500m',
};

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null);

/* ---------- Business ---------- */

function Business({ business }: { business: BusinessDto }) {
  const profile = useProfile();
  const me = profile.data;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={`${panel} h-fit p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">From the CAC register</h2>
        <p className="mt-1 text-[13.5px] text-graphite/55">These come from your company record, so they can only change there.</p>
        <Facts
          rows={[
            ['Registered name', business.name],
            ['Registration number', `RC ${business.rcNumber}`],
            ['Type', business.companyType],
            ['Incorporated', date(business.registeredOn)],
            ['Registered address', business.registeredAddress],
          ]}
        />
      </section>

      <section className={`${panel} h-fit p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">What you told us</h2>
        <p className="mt-1 text-[13.5px] text-graphite/55">
          {business.editable ? (
            <>
              Your application is open for changes.{' '}
              <Link to="/business/app/open" className="font-semibold text-graphite underline-offset-4 hover:underline">
                Change them there
              </Link>
              .
            </>
          ) : (
            'Checked with your application. To change any of it, write to us from Help.'
          )}
        </p>
        <Facts
          rows={[
            ['What the business does', business.industry],
            ['What the account is for', business.purpose],
            ['Yearly turnover', business.annualTurnover ? (TURNOVER[business.annualTurnover] ?? business.annualTurnover) : null],
            ['Where the money comes from', business.sourceOfFunds],
            ['Business email', business.contactEmail],
            ['Business phone', business.contactPhone],
            ['Website', business.website],
          ]}
        />
      </section>

      <section className={`${panel} h-fit p-6 lg:col-span-2`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">You</h2>
        <p className="mt-1 text-[13.5px] text-graphite/55">Your name is from your BVN record. You sign in with this email or phone, here and in the app.</p>
        <Facts
          rows={[
            ['Name', me ? nameCase(`${me.firstName} ${me.lastName}`) : null],
            ['Email', me?.email],
            ['Phone', me?.phoneNumber],
            ['Role', 'Owner'],
          ]}
        />
      </section>
    </div>
  );
}

/* ---------- Security ---------- */

const PASSWORD_RULES: [string, (p: string) => boolean][] = [
  ['8 or more characters', (p) => p.length >= 8],
  ['An uppercase letter', (p) => /[A-Z]/.test(p)],
  ['A number', (p) => /\d/.test(p)],
];

function ChangePassword() {
  const change = useChangePassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const ok = current && PASSWORD_RULES.every(([, test]) => test(next)) && !change.isPending;

  return (
    <section className={`${panel} p-6`}>
      <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Password</h2>
      <p className="mt-1 text-[13.5px] text-graphite/55">Changing it signs you out everywhere else, including the app.</p>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          change.mutate({ currentPassword: current, password: next }, { onSuccess: () => (setCurrent(''), setNext('')) });
        }}
      >
        <label className="block">
          <span className={label}>Current password</span>
          <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className={label}>New password</span>
          <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={field} />
        </label>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
          {PASSWORD_RULES.map(([rule, test]) => (
            <span key={rule} className={test(next) ? 'text-[#1f6b33]' : 'text-graphite/45'}>
              {test(next) ? '✓' : '·'} {rule}
            </span>
          ))}
        </p>
        {change.error && <p className="text-[13.5px] text-[#9a3a17]">{errorMessage(change.error)}</p>}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={!ok} className={primary}>
            {change.isPending ? 'Changing…' : 'Change password'}
          </button>
          <Saved show={change.isSuccess}>Changed. Other devices are signed out.</Saved>
        </div>
      </form>
    </section>
  );
}

function ChangePin() {
  const change = useChangePin();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const digits = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value.replace(/\D/g, '').slice(0, 4));
  const ok = current.length === 4 && next.length === 4 && !change.isPending;

  return (
    <section className={`${panel} p-6`}>
      <h2 className="text-[18px] font-semibold tracking-[-0.02em]">PIN</h2>
      <p className="mt-1 text-[13.5px] text-graphite/55">The 4 digits that confirm every payment, here and in the app.</p>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          change.mutate({ currentPin: current, pin: next }, { onSuccess: () => (setCurrent(''), setNext('')) });
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={label}>Current PIN</span>
            <input type="password" inputMode="numeric" autoComplete="off" value={current} onChange={digits(setCurrent)} className={`${field} font-ledger tracking-[0.3em]`} />
          </label>
          <label className="block">
            <span className={label}>New PIN</span>
            <input type="password" inputMode="numeric" autoComplete="off" value={next} onChange={digits(setNext)} className={`${field} font-ledger tracking-[0.3em]`} />
          </label>
        </div>
        <p className="text-[12.5px] text-graphite/45">Avoid repeated or sequential digits like 1111 or 1234.</p>
        {change.error && <p className="text-[13.5px] text-[#9a3a17]">{errorMessage(change.error)}</p>}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={!ok} className={primary}>
            {change.isPending ? 'Changing…' : 'Change PIN'}
          </button>
          <Saved show={change.isSuccess}>PIN changed.</Saved>
        </div>
      </form>
    </section>
  );
}

function Security() {
  const signOut = useSignOut();
  const everywhere = useSignOutEverywhere();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChangePassword />
      <ChangePin />

      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Signing out</h2>
        <p className="mt-1 text-[13.5px] text-graphite/55">If you think someone else is signed in, sign out everywhere, then change your password and PIN.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {/* The dashboard's guard returns to sign-in once the session ends. */}
          <button type="button" onClick={() => signOut.mutate()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30">
            <LogOut className="size-4" /> Sign out here
          </button>
          {confirm ? (
            <button type="button" disabled={everywhere.isPending} onClick={() => everywhere.mutate()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#9a3a17] px-4 text-[14px] font-semibold text-white hover:bg-[#7d2f12]">
              {everywhere.isPending ? 'Signing out…' : 'Yes, sign out everywhere'}
            </button>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="inline-flex h-10 items-center rounded-lg px-3 text-[14px] font-semibold text-[#9a3a17] hover:bg-[#9a3a17]/5">
              Sign out everywhere
            </button>
          )}
        </div>
        {confirm && <p className="mt-2 text-[13px] text-graphite/55">This device too, and the Credvera app on your phone.</p>}
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">How your account is kept safe</h2>
        <ul className="mt-4 space-y-4 text-[14px]">
          {[
            { icon: KeyRound, title: 'Every payment needs your PIN', body: 'Sending money and paying bills ask for it, and we never keep it in your browser.' },
            { icon: ShieldCheck, title: 'Wrong guesses lock the account', body: 'After five wrong passwords or PINs, signing in is locked for 15 minutes.' },
            { icon: UserCheck, title: 'Your business was checked by two people', body: 'Every business account is reviewed by two people on our team before money can leave it.' },
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

/* ---------- Documents ---------- */

const REVIEW: Record<BusinessDto['status'], string> = {
  draft: 'Not sent yet.',
  pending: 'We’re checking them. This usually takes one or two working days.',
  second_review: 'A second person on our team is checking them.',
  more_info: 'We need something from you before we can finish.',
  approved: 'Everything is checked.',
  rejected: 'We couldn’t approve this business.',
};

function Documents({ business }: { business: BusinessDto }) {
  const checked = business.status === 'approved';
  const people = business.people.filter((p) => p.requiresVerification);

  return (
    <section className={`${panel} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Company documents</h2>
          <p className="mt-1 text-[13.5px] text-graphite/55">{REVIEW[business.status]}</p>
        </div>
        {!checked && (
          <span className="inline-flex items-center gap-2 rounded-md bg-[#fbf0d6] px-2.5 py-1 text-[13px] font-medium text-[#8a5a00]">
            <FileSearch className="size-4" /> {business.status === 'more_info' ? 'Needs you' : 'Being checked'}
          </span>
        )}
      </div>
      <ul className="mt-5 divide-y divide-graphite/[0.08] border-t border-graphite/10">
        {business.documents.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-3.5">
            <span className={`grid size-9 place-items-center rounded-full ${checked ? 'bg-[#e3f1e0] text-[#1f6b33]' : 'bg-[#fbf0d6] text-[#8a5a00]'}`}>{checked ? <FileCheck2 className="size-4" /> : <FileSearch className="size-4" />}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-medium">{d.label}</span>
              <span className="block truncate text-[12.5px] text-graphite/50">
                {d.fileName} · {date(d.uploadedAt)}
              </span>
            </span>
          </li>
        ))}
        {people.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-3.5">
            <span className={`grid size-9 place-items-center rounded-full ${p.status === 'verified' ? 'bg-[#e3f1e0] text-[#1f6b33]' : 'bg-[#f6e7e0] text-[#9a3a17]'}`}>
              <UserCheck className="size-4" />
            </span>
            <span className="flex-1">
              <span className="block text-[14.5px] font-medium">{p.name}’s BVN</span>
              <span className="block text-[12.5px] text-graphite/50">{p.isDirector ? 'Director' : 'Owner'}{p.sharePercent != null ? ` · ${p.sharePercent}%` : ''}</span>
            </span>
            <span className={`text-[13px] font-medium ${p.status === 'verified' ? 'text-[#1f6b33]' : 'text-[#9a3a17]'}`}>{p.status === 'verified' ? 'Checked' : 'Not checked'}</span>
          </li>
        ))}
        {business.documents.length === 0 && people.length === 0 && <li className="py-5 text-[14px] text-graphite/50">Nothing uploaded yet.</li>}
      </ul>
    </section>
  );
}

const SECTIONS = [
  { to: '/business/app/settings', label: 'Business', end: true },
  { to: '/business/app/settings/security', label: 'Security' },
  { to: '/business/app/settings/documents', label: 'Documents' },
];

/** Settings: the business's details, how it's kept safe, and its documents. */
export default function Settings() {
  const { section } = useParams();
  const session = useSession();
  const business = useActiveBusiness();
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
        {section === 'security' ? <Security /> : !business ? null : section === 'documents' ? <Documents business={business} /> : <Business business={business} />}
      </motion.div>
    </div>
  );
}
