import { useSyncExternalStore } from 'react';

// The dashboard's view models, and the demo data for features the API does
// not serve yet (invoices, links, customers, suppliers, cards, team, FX rates).
//
// Money is not here. Balances, transactions and the session come from the
// backend through ./data.ts, so nothing in this file can make a real balance
// look different from the ledger.
// TODO(credvera): move each demo feature to the API as its endpoints land.

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type Status = 'paid' | 'received' | 'waiting' | 'sent back' | 'in transit' | 'pending' | 'failed';

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
  requestedBy?: string;
  reason?: string;
  note?: string;
  // A conversion between the business's own currencies: shown in the list,
  // never counted as money in or out.
  internal?: boolean;
  // For a conversion: what arrived, and in which currency.
  toCurrency?: Currency;
  toAmount?: number;
};

/** A bank account someone has been paid at before. */
export type Recipient = { name: string; bankCode: string; bankName: string; accountNumber: string };

export type Session = { business: string; person: string; role: 'Owner' | 'Finance' | 'Staff' };

type State = {
  // The business's documents: still being checked, or done.
  documents: 'checking' | 'done';
  alerts: RateAlert[];
  cards: Card[];
  invoices: Invoice[];
  links: PayLink[];
  // Customers added by hand; the rest come from invoices and payments.
  contacts: Contact[];
  suppliers: Supplier[];
  checks: InvoiceCheck[];
  team: Member[];
  rules: Rules;
  profile: Profile;
  notify: Record<string, { email: boolean; app: boolean }>;
  cases: Case[];
  // Notifications already read, by id.
  seen: string[];
};

/** A problem reported to Credvera. */
export type Case = { id: string; subject: string; about?: string; detail: string; created: string; status: 'open' | 'answered'; reply?: string };

/** The business's details: the CAC record, and contact details they can change. */
export type Profile = { rc: string; type: string; registered: string; email: string; phone: string; address: string; industry: string };

export type Role = 'Owner' | 'Admin' | 'Finance' | 'Staff' | 'Accountant';
/** Someone with access to the business's dashboard and app. */
export type Member = { id: string; name: string; email: string; role: Role; status: 'active' | 'invited'; lastActive?: string };
/** Payments at or over `over` (naira) wait for one of the `approvers` roles; nobody approves their own. */
export type Rules = { over: number; approvers: Role[] };

/** A business the company pays, here or abroad. */
export type Supplier = { id: string; name: string; country: string; flag: string; currency: Currency; bank: string; account: string; since: string };

/** A supplier invoice checked against the account paid before. */
export type InvoiceCheck = { id: string; supplier: string; invoice: string; amount: number; currency: Currency; account: string; checked: string; result: 'match' | 'changed' | 'new' };

export type Contact = { name: string; email?: string; phone?: string };

/** A link a customer pays through, by card or bank transfer. */
export type PayLink = {
  id: string;
  title: string;
  note?: string;
  currency: Currency;
  amount: number | null; // null: the customer chooses
  reusable: boolean;
  created: string;
  paused?: boolean;
  paidBy: string[]; // who has paid through it, matching payments
};

export type InvoiceItem = { desc: string; qty: number; price: number };
/** An invoice to a customer. Overdue is worked out from the due date. */
export type Invoice = {
  id: string;
  number: string;
  customer: string;
  email: string;
  currency: Currency;
  items: InvoiceItem[];
  vat: boolean;
  issued: string;
  due: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid';
  paidOn?: string;
  /** The incoming transaction that settled it, once matched. */
  paymentId?: string;
  note?: string;
};

/** A business card: virtual for online spending, physical for the team. */
export type Card = {
  id: string;
  name: string; // what it's for
  currency: Currency;
  kind: 'virtual' | 'physical';
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
  limit: number; // a month, in the card's currency
  frozen?: boolean;
  status: 'active' | 'on its way';
};

/** "Tell me when $1 goes below ₦1,500." */
export type RateAlert = { id: string; currency: Exclude<Currency, 'NGN'>; when: 'above' | 'below'; rate: number };

