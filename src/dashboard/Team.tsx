import { Check, Copy, Loader2, Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeBusiness, errorMessage, useChangeRole, useInvite, useRemoveMember, useRevokeInvitation, useTeam, type BusinessRole, type InviteResult, type TeamRole } from '../api';
import { useActiveBusiness } from './data';
import { shortDate } from './model';
import { Modal } from './money';
import { field, initials, label, panel, primary } from './pay/shared';

const secondary = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 text-[13.5px] font-semibold transition-colors hover:border-graphite/35 disabled:opacity-40';

/** What each role can do, as the people choosing one need to read it. */
export const ROLES: Record<BusinessRole, { name: string; about: string }> = {
  owner: { name: 'Owner', about: 'Opened the account. Everything, including closing it.' },
  admin: { name: 'Admin', about: 'Pays, approves others’ payments, and runs the team.' },
  payer: { name: 'Can pay', about: 'Makes payments, invoices and suppliers. Big payments wait for approval.' },
  viewer: { name: 'View only', about: 'Sees balances and history. Can’t move money or change anything.' },
};
const TEAM_ROLES: TeamRole[] = ['admin', 'payer', 'viewer'];

/**
 * Team: the people on this business account and what each can do. The owner
 * and admins invite by email; people accept signed in with that email.
 */
export default function Team() {
  const business = useActiveBusiness();
  const team = useTeam();
  const [inviting, setInviting] = useState(false);
  const t = team.data;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{business?.name}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Team</h1>
          <p className="mt-1 max-w-2xl text-[14.5px] text-graphite/60">Who works on this account, and what each person can do. Everyone signs in with their own Credvera account and confirms payments with their own PIN.</p>
        </div>
        {t?.you.canManage && !business?.closedAt && (
          <button type="button" onClick={() => setInviting(true)} className={primary}>
            <UserPlus className="size-4" /> Invite someone
          </button>
        )}
      </div>

      {team.isLoading ? (
        <Loader2 className="mx-auto mt-14 size-5 animate-spin text-graphite/40" aria-label="Loading" />
      ) : team.error ? (
        <p className="mt-10 text-center text-[14px] text-[#a3261b]">{errorMessage(team.error)}</p>
      ) : t ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className={`${panel} overflow-hidden`}>
            <h2 className="border-b border-graphite/[0.07] px-5 py-4 text-[16px] font-semibold">People</h2>
            <ul className="divide-y divide-graphite/[0.07]">
              {t.members.map((m) => (
                <Member key={m.userId} m={m} you={t.you.userId === m.userId} canManage={t.you.canManage} />
              ))}
            </ul>
            {t.invitations.length > 0 && (
              <>
                <h3 className="border-y border-graphite/[0.07] bg-[#fafaf7] px-5 py-2.5 text-[13px] font-medium text-graphite/55">Invited, not joined yet</h3>
                <ul className="divide-y divide-graphite/[0.07]">
                  {t.invitations.map((i) => (
                    <Invitation key={i.id} i={i} canManage={t.you.canManage} />
                  ))}
                </ul>
              </>
            )}
          </section>

          <aside className="space-y-6">
            <section className={`${panel} p-5`}>
              <h2 className="text-[16px] font-semibold">What each role can do</h2>
              <dl className="mt-3 space-y-3 text-[14px]">
                {(Object.keys(ROLES) as BusinessRole[]).map((r) => (
                  <div key={r}>
                    <dt className="font-medium">{ROLES[r].name}</dt>
                    <dd className="text-graphite/60">{ROLES[r].about}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className={`${panel} p-5 text-[14px]`}>
              <h2 className="text-[16px] font-semibold">Approvals</h2>
              <p className="mt-1 text-graphite/60">
                {t.approvalThreshold
                  ? `On: payments of ₦${Number(t.approvalThreshold).toLocaleString('en-NG')} or more wait for a second person.`
                  : t.approvers < 2
                    ? 'Big payments can wait for a second person once there’s an admin besides the owner.'
                    : 'Off. Turn them on under Approvals.'}
              </p>
            </section>
          </aside>
        </div>
      ) : null}

      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}

function Member({ m, you, canManage }: { m: { userId: string; name: string; email: string | null; role: BusinessRole; joinedAt: string }; you: boolean; canManage: boolean }) {
  const change = useChangeRole();
  const remove = useRemoveMember();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const owner = m.role === 'owner';
  const error = change.error ?? remove.error;

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[13px] font-semibold">{initials(m.name)}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">
            {m.name}
            {you && <span className="ml-1.5 text-[13px] font-normal text-graphite/50">(you)</span>}
          </span>
          <span className="block truncate text-[13px] text-graphite/55">
            {m.email} · {owner ? 'opened the account' : `joined ${shortDate(m.joinedAt)}`}
          </span>
        </span>
        {canManage && !owner && !you ? (
          <select
            value={m.role}
            disabled={change.isPending}
            onChange={(e) => change.mutate({ userId: m.userId, role: e.target.value as TeamRole })}
            aria-label={`${m.name}’s role`}
            className="h-9 rounded-lg border border-graphite/15 bg-white px-2.5 text-[13.5px] font-medium outline-none hover:border-graphite/30"
          >
            {TEAM_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLES[r].name}
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12.5px] font-medium text-graphite/70">{ROLES[m.role].name}</span>
        )}
        {!owner && (canManage || you) && (
          <button type="button" onClick={() => setConfirming(true)} className="text-[13px] font-semibold text-[#a3261b] underline-offset-4 hover:underline">
            {you ? 'Leave' : 'Remove'}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-[13px] text-[#a3261b]">{errorMessage(error)}</p>}

      <Modal open={confirming} title={you ? 'Leave this business?' : `Remove ${m.name}?`} onClose={() => setConfirming(false)}>
        <p className="text-[14.5px] text-graphite/65">
          {you ? 'You’ll lose access to this business’s account straight away. Someone would have to invite you again.' : `${m.name} loses access to this business’s account straight away. Anything they did stays on record.`}
        </p>
        {remove.error && <p className="mt-3 text-[13.5px] text-[#a3261b]">{errorMessage(remove.error)}</p>}
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
                  }
                },
              })
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#a3261b] px-3.5 text-[13.5px] font-semibold text-white hover:bg-[#8f1c13] disabled:opacity-40"
          >
            {remove.isPending && <Loader2 className="size-4 animate-spin" />} {you ? 'Leave' : 'Remove'}
          </button>
        </div>
      </Modal>
    </li>
  );
}

