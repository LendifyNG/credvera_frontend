import { http } from '../api/client';
import type { PaymentState } from '../components/pay/PayFlow';

/**
 * Split-bill pay pages at /s/:token. Someone splits a bill in the Credvera
 * app and each person they split with is texted their own link, where they
 * pay their share by bank transfer or card. No sign-in.
 */

export type SplitShare = {
  title: string; // "Friday dinner"
  from: string; // the first name of whoever split it
  name: string; // who this share is for
  amount: string;
  paid: string;
  left: string;
  settled: boolean;
  closed: boolean;
};

const path = (token: string) => `/splits/pay/${encodeURIComponent(token)}`;

export const splitsApi = {
  find: (token: string) => http.get<SplitShare>(path(token), { skipAuth: true }),
  pay: (token: string, payment: { method: 'transfer' | 'card'; amount: number }) =>
    http.post<PaymentState>(path(token), { method: payment.method, amount: payment.amount.toFixed(2) }, { skipAuth: true }),
  payment: (token: string, reference: string) => http.get<PaymentState>(`${path(token)}/payments/${encodeURIComponent(reference)}`, { skipAuth: true }),
};