/** Naira for one unit of each currency, the same rates as the app. TODO(credvera): live rates from the API. */
export const RATES: Record<Currency, number> = { NGN: 1, USD: 1535, GBP: 2065, EUR: 1790 };
export const RATES_UPDATED = '09:30';
/** Change since yesterday, in percent, as in the app. */
export const CHANGE_TODAY: Record<Exclude<Currency, 'NGN'>, number> = { USD: 0.4, GBP: -0.2, EUR: 0.1 };
/** Credvera's margin on conversions, as in the app: none. */
export const FX_MARGIN_PERCENT = 0;

/**
 * The last 30 days of a rate, ending at today's.
 * TODO(credvera): the rates provider's history. For now a gentle walk back
 * from today's rate, the same every time.
 */
export function rateHistory(c: Exclude<Currency, 'NGN'>) {
  const out: number[] = [RATES[c]];
  let seed = c.charCodeAt(0) * 31 + c.charCodeAt(1);
  for (let i = 1; i < 30; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const step = (seed / 233280 - 0.48) * 0.006;
    out.unshift(out[0]! * (1 - step));
  }
  return out;
}

/** Naira payments at or above this wait for a second approval. TODO(credvera): let the owner set it. */
export const APPROVAL_OVER = 500000;

const ahead = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t.toISOString();
};

const day = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString();
};

// The example business, the same as the business app's: Okafor Studios
// Limited, with its invoices, suppliers and cards.
const seed = (): State => ({
  documents: 'done',
  alerts: [],
  invoices: [
    { id: 'i3', number: 'INV-0003', customer: 'Lagoon Events Ltd', email: 'accounts@lagoonevents.ng', currency: 'NGN', items: [{ desc: 'Event identity and signage', qty: 1, price: 450000 }, { desc: 'Printed banners', qty: 6, price: 35000 }], vat: false, issued: day(3), due: ahead(11), status: 'sent' },
    { id: 'i2', number: 'INV-0002', customer: 'Brightline Studio Ltd', email: 'finance@brightline.co.uk', currency: 'GBP', items: [{ desc: 'Illustrations for product pages', qty: 1, price: 1200 }], vat: false, issued: day(24), due: day(4), status: 'sent' },
    { id: 'i1', number: 'INV-0001', customer: 'Chinedu Eze', email: 'chinedu@ezeholdings.ng', currency: 'NGN', items: [{ desc: 'Logo and brand guide', qty: 1, price: 185000 }], vat: false, issued: day(15), due: day(8), status: 'paid', paidOn: day(12) },
  ],
  links: [],
  contacts: [],
  suppliers: [
    { id: 's3', name: 'Shenzhen Hongda Trading Co.', country: 'China', flag: 'cn', currency: 'USD', bank: 'Bank of China', account: '6217853100008841', since: day(200) },
    { id: 's1', name: 'Müller Verpackung GmbH', country: 'Germany', flag: 'de', currency: 'EUR', bank: 'Commerzbank', account: 'DE89370400440532013000', since: day(150) },
    { id: 's2', name: 'Brightline Studio Ltd', country: 'United Kingdom', flag: 'gb', currency: 'GBP', bank: 'Sort code 30-96-34', account: '41822690', since: day(90) },
  ],
  checks: [],
  team: [
    { id: 'm1', name: 'Adaeze Okafor', email: 'adaeze.okafor@example.com', role: 'Owner', status: 'active', lastActive: day(0) },
    { id: 'm2', name: 'Tunde Bakare', email: 'tunde.bakare@example.com', role: 'Admin', status: 'active', lastActive: day(1) },
    { id: 'm3', name: 'Kemi Adeyemi', email: 'kemi.adeyemi@example.com', role: 'Finance', status: 'active', lastActive: day(3) },
  ],
  rules: { over: APPROVAL_OVER, approvers: ['Owner', 'Admin'] },
  profile: { rc: 'RC 1845523', type: 'Private company limited by shares', registered: '12 March 2021', email: 'adaeze.okafor@example.com', phone: '+234 803 000 0000', address: '14 Adeola Odeku Street, Victoria Island, Lagos', industry: 'Creative and design services' },
  notify: {
    in: { email: false, app: true },
    out: { email: false, app: true },
    approvals: { email: true, app: true },
    overdue: { email: true, app: true },
    rates: { email: true, app: true },
    weekly: { email: true, app: false },
  },
  seen: [],
  cases: [],
  // The same cards as the app; physical business cards aren't out yet.
  cards: [
    { id: 'c-usd', name: 'Online spending', currency: 'USD', kind: 'virtual', holder: 'Adaeze Okafor', number: '5399 8312 0457 7719', expiry: '09/29', cvv: '482', limit: 2000, status: 'active' },
    { id: 'c-ngn', name: 'Expenses', currency: 'NGN', kind: 'virtual', holder: 'Adaeze Okafor', number: '5061 2204 9913 5530', expiry: '09/29', cvv: '215', limit: 1500000, status: 'active' },
  ],
});

