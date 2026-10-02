import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { BusinessRole } from './types';

// The people on the active business's account, and invitations to join it.
// Every call here is for the active business (the client sends X-Business-Id),
// except the invitation link, which works before you're on the team.

export type TeamRole = Exclude<BusinessRole, 'owner'>;

export type TeamDto = {
  you: { userId: string; role: BusinessRole; canManage: boolean };
  approvalThreshold: string | null;
  /** The owner and every admin. */
  approvers: number;
  members: { userId: string; name: string; email: string | null; role: BusinessRole; joinedAt: string }[];
  invitations: { id: string; email: string; role: TeamRole; invitedBy: string | null; expiresAt: string; createdAt: string }[];
};

export type InviteResult = { id: string; delivered: boolean; /** Outside production, when the email went nowhere. */ link?: string };
export type InvitationView = { businessName: string; role: TeamRole; invitedBy: string | null; email: string; expiresAt: string };

export const teamApi = {
  view: () => http.get<TeamDto>('/team'),
  invite: (input: { email: string; role: TeamRole }) => http.post<InviteResult>('/team/invitations', input),
  revoke: (id: string) => http.post<TeamDto>(`/team/invitations/${id}/revoke`),
  changeRole: (userId: string, role: TeamRole) => http.patch<TeamDto>(`/team/members/${userId}`, { role }),
  remove: (userId: string) => http.post<TeamDto | { left: true }>(`/team/members/${userId}/remove`),
  describe: (token: string) => http.get<InvitationView>(`/team-invitations/${token}`, { skipAuth: true }),
  accept: (token: string) => http.post<{ businessId: string; businessName: string; role: TeamRole }>(`/team-invitations/${token}/accept`),
};

export function useTeam() {
  return useQuery({ queryKey: queryKeys.team, queryFn: teamApi.view, enabled: useSignedIn() });
}

/** Any change to the team: refresh it, and the business list (roles live there too). */
function useTeamChange<I, O>(fn: (input: I) => Promise<O>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.team });
      void client.invalidateQueries({ queryKey: queryKeys.businesses });
    },
  });
}

export const useInvite = () => useTeamChange(teamApi.invite);
export const useRevokeInvitation = () => useTeamChange(teamApi.revoke);
export const useChangeRole = () => useTeamChange(({ userId, role }: { userId: string; role: TeamRole }) => teamApi.changeRole(userId, role));
export const useRemoveMember = () => useTeamChange(teamApi.remove);

export function useInvitation(token: string) {
  return useQuery({ queryKey: ['team-invitation', token], queryFn: () => teamApi.describe(token), retry: false });
}

export function useAcceptInvitation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: teamApi.accept, onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.businesses }) });
}
