import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Loader2, Minus, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  activeBusiness,
  errorMessage,
  useChangeRole,
  useInvite,
  useRemoveMember,
  useRevokeInvitation,
  useSetThreshold,
  useTeam,
  type BusinessRole,
  type InviteResult,
  type TeamDto,
  type TeamRole,
} from '../api';
import { useActiveBusiness } from './data';
import { money, shortDate } from './model';
import { Modal } from './money';
import { field, initials, label, NairaInput, nairaFrom, panel } from './pay/shared';

const ease = [0.16, 1, 0.3, 1] as const;
const secondary = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 text-[13.5px] font-semibold transition-colors hover:border-graphite/35 disabled:opacity-40';

/** What each role can do, as the people choosing one need to read it. */
export const ROLES: Record<BusinessRole, { name: string; about: string }> = {
  owner: { name: 'Owner', about: 'Opened the account. Everything, including closing it.' },
  admin: { name: 'Admin', about: 'Pays, approves others’ payments, and runs the team.' },
  payer: { name: 'Can pay', about: 'Makes payments, invoices and suppliers. Big payments wait for approval.' },
  viewer: { name: 'View only', about: 'Sees balances and history. Can’t move money or change anything.' },
};
const ALL_ROLES: BusinessRole[] = ['owner', 'admin', 'payer', 'viewer'];
const TEAM_ROLES: TeamRole[] = ['admin', 'payer', 'viewer'];

// Who can do what, as the API enforces it. Approving big payments is the
// last row, filled in from the limit.
const MATRIX: { can: string; roles: BusinessRole[] }[] = [
  { can: 'See balances and transactions', roles: ['owner', 'admin', 'payer', 'viewer'] },
  { can: 'Pay someone and pay bills', roles: ['owner', 'admin', 'payer'] },
  { can: 'Send invoices and payment links', roles: ['owner', 'admin', 'payer'] },
  { can: 'Add and pay suppliers', roles: ['owner', 'admin', 'payer'] },
  { can: 'Invite people and change roles', roles: ['owner', 'admin'] },
  { can: 'Set the approval limit', roles: ['owner', 'admin'] },
  { can: 'Close the account', roles: ['owner'] },
];

type MemberDto = TeamDto['members'][number];
type InvitationDto = TeamDto['invitations'][number];

