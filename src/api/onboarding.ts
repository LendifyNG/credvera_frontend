import { useMutation } from '@tanstack/react-query';
import { http } from './client';

/**
 * Creating a login: the backend's step-by-step onboarding.
 *
 * Each step answers with a new short-lived onboarding token for the next one,
 * sent in its own header so it can never be mistaken for a signed-in session.
 */

const ONBOARDING_HEADER = 'x-onboarding-token';

export type RegisterInput = { firstName: string; lastName: string; email: string; phoneNumber: string };
export type AddressInput = { state: string; city: string; street: string; nearestLandmark: string; houseNumber?: string };

type Step = { onboardingToken: string };
type Registered = Step & { maskedContact: string; channel: string };

const step = <T = Step>(path: string, token: string, body: unknown) =>
  http.post<T>(`/onboarding/${path}`, body, { skipAuth: true, headers: { [ONBOARDING_HEADER]: token } });

export const onboardingApi = {
  register: (input: RegisterInput) => http.post<Registered>('/onboarding/register', input, { skipAuth: true }),
  resend: (token: string, channel: 'sms' | 'email') => step<Registered>('resend', token, { channel }),
  verify: (token: string, code: string) => step('verify', token, { code }),
  password: (token: string, password: string) => step('password', token, { password }),
  address: (token: string, address: AddressInput) => step('address', token, address),
  pin: (token: string, pin: string) => step('pin', token, { pin }),
  finish: (token: string) => step<{ message: string }>('biometrics', token, { enabled: false }),
};

export const useRegister = () => useMutation({ mutationFn: onboardingApi.register });
export const useResendCode = () => useMutation({ mutationFn: ({ token, channel }: { token: string; channel: 'sms' | 'email' }) => onboardingApi.resend(token, channel) });
export const useVerifyCode = () => useMutation({ mutationFn: ({ token, code }: { token: string; code: string }) => onboardingApi.verify(token, code) });

/**
 * The last four steps in one go: password, home address, PIN, done. They have
 * no screen of their own here, so the web collects them together and walks the
 * backend's stages in order.
 */
export const useFinishSignUp = () =>
  useMutation({
    mutationFn: async ({ token, password, address, pin }: { token: string; password: string; address: AddressInput; pin: string }) => {
      const afterPassword = await onboardingApi.password(token, password);
      const afterAddress = await onboardingApi.address(afterPassword.onboardingToken, address);
      const afterPin = await onboardingApi.pin(afterAddress.onboardingToken, pin);
      return onboardingApi.finish(afterPin.onboardingToken);
    },
  });
