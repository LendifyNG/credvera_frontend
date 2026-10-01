import { useMutation } from '@tanstack/react-query';
import { http } from './client';
import { session } from './session';
import type { SignInResponse } from './types';

export type SignInInput =
  | { method: 'password'; emailOrPhone: string; password: string }
  | { method: 'pin'; emailOrPhone: string; pin: string };

export const authApi = {
  signIn: (input: SignInInput) =>
    input.method === 'password'
      ? http.post<SignInResponse>('/auth/login', { emailOrPhone: input.emailOrPhone, password: input.password }, { skipAuth: true })
      : http.post<SignInResponse>('/auth/login/pin', { emailOrPhone: input.emailOrPhone, pin: input.pin }, { skipAuth: true }),

  signOut: () => http.post<{ message: string }>('/auth/logout'),
};

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
