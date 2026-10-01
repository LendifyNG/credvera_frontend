import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { http } from './client';
import { invalidateMoney, queryKeys } from './queryClient';
import type { AccountNameDto, BankDto, SendMoneyInput, TransferQuoteDto, TransferResultDto } from './types';

export const transfersApi = {
  banks: () => http.get<BankDto[]>('/transfers/banks'),

  accountName: (bankCode: string, accountNumber: string) =>
    http.post<AccountNameDto>('/transfers/verify-account', { bankCode, accountNumber }),

  quote: (amount: string) => http.post<TransferQuoteDto>('/transfers/quote', { amount }),

  send: (input: SendMoneyInput) => http.post<TransferResultDto>('/transfers/send', input),
};

/** The bank list barely changes; fetch it once per visit. */
export function useBanks() {
  return useQuery({ queryKey: queryKeys.banks, queryFn: transfersApi.banks, staleTime: Infinity });
}

/** The bank's own name for an account, once there is a bank and ten digits. */
export function useAccountName(bankCode: string, accountNumber: string) {
  return useQuery({
    queryKey: queryKeys.accountName(bankCode, accountNumber),
    queryFn: () => transfersApi.accountName(bankCode, accountNumber),
    enabled: !!bankCode && /^\d{10}$/.test(accountNumber),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

/** Fee and total for an amount; the last answer stays on screen while typing. */
export function useTransferQuote(amount: string) {
  return useQuery({
    queryKey: queryKeys.transferQuote(amount),
    queryFn: () => transfersApi.quote(amount),
    enabled: Number(amount) > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useSendMoney() {
  return useMutation({
    mutationFn: transfersApi.send,
    // Settled either way: a declined transfer is refunded, which moves money too.
    onSettled: invalidateMoney,
  });
}
