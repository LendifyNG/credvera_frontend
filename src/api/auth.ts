import { useMutation } from '@tanstack/react-query';
import { http } from './client';
import { deviceHeaders } from './device';
import { session } from './session';
import type { SignInResponse } from './types';

export type SignInInput =
  | { method: 'password'; emailOrPhone: string; password: string }
  | { method: 'pin'; emailOrPhone: string; pin: string };

export const authApi = {
  signIn: (input: SignInInput) =>
    input.method === 'password'
      ? http.post<SignInResponse>('/auth/login', { emailOrPhone: input.emailOrPhone, password: input.password }, { skipAuth: true, headers: deviceHeaders() })
      : http.post<SignInResponse>('/auth/login/pin', { emailOrPhone: input.emailOrPhone, pin: input.pin }, { skipAuth: true, headers: deviceHeaders() }),

  /** A code texted to the phone on the account; the same answer whether or not there is one. */
  sendCode: (phone: string) => http.post<{ message: string; sentTo?: string }>('/auth/login/code', { phone }, { skipAuth: true }),
  checkCode: (phone: string, code: string) => http.post<{ pinStep: string; expiresInSeconds: number }>('/auth/login/code/verify', { phone, code }, { skipAuth: true }),
  finishWithPin: (pinStep: string, pin: string) => http.post<SignInResponse>('/auth/login/code/pin', { pinStep, pin }, { skipAuth: true }),

  signOut: () => http.post<{ message: string }>('/auth/logout'),
};

/** Text-code sign-in: send the code, check it, then the PIN opens a session. */
export function useCodeSignIn() {
  return {
    send: useMutation({ mutationFn: authApi.sendCode }),
    check: useMutation({ mutationFn: ({ phone, code }: { phone: string; code: string }) => authApi.checkCode(phone, code) }),
    finish: useMutation({
      mutationFn: ({ pinStep, pin }: { pinStep: string; pin: string }) => authApi.finishWithPin(pinStep, pin),
      onSuccess: ({ accessToken, refreshToken }) => session.set({ accessToken, refreshToken }),
    }),
  };
}

/** Signs in and keeps the session; everything else reads it from there. */
export function useSignIn() {
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: ({ accessToken, refreshToken }) => session.set({ accessToken, refreshToken }),
  });
}

/**
 * Ends the session on the server, then here. Signed out locally even if the
 * server can't be reached: leaving someone signed in after they asked to
 * leave is the worse failure.
 */
export function useSignOut() {
  return useMutation({
    mutationFn: authApi.signOut,
    onSettled: () => session.clear(),
  });
}
