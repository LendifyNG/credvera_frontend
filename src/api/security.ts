import { useMutation } from '@tanstack/react-query';
import { http } from './client';
import { session } from './session';
import type { SignInResponse } from './types';

// Changing the password and PIN, and ending every session.

export type ChangePasswordInput = { currentPassword: string; password: string };
export type ChangePinInput = { currentPin: string; pin: string };

export const securityApi = {
  changePassword: (input: ChangePasswordInput) => http.post<SignInResponse & { message: string }>('/auth/password/change', input),
  changePin: (input: ChangePinInput) => http.post<{ message: string }>('/auth/pin/change', input),
  signOutEverywhere: () => http.post<{ message: string }>('/auth/logout-all'),
};

/**
 * The API ends every session when the password changes, this one included,
 * and hands back a fresh one: kept here so the person stays signed in.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: securityApi.changePassword,
    onSuccess: ({ accessToken, refreshToken }) => session.set({ accessToken, refreshToken }),
  });
}

export function useChangePin() {
  return useMutation({ mutationFn: securityApi.changePin });
}

/** Signs out on every device, this one too. */
export function useSignOutEverywhere() {
  return useMutation({ mutationFn: securityApi.signOutEverywhere, onSettled: () => session.clear() });
}
