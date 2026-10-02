import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';

// Asking Credvera's operations team for something that needs a person: an
// official statement, or closing the account. Acting for a business, the
// request is the business's (the client sends X-Business-Id).

export type ServiceRequestKind = 'statement' | 'account_closure';
export type ServiceRequestStatus = 'new' | 'in_progress' | 'done' | 'declined' | 'cancelled';

export type StatementLine = { at: string; details: string; reference: string; moneyIn: string | null; moneyOut: string | null; balance: string };
export type OfficialStatement = {
  reference: string;
  holder: string;
  accountNumber: string | null;
  bankName: string | null;
  currency: string;
  from: string;
  to: string;
  opening: string;
  closing: string;
  totalIn: string;
  totalOut: string;
  lines: StatementLine[];
  issuedAt: string;
  issuedBy: string;
};

export type ServiceRequestDto = {
  id: string;
  reference: string;
  kind: ServiceRequestKind;
  status: ServiceRequestStatus;
  details: { currency?: string; from?: string; to?: string; purpose?: string; addressedTo?: string | null; reason?: string };
  createdAt: string;
  resolvedAt: string | null;
  /** Why it was declined, or a word from the team when it's done. */
  resolutionNote: string | null;
  hasStatement: boolean;
  statement?: OfficialStatement | null;
};

export type StatementRequestInput = { currency: string; from: string; to: string; purpose: string; addressedTo?: string };

export const serviceRequestsApi = {
  list: () => http.get<ServiceRequestDto[]>('/service-requests'),
  get: (id: string) => http.get<ServiceRequestDto>(`/service-requests/${id}`),
  statement: (input: StatementRequestInput) => http.post<ServiceRequestDto>('/service-requests/statement', input),
  closure: (reason: string) => http.post<ServiceRequestDto>('/service-requests/closure', { reason }),
  cancel: (id: string) => http.post<ServiceRequestDto>(`/service-requests/${id}/cancel`),
};

/** This account's requests, newest first. Checked again every minute while one is open. */
export function useServiceRequests() {
  return useQuery({
    queryKey: queryKeys.serviceRequests,
    queryFn: serviceRequestsApi.list,
    enabled: useSignedIn(),
    refetchInterval: (q) => (q.state.data?.some((r) => r.status === 'new' || r.status === 'in_progress') ? 60_000 : false),
  });
}

export function useServiceRequest(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.serviceRequest(id ?? ''), queryFn: () => serviceRequestsApi.get(id!), enabled: useSignedIn() && !!id });
}

function useRefresh() {
  const client = useQueryClient();
  return () => void client.invalidateQueries({ queryKey: queryKeys.serviceRequests });
}

export function useRequestStatement() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: serviceRequestsApi.statement, onSuccess: refresh });
}

export function useRequestClosure() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: serviceRequestsApi.closure, onSuccess: refresh });
}

export function useCancelServiceRequest() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: serviceRequestsApi.cancel, onSuccess: refresh });
}