// Bumped when the example data changes, so older saved copies reset. v16
// dropped the demo balances and payments, which now come from the API.
const KEY = 'credvera.dashboard.v16';

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

export function addSupplier(sup: Omit<Supplier, 'id' | 'since'>) {
  set({ ...state, suppliers: [...state.suppliers, { ...sup, id: `su${Date.now()}`, since: new Date().toISOString() }] });
}

/** Compares the bank details on a supplier's invoice with the account paid before. */
export function checkInvoice(input: Pick<InvoiceCheck, 'supplier' | 'invoice' | 'amount' | 'currency' | 'account'>) {
  const known = state.suppliers.find((x) => x.name === input.supplier);
  const same = (a: string, b: string) => a.replace(/\W/g, '').toUpperCase() === b.replace(/\W/g, '').toUpperCase();
  const result: InvoiceCheck['result'] = !known ? 'new' : same(known.account, input.account) ? 'match' : 'changed';
  const check: InvoiceCheck = { ...input, id: `k${Date.now()}`, checked: new Date().toISOString(), result };
  set({ ...state, checks: [check, ...state.checks] });
  return check;
}

export function inviteMember(m: Pick<Member, 'name' | 'email' | 'role'>) {
  set({ ...state, team: [...state.team, { ...m, id: `m${Date.now()}`, status: 'invited' }] });
}

export function updateMember(id: string, change: Partial<Member>) {
  set({ ...state, team: state.team.map((m) => (m.id === id ? { ...m, ...change } : m)) });
}

export function removeMember(id: string) {
  set({ ...state, team: state.team.filter((m) => m.id !== id) });
}

export function setRules(change: Partial<Rules>) {
  set({ ...state, rules: { ...state.rules, ...change } });
}

/** Links a payment that came in to the invoice it paid, and marks the invoice paid. */
export function matchPayment(payment: Pick<Payment, 'id' | 'date'>, invoiceId: string) {
  set({
    ...state,
    invoices: state.invoices.map((x) => (x.id === invoiceId ? { ...x, status: 'paid', paidOn: payment.date, paymentId: payment.id } : x)),
  });
}

export function updateProfile(change: Partial<Profile>) {
  set({ ...state, profile: { ...state.profile, ...change } });
}

export function setNotify(key: string, channel: 'email' | 'app', on: boolean) {
  set({ ...state, notify: { ...state.notify, [key]: { ...state.notify[key]!, [channel]: on } } });
}

/** TODO(credvera): opens a case with the support team through the API. */
export function reportProblem(c: Pick<Case, 'subject' | 'about' | 'detail'>) {
  set({ ...state, cases: [{ ...c, id: `h${Date.now()}`, created: new Date().toISOString(), status: 'open' }, ...state.cases] });
}

export function markSeen(ids: string[]) {
  set({ ...state, seen: [...new Set([...state.seen, ...ids])] });
}

export function addContact(c: Contact) {
  set({ ...state, contacts: [...state.contacts.filter((x) => x.name !== c.name), c] });
}

/** A link's address. TODO(credvera): the real checkout domain. */
export const linkUrl = (l: PayLink) => `https://pay.credvera.co/l/${l.id}-${l.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)}`;

export function addLink(input: Omit<PayLink, 'id' | 'created' | 'paidBy'>) {
  const link: PayLink = { ...input, id: `l${Date.now().toString(36)}`, created: new Date().toISOString(), paidBy: [] };
  set({ ...state, links: [link, ...state.links] });
  return link;
}

export function updateLink(id: string, change: Partial<PayLink>) {
  set({ ...state, links: state.links.map((l) => (l.id === id ? { ...l, ...change } : l)) });
}

/** VAT in Nigeria: 7.5%. */
export const VAT = 0.075;

export function invoiceTotals(inv: Pick<Invoice, 'items' | 'vat'>) {
  const subtotal = inv.items.reduce((a, i) => a + i.qty * i.price, 0);
  const vat = inv.vat ? subtotal * VAT : 0;
  return { subtotal, vat, total: subtotal + vat };
}

