// The dashboard's view models and how they read: the shapes the screens
// render, built from the API in ./data.ts. Nothing here holds state, so
// nothing here can make the screens disagree with the backend.

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type Status = 'paid' | 'received' | 'pending' | 'failed';

/** One transaction as the screens show it. Built from the API in ./data.ts. */
export type Payment = {
  id: string;
  /** The backend's reference, shown on receipts and to support. */
  ref?: string;
  date: string; // ISO
  who: string;
  what: string;
  /** What reached the recipient, before any fee. */
  amount: number;
  fee?: number;
  currency: Currency;
  kind: 'in' | 'out';
  status: Status;
  /** For a bank transfer: who it went to, so they can be paid again. */
  recipient?: Recipient;
  note?: string;
};

/** A bank account someone has been paid at before. */
export type Recipient = { name: string; bankCode: string; bankName: string; accountNumber: string };

export type Session = { business: string; person: string; role: 'Owner' };

/** What kind of transaction it is, read from its description. */
export function kindOf(p: Payment) {
  if (/payment link/i.test(p.what)) return 'Invoice payment';
  if (/^bill/i.test(p.what)) return 'Bill';
  return p.kind === 'in' ? 'Transfer in' : 'Transfer';
}

export const settled = (p: Payment) => p.status === 'paid' || p.status === 'received';

/** Each status in words, with its quiet colour. */
export const STATUS: Record<Status, { label: string; short: string; tone: string }> = {
  paid: { label: 'Paid', short: 'Paid', tone: 'bg-[#efeee7] text-graphite/65' },
  received: { label: 'Received', short: 'Received', tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
  pending: { label: 'Processing', short: 'Processing', tone: 'bg-[#e6ecf7] text-[#2b4a86]' },
  failed: { label: 'Declined', short: 'Declined', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
};

/** A payment's reference, as it appears on a receipt. */
export const reference = (p: Payment) => p.ref ?? `CV-${p.id.replace(/\D/g, '').slice(-8).padStart(6, '0')}`;

const symbols: Record<Currency, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };
export const money = (n: number, c: Currency = 'NGN') =>
  `${symbols[c]}${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
