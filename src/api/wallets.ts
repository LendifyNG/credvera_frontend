import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from './client';
import { isApiError } from './errors';
import { queryClient, queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { CreateWalletResponse, VirtualAccountDto, WalletDto } from './types';

export const walletsApi = {
  list: () => http.get<WalletDto[]>('/wallets'),

  open: (currency: string) => http.post<CreateWalletResponse>('/wallets', { currency }),

  /** Null when no pay-in account has been requested for the wallet yet. */
  virtualAccount: async (walletId: string) => {
    try {
      return await http.get<VirtualAccountDto>(`/wallets/${walletId}/virtual-account`);
    } catch (error) {
      if (isApiError(error) && error.code === 'VIRTUAL_ACCOUNT_NOT_FOUND') return null;
      throw error;
    }
  },

  /** Issues the pay-in account, or retries one that failed. */
  provisionVirtualAccount: (walletId: string) => http.post<VirtualAccountDto>(`/wallets/${walletId}/virtual-account`),
};

export function useWallets() {
  const signedIn = useSignedIn();
  return useQuery({ queryKey: queryKeys.wallets, queryFn: walletsApi.list, enabled: signedIn });
}

/** The details people pay into. Pass no id to stay idle, e.g. before the wallet exists. */
export function useVirtualAccount(walletId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.virtualAccount(walletId ?? 'none'),
    queryFn: () => walletsApi.virtualAccount(walletId!),
    enabled: !!walletId,
    staleTime: 5 * 60_000,
  });
}

export function useOpenWallet() {
  return useMutation({
    mutationFn: walletsApi.open,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
  });
}

export function useProvisionVirtualAccount() {
  return useMutation({
    mutationFn: walletsApi.provisionVirtualAccount,
    onSuccess: (account, walletId) => queryClient.setQueryData(queryKeys.virtualAccount(walletId), account),
  });
}
