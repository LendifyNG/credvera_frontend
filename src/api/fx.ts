import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { invalidateMoney, queryKeys } from './queryClient';
import { useSignedIn } from './session';

// Reference exchange rates (naira per one unit, mid-market, published once a
// day) and alerts on them, to watch; and converting between your own balances
// at a quote held for a few seconds, which is the one thing here that moves money.

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

export type ConvertibleCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type ConversionQuoteInput = { from: ConvertibleCurrency; to: ConvertibleCurrency; side: 'sell' | 'buy'; amount: string };
export type ConversionQuoteDto = {
  quoteId: string;
  from: { currency: ConvertibleCurrency; amount: string };
  to: { currency: ConvertibleCurrency; amount: string };
  side: 'sell' | 'buy';
  /** Units of `to` per one unit of `from`, after the spread. */
  rate: string;
  inverseRate: string;
  midRate: string;
  spreadBps: number;
  rateAsOf: string;
  expiresAt: string;
  ttlSeconds: number;
};
export type ConversionResultDto = { message: string; reference: string; from: { currency: string; amount: string }; to: { currency: string; amount: string }; rate: string };

export const fxApi = {
  rates: () => http.get<FxRatesDto>('/fx/rates'),
  history: (currency: string, days: number) => http.get<FxHistoryDto>(`/fx/rates/${currency}/history`, { params: { days } }),
  alerts: () => http.get<FxAlertDto[]>('/fx/alerts'),
  createAlert: (input: { currency: string; direction: 'above' | 'below'; target: string }) => http.post<FxAlertDto>('/fx/alerts', input),
  cancelAlert: (id: string) => http.post<{ cancelled: true }>(`/fx/alerts/${id}/cancel`),
  quoteConversion: (input: ConversionQuoteInput) => http.post<ConversionQuoteDto>('/fx/conversions/quote', input),
  convert: (input: { quoteId: string; pin: string }) => http.post<ConversionResultDto>('/fx/conversions', input),
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

/** A rate for a conversion, held for a few seconds. Asked for, not polled: each one is a firm price. */
export function useConversionQuote() {
  return useMutation({ mutationFn: fxApi.quoteConversion });
}

export function useConvert() {
  return useMutation({ mutationFn: fxApi.convert, onSuccess: () => void invalidateMoney() });
}
