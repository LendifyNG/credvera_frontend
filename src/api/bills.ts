import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from './client';
import { invalidateMoney, queryKeys } from './queryClient';
import type { BillResultDto, DataBundleDto, ElectricityProviderDto, MeterDto, MeterType, Network } from './types';

export type AirtimeInput = { phoneNumber: string; amount: number; pin: string };
export type DataInput = { phoneNumber: string; network: Network; planCode: string; pin: string };
export type MeterLookupInput = { provider: string; meterNumber: string; meterType: MeterType };
export type ElectricityInput = { reference: string; amount: number; phoneNumber: string; pin: string };

export const billsApi = {
  dataBundles: (network: Network) => http.get<DataBundleDto[]>('/bills/data-bundles', { params: { network } }),
  electricityProviders: () => http.get<ElectricityProviderDto[]>('/bills/electricity/providers'),
  lookupMeter: (input: MeterLookupInput) => http.post<MeterDto>('/bills/electricity/lookup', input),

  buyAirtime: (input: AirtimeInput) => http.post<BillResultDto>('/bills/airtime', input),
  buyData: (input: DataInput) => http.post<BillResultDto>('/bills/data', input),
  buyElectricity: (input: ElectricityInput) => http.post<BillResultDto>('/bills/electricity', input),
};

export function useDataBundles(network: Network | undefined) {
  return useQuery({
    queryKey: queryKeys.dataBundles(network ?? 'none'),
    queryFn: () => billsApi.dataBundles(network!),
    enabled: !!network,
    staleTime: 10 * 60_000,
  });
}

export function useElectricityProviders() {
  return useQuery({
    queryKey: queryKeys.electricityProviders,
    queryFn: billsApi.electricityProviders,
    staleTime: 60 * 60_000,
  });
}

/** Resolves a meter to its owner; the result carries the reference a purchase needs. */
export function useMeterLookup() {
  return useMutation({ mutationFn: billsApi.lookupMeter });
}

// Settled either way: a declined purchase is refunded, which moves money too.
export const useBuyAirtime = () => useMutation({ mutationFn: billsApi.buyAirtime, onSettled: invalidateMoney });
export const useBuyData = () => useMutation({ mutationFn: billsApi.buyData, onSettled: invalidateMoney });
export const useBuyElectricity = () => useMutation({ mutationFn: billsApi.buyElectricity, onSettled: invalidateMoney });