function People({ t, closed }: { t: TeamDto; closed: boolean }) {
  const [inviting, setInviting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const say = (text: string) => {
    setDone(text);
    window.setTimeout(() => setDone(null), 3500);
  };

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite/10 p-5">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">People</h2>
          <p className="text-[13.5px] text-graphite/55">Everyone who can see or use the business’s money. Each signs in with their own Credvera account and confirms with their own PIN.</p>
        </div>
        {t.you.canManage && !closed && (
          <button type="button" onClick={() => setInviting(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
            <Plus className="size-4" /> Invite someone
          </button>
        )}
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
            {t.members.map((m) => (
              <MemberRow key={m.userId} m={m} you={t.you.userId === m.userId} canManage={t.you.canManage} say={say} />
            ))}
            {t.invitations.map((i) => (
              <InvitationRow key={i.id} i={i} canManage={t.you.canManage} say={say} />
            ))}
          </tbody>
        </table>
      </div>

      <InviteDrawer open={inviting} onClose={() => setInviting(false)} />
    </section>
  );
}

function MemberRow({ m, you, canManage, say }: { m: MemberDto; you: boolean; canManage: boolean; say: (t: string) => void }) {
  const change = useChangeRole();
  const remove = useRemoveMember();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const owner = m.role === 'owner';
  const first = m.name.split(' ')[0];

  return (
    <tr className="border-b border-graphite/[0.06] last:border-0">
      <td className="py-3.5 pl-5 pr-4">
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[12px] font-semibold">{initials(m.name)}</span>
          <span className="min-w-0">
            <span className="block font-medium">
              {m.name} {you && <span className="font-normal text-graphite/45">(you)</span>}
            </span>
            <span className="block text-[12.5px] text-graphite/45">{m.email}</span>
          </span>
        </span>
        {change.error && <p className="mt-1.5 text-[13px] text-[#a3261b]">{errorMessage(change.error)}</p>}
      </td>
      <td className="py-3.5 pr-4">
        {canManage && !owner && !you ? (
          <select
            value={m.role}
            disabled={change.isPending}
            onChange={(e) => {
              const role = e.target.value as TeamRole;
              change.mutate({ userId: m.userId, role }, { onSuccess: () => say(`${first} is now ${ROLES[role].name.toLowerCase()}.`) });
            }}
            className="h-9 rounded-lg border border-graphite/15 bg-white px-2.5 text-[13.5px] font-medium outline-none hover:border-graphite/30"
            aria-label={`${m.name}'s role`}
          >
            {TEAM_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLES[r].name}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-medium">{ROLES[m.role].name}</span>
        )}
      </td>
      <td className="py-3.5 pr-4">
        <span className="text-[13px] text-graphite/55">{owner ? 'Opened the account' : `Joined ${shortDate(m.joinedAt)}`}</span>
      </td>
      <td className="py-3.5 pr-5 text-right">
        {!owner && (canManage || you) && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={you ? 'Leave this business' : `Remove ${m.name}`}
            className={you ? 'h-8 rounded-md px-2 text-[13px] font-semibold text-[#9a3a17] hover:bg-[#f6e7e0]' : 'grid size-8 place-items-center rounded-md text-graphite/45 hover:bg-[#f6e7e0] hover:text-[#9a3a17]'}
          >
            {you ? 'Leave' : <Trash2 className="size-4" />}
          </button>
        )}
        <Modal open={confirming} title={you ? 'Leave this business?' : `Remove ${m.name}?`} onClose={() => setConfirming(false)}>
          <p className="text-left text-[14.5px] text-graphite/65">
            {you ? 'You’ll lose access to this business’s account straight away. Someone would have to invite you again.' : `${m.name} loses access to this business’s account straight away. Anything they did stays on record.`}
          </p>
          {remove.error && <p className="mt-3 text-left text-[13.5px] text-[#a3261b]">{errorMessage(remove.error)}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirming(false)} className={secondary}>
              Cancel
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(m.userId, {
                  onSuccess: () => {
                    setConfirming(false);
                    if (you) {
                      activeBusiness.set(null);
                      navigate('/business/app');
                    } else say(`${m.name} no longer has access.`);
                  },
                })
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#a3261b] px-3.5 text-[13.5px] font-semibold text-white hover:bg-[#8f1c13] disabled:opacity-40"
            >
              {remove.isPending && <Loader2 className="size-4 animate-spin" />} {you ? 'Leave' : 'Remove'}
            </button>
          </div>
        </Modal>
      </td>
    </tr>
  );
}

function InvitationRow({ i, canManage, say }: { i: InvitationDto; canManage: boolean; say: (t: string) => void }) {
  const revoke = useRevokeInvitation();
  return (
    <tr className="border-b border-graphite/[0.06] last:border-0">
      <td className="py-3.5 pl-5 pr-4">
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-graphite/30 text-[12px] font-semibold text-graphite/50">{i.email[0]!.toUpperCase()}</span>
          <span className="min-w-0">
            <span className="block font-medium">{i.email}</span>
            <span className="block text-[12.5px] text-graphite/45">Invited{i.invitedBy ? ` by ${i.invitedBy}` : ''}</span>
          </span>
        </span>
        {revoke.error && <p className="mt-1.5 text-[13px] text-[#a3261b]">{errorMessage(revoke.error)}</p>}
      </td>
      <td className="py-3.5 pr-4 font-medium text-graphite/70">{ROLES[i.role].name}</td>
      <td className="py-3.5 pr-4">
        <span className="rounded-md bg-[#fbf0d6] px-2 py-0.5 text-[12px] font-medium text-[#8a5a00]">Invite sent</span>
        <span className="ml-2 text-[12.5px] text-graphite/45">open until {shortDate(i.expiresAt)}</span>
      </td>
      <td className="py-3.5 pr-5 text-right">
        {canManage && (
          <button
            type="button"
            disabled={revoke.isPending}
            onClick={() => revoke.mutate(i.id, { onSuccess: () => say(`The invite to ${i.email} is withdrawn.`) })}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-graphite/60 hover:bg-graphite/5 hover:text-graphite disabled:opacity-40"
          >
            Withdraw
          </button>
        )}
      </td>
    </tr>
  );
}

/** Invite by email, from the side. Accepted signed in with that same email. */
function InviteDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invite = useInvite();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('payer');
  const [sent, setSent] = useState<{ email: string; result: InviteResult } | null>(null);
  const [copied, setCopied] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const close = () => {
    setEmail('');
    setRole('payer');
    setSent(null);
    setCopied(false);
    invite.reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
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
              <p className="text-[15px] font-semibold">{sent ? (sent.result.delivered && !sent.result.link ? 'Invite sent' : 'Invite ready') : 'Invite someone'}</p>
              <button type="button" onClick={close} aria-label="Close" className="text-graphite/45 hover:text-graphite">
                <X className="size-5" />
              </button>
            </div>

            {sent ? (
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 text-[14.5px]">
                <p className="text-graphite/70">
                  {sent.result.delivered ? `We emailed ${sent.email} a link to join.` : `The email to ${sent.email} didn’t go out.`} They accept it signed in to Credvera with that email address; if they don’t have an account, they can create one first.
                </p>
                {sent.result.link && (
                  <div className="rounded-lg bg-[#f5f4ef] p-3">
                    <p className="text-[12.5px] text-graphite/55">The link, to send them yourself:</p>
                    <p className="mt-1 break-all font-ledger text-[13px]">{sent.result.link}</p>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(sent.result.link!);
                        setCopied(true);
                      }}
                      className={`${secondary} mt-2`}
                    >
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form
                id="invite"
                className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!valid) return;
                  invite.mutate({ email: email.trim(), role }, { onSuccess: (result) => setSent({ email: email.trim(), result }) });
                }}
              >
                <label className="block">
                  <span className={label}>Work email</span>
                  <input type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tunde@yourbusiness.ng" className={field} />
                </label>
                <div>
                  <span className={label}>Role</span>
                  <div className="space-y-2">
                    {TEAM_ROLES.map((r) => (
                      <label key={r} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${role === r ? 'border-graphite bg-[#faf9f5]' : 'border-graphite/12 hover:border-graphite/30'}`}>
                        <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="mt-0.5 accent-[#141c17]" />
                        <span>
                          <span className="block text-[14.5px] font-semibold">{ROLES[r].name}</span>
                          <span className="block text-[13px] text-graphite/55">{ROLES[r].about}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {invite.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(invite.error)}</p>}
              </form>
            )}

            <div className="border-t border-graphite/10 px-6 py-5">
              {sent ? (
                <button type="button" onClick={close} className="h-11 w-full rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black">
                  Done
                </button>
              ) : (
                <button type="submit" form="invite" disabled={!valid || invite.isPending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40">
                  {invite.isPending && <Loader2 className="size-4 animate-spin" />} Send the invite
                </button>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const LIMITS = [100000, 250000, 500000, 1000000, 2500000];
const short = (n: number) => money(n).replace(/\.00$/, '');

function Roles({ t, closed }: { t: TeamDto; closed: boolean }) {
  const set = useSetThreshold();
  const threshold = t.approvalThreshold === null ? null : Number(t.approvalThreshold);
  const [own, setOwn] = useState('');
  const custom = nairaFrom(own);
  const [saved, setSaved] = useState(false);
  const canSet = t.you.canManage && !closed && t.approvers >= 2;
  const save = (value: number | null) =>
    set.mutate(value === null ? null : String(value), {
      onSuccess: () => {
        setOwn('');
        setSaved(true);
        window.setTimeout(() => setSaved(false), 3000);
      },
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
      <section className={`${panel} h-fit p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Approvals</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Big payments wait for a second person before they go. Nobody can approve their own.</p>

        {t.approvers < 2 ? (
          <p className="mt-6 rounded-lg bg-[#f5f4ef] px-3.5 py-3 text-[13.5px] text-graphite/70">
            Approvals need two people who can approve, so neither waits on themselves: the owner and at least one admin. Invite an admin under People.
          </p>
        ) : (
          <>
            <p className="mt-6 text-[13px] font-medium text-graphite/60">A second person approves payments of</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LIMITS.map((l) => (
                <button
                  key={l}
                  type="button"
                  disabled={!canSet || set.isPending}
                  onClick={() => l !== threshold && save(l)}
                  className={`rounded-lg border px-3 py-2 font-ledger text-[14px] font-medium transition-colors disabled:cursor-default ${threshold === l ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 enabled:hover:border-graphite/35'}`}
                >
                  {short(l)}
                </button>
              ))}
            </div>
            {canSet && (
              <div className="mt-3 flex gap-2">
                <div className="flex-1">
                  <NairaInput value={custom} onChange={setOwn} />
                </div>
                <button type="button" disabled={custom < 1000 || custom === threshold || set.isPending} onClick={() => save(custom)} className={`${secondary} h-11`}>
                  Use this
                </button>
              </div>
            )}
            <p className="mt-2 text-[13px] text-graphite/50">
              {threshold === null ? 'Off: every payment goes as soon as it’s confirmed.' : !LIMITS.includes(threshold) ? `Now ${short(threshold)} or more, in naira.` : 'or more, in naira.'}
            </p>
            {canSet && threshold !== null && (
              <button type="button" disabled={set.isPending} onClick={() => save(null)} className="mt-3 text-[13.5px] font-semibold text-graphite/60 underline-offset-4 hover:text-graphite hover:underline">
                Turn approvals off
              </button>
            )}
          </>
        )}

        <p className="mt-6 text-[13px] font-medium text-graphite/60">Who can approve</p>
        <div className="mt-2 space-y-2">
          {(['owner', 'admin', 'payer'] as BusinessRole[]).map((r) => (
            <label key={r} className="flex items-center gap-3 text-[14.5px]">
              <input type="checkbox" checked={r !== 'payer'} disabled className="size-4 accent-[#141c17] disabled:opacity-50" />
              {ROLES[r].name}
              {r !== 'payer' && <span className="text-[12.5px] text-graphite/45">always</span>}
            </label>
          ))}
        </div>

        {!t.you.canManage && <p className="mt-5 text-[13px] text-graphite/50">The owner or an admin sets the limit.</p>}
        {set.error && <p className="mt-4 text-[13px] text-[#a3261b]">{errorMessage(set.error)}</p>}
        <AnimatePresence>
          {saved && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 flex items-center gap-2 text-[13.5px] font-medium text-[#1f6b33]">
              <Check className="size-4" /> Saved. New payments follow it straight away.
            </motion.p>
          )}
        </AnimatePresence>
        <p className="mt-5 text-[12.5px] text-graphite/45">
          Bank transfers and supplier payments. Airtime, data and electricity aren’t held. What’s waiting is under{' '}
          <Link to="/business/app/approvals" className="font-semibold text-graphite/60 underline-offset-4 hover:text-graphite hover:underline">
            Approvals
          </Link>
          .
        </p>
      </section>

      <section className={`${panel} overflow-x-auto p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Who can do what</h2>
        <table className="mt-4 w-full min-w-[520px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/50">
              <th className="py-2.5 pr-3 font-medium" />
              {ALL_ROLES.map((r) => (
                <th key={r} className="px-2 py-2.5 text-center font-medium">
                  {ROLES[r].name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...MATRIX, { can: threshold === null ? 'Approve big payments, once approvals are on' : `Approve payments of ${short(threshold)} or more`, roles: ['owner', 'admin'] as BusinessRole[] }].map((row) => (
              <tr key={row.can} className="border-b border-graphite/[0.06] last:border-0">
                <td className="py-3 pr-3 text-graphite/75">{row.can}</td>
                {ALL_ROLES.map((r) => (
                  <td key={r} className="px-2 py-3 text-center">
                    {row.roles.includes(r) ? <Check className="mx-auto size-4 text-[#1f6b33]" /> : <Minus className="mx-auto size-4 text-graphite/20" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[12.5px] text-graphite/45">Whoever asks for a big payment can’t approve it, whatever their role.</p>
      </section>
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
  const business = useActiveBusiness();
  const team = useTeam();
  const t = team.data;
  const closed = !!business?.closedAt;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{business?.name}</p>
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
        {team.isLoading ? (
          <Loader2 className="mx-auto mt-8 size-5 animate-spin text-graphite/40" aria-label="Loading" />
        ) : team.error ? (
          <p className="mt-4 text-center text-[14px] text-[#a3261b]">{errorMessage(team.error)}</p>
        ) : t ? (
          section === 'roles' ? <Roles t={t} closed={closed} /> : <People t={t} closed={closed} />
        ) : null}
      </motion.div>
    </div>
  );
}
