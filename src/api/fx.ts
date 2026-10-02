import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';

// Reference exchange rates (naira per one unit, mid-market, published once a
// day) and alerts on them. To watch, not to deal at: nothing here moves money.

export type FxRateDto = { currency: string; name: string; rate: string; asOf: string; previous: string | null; /** Percent since the publication before. */ change: number | null };
export type FxRatesDto = { source: string; attribution: { name: string; url: string }; asOf: string | null; rates: FxRateDto[] };
export type FxHistoryDto = { currency: string; since: string | null; points: { asOf: string; rate: string }[] };
export type FxAlertDto = {
  id: string;
  currency: string;
  direction: 'above' | 'below';
  target: string;
  rateWhenSet: string;
  status: 'active' | 'triggered' | 'cancelled';
  triggeredAt: string | null;
  triggeredRate: string | null;
  createdAt: string;
  yours: boolean;
};

export const fxApi = {
  rates: () => http.get<FxRatesDto>('/fx/rates'),
  history: (currency: string, days: number) => http.get<FxHistoryDto>(`/fx/rates/${currency}/history`, { params: { days } }),
  alerts: () => http.get<FxAlertDto[]>('/fx/alerts'),
  createAlert: (input: { currency: string; direction: 'above' | 'below'; target: string }) => http.post<FxAlertDto>('/fx/alerts', input),
  cancelAlert: (id: string) => http.post<{ cancelled: true }>(`/fx/alerts/${id}/cancel`),
};

/** Rates change once a day; checked again every half hour while the page is open. */
export function useFxRates() {
  return useQuery({ queryKey: queryKeys.fxRates, queryFn: fxApi.rates, enabled: useSignedIn(), staleTime: 10 * 60_000, refetchInterval: 30 * 60_000 });
}

export function useFxHistory(currency: string, days: number) {
  return useQuery({ queryKey: queryKeys.fxHistory(currency, days), queryFn: () => fxApi.history(currency, days), enabled: useSignedIn() && !!currency, placeholderData: keepPreviousData, staleTime: 10 * 60_000 });
}

export function useFxAlerts() {
  return useQuery({ queryKey: queryKeys.fxAlerts, queryFn: fxApi.alerts, enabled: useSignedIn() });
}

export function useCreateFxAlert() {
  const client = useQueryClient();
  return useMutation({ mutationFn: fxApi.createAlert, onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.fxAlerts }) });
}

export function useCancelFxAlert() {
  const client = useQueryClient();
  return useMutation({ mutationFn: fxApi.cancelAlert, onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.fxAlerts }) });
}
