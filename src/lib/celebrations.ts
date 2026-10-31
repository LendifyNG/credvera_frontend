import { http } from '../api/client';

/**
 * Celebration pages at /c/:slug. Organisers create them in the Credvera app;
 * guests open the link or scan the QR on the invitation and send a gift,
 * by an account number made for that one gift or by card. No sign-in.
 */

export type CelebrationKind = 'wedding' | 'birthday' | 'naming' | 'burial' | 'other';
export type CelebrationTheme = 'ink' | 'lime' | 'paper';

export type Celebration = {
  slug: string;
  kind: CelebrationKind;
  title: string; // "Chidi & Amaka"
  date: string; // ISO date of the event
  message?: string | null;
  theme: CelebrationTheme;
  closed?: boolean;
};

export type GiftMethod = 'transfer' | 'card';

/** A gift as the API tracks it: pending until Monnify confirms the money arrived. */
export type GiftState = {
  reference: string;
  status: 'pending' | 'paid' | 'expired';
  method: GiftMethod;
  amount: string;
  account: { number: string; name: string | null; bank: string | null; expiresAt: string | null } | null;
  checkoutUrl: string | null;
};

export const KIND_LINE: Record<CelebrationKind, string> = {
  wedding: 'The wedding of',
  birthday: 'Celebrating',
  naming: 'The naming of',
  burial: 'Celebrating the life of',
  other: 'Join us for',
};

const page = (slug: string) => `/celebrations/page/${encodeURIComponent(slug)}`;

export const celebrationsApi = {
  find: (slug: string) => http.get<Celebration>(page(slug), { skipAuth: true }),
  startGift: (slug: string, gift: { amount: number; name: string; note?: string; method: GiftMethod }) =>
    http.post<GiftState>(`${page(slug)}/gifts`, { ...gift, amount: String(gift.amount), note: gift.note || undefined }, { skipAuth: true }),
  gift: (reference: string) => http.get<GiftState>(`/celebrations/gifts/${encodeURIComponent(reference)}`, { skipAuth: true }),
};

// What the guest typed, kept for the thank-you when card checkout sends them
// back to this page.
const KEY = (reference: string) => `credvera.gift.${reference}`;
export const rememberGift = (reference: string, draft: unknown) => {
  try {
    sessionStorage.setItem(KEY(reference), JSON.stringify(draft));
  } catch {
    // Private mode: the thank-you is plainer, nothing else changes.
  }
};
export const recallGift = <T,>(reference: string): T | null => {
  try {
    const raw = sessionStorage.getItem(KEY(reference));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