export const isOverdue = (inv: Invoice) => inv.status !== 'paid' && inv.status !== 'draft' && new Date(inv.due).getTime() < new Date().setHours(0, 0, 0, 0);

export function saveInvoice(inv: Omit<Invoice, 'id' | 'number'>) {
  const n = Math.max(0, ...state.invoices.map((i) => Number(i.number.slice(4)))) + 1;
  const invoice: Invoice = { ...inv, id: `i${Date.now()}`, number: `INV-${String(n).padStart(4, '0')}` };
  set({ ...state, invoices: [invoice, ...state.invoices] });
  return invoice;
}

export function updateInvoice(id: string, change: Partial<Invoice>) {
  set({ ...state, invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...change } : i)) });
}

/**
 * Records that the customer paid outside Credvera. No money is booked here:
 * a payment into the account arrives as a real transaction of its own.
 */
export function markInvoicePaid(id: string) {
  set({ ...state, invoices: state.invoices.map((i) => (i.id === id && i.status !== 'paid' ? { ...i, status: 'paid', paidOn: new Date().toISOString() } : i)) });
}

export function updateCard(id: string, change: Partial<Card>) {
  set({ ...state, cards: state.cards.map((c) => (c.id === id ? { ...c, ...change } : c)) });
}

/** A new card. TODO(credvera): the issuer creates it and returns its details. */
export function addCard(input: Pick<Card, 'name' | 'currency' | 'kind' | 'holder' | 'limit'>) {
  const digits = () => String(Math.floor(1000 + Math.random() * 9000));
  const card: Card = {
    ...input,
    id: `c${Date.now()}`,
    number: `${input.currency === 'NGN' ? '5061' : '5399'} ${digits()} ${digits()} ${digits()}`,
    expiry: '10/30',
    cvv: String(Math.floor(100 + Math.random() * 900)),
    status: input.kind === 'physical' ? 'on its way' : 'active',
  };
  set({ ...state, cards: [...state.cards, card] });
  return card;
}

export function addAlert(a: Omit<RateAlert, 'id'>) {
  set({ ...state, alerts: [...state.alerts, { ...a, id: `a${Date.now()}` }] });
}

export function removeAlert(id: string) {
  set({ ...state, alerts: state.alerts.filter((x) => x.id !== id) });
}

/** What kind of transaction it is, read from its description. */
export function kindOf(p: Payment) {
  if (p.internal) return 'Conversion';
  if (/payment link/i.test(p.what)) return 'Payment link';
  if (/INV-/.test(p.what)) return 'Invoice';
  if (/^bill/i.test(p.what)) return 'Bill';
  if (/^card/i.test(p.what)) return 'Card payment';
  if (/supplier/i.test(p.what)) return 'Payment abroad';
  if (/salary/i.test(p.what)) return 'Salary';
  return p.kind === 'in' ? 'Transfer in' : 'Transfer';
}

export const settled = (p: Payment) => p.status === 'paid' || p.status === 'received';

/** Each status in words, with its quiet colour. */
export const STATUS: Record<Status, { label: string; short: string; tone: string }> = {
  paid: { label: 'Paid', short: 'Paid', tone: 'bg-[#efeee7] text-graphite/65' },
  received: { label: 'Received', short: 'Received', tone: 'bg-[#e3f1e0] text-[#1f6b33]' },
  waiting: { label: 'Waiting for approval', short: 'To approve', tone: 'bg-[#fbf0d6] text-[#8a5a00]' },
  'in transit': { label: 'On its way', short: 'On its way', tone: 'bg-[#e6ecf7] text-[#2b4a86]' },
  'sent back': { label: 'Sent back', short: 'Sent back', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
  pending: { label: 'Processing', short: 'Processing', tone: 'bg-[#e6ecf7] text-[#2b4a86]' },
  failed: { label: 'Declined', short: 'Declined', tone: 'bg-[#f6e7e0] text-[#9a3a17]' },
};

/** A payment's reference, as it appears on a receipt. */
export const reference = (p: Payment) => p.ref ?? `CV-${p.id.replace(/\D/g, '').slice(-8).padStart(6, '0')}`;

const symbols: Record<Currency, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };
export const money = (n: number, c: Currency = 'NGN') =>
  `${symbols[c]}${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
