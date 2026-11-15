import { http } from '../api/client';
import type { PaymentState } from '../components/pay/PayFlow';

/**
 * Aso-ebi pages at /a/:slug. An organiser sets up the family fabric in the
 * Credvera app, with an option or two and a deadline; guests open the link,
 * pick what they want and pay by an account number made for that one order,
 * or by card. No sign-in. An order counts only once the API has Monnify's
 * confirmation.
 */

export type AsoEbiState = 'open' | 'closed' | 'past_deadline' | 'on_hold';

export type AsoEbiOption = {
  id: string;
  name: string; // "Gele"
  price: string; // "15000.00"
  /** Pieces left where there's a stock limit; null when there isn't one. 0 = sold out. */
  left: number | null;
};

export type AsoEbiPage = {
  slug: string;
  title: string;
  note: string | null;
  deadline: string; // "YYYY-MM-DD", Lagos
  state: AsoEbiState;
  organiser: string; // "Adaeze O."
  options: AsoEbiOption[];
  celebration: { slug: string; title: string } | null;
};

export type OrderMethod = 'transfer' | 'card';

/** An order as the API tracks it. It never carries the buyer's details. */
export type OrderState = PaymentState & {
  quantity: number;
  option: { id: string; name: string } | null;
  collection: { slug: string; title: string };
  paidAt: string | null;
};

export type OrderDraft = {
  optionId: string;
  quantity: number;
  name: string;
  phone: string;
  size?: string;
  method: OrderMethod;
};

export const MAX_QUANTITY = 20;

const page = (slug: string) => `/aso-ebi/page/${encodeURIComponent(slug)}`;

export const asoEbiApi = {
  find: (slug: string) => http.get<AsoEbiPage>(page(slug), { skipAuth: true }),
  order: (slug: string, d: OrderDraft) => http.post<OrderState>(`${page(slug)}/orders`, { ...d, size: d.size || undefined }, { skipAuth: true }),
  status: (reference: string) => http.get<OrderState>(`/aso-ebi/orders/${encodeURIComponent(reference)}`, { skipAuth: true }),
};

// Orders started on this phone, kept so a guest can come back to one (after
// card checkout, or a closed tab) and see a receipt. Only the references:
// never the name, phone or sizes.
const ORDERS = (slug: string) => `credvera.asoebi.${slug}`;
export const keptOrders = (slug: string): string[] => {
  try {
    const list = JSON.parse(localStorage.getItem(ORDERS(slug)) ?? '[]') as unknown;
    return Array.isArray(list) ? list.filter((r): r is string => typeof r === 'string') : [];
  } catch {
    return [];
  }
};
export const keepOrder = (slug: string, reference: string) => {
  try {
    localStorage.setItem(ORDERS(slug), JSON.stringify([reference, ...keptOrders(slug).filter((r) => r !== reference)].slice(0, 10)));
  } catch {
    // Private mode: the order still goes through, it just can't be resumed.
  }
};
export const forgetOrder = (slug: string, reference: string) => {
  try {
    localStorage.setItem(ORDERS(slug), JSON.stringify(keptOrders(slug).filter((r) => r !== reference)));
  } catch {
    // Nothing kept to forget.
  }
};


/** "2026-12-20" → "Saturday, 20 December". The year only when it isn't this year. */
export function deadlineDate(iso: string, withDay = true) {
  const d = new Date(`${iso}T12:00:00`);
  const thisYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-GB', { ...(withDay ? { weekday: 'long' } : {}), day: 'numeric', month: 'long', ...(thisYear ? {} : { year: 'numeric' }) });
}

/** Whole days from today (Lagos) to the deadline: 0 on the day itself. */
export function daysLeft(iso: string) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}
