import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { invalidateMoney, queryKeys } from './queryClient';
import { useSignedIn } from './session';

// Business payment tools: payments that repeat, many payments from one
// spreadsheet, and supplier orders paid into a hold. Each is confirmed once
// with the PIN; the API then sends as whoever set it up.

// ── Scheduled ────────────────────────────────────────────────────────────────

export type ScheduleDto = {
  id: string;
  accountName: string;
  bankName: string;
  accountLast4: string;
  supplierId: string | null;
  amount: string;
  narration: string | null;
  every: 'week' | 'month';
  nextRunAt: string;
  paused: boolean;
  runs: number;
  lastRunAt: string | null;
  lastResult: 'sent' | 'processing' | 'awaiting_approval' | 'failed' | null;
  /** Why the last run didn't go. */
  lastProblem: string | null;
  createdBy: string;
  createdAt: string;
};

export type NewSchedule = { bankCode: string; accountNumber: string; amount: string; every: 'week' | 'month'; startOn?: string; narration?: string; supplierId?: string; pin: string };

// ── Bulk ─────────────────────────────────────────────────────────────────────

export type BulkRowInput = { name: string; bankCode: string; accountNumber: string; amount: string };

export type BulkSummaryDto = {
  id: string;
  fileName: string;
  count: number;
  total: string;
  sent: number;
  awaitingApproval: number;
  failed: number;
  /** Rows still to go. */
  waiting: number;
  finished: boolean;
  createdBy: string;
  createdAt: string;
};

export type BulkDetailDto = BulkSummaryDto & {
  rows: { position: number; name: string; bankName: string; accountLast4: string; accountName: string | null; amount: string; status: 'queued' | 'sent' | 'processing' | 'awaiting_approval' | 'failed'; reference: string | null; problem: string | null }[];
};

// ── Protected orders ─────────────────────────────────────────────────────────

export type ProtectedOrderDto = {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  description: string;
  amount: string;
  depositPercent: number;
  depositAmount: string;
  heldAmount: string;
  stage: 'waiting' | 'problem' | 'released' | 'returned';
  note: string | null;
  shipBy: string;
  depositReference: string | null;
  releaseReference: string | null;
  releasedAt: string | null;
  returnedAt: string | null;
  createdBy: string;
  createdAt: string;
};

export type NewProtectedOrder = { supplierId: string; description: string; amount: string; depositPercent: number; shipWithinDays: number; confirmNewDetails?: boolean; pin: string };

// ── Invoice checks ───────────────────────────────────────────────────────────

export type InvoiceCheckDto = {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  amount: string | null;
  accountLast4: string;
  result: 'match' | 'changed' | 'new';
  checkedAt: string;
};

export type NewInvoiceCheck = { invoiceNumber: string; accountNumber: string; bankCode?: string; amount?: string };

export const payToolsApi = {
  schedules: () => http.get<ScheduleDto[]>('/scheduled-payments'),
  schedule: (input: NewSchedule) => http.post<ScheduleDto>('/scheduled-payments', input),
  pauseSchedule: (id: string, pause: boolean) => http.post<ScheduleDto[]>(`/scheduled-payments/${encodeURIComponent(id)}/${pause ? 'pause' : 'resume'}`),
  cancelSchedule: (id: string) => http.delete<ScheduleDto[]>(`/scheduled-payments/${encodeURIComponent(id)}`),
  bulkList: () => http.get<BulkSummaryDto[]>('/bulk-payments'),
  bulk: (id: string) => http.get<BulkDetailDto>(`/bulk-payments/${encodeURIComponent(id)}`),
  payBulk: (input: { fileName: string; rows: BulkRowInput[]; pin: string }) => http.post<BulkDetailDto>('/bulk-payments', input),
  orders: () => http.get<ProtectedOrderDto[]>('/protected-orders'),
  startOrder: (input: NewProtectedOrder) => http.post<ProtectedOrderDto>('/protected-orders', input),
  releaseOrder: (id: string, pin: string) => http.post<ProtectedOrderDto>(`/protected-orders/${encodeURIComponent(id)}/release`, { pin }),
  returnOrder: (id: string, pin: string) => http.post<ProtectedOrderDto>(`/protected-orders/${encodeURIComponent(id)}/return`, { pin }),
  orderProblem: (id: string, note: string) => http.post<ProtectedOrderDto>(`/protected-orders/${encodeURIComponent(id)}/problem`, { note }),
  invoiceChecks: () => http.get<InvoiceCheckDto[]>('/suppliers/invoice-checks'),
  checkInvoice: (supplierId: string, input: NewInvoiceCheck) => http.post<InvoiceCheckDto>(`/suppliers/${encodeURIComponent(supplierId)}/invoice-checks`, input),
};

export function useSchedules() {
  return useQuery({ queryKey: queryKeys.schedules, queryFn: payToolsApi.schedules, enabled: useSignedIn() });
}

export function useCreateSchedule() {
  const client = useQueryClient();
  return useMutation({ mutationFn: payToolsApi.schedule, onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.schedules }) });
}

export function useScheduleAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'pause' | 'resume' | 'cancel' }) => (action === 'cancel' ? payToolsApi.cancelSchedule(id) : payToolsApi.pauseSchedule(id, action === 'pause')),
    onSuccess: (list) => client.setQueryData(queryKeys.schedules, list),
  });
}

/** Refreshed every few seconds while any spreadsheet still has rows to go. */
export function useBulkPayments() {
  return useQuery({
    queryKey: queryKeys.bulkPayments,
    queryFn: payToolsApi.bulkList,
    enabled: useSignedIn(),
    refetchInterval: (q) => (q.state.data?.some((b) => !b.finished) ? 4000 : false),
  });
}

export function usePayBulk() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: payToolsApi.payBulk,
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.bulkPayments }),
    onSettled: () => void invalidateMoney(),
  });
}

export function useProtectedOrders() {
  return useQuery({ queryKey: queryKeys.protectedOrders, queryFn: payToolsApi.orders, enabled: useSignedIn() });
}

/** Any change to an order moves money, or might have: balances and history refresh too. */
export function useOrderAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (a: { kind: 'start'; input: NewProtectedOrder } | { kind: 'release' | 'return'; id: string; pin: string } | { kind: 'problem'; id: string; note: string }) =>
      a.kind === 'start' ? payToolsApi.startOrder(a.input) : a.kind === 'problem' ? payToolsApi.orderProblem(a.id, a.note) : a.kind === 'release' ? payToolsApi.releaseOrder(a.id, a.pin) : payToolsApi.returnOrder(a.id, a.pin),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.protectedOrders });
      void client.invalidateQueries({ queryKey: queryKeys.suppliers });
      void invalidateMoney();
    },
  });
}

export function useInvoiceChecks() {
  return useQuery({ queryKey: queryKeys.invoiceChecks, queryFn: payToolsApi.invoiceChecks, enabled: useSignedIn() });
}

export function useCheckInvoice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, input }: { supplierId: string; input: NewInvoiceCheck }) => payToolsApi.checkInvoice(supplierId, input),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.invoiceChecks }),
  });
}
