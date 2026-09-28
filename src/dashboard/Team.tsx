import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { inviteMember, money, removeMember, setRules, shortDate, updateMember, useDash, type Role } from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

const ROLES: { role: Role; about: string }[] = [
  { role: 'Owner', about: 'Everything, including the team and settings.' },
  { role: 'Admin', about: 'Everything except removing the owner.' },
  { role: 'Finance', about: 'Pays, invoices and converts. Big payments need approval.' },
  { role: 'Staff', about: 'Uses the card they’re given, and sees their own spending.' },
  { role: 'Accountant', about: 'Sees everything and downloads statements. Can’t move money.' },
];

// Who can do what. Approving is set separately, on the right.
const MATRIX: { can: string; roles: Role[] }[] = [
  { can: 'See balances and transactions', roles: ['Owner', 'Admin', 'Finance', 'Accountant'] },
  { can: 'Pay someone and pay bills', roles: ['Owner', 'Admin', 'Finance'] },
  { can: 'Send invoices and payment links', roles: ['Owner', 'Admin', 'Finance'] },
  { can: 'Convert currencies', roles: ['Owner', 'Admin', 'Finance'] },
  { can: 'Use a card', roles: ['Owner', 'Admin', 'Finance', 'Staff'] },
  { can: 'Create cards and set limits', roles: ['Owner', 'Admin'] },
  { can: 'Download statements', roles: ['Owner', 'Admin', 'Finance', 'Accountant'] },
  { can: 'Invite people and change roles', roles: ['Owner', 'Admin'] },
];

const initials = (n: string) =>
  n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

