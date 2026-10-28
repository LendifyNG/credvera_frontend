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

/** Ways a code can reach a phone; a text always, WhatsApp and a call once the server has them. */
export type CodeChannel = 'sms' | 'whatsapp' | 'call';
export type CodeChannelsDto = Record<CodeChannel, boolean>;

export const capabilitiesApi = {
  get: () => http.get<CapabilitiesDto>('/capabilities'),
  codeChannels: () => http.get<CodeChannelsDto>('/capabilities/code-channels'),
};

/** For the code screens, before anyone is signed in. */
export function useCodeChannels() {
  return useQuery({ queryKey: ['capabilities', 'code-channels'], queryFn: capabilitiesApi.codeChannels, staleTime: 5 * 60_000 });
}

/** Undefined until known: screens show nothing switched off until the answer is in. */
export function useCapabilities() {
  const signedIn = useSignedIn();
  return useQuery({ queryKey: queryKeys.capabilities, queryFn: capabilitiesApi.get, enabled: signedIn, staleTime: 5 * 60_000 });
}
