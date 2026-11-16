import { AnimatePresence, LayoutGroup, motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { AlertCircle, Check, Mail, Minus, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import logoDark from '../../assets/logo-dark.png';
import logoLight from '../../assets/logo.png';

const ease = [0.16, 1, 0.3, 1] as const;
const naira = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const nairaWhole = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// Okafor Studios' team, the same people used across the business pages.
const owner = { name: 'Adaeze Okafor', short: 'Adaeze', initials: 'AO' };
const admin = { name: 'Tunde Bakare', short: 'Tunde', initials: 'TB' };
const payer = { name: 'Folake Adebayo', short: 'Folake', initials: 'FA' };

// ── Opening: two people on one account ──────────────────────────────────────

/** A team member's card: who they are, their role, and what that role lets them do. */
export function RoleCard({ role }: { role: 'owner' | 'admin' }) {
  const dark = role === 'owner';
  const p = dark ? owner : admin;
  return (
    <div
      className={`relative aspect-[1.586] w-full overflow-hidden rounded-2xl p-6 ${
        dark ? 'text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10' : 'text-graphite shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]'
      }`}
      style={{
        background: dark ? 'linear-gradient(135deg, #1b2520 0%, #1c1e21 55%, #0e1511 100%)' : 'linear-gradient(135deg, #fbfcfa 0%, #eef1ec 60%, #e2e7e0 100%)',
      }}
    >
      <span aria-hidden className={`pointer-events-none absolute -bottom-10 -right-2 font-ledger text-[9.5rem] font-semibold leading-none tracking-[-0.06em] ${dark ? 'text-white/[0.06]' : 'text-graphite/[0.07]'}`}>
        {p.initials}
      </span>
      <div className="relative flex items-start justify-between">
        <div>
          <img src={dark ? logoLight : logoDark} alt="Credvera" className="h-5 w-auto" />
          <p className={`mt-1 text-[10px] font-medium uppercase tracking-[0.3em] ${dark ? 'text-white/60' : 'text-graphite/55'}`}>Okafor Studios</p>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${dark ? 'bg-primary text-graphite' : 'bg-graphite text-white'}`}>{dark ? 'Owner' : 'Admin'}</span>
      </div>
      <div className="absolute inset-x-6 bottom-6">
        <p className="text-[clamp(1.1rem,2.4vw,1.45rem)] font-semibold tracking-[-0.02em]">{p.name}</p>
        <p className={`mt-1 text-[12.5px] ${dark ? 'text-white/60' : 'text-graphite/60'}`}>
          {dark ? 'Everything, including the approval limit' : 'Pays, approves others’ payments, runs the team'}
        </p>
      </div>
    </div>
  );
}

// ── Who can see, who can pay ────────────────────────────────────────────────

type Role = 'owner' | 'admin' | 'payer' | 'viewer';
const roles: { id: Role; name: string; who: string; invite: string }[] = [
  { id: 'owner', name: 'Owner', who: 'Adaeze Okafor', invite: 'The owner opened the account and stays the owner. Ownership doesn’t move.' },
  { id: 'admin', name: 'Admin', who: 'Tunde Bakare', invite: 'Only the owner makes someone an admin. A new admin can approve payments after 24 hours.' },
  { id: 'payer', name: 'Can pay', who: 'Folake Adebayo', invite: 'The owner or an admin can invite them. Payments over the limit wait for approval.' },
  { id: 'viewer', name: 'View only', who: 'Halima Sani', invite: 'Good for your accountant. They see balances and history, and can’t move money or change anything.' },
];

// What each role can do, as the business's own team page sets it.
const abilities: { what: string; who: Role[] }[] = [
  { what: 'See balances and history', who: ['owner', 'admin', 'payer', 'viewer'] },
  { what: 'Pay people, send invoices, add suppliers', who: ['owner', 'admin', 'payer'] },
  { what: 'Approve other people’s payments', who: ['owner', 'admin'] },
  { what: 'Invite people who can pay or view', who: ['owner', 'admin'] },
  { what: 'Make someone an admin', who: ['owner'] },
  { what: 'Set when payments need approval', who: ['owner'] },
  { what: 'Close the account', who: ['owner'] },
];

/** Four roles against seven things a team does. Pick a role to see its column, and how they join. */
export function PermissionsGrid() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const go = seen || !!reduce;
  const [pick, setPick] = useState<Role>('payer');
  const picked = roles.find((r) => r.id === pick)!;
  const cols = 'grid grid-cols-[minmax(0,1fr)_repeat(4,minmax(2.75rem,6.5rem))] items-center gap-x-1 sm:gap-x-2';

  return (
    <div ref={ref}>
      <LayoutGroup>
        <div className={`${cols} border-b border-graphite/15 pb-3`}>
          <span className="font-medium text-[13px] text-graphite/45">Pick a role</span>
          {roles.map((r) => (
            <button key={r.id} type="button" onClick={() => setPick(r.id)} className="relative rounded-md px-1 py-2 text-center">
              {pick === r.id && <motion.span layoutId="role-pick" className="absolute inset-0 rounded-md bg-graphite" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
              <span className={`relative block text-[12px] font-semibold leading-tight transition-colors sm:text-[13.5px] ${pick === r.id ? 'text-white' : 'text-graphite/60 hover:text-graphite'}`}>
                {r.name}
              </span>
            </button>
          ))}
        </div>
        <ul className="divide-y divide-graphite/10">
          {abilities.map((a, row) => (
            <li key={a.what} className={`${cols} py-3.5`}>
              <span className={`pr-2 text-[14px] transition-colors sm:text-[15.5px] ${a.who.includes(pick) ? 'text-graphite' : 'text-graphite/40'}`}>{a.what}</span>
              {roles.map((r, col) => {
                const yes = a.who.includes(r.id);
                return (
                  <span key={r.id} className={`relative grid h-9 place-items-center rounded-md transition-colors duration-300 ${pick === r.id ? 'bg-white' : ''}`}>
                    <motion.span
                      initial={reduce ? false : { scale: 0, opacity: 0 }}
                      animate={go ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.35, ease, delay: 0.1 + row * 0.07 + col * 0.04 }}
                      className={`grid size-6 place-items-center rounded-full ${yes ? (pick === r.id ? 'bg-primary text-graphite' : 'bg-graphite text-white') : 'text-graphite/25'}`}
                    >
                      {yes ? <Check className="size-3.5" strokeWidth={2.5} /> : <Minus className="size-3.5" />}
                    </motion.span>
                  </span>
                );
              })}
            </li>
          ))}
        </ul>
      </LayoutGroup>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pick}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease }}
          className="mt-8 flex flex-wrap items-center gap-4 rounded-xl bg-white px-5 py-4 ring-1 ring-graphite/10"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ledger text-[12px] font-semibold">
            {picked.who
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">
              {picked.who} · {picked.name}
            </span>
            <span className="block text-[13.5px] text-graphite/60">{picked.invite}</span>
          </span>
          {pick !== 'owner' && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-ledger px-2.5 py-1 text-[12.5px] font-medium text-graphite/70">
              <Mail className="size-3.5" /> Invited by email · open 7 days
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Over the limit, two people decide ───────────────────────────────────────

const LIMIT = 500_000;
const amounts = [85_000, 850_000];
type Stage = 'draft' | 'waiting' | 'approved' | 'sent' | 'sentBack' | 'withdrawn';
const columns = ['Asked', 'Approved', 'Sent'] as const;
const columnOf = (s: Stage) => (s === 'approved' ? 1 : s === 'sent' ? 2 : 0);

/** One payment from someone who can pay, under or over the limit, and what each person on the team can do with it. */
export function ApprovalFlow() {
  const [amount, setAmount] = useState(850_000);
  const [stage, setStage] = useState<Stage>('draft');
  const [selfTry, setSelfTry] = useState(false);
  const over = amount >= LIMIT;

  // An approved payment goes a moment later, from the balance as it stands.
  useEffect(() => {
    if (stage !== 'approved') return;
    const t = window.setTimeout(() => setStage('sent'), 1100);
    return () => clearTimeout(t);
  }, [stage]);

  const reset = (next = amount) => {
    setAmount(next);
    setStage('draft');
    setSelfTry(false);
  };
  const ask = () => {
    setSelfTry(false);
    setStage(over ? 'waiting' : 'sent');
  };

  const pill: Record<Stage, { label: string; tone: string }> = {
    draft: { label: 'Not sent yet', tone: 'bg-graphite/10 text-graphite/60' },
    waiting: { label: 'Waiting', tone: 'bg-[#fbf5e6] text-[#8a5a00]' },
    approved: { label: 'Approved', tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
    sent: { label: 'Sent', tone: 'bg-primary text-graphite' },
    sentBack: { label: 'Sent back', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
    withdrawn: { label: 'Withdrawn', tone: 'bg-graphite/10 text-graphite/60' },
  };

  const card = (
    <motion.div layoutId="approval-card" transition={{ type: 'spring', stiffness: 220, damping: 28 }} className="rounded-xl bg-white p-4 text-graphite shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13.5px] font-semibold">Lagos Print Hub</span>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11.5px] font-semibold ${pill[stage].tone}`}>{pill[stage].label}</span>
      </div>
      <p className="mt-2 font-ledger text-[18px] font-semibold tabular-nums">{naira(amount)}</p>
      <p className="mt-1 text-[12px] text-graphite/55">Asked by {payer.name}</p>
      {stage === 'waiting' && <p className="mt-1 text-[12px] text-graphite/45">Lapses in 3 days</p>}
      {stage === 'sentBack' && <p className="mt-1 text-[12px] text-[#9a3a17]">“Wrong invoice number” · {admin.short}</p>}
      {stage === 'sent' && over && <p className="mt-1 text-[12px] text-graphite/55">Approved by {admin.name}</p>}
    </motion.div>
  );

  const btn = 'rounded-md px-3.5 py-2 text-[13.5px] font-semibold transition-colors';

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
      <div>
        <p className="font-medium text-[13px] text-white/45">Approval limit · set by the owner</p>
        <p className="mt-3 font-ledger text-[clamp(2.6rem,6vw,4.4rem)] font-medium leading-none tabular-nums tracking-[-0.05em]">{nairaWhole(LIMIT)}</p>
        <p className="mt-3 text-[14px] text-white/55">Payments of this or more wait for a second person.</p>

        <div className="mt-10 border-t border-white/15 pt-6">
          <p className="text-lg font-semibold">{payer.short} pays Lagos Print Hub</p>
          <div className="mt-3 flex gap-2">
            {amounts.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => reset(a)}
                className={`rounded-md px-3 py-1.5 font-ledger text-[13px] transition-colors ${a === amount ? 'bg-white text-graphite' : 'text-white/65 ring-1 ring-white/20 hover:bg-white/10'}`}
              >
                {nairaWhole(a)}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-[132px]">
            <AnimatePresence mode="wait" initial={false}>
              {stage === 'draft' && (
                <motion.div key="draft" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <button type="button" onClick={ask} className={`${btn} bg-white text-graphite hover:bg-white/90`}>
                    Confirm with {payer.short}’s PIN
                  </button>
                  <p className="mt-3 text-[13.5px] text-white/50">{over ? 'Over the limit, so nothing moves yet.' : 'Under the limit, so it goes straight away.'}</p>
                </motion.div>
              )}
              {stage === 'waiting' && (
                <motion.div key="waiting" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="flex items-center gap-2 text-[13.5px] text-white/65">
                    <Mail className="size-4 text-primary" /> {owner.short} and {admin.short} are emailed
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setStage('approved')} className={`${btn} bg-primary text-graphite hover:bg-primary/90`}>
                      Approve as {admin.short}
                    </button>
                    <button type="button" onClick={() => setStage('sentBack')} className={`${btn} text-white ring-1 ring-white/20 hover:bg-white/10`}>
                      Send back as {admin.short}
                    </button>
                    <button type="button" onClick={() => setSelfTry(true)} className={`${btn} text-white/70 ring-1 ring-white/20 hover:bg-white/10`}>
                      Approve as {payer.short}
                    </button>
                    <button type="button" onClick={() => setStage('withdrawn')} className={`${btn} text-white/70 ring-1 ring-white/20 hover:bg-white/10`}>
                      Withdraw as {payer.short}
                    </button>
                  </div>
                  <AnimatePresence>
                    {selfTry && (
                      <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-2 text-[13px] text-[#f5c451]">
                        <AlertCircle className="size-4 shrink-0" /> You asked for this payment. Someone else has to approve it.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {(stage === 'approved' || stage === 'sent' || stage === 'sentBack' || stage === 'withdrawn') && (
                <motion.div key="end" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className={`text-[14.5px] font-semibold ${stage === 'sentBack' ? 'text-[#f5c451]' : 'text-primary'}`}>
                    {stage === 'sentBack'
                      ? 'Sent back with a reason. Nothing was sent.'
                      : stage === 'withdrawn'
                        ? 'Withdrawn. Nothing was sent.'
                        : over
                          ? `Approved with ${admin.short}’s own PIN, then sent.`
                          : 'Sent. No approval needed.'}
                  </p>
                  <button type="button" onClick={() => reset()} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/60 hover:text-white">
                    <RotateCcw className="size-3.5" /> Try again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* The payment's path */}
      <LayoutGroup>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {columns.map((c, i) => {
            const here = columnOf(stage) === i;
            const skipped = i === 1 && !over && stage === 'sent';
            const reached = columnOf(stage) >= i && stage !== 'draft' && stage !== 'withdrawn' && stage !== 'sentBack';
            return (
              <div key={c} className="min-w-0">
                <div className="flex items-center gap-2 border-b border-white/15 pb-3">
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors ${reached && !skipped ? 'bg-primary text-graphite' : 'bg-white/10 text-white/50'}`}>
                    {reached && !skipped ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`truncate text-[13px] font-semibold ${reached && !skipped ? 'text-white' : 'text-white/45'}`}>{c}</span>
                </div>
                <div className="mt-4 min-h-[150px] rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/10 sm:p-3">
                  {here && card}
                  {skipped && <p className="p-2 text-[12px] leading-snug text-white/40">Not needed under the limit</p>}
                </div>
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

// ── Every decision, with a name on it ───────────────────────────────────────

const decisions = [
  { date: '14 Nov', to: 'Lagos Print Hub', asked: payer.name, amount: 850_000, status: 'Approved', by: admin.name, note: null, tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
  { date: '12 Nov', to: 'Adebayo Logistics', asked: payer.name, amount: 640_000, status: 'Sent back', by: owner.name, note: 'Wrong invoice number', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
  { date: '10 Nov', to: 'Emeka Obi', asked: admin.name, amount: 520_000, status: 'Approved', by: owner.name, note: null, tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
  { date: '6 Nov', to: 'Studio rent', asked: payer.name, amount: 600_000, status: 'Withdrawn', by: null, note: null, tone: 'bg-[#efeee7] text-graphite/55' },
  { date: '2 Nov', to: 'Ngozi Umeh', asked: payer.name, amount: 510_000, status: 'Lapsed', by: null, note: null, tone: 'bg-[#efeee7] text-graphite/55' },
];

/** The approvals record writing itself: who asked, who decided, and what they said. */
export function DecisionLog() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const go = seen || !!reduce;
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl bg-white ring-1 ring-graphite/10">
      <div className="flex items-center justify-between border-b border-graphite/10 bg-ledger/60 px-5 py-3.5">
        <span className="text-[13.5px] font-semibold">Approvals · Decided</span>
        <span className="text-[12px] text-graphite/50">Okafor Studios</span>
      </div>
      <ul className="divide-y divide-graphite/[0.07]">
        {decisions.map((d, i) => (
          <motion.li
            key={d.date + d.to}
            initial={reduce ? false : { opacity: 0, x: -12 }}
            animate={go ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.18 }}
            className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 px-5 py-4"
          >
            <span className="min-w-0">
              <span className="block truncate text-[14.5px] font-medium">{d.to}</span>
              <span className="block truncate text-[12.5px] text-graphite/50">
                {d.date} · asked by {d.asked}
              </span>
            </span>
            <span className="text-right font-ledger text-[14px] font-medium tabular-nums">{naira(d.amount)}</span>
            <span className="col-span-2 text-[13px]">
              <span className={`rounded-md px-2 py-0.5 font-medium ${d.tone}`}>{d.status}</span>
              {d.by && <span className="ml-2 text-graphite/55">by {d.by}</span>}
              {d.note && <span className="ml-2 text-graphite/55">“{d.note}”</span>}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