function People() {
  const { team, session } = useDash();
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Finance');
  const [done, setDone] = useState<string | null>(null);
  const say = (t: string) => {
    setDone(t);
    window.setTimeout(() => setDone(null), 3500);
  };
  const isMe = (n: string) => !!session && n.startsWith(session.person);

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite/10 p-5">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">People</h2>
          <p className="text-[13.5px] text-graphite/55">Everyone who can see or use the business’s money, and what they’re allowed to do.</p>
        </div>
        <button type="button" onClick={() => setInviting(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> Invite someone
        </button>
      </div>
      <AnimatePresence>
        {done && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 border-b border-[#cfe8c9] bg-[#eef8ea] px-5 py-3 text-[14px] font-medium text-[#1f6b33]">
            <Check className="size-4" /> {done}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
              <th className="py-3 pl-5 pr-4 font-medium">Person</th>
              <th className="py-3 pr-4 font-medium">Role</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-5" />
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id} className="border-b border-graphite/[0.06] last:border-0">
                <td className="py-3.5 pl-5 pr-4">
                  <span className="flex items-center gap-3">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${m.status === 'invited' ? 'border border-dashed border-graphite/30 text-graphite/50' : 'bg-[#efeee7]'}`}>{initials(m.name)}</span>
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {m.name} {isMe(m.name) && <span className="font-normal text-graphite/45">(you)</span>}
                      </span>
                      <span className="block text-[12.5px] text-graphite/45">{m.email}</span>
                    </span>
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  {m.role === 'Owner' ? (
                    <span className="font-medium">Owner</span>
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => {
                        updateMember(m.id, { role: e.target.value as Role });
                        say(`${m.name.split(' ')[0]} is now ${e.target.value}.`);
                      }}
                      className="h-9 rounded-lg border border-graphite/15 bg-white px-2.5 text-[13.5px] font-medium outline-none hover:border-graphite/30"
                      aria-label={`${m.name}'s role`}
                    >
                      {ROLES.filter((r) => r.role !== 'Owner').map((r) => (
                        <option key={r.role}>{r.role}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="py-3.5 pr-4">
                  {m.status === 'invited' ? (
                    <span className="rounded-md bg-[#fbf0d6] px-2 py-0.5 text-[12px] font-medium text-[#8a5a00]">Invite sent</span>
                  ) : (
                    <span className="text-[13px] text-graphite/55">Active {m.lastActive && Date.now() - new Date(m.lastActive).getTime() < 86400000 ? 'today' : m.lastActive ? shortDate(m.lastActive) : ''}</span>
                  )}
                </td>
                <td className="py-3.5 pr-5 text-right">
                  <span className="inline-flex gap-1">
                    {m.status === 'invited' && (
                      <button type="button" onClick={() => say(`Invite sent again to ${m.email}.`)} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-graphite/60 hover:bg-graphite/5 hover:text-graphite">
                        <Send className="size-3.5" /> Resend
                      </button>
                    )}
                    {m.role !== 'Owner' && !isMe(m.name) && (
                      <button
                        type="button"
                        onClick={() => {
                          removeMember(m.id);
                          say(`${m.name} no longer has access.`);
                        }}
                        aria-label={`Remove ${m.name}`}
                        className="grid size-8 place-items-center rounded-md text-graphite/45 hover:bg-[#f6e7e0] hover:text-[#9a3a17]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {inviting && (
          <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInviting(false)}>
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Invite someone"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
                <p className="text-[15px] font-semibold">Invite someone</p>
                <button type="button" onClick={() => setInviting(false)} aria-label="Close" className="text-graphite/45 hover:text-graphite">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Work email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                </label>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-graphite/60">Role</span>
                  <div className="space-y-2">
                    {ROLES.filter((r) => r.role !== 'Owner').map((r) => (
                      <label key={r.role} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${role === r.role ? 'border-graphite bg-[#faf9f5]' : 'border-graphite/12 hover:border-graphite/30'}`}>
                        <input type="radio" name="role" checked={role === r.role} onChange={() => setRole(r.role)} className="mt-0.5 accent-[#141c17]" />
                        <span>
                          <span className="block text-[14.5px] font-semibold">{r.role}</span>
                          <span className="block text-[13px] text-graphite/55">{r.about}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-graphite/10 px-6 py-5">
                <button
                  type="button"
                  disabled={name.trim().length < 2 || !/\S+@\S+\.\S+/.test(email)}
                  onClick={() => {
                    // TODO(credvera): the invite email comes from the API; they verify with their BVN before getting access.
                    inviteMember({ name: name.trim(), email: email.trim(), role });
                    setInviting(false);
                    say(`Invite sent to ${email.trim()}.`);
                    setName('');
                    setEmail('');
                  }}
                  className="h-11 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40"
                >
                  Send the invite
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const LIMITS = [100000, 250000, 500000, 1000000, 2500000];

function Roles() {
  const { rules } = useDash();
  const [pending, setPending] = useState<{ over?: number; approvers?: Role[] } | null>(null);
  const [saved, setSaved] = useState(false);
  const change = (c: { over?: number; approvers?: Role[] }) => setPending(c);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
      <section className={`${panel} h-fit p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Approvals</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Big payments wait for a second person before they go. Nobody can approve their own.</p>

        <p className="mt-6 text-[13px] font-medium text-graphite/60">A second person approves payments of</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LIMITS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => l !== rules.over && change({ over: l })}
              className={`rounded-lg border px-3 py-2 font-ledger text-[14px] font-medium transition-colors ${rules.over === l ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 hover:border-graphite/35'}`}
            >
              {money(l).replace(/\.00$/, '')}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-graphite/50">or more, in naira terms.</p>

        <p className="mt-6 text-[13px] font-medium text-graphite/60">Who can approve</p>
        <div className="mt-2 space-y-2">
          {(['Owner', 'Admin', 'Finance'] as Role[]).map((r) => {
            const on = rules.approvers.includes(r);
            return (
              <label key={r} className="flex cursor-pointer items-center gap-3 text-[14.5px]">
                <input
                  type="checkbox"
                  checked={on}
                  disabled={r === 'Owner'}
                  onChange={() => change({ approvers: on ? rules.approvers.filter((x) => x !== r) : [...rules.approvers, r] })}
                  className="size-4 accent-[#141c17] disabled:opacity-50"
                />
                {r}
                {r === 'Owner' && <span className="text-[12.5px] text-graphite/45">always</span>}
              </label>
            );
          })}
        </div>
        <AnimatePresence>
          {saved && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 flex items-center gap-2 text-[13.5px] font-medium text-[#1f6b33]">
              <Check className="size-4" /> Saved. New payments follow it straight away.
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      <section className={`${panel} overflow-x-auto p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Who can do what</h2>
        <table className="mt-4 w-full min-w-[560px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/50">
              <th className="py-2.5 pr-3 font-medium" />
              {ROLES.map((r) => (
                <th key={r.role} className="px-2 py-2.5 text-center font-medium">
                  {r.role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...MATRIX, { can: `Approve payments of ${money(rules.over).replace(/\.00$/, '')} or more`, roles: rules.approvers }].map((row) => (
              <tr key={row.can} className="border-b border-graphite/[0.06] last:border-0">
                <td className="py-3 pr-3 text-graphite/75">{row.can}</td>
                {ROLES.map((r) => (
                  <td key={r.role} className="px-2 py-3 text-center">
                    {row.roles.includes(r.role) ? <Check className="mx-auto size-4 text-[#1f6b33]" /> : <Minus className="mx-auto size-4 text-graphite/20" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <PinPrompt
        open={!!pending}
        title="Change the approval rules"
        detail={pending?.over ? `Approve payments of ${money(pending.over).replace(/\.00$/, '')} or more` : 'Change who can approve'}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) setRules(pending);
          setPending(null);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 3000);
        }}
      />
    </div>
  );
}

const SECTIONS = [
  { to: '/business/app/team', label: 'People', end: true },
  { to: '/business/app/team/roles', label: 'Roles and approvals' },
];

/** Team: who has access, what each role can do, and who approves big payments. */
export default function Team() {
  const { section } = useParams();
  const { session } = useDash();
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Team</h1>
      <p className="mt-1 text-[15px] text-graphite/55">Who has access, what they can do, and who approves big payments.</p>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite/10" aria-label="Team">
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
      <motion.div key={section ?? 'people'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
        {section === 'roles' ? <Roles /> : <People />}
      </motion.div>
    </div>
  );
}
