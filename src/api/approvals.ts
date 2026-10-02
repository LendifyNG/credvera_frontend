import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { invalidateMoney, queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { BusinessRole } from './types';

// Payments over the active business's approval limit, waiting for a second
// person, and the limit itself.

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'failed';

export type ApprovalDto = {
  id: string;
  status: ApprovalStatus;
  amount: string;
  currency: string;
  to: { accountName: string; bankName: string; accountLast4: string; supplierName: string | null };
  narration: string | null;
  requestedBy: string;
  requestedByYou: boolean;
  createdAt: string;
  expiresAt: string;
  decidedBy: string | null;
  decidedAt: string | null;
  /** Why it was rejected, or why the approved transfer didn't go. */
  note: string | null;
  transferReference: string | null;
  canDecide: boolean;
  canCancel: boolean;
};

export type ApprovalsDto = {
  threshold: string | null;
  approvers: number;
  you: { role: BusinessRole; canApprove: boolean; canManage: boolean };
  /** Waiting on you: you can approve, and you didn't ask. */
  forYou: number;
  waiting: ApprovalDto[];
  history: ApprovalDto[];
};

export const approvalsApi = {
  list: () => http.get<ApprovalsDto>('/approvals'),
  setThreshold: (threshold: string | null) => http.put<ApprovalsDto>('/approvals/threshold', { threshold }),
  approve: (id: string, pin: string) => http.post<ApprovalsDto>(`/approvals/${id}/approve`, { pin }),
  reject: (id: string, note: string) => http.post<ApprovalsDto>(`/approvals/${id}/reject`, { note }),
  cancel: (id: string) => http.post<ApprovalsDto>(`/approvals/${id}/cancel`),
};

/** Checked every minute: someone else may be waiting on you. Business accounts only. */
export function useApprovals(enabled = true) {
  return useQuery({ queryKey: queryKeys.approvals, queryFn: approvalsApi.list, enabled: useSignedIn() && enabled, refetchInterval: 60_000 });
}

function useApprovalChange<I>(fn: (input: I) => Promise<ApprovalsDto>, movesMoney = false) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => client.setQueryData(queryKeys.approvals, data),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.businesses });
      if (movesMoney) void invalidateMoney();
    },
  });
}

export const useSetThreshold = () => useApprovalChange(approvalsApi.setThreshold);
export const useApprove = () => useApprovalChange(({ id, pin }: { id: string; pin: string }) => approvalsApi.approve(id, pin), true);
export const useReject = () => useApprovalChange(({ id, note }: { id: string; note: string }) => approvalsApi.reject(id, note));
export const useCancelApproval = () => useApprovalChange(approvalsApi.cancel);
