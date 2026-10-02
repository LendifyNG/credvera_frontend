import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './errors';
import { activeBusiness } from './activeBusiness';
import { session } from './session';

/**
 * Every cache key in one place, so it is clear what a mutation invalidates.
 * Keys are hierarchical: invalidating `['wallets']` also refreshes each
 * wallet's pay-in account.
 */
export const queryKeys = {
  profile: ['profile'] as const,
  wallets: ['wallets'] as const,
  virtualAccount: (walletId: string) => ['wallets', walletId, 'virtual-account'] as const,
  transactions: ['transactions'] as const,
  banks: ['transfers', 'banks'] as const,
  accountName: (bankCode: string, accountNumber: string) => ['transfers', 'account-name', bankCode, accountNumber] as const,
  transferQuote: (amount: string) => ['transfers', 'quote', amount] as const,
  dataBundles: (network: string) => ['bills', 'data-bundles', network] as const,
  electricityProviders: ['bills', 'electricity-providers'] as const,
  businesses: ['businesses'] as const,
  business: (id: string) => ['businesses', id] as const,
  paymentLinks: ['payment-links'] as const,
  paymentLinkCurrencies: ['payment-links', 'currencies'] as const,
  publicInvoice: (slug: string) => ['pay', slug] as const,
  content: ['content'] as const,
  serviceRequests: ['service-requests'] as const,
  serviceRequest: (id: string) => ['service-requests', id] as const,
  suppliers: ['suppliers'] as const,
  supplier: (id: string) => ['suppliers', 'one', id] as const,
  team: ['team'] as const,
  approvals: ['approvals'] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // A 4xx will say the same thing again; only retry what might be transient.
      retry: (failures, error) => failures < 2 && !(isApiError(error) && error.status >= 400 && error.status < 500),
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Money-moving calls are never retried automatically.
      retry: false,
    },
  },
});

/** Balances and history both change whenever money moves. */
export function invalidateMoney() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
  ]);
}

// Signing out, or a session ended by the server, drops everything cached for
// that person, so the next account never sees the last one's data - or acts
// for the last one's business.
session.subscribe(() => {
  if (session.isSignedIn()) return;
  activeBusiness.set(null);
  queryClient.clear();
});

// Money is per business: switching drops what was cached for the last one.
activeBusiness.subscribe(() => {
  queryClient.removeQueries({ queryKey: queryKeys.wallets });
  queryClient.removeQueries({ queryKey: queryKeys.transactions });
  queryClient.removeQueries({ queryKey: queryKeys.paymentLinks, exact: true });
  queryClient.removeQueries({ queryKey: queryKeys.serviceRequests });
  queryClient.removeQueries({ queryKey: queryKeys.suppliers });
  queryClient.removeQueries({ queryKey: queryKeys.team });
  queryClient.removeQueries({ queryKey: queryKeys.approvals });
});
