import { useSyncExternalStore } from 'react';

// The business dashboard's state: who is signed in, balances, payments and
// approvals. Kept in this browser for now.
// TODO(credvera): replace with the business API (sign-in sessions, KYB,
// payments, approvals). Nothing here talks to a server yet.

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type Status = 'paid' | 'received' | 'waiting' | 'sent back' | 'in transit';
export type Payment = {
  id: string;
  date: string; // ISO
  who: string;
  what: string;
  amount: number;
  currency: Currency;
  kind: 'in' | 'out';
  status: Status;
  requestedBy?: string;
  reason?: string;
  note?: string;
};
export type Recipient = { id: string; name: string; detail: string };
export type Session = { business: string; person: string; role: 'Owner' | 'Finance' | 'Staff' };

type State = {
  session: Session | null;
  balances: Record<Currency, number>;
  payments: Payment[];
};

/** Naira payments at or above this wait for a second approval. TODO(credvera): let the owner set it. */
export const APPROVAL_OVER = 500000;
export const TRANSFER_FEE = 25;

export const recipients: Recipient[] = [
  { id: 'r1', name: 'Kemi Adeyemi', detail: 'Zenith Bank · 21•• ••• 408' },
  { id: 'r2', name: 'Chinedu Logistics', detail: 'GTBank · 01•• ••• 772' },
  { id: 'r3', name: 'Ikeja Electric', detail: 'Prepaid · meter 4510 ••• 2931' },
  { id: 'r4', name: 'Lekki Property Partners', detail: 'Access Bank · 06•• ••• 115' },
  { id: 'r5', name: 'Tunde Bakare', detail: 'UBA · 20•• ••• 963' },
];

const day = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString();
};

// The example business, matching the website and the app.
const seed = (): State => ({
  session: null,
  balances: { NGN: 3420750, USD: 18240, GBP: 2150, EUR: 3400 },
  payments: [
    { id: 'p1', date: day(0), who: 'Kemi Adeyemi', what: 'Salary, September · Zenith Bank', amount: 650000, currency: 'NGN', kind: 'out', status: 'waiting', requestedBy: 'Tunde (Finance)', reason: 'Salary, September' },
    { id: 'p2', date: day(0), who: 'Chinedu Logistics', what: 'Delivery, Lekki route · GTBank', amount: 780000, currency: 'NGN', kind: 'out', status: 'waiting', requestedBy: 'Tunde (Finance)', reason: 'Deliveries, August and September' },
    { id: 'p3', date: day(1), who: 'Lekki Grill', what: 'INV-0143 · bank transfer', amount: 420000, currency: 'NGN', kind: 'in', status: 'received' },
    { id: 'p4', date: day(1), who: 'Adeola Foods event client', what: 'Payment link · card', amount: 830000, currency: 'NGN', kind: 'in', status: 'received' },
    { id: 'p5', date: day(2), who: 'Müller Verpackung GmbH', what: 'Supplier · Germany', amount: 2300, currency: 'EUR', kind: 'out', status: 'paid' },
    { id: 'p6', date: day(3), who: 'Ikeja Electric', what: 'Bill · prepaid', amount: 85000, currency: 'NGN', kind: 'out', status: 'paid' },
    { id: 'p7', date: day(4), who: 'Northwind Retail', what: 'Payment link · card', amount: 3200, currency: 'USD', kind: 'in', status: 'received' },
    { id: 'p8', date: day(5), who: 'Brightline Studio Ltd', what: 'Supplier · United Kingdom', amount: 1150, currency: 'GBP', kind: 'out', status: 'in transit' },
    { id: 'p9', date: day(6), who: 'Oak & Iron Studio', what: 'INV-0138 · card', amount: 180000, currency: 'NGN', kind: 'in', status: 'received' },
  ],
});

const KEY = 'credvera.dashboard';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch {
    // Storage unavailable: start from the example business.
  }
  return seed();
}

let state = load();
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Not saved; it still works for this visit.
  }
  listeners.forEach((l) => l());
}

export function useDash() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export const getDash = () => state;

export function signIn(session: Session) {
  set({ ...state, session });
}

export function signOut() {
  set({ ...state, session: null });
}

/** A new payment out. Big naira payments wait for someone else's approval. */
export function addPayment(input: { who: string; what: string; amount: number; reason: string }) {
  const needsApproval = input.amount >= APPROVAL_OVER;
  const p: Payment = {
    id: `p${Date.now()}`,
    date: new Date().toISOString(),
    who: input.who,
    what: input.what,
    amount: input.amount,
    currency: 'NGN',
    kind: 'out',
    status: needsApproval ? 'waiting' : 'paid',
    requestedBy: needsApproval ? `${state.session?.person ?? 'You'} (${state.session?.role ?? 'Owner'})` : undefined,
    reason: input.reason,
  };
  const balances = needsApproval ? state.balances : { ...state.balances, NGN: state.balances.NGN - input.amount - TRANSFER_FEE };
  set({ ...state, balances, payments: [p, ...state.payments] });
  return p;
}

export function approve(id: string) {
  const p = state.payments.find((x) => x.id === id);
  if (!p || p.status !== 'waiting') return;
  set({
    ...state,
    balances: { ...state.balances, [p.currency]: state.balances[p.currency] - p.amount - (p.currency === 'NGN' ? TRANSFER_FEE : 0) },
    payments: state.payments.map((x) => (x.id === id ? { ...x, status: 'paid', date: new Date().toISOString() } : x)),
  });
}

export function sendBack(id: string, note: string) {
  set({ ...state, payments: state.payments.map((x) => (x.id === id ? { ...x, status: 'sent back', note } : x)) });
}

const symbols: Record<Currency, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };
export const money = (n: number, c: Currency = 'NGN') =>
  `${symbols[c]}${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