function Invitation({ i, canManage }: { i: { id: string; email: string; role: TeamRole; invitedBy: string | null; expiresAt: string }; canManage: boolean }) {
  const revoke = useRevokeInvitation();
  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-[14px]">
      <Mail className="size-4 shrink-0 text-graphite/40" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{i.email}</span>
        <span className="block text-[12.5px] text-graphite/50">
          {ROLES[i.role].name} · invited{i.invitedBy ? ` by ${i.invitedBy}` : ''} · open until {shortDate(i.expiresAt)}
        </span>
      </span>
      {canManage && (
        <button type="button" disabled={revoke.isPending} onClick={() => revoke.mutate(i.id)} className={secondary}>
          Withdraw
        </button>
      )}
      {revoke.error && <p className="w-full text-[13px] text-[#a3261b]">{errorMessage(revoke.error)}</p>}
    </li>
  );
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    <Modal open={open} title={sent ? (sent.result.delivered && !sent.result.link ? 'Invitation sent' : 'Invitation ready') : 'Invite someone'} onClose={close}>
      {sent ? (
        <div className="space-y-4 text-[14.5px]">
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
          <div className="flex justify-end">
            <button type="button" onClick={close} className={primary}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            invite.mutate({ email: email.trim(), role }, { onSuccess: (result) => setSent({ email: email.trim(), result }) });
          }}
        >
          <label className="block">
            <span className={label}>Their email</span>
            <input type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tunde@yourbusiness.ng" className={field} />
          </label>
          <fieldset>
            <legend className={label}>What they can do</legend>
            <div className="space-y-2">
              {TEAM_ROLES.map((r) => (
                <label key={r} className={`flex cursor-pointer gap-3 rounded-lg border px-3.5 py-2.5 text-[14px] ${role === r ? 'border-graphite bg-[#fafaf7]' : 'border-graphite/15'}`}>
                  <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="mt-1 accent-graphite" />
                  <span>
                    <span className="block font-medium">{ROLES[r].name}</span>
                    <span className="block text-[13px] text-graphite/60">{ROLES[r].about}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {invite.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(invite.error)}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={!valid || invite.isPending} className={primary}>
              {invite.isPending && <Loader2 className="size-4 animate-spin" />} Send invitation
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
