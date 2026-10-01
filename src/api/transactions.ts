import { useInfiniteQuery } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { Page, TransactionDto } from './types';

const PAGE_SIZE = 100;

export const transactionsApi = {
  list: (page: number, limit = PAGE_SIZE) =>
    http.get<Page<TransactionDto>>('/transactions', { params: { page, limit } }),
};

/** Newest first, a page at a time. */
export function useTransactions() {
  const signedIn = useSignedIn();

  return useInfiniteQuery({
    queryKey: queryKeys.transactions,
    queryFn: ({ pageParam }) => transactionsApi.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: ({ meta }) => (meta.page < meta.totalPages ? meta.page + 1 : undefined),
    enabled: signedIn,
  });
}
