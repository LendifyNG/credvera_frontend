import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';

// Asking Credvera's support team something. Signed in, the question is the
// account's (the business's when acting for one: the client sends
// X-Business-Id) and the replies come back here and by email. Not signed in,
// the contact form sends it with a name and email, and the reply comes by email.

export type SupportStatus = 'new' | 'ours' | 'theirs' | 'solved';

export type SupportMessageDto = { id: string; from: 'you' | 'credvera'; by: string | null; body: string; at: string };

export type SupportTicketDto = {
  id: string;
  reference: string;
  subject: string;
  status: SupportStatus;
  /** We've replied and are waiting on them. */
  needsYou: boolean;
  linked: { kind: 'transaction'; id: string; label: string } | null;
  createdAt: string;
  updatedAt: string;
  solvedAt: string | null;
  messages?: SupportMessageDto[];
};

export type OpenTicketInput = { subject: string; message: string; transactionId?: string };
export type ContactInput = { name: string; email: string; subject: string; message: string };

export const supportApi = {
  list: () => http.get<SupportTicketDto[]>('/support/tickets'),
  get: (id: string) => http.get<SupportTicketDto>(`/support/tickets/${id}`),
  open: (input: OpenTicketInput) => http.post<SupportTicketDto>('/support/tickets', { ...input, channel: 'website' }),
  reply: (id: string, message: string) => http.post<SupportTicketDto>(`/support/tickets/${id}/messages`, { message }),
  solve: (id: string) => http.post<SupportTicketDto>(`/support/tickets/${id}/solve`),
  contact: (input: ContactInput) => http.post<{ reference: string; message: string }>('/support/contact', input, { skipAuth: true }),
};

/** This account's questions, most recently active first. Checked every minute while any is open. */
export function useSupportTickets() {
  return useQuery({
    queryKey: queryKeys.supportTickets,
    queryFn: supportApi.list,
    enabled: useSignedIn(),
    refetchInterval: (q) => (q.state.data?.some((t) => t.status !== 'solved') ? 60_000 : false),
  });
}

/** One question with the conversation; checked every half minute while it's open on screen. */
export function useSupportTicket(id: string | null) {
  return useQuery({
    queryKey: queryKeys.supportTicket(id ?? ''),
    queryFn: () => supportApi.get(id!),
    enabled: useSignedIn() && !!id,
    refetchInterval: 30_000,
  });
}

function useSettle() {
  const client = useQueryClient();
  return (ticket: SupportTicketDto) => {
    client.setQueryData(queryKeys.supportTicket(ticket.id), ticket);
    void client.invalidateQueries({ queryKey: queryKeys.supportTickets, exact: true });
  };
}

export function useOpenTicket() {
  const settle = useSettle();
  return useMutation({ mutationFn: supportApi.open, onSuccess: settle });
}

export function useReplyToTicket(id: string) {
  const settle = useSettle();
  return useMutation({ mutationFn: (message: string) => supportApi.reply(id, message), onSuccess: settle });
}

export function useSolveTicket(id: string) {
  const settle = useSettle();
  return useMutation({ mutationFn: () => supportApi.solve(id), onSuccess: settle });
}

/** The contact form, for people who aren't signed in. */
export const useContactSupport = () => useMutation({ mutationFn: supportApi.contact });
