import { useQuery } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';

/** Which features are switched on. A feature whose partner isn't connected yet is off, and the API refuses it. */
export type CapabilitiesDto = {
  sending: boolean;
  bills: boolean;
  nairaAccounts: boolean;
  foreignAccounts: boolean;
  paymentLinks: { naira: boolean; cards: boolean; paypal: boolean };
  identityChecks: boolean;
};

export const capabilitiesApi = { get: () => http.get<CapabilitiesDto>('/capabilities') };

/** Undefined until known: screens show nothing switched off until the answer is in. */
export function useCapabilities() {
  const signedIn = useSignedIn();
  return useQuery({ queryKey: queryKeys.capabilities, queryFn: capabilitiesApi.get, enabled: signedIn, staleTime: 5 * 60_000 });
}
