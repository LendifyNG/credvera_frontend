import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, FileUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
import StoreButtons from '../components/business/StoreButtons';
import { signIn } from './store';

const ease = [0.16, 1, 0.3, 1] as const;

// TODO(credvera): look the company up with CAC, check each BVN with the KYB
// provider and upload the documents. For now the lookup returns the example
// business and any 11-digit BVN is accepted.
const COMPANY = { name: 'Okafor Studios Limited', type: 'Private company limited by shares', address: '14 Adeola Odeku Street, Victoria Island, Lagos', since: 'Incorporated 2021' };
const PEOPLE = [
  { name: 'Adaeze Okafor', role: 'Director · 60%' },
  { name: 'Tunde Bakare', role: 'Director · 40%' },
];
const DOCS = ['Certificate of incorporation', 'CAC status report'];

const label = 'text-[13px] font-medium text-graphite/55';
const field = 'w-full border-b-2 border-graphite/15 bg-transparent py-2.5 text-[17px] outline-none transition-colors placeholder:text-graphite/30 focus:border-graphite';

function Step({ n, title, done, active, children }: { n: number; title: string; done: boolean; active: boolean; children: React.ReactNode }) {
  return (
    <section className={`border-t border-graphite/15 py-8 transition-opacity ${active || done ? 'opacity-100' : 'pointer-events-none opacity-35'}`}>
      <div className="flex items-center gap-4">
        <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors ${done ? 'bg-primary text-graphite' : active ? 'bg-graphite text-white' : 'ring-1 ring-graphite/25 text-graphite/50'}`}>
          {done ? <Check className="size-4" /> : n}
        </span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="mt-6 pl-12">{children}</div>
    </section>
  );
}

/** Opening a business account: one page that fills itself in as you go. */
export default function OpenAccount() {
  const navigate = useNavigate();
  const [rc, setRc] = useState('');
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState(false);
  const [bvns, setBvns] = useState<string[]>(PEOPLE.map(() => ''));
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [files, setFiles] = useState<(string | null)[]>(DOCS.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const peopleDone = bvns.every((b) => b.length === 11);
  const detailsDone = /\S+@\S+\.\S+/.test(email) && phone.replace(/\D/g, '').length >= 10;
  const docsDone = files.every(Boolean);

  const lookUp = () => {
    if (rc.replace(/\D/g, '').length < 5) return;
    setLooking(true);
    window.setTimeout(() => {
      setLooking(false);
      setFound(true);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-ledger text-graphite">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8">
        <Link to="/business">
          <img src={logoDark} alt="Credvera" className="h-7 w-auto" />
        </Link>
        <Link to="/business/app/sign-in" className="text-[14px] font-semibold text-graphite/60 hover:text-graphite">
          Sign in instead
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <p className="text-[13px] font-medium text-graphite/50">Open a business account</p>
        <h1 className="mt-4 text-[clamp(2.4rem,5.4vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          Tell us who you are.
          <br />
          <span className="text-graphite/45">We’ll fill in the rest.</span>
        </h1>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" exit={{ opacity: 0 }} className="mt-14">
              <Step n={1} title="Your company" done={found} active={!found}>
                <label className="block">
                  <span className={label}>CAC registration number</span>
                  <div className="flex items-end gap-4">
                    <span className="pb-2.5 text-[17px] font-medium text-graphite/45">RC</span>
                    <input value={rc} onChange={(e) => setRc(e.target.value.replace(/[^\d]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && lookUp()} inputMode="numeric" placeholder="1234567" className={field} disabled={found} />
                    {!found && (
                      <button type="button" onClick={lookUp} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
                        {looking ? <Loader2 className="size-4 animate-spin" /> : null} Look it up
                      </button>
                    )}
                  </div>
                </label>
                <AnimatePresence>
                  {found && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="mt-6 rounded-xl bg-white p-5 ring-1 ring-graphite/10">
                      <p className="text-lg font-semibold">{COMPANY.name}</p>
                      <p className="text-[14px] text-graphite/60">{COMPANY.type}</p>
                      <p className="mt-2 text-[14px] text-graphite/60">{COMPANY.address}</p>
                      <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#1f6b33]">
                        <Check className="size-4" /> Found on the CAC register · {COMPANY.since}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Step>

              <Step n={2} title="Directors and owners" done={found && peopleDone} active={found && !peopleDone}>
                <p className="mb-5 text-[15px] text-graphite/60">We found these people on your company record. Add each one’s BVN.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PEOPLE.map((p, i) => {
                    const ok = bvns[i]!.length === 11;
                    return (
                      <div key={p.name} className={`rounded-xl bg-white p-5 ring-1 transition-colors ${ok ? 'ring-[#1f6b33]/40' : 'ring-graphite/10'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-[13px] text-graphite/55">{p.role}</p>
                          </div>
                          {ok && (
                            <span className="grid size-6 place-items-center rounded-full bg-primary text-graphite">
                              <Check className="size-3.5" />
                            </span>
                          )}
                        </div>
                        <input
                          value={bvns[i]}
                          onChange={(e) => setBvns((b) => b.map((x, j) => (j === i ? e.target.value.replace(/\D/g, '').slice(0, 11) : x)))}
                          inputMode="numeric"
                          placeholder="BVN, 11 digits"
                          aria-label={`${p.name}'s BVN`}
                          className="mt-4 w-full border-b border-graphite/15 bg-transparent py-2 font-ledger text-[15px] tracking-wide outline-none focus:border-graphite"
                        />
                        <p className="mt-2 text-[12px] text-graphite/45">{ok ? 'Checked' : 'Checked against their BVN record'}</p>
                      </div>
                    );
                  })}
                </div>
              </Step>

              <Step n={3} title="How we reach you" done={found && peopleDone && detailsDone} active={found && peopleDone && !detailsDone}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className={label}>Work email</span>
                    <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className={field} />
                  </label>
                  <label className="block">
                    <span className={label}>Phone, for signing in</span>
                    <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 803 000 0000" className={field} />
                  </label>
                </div>
              </Step>

              <Step n={4} title="Your documents" done={found && peopleDone && detailsDone && docsDone} active={found && peopleDone && detailsDone && !docsDone}>
                <ul className="space-y-2">
                  {DOCS.map((d, i) => (
                    <li key={d}>
                      <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white px-5 py-4 ring-1 transition-colors ${files[i] ? 'ring-[#1f6b33]/40' : 'ring-graphite/10 hover:ring-graphite/30'}`}>
                        <span>
                          <span className="block font-medium">{d}</span>
                          <span className="block text-[13px] text-graphite/50">{files[i] ?? 'PDF or photo'}</span>
                        </span>
                        {files[i] ? <Check className="size-5 text-[#1f6b33]" /> : <FileUp className="size-5 text-graphite/45" />}
                        <input type="file" accept=".pdf,image/*" className="sr-only" onChange={(e) => setFiles((f) => f.map((x, j) => (j === i ? e.target.files?.[0]?.name ?? x : x)))} />
                      </label>
                    </li>
                  ))}
                </ul>
              </Step>

              <div className="border-t border-graphite/15 pt-8">
                <button
                  type="button"
                  disabled={!(found && peopleDone && detailsDone && docsDone)}
                  onClick={() => setSubmitted(true)}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-graphite px-6 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/20 disabled:text-graphite/45"
                >
                  Send my application <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mt-14">
              <ol className="relative space-y-8 border-l border-graphite/20 pl-8">
                {[
                  ['Application sent', 'Just now', 'done'],
                  ['Under review', 'Usually one or two working days', 'now'],
                  ['Fully open', 'We’ll tell you by email and in the app', 'next'],
                ].map(([t, b, s]) => (
                  <li key={t} className="relative">
                    <span className={`absolute -left-[41px] top-0.5 grid size-5 place-items-center rounded-full ring-4 ring-ledger ${s === 'done' ? 'bg-primary' : s === 'now' ? 'bg-graphite' : 'bg-graphite/20'}`}>
                      {s === 'now' && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
                    </span>
                    <p className={`text-xl font-semibold tracking-tight ${s === 'next' ? 'text-graphite/40' : ''}`}>{t}</p>
                    <p className="text-[14px] text-graphite/55">{b}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-12 max-w-lg text-lg leading-relaxed text-graphite/70">
                You can start using {COMPANY.name}’s account now. Some limits lift once the review is done.
              </p>
              <div className="mt-10 rounded-xl bg-white p-6 ring-1 ring-graphite/10">
                <p className="text-lg font-semibold tracking-tight">Get the Credvera app</p>
                <p className="mt-1 max-w-md text-[15px] text-graphite/60">You’ll use it to sign in here by scanning a code, and to approve payments with your PIN or Face ID.</p>
                <StoreButtons className="mt-5" />
              </div>
              <button
                type="button"
                onClick={() => {
                  signIn({ business: COMPANY.name, person: 'Adaeze', role: 'Owner' });
                  navigate('/business/app', { replace: true });
                }}
                className="group mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-graphite px-6 text-[15px] font-semibold text-white hover:bg-black"
              >
                Go to your dashboard <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
