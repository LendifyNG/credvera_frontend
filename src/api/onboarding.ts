import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth';
import { http } from './client';
import { session } from './session';

/**
 * Creating a login: the backend's step-by-step onboarding, in the app's
 * order. Details and password, the phone's code, the email's code, a PIN,
 * then done; the home address is saved to the profile once signed in.
 *
 * Each step answers with a new short-lived onboarding token for the next one,
 * sent in its own header so it can never be mistaken for a signed-in session.
 */

const ONBOARDING_HEADER = 'x-onboarding-token';

export type RegisterInput = { firstName: string; lastName: string; email: string; phoneNumber: string; password: string };
export type AddressInput = { state: string; city: string; street: string; nearestLandmark: string; houseNumber?: string };

type Step = { onboardingToken: string };
/** A code was sent: where to, and on which channel. */
export type CodeSent = Step & { maskedContact: string; channel: 'sms' | 'email' };

const step = <T = Step>(path: string, token: string, body: unknown) =>
  http.post<T>(`/onboarding/${path}`, body, { skipAuth: true, headers: { [ONBOARDING_HEADER]: token } });

export const onboardingApi = {
  register: (input: RegisterInput) => http.post<CodeSent>('/onboarding/register', { ...input, country: 'NG' }, { skipAuth: true }),
  // The step decides the channel: texted until the phone is confirmed, then emailed.
  resend: (token: string) => step<CodeSent>('resend', token, {}),
  // Confirming the phone emails the next code and answers with its token; confirming the email answers with the PIN step's.
  verify: (token: string, code: string) => step<Step | CodeSent>('verify', token, { code }),
  pin: (token: string, pin: string) => step('pin', token, { pin }),
  // Logins made here are for a business application, so the server holds back
  // its "welcome" email: the applicant hears from us once the application is in.
  finish: (token: string) => step<{ message: string }>('biometrics', token, { enabled: false, forBusiness: true }),
};

export const useRegister = () => useMutation({ mutationFn: onboardingApi.register });
export const useResendCode = () => useMutation({ mutationFn: ({ token }: { token: string }) => onboardingApi.resend(token) });
export const useVerifyCode = () => useMutation({ mutationFn: ({ token, code }: { token: string; code: string }) => onboardingApi.verify(token, code) });

/** How far the last steps got, so a retry carries on instead of starting over. */
export type FinishProgress = { done: 'none' | 'pin' | 'finished'; token: string };

/**
 * The last steps in one go: PIN, done, sign in, then the home address on the
 * profile. The backend takes each step only once, so `progress` records every
 * step it accepted; if one is refused (a PIN that's too easy, say), sending
 * the form again picks up at that step. The session is kept only at the end,
 * so the page turns over to the application once everything is in.
 */
export const useFinishSignUp = (progress: { current: FinishProgress }) =>
  useMutation({
    mutationFn: async ({ email, password, address, pin }: { email: string; password: string; address: AddressInput; pin: string }) => {
      if (progress.current.done === 'none') progress.current = { done: 'pin', token: (await onboardingApi.pin(progress.current.token, pin)).onboardingToken };
      if (progress.current.done === 'pin') {
        await onboardingApi.finish(progress.current.token);
        progress.current = { ...progress.current, done: 'finished' };
      }
      const tokens = await authApi.signIn({ method: 'password', emailOrPhone: email, password });
      // Best effort: the account stands without it, and it can be added later.
      await http.patch('/users/me', address, { skipAuth: true, headers: { Authorization: `Bearer ${tokens.accessToken}` } }).catch(() => undefined);
      session.set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    },
  });
