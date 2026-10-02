import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { invalidateMoney, queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { AwaitingApprovalDto, TransferResultDto } from './types';

// Suppliers: the businesses this account pays, each with a bank account the
// bank itself named. Acting for a business, they're the business's (the
// client sends X-Business-Id).

export type SupplierDto = {
  id: string;
  name: string;
  category: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  bank: {
    code: string;
    name: string;
    /** The bank's own name for the account. */
    accountName: string;
    accountLast4: string;
    /** Only on a single supplier, not in the list. */
    accountNumber?: string;
    /** When the details were last changed; null while they're the ones first saved. */
    changedAt: string | null;
    /** Changed (not first saved) in the last three days. */
    recentlyChanged: boolean;
    /** Nothing paid to these details yet: the next payment asks for confirmation. */
    unconfirmed: boolean;
  };
  cac: { rcNumber: string; name: string | null; status: string | null; checkedAt: string | null; matchesAccount: boolean | null } | null;
  archivedAt: string | null;
  createdAt: string;
  stats: { payments: number; paid: string; lastPaidAt: string | null };
};

export type SupplierPayment = {
  id: string;
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  amount: string;
  fee: string;
  currency: string;
  to: string | null;
  bankName: string | null;
  accountLast4: string | null;
  createdAt: string;
};

export type SupplierDetail = SupplierDto & { payments: SupplierPayment[] };

export type SupplierContact = { name?: string; category?: string; email?: string; phone?: string; notes?: string; rcNumber?: string };
export type NewSupplier = SupplierContact & { name: string; bankCode: string; accountNumber: string; pin: string };
export type PaySupplierInput = { amount: string; narration?: string; pin: string; confirmNewDetails?: boolean };

export const suppliersApi = {
  list: (archived: boolean) => http.get<SupplierDto[]>('/suppliers', { params: archived ? { archived: true } : {} }),
  get: (id: string) => http.get<SupplierDetail>(`/suppliers/${id}`),
  create: (input: NewSupplier) => http.post<SupplierDetail>('/suppliers', input),
  update: (id: string, input: SupplierContact) => http.patch<SupplierDetail>(`/suppliers/${id}`, input),
  changeBank: (id: string, input: { bankCode: string; accountNumber: string; pin: string }) => http.put<SupplierDetail>(`/suppliers/${id}/bank`, input),
  archive: (id: string, archive: boolean) => http.post<SupplierDetail>(`/suppliers/${id}/${archive ? 'archive' : 'restore'}`),
  pay: (id: string, input: PaySupplierInput) => http.post<TransferResultDto | AwaitingApprovalDto>(`/suppliers/${id}/pay`, input),
};

export function useSuppliers(archived = false) {
  return useQuery({ queryKey: [...queryKeys.suppliers, archived ? 'archived' : 'active'], queryFn: () => suppliersApi.list(archived), enabled: useSignedIn() });
}

export function useSupplier(id: string | null) {
  return useQuery({ queryKey: queryKeys.supplier(id ?? ''), queryFn: () => suppliersApi.get(id!), enabled: useSignedIn() && !!id });
}

/** After any change: the supplier as it now stands, and the lists refreshed. */
function useRemember() {
  const client = useQueryClient();
  return (s: SupplierDetail) => {
    client.setQueryData(queryKeys.supplier(s.id), s);
    void client.invalidateQueries({ queryKey: queryKeys.suppliers });
  };
}

export function useCreateSupplier() {
  const remember = useRemember();
  return useMutation({ mutationFn: suppliersApi.create, onSuccess: remember });
}

export function useUpdateSupplier(id: string) {
  const remember = useRemember();
  return useMutation({ mutationFn: (input: SupplierContact) => suppliersApi.update(id, input), onSuccess: remember });
}

export function useChangeSupplierBank(id: string) {
  const remember = useRemember();
  return useMutation({ mutationFn: (input: { bankCode: string; accountNumber: string; pin: string }) => suppliersApi.changeBank(id, input), onSuccess: remember });
}

export function useArchiveSupplier(id: string) {
  const remember = useRemember();
  return useMutation({ mutationFn: (archive: boolean) => suppliersApi.archive(id, archive), onSuccess: remember });
}

export function usePaySupplier(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: PaySupplierInput) => suppliersApi.pay(id, input),
    // Settled either way: a declined transfer is refunded, which moves money too.
    onSettled: () => {
      void invalidateMoney();
      void client.invalidateQueries({ queryKey: queryKeys.suppliers });
      void client.invalidateQueries({ queryKey: queryKeys.supplier(id) });
    },
  });
}
