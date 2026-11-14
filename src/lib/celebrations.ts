import { http } from '../api/client';

/**
 * Celebration pages at /c/:slug. Organisers create them in the Credvera app;
 * guests open the link or scan the QR on the invitation and send a gift,
 * by an account number made for that one gift or by card, or transfer any
 * amount straight to the celebration's own number. No sign-in.
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
  /** The celebration's own number, while it's open; null until issued. */
  account?: { number: string; name: string | null; bank: string | null } | null;
  /** The day itself: guests can buy spray money and flick it onto the live screen. */
  sprayOn?: boolean;
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
  kind?: 'gift' | 'spray';
  /** Spray money, as notes: how many in all, flicked onto the screen, and left. */
  spray?: Wad | null;
  /** Only in the reply that starts spray money: the key that lets this phone flick it. */
  sprayKey?: string;
};

export type Wad = { note: SprayNoteValue; notes: number; sprayed: number; left: number };
export type SprayNoteValue = 200 | 500 | 1000;
export const SPRAY_NOTES: SprayNoteValue[] = [200, 500, 1000];
export const MIN_SPRAY = 1_000;
export const MAX_SPRAY = 1_000_000;
export const MAX_NOTES = 2_000;

export type SprayEvent = { seq: number; name: string; amount: number; note: SprayNoteValue; notes: number; at: string };
export type LiveState = {
  slug: string;
  title: string;
  kind: CelebrationKind;
  date: string;
  theme: CelebrationTheme;
  sprayOn: boolean;
  closed: boolean;
  total: number;
  sprayers: number;
  top: { name: string; amount: number }[];
  events: SprayEvent[];
  last: number;
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
  startGift: (slug: string, gift: { amount: number; name: string; note?: string; method: GiftMethod; kind?: 'gift' | 'spray'; noteValue?: SprayNoteValue }) =>
    http.post<GiftState>(`${page(slug)}/gifts`, { ...gift, amount: String(gift.amount), note: gift.note || undefined }, { skipAuth: true }),
  gift: (reference: string) => http.get<GiftState>(`/celebrations/gifts/${encodeURIComponent(reference)}`, { skipAuth: true }),
  /** Flicks notes from this phone's spray money onto the live screen. */
  spray: (reference: string, key: string, notes: number) =>
    http.post<Wad & { flicked: number }>(`/celebrations/sprays/${encodeURIComponent(reference)}`, { key, notes }, { skipAuth: true }),
  live: (slug: string, after: number) => http.get<LiveState>(`${page(slug)}/live?after=${after}`, { skipAuth: true }),
};

/** "Ada & Tunde" → "A&T", "Tolu at 30" → "TA": the monogram on the spray notes. */
export function monogram(title: string) {
  const parts = title.split('&').map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('&');
  return title
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

// Spray money bought on this phone, kept so a guest can come back to it
// (after card checkout, or a closed tab). The key is what lets this phone,
// and only this phone, flick the notes.
type KeptWad = { reference: string; key: string; name: string };
const WADS = (slug: string) => `credvera.spray.${slug}`;
export const keptWads = (slug: string): KeptWad[] => {
  try {
    return JSON.parse(localStorage.getItem(WADS(slug)) ?? '[]') as KeptWad[];
  } catch {
    return [];
  }
};
export const keepWad = (slug: string, wad: KeptWad) => {
  try {
    localStorage.setItem(WADS(slug), JSON.stringify([wad, ...keptWads(slug).filter((w) => w.reference !== wad.reference)].slice(0, 20)));
  } catch {
    // Private mode: the notes can still be flicked until the tab closes.
  }
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
