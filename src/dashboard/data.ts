import { useMemo } from 'react';
import {
  useActiveBusinessId,
  useBusinesses,
  useProfile,
  useTransactions,
  useVirtualAccount,
  useWallets,
  type BusinessDto,
  type TransactionDto,
  type WalletDto,
} from '../api';
import type { Currency, Payment, Recipient, Session, Status } from './model';

// The seam between the API and the screens. Screens ask for balances,
// payments and the session in the shapes they already render; only this file
// knows what the backend actually sends.

/** The four currencies the dashboard shows, in display order. */
export const CURRENCY_CODES: Currency[] = ['NGN', 'USD', 'GBP', 'EUR'];

const isCurrency = (code: string): code is Currency => (CURRENCY_CODES as string[]).includes(code);

// ── Session ──────────────────────────────────────────────────────────────────

/**
 * Who is signed in, and for which business. The person applied for the
 * business, so they are its owner.
 * TODO(credvera): roles for team members once the API has them.
 */
export function useSession(): Session | undefined {
  const { data } = useProfile();
  const business = useActiveBusiness();

  return useMemo(() => {
    if (!data) return undefined;
    const first = nameCase(data.firstName);
    return { business: business?.name ?? `${first} ${nameCase(data.lastName)}`, person: first, role: 'Owner' as const };
  }, [data, business]);
}

/** The business the dashboard is acting for, once chosen. */
export function useActiveBusiness(): BusinessDto | undefined {
  const { data } = useBusinesses();
  const id = useActiveBusinessId();
  return data?.find((b) => b.id === id);
}

/** Businesses with an account to act on: sent for review, or open. */
export const usableBusinesses = (businesses: BusinessDto[] | undefined) =>
  (businesses ?? []).filter((b) => b.status !== 'draft' && b.status !== 'rejected');

/** BVN records hold names in capitals: "ADA OKONKWO" -> "Ada Okonkwo". */
export const nameCase = (name: string) => name.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toUpperCase());

// ── Balances ─────────────────────────────────────────────────────────────────

/** Each currency's balance, zero for a currency without a wallet yet. */
export function useBalances() {
  const query = useWallets();

  const { balances, wallets } = useMemo(() => {
    const balances: Record<Currency, number> = { NGN: 0, USD: 0, GBP: 0, EUR: 0 };
    const wallets: Partial<Record<Currency, WalletDto>> = {};

    for (const wallet of query.data ?? []) {
      if (!isCurrency(wallet.currency)) continue;
      balances[wallet.currency] = Number(wallet.ledgerAccount.balance);
      wallets[wallet.currency] = wallet;
    }

    return { balances, wallets };
  }, [query.data]);

  return { balances, wallets, isLoading: query.isLoading, error: query.error };
}

/** The account people pay into for one currency, or why there isn't one yet. */
export function usePayInAccount(currency: Currency) {
  const { wallets, isLoading: loadingWallets } = useBalances();
  const wallet = wallets[currency];
  const account = useVirtualAccount(wallet?.id);

  return {
    wallet,
    account: account.data ?? null,
    isLoading: loadingWallets || account.isLoading,
    /** True when the details can be shared with a payer right now. */
    ready: account.data?.status === 'active' && !!account.data.accountNumber,
  };
}

// ── Payments ─────────────────────────────────────────────────────────────────

/** Every transaction loaded so far, newest first, in the screens' shape. */
export function usePayments() {
  const query = useTransactions();

  const payments = useMemo(
    () =>
      (query.data?.pages ?? [])
        .flatMap((page) => page.data)
        .map(toPayment)
        .filter((payment): payment is Payment => payment !== null),
    [query.data],
  );

  return {
    payments,
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    loadingMore: query.isFetchingNextPage,
  };
}

/** Bank accounts paid before, most recent first, each once. */
export function recentRecipients(payments: Payment[], limit = 6): Recipient[] {
  const seen = new Set<string>();
  const out: Recipient[] = [];

  for (const payment of payments) {
    const r = payment.recipient;
    if (!r) continue;
    const key = `${r.bankCode}:${r.accountNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
    if (out.length === limit) break;
  }

  return out;
}

/** `0123456789` -> `•••• 6789` */
export const maskAccount = (accountNumber?: string) => (accountNumber ? `•••• ${accountNumber.slice(-4)}` : '');

const REFUNDED = 'The money is back in your account.';

function statusOf(tx: TransactionDto, incoming: boolean): Status {
  switch (tx.status) {
    case 'success':
      return incoming ? 'received' : 'paid';
    case 'pending':
      return 'pending';
    default:
      return 'failed';
  }
}

function noteOf(tx: TransactionDto): string | undefined {
  if (tx.status === 'reversed') return `Reversed. ${REFUNDED}`;
  if (tx.status !== 'failed') return undefined;
  const reason = tx.metadata?.providerMessage;
  return reason ? `${reason}. ${REFUNDED}` : REFUNDED;
}

/**
 * One backend transaction as the screens show it. Descriptions follow the
 * conventions `kindOf` reads (e.g. bills start with "Bill ·").
 * Currencies the dashboard doesn't show are left out.
 */
export function toPayment(tx: TransactionDto): Payment | null {
  if (!isCurrency(tx.currency)) return null;

  const m = tx.metadata ?? {};
  const incoming = tx.type === 'deposit';
  const base = {
    id: tx.id,
    ref: tx.reference,
    date: tx.createdAt,
    currency: tx.currency,
    kind: incoming ? ('in' as const) : ('out' as const),
    status: statusOf(tx, incoming),
    note: noteOf(tx),
    amount: Number(tx.amount),
  };

  switch (tx.type) {
    case 'transfer':
      return {
        ...base,
        who: m.accountName ?? 'Bank transfer',
        what: [m.bankName, maskAccount(m.destinationAccount)].filter(Boolean).join(' · ') || 'Bank transfer',
        // The backend records the total debited; the screens show what was sent.
        amount: m.amount ?? base.amount,
        fee: m.fee,
        recipient:
          m.accountName && m.destinationBank && m.destinationAccount
            ? { name: m.accountName, bankCode: m.destinationBank, bankName: m.bankName ?? '', accountNumber: m.destinationAccount }
            : undefined,
      };
    case 'airtime':
      return { ...base, who: 'Airtime', what: `Bill · airtime · ${m.phoneNumber ?? ''}` };
    case 'data':
      return { ...base, who: 'Data', what: `Bill · data${m.bundleValue ? ` · ${m.bundleValue}` : ''} · ${m.phoneNumber ?? ''}` };
    case 'electricity':
      return { ...base, who: 'Electricity', what: `Bill · electricity${m.meterReference ? ` · ${m.meterReference}` : ''}` };
    case 'deposit':
      return {
        ...base,
        who: m.payerName ?? m.senderName ?? (m.source === 'dev-tooling' ? 'Test credit' : 'Bank transfer'),
        what: m.source === 'payment-link' ? 'Payment link' : 'Money in',
      };
    default:
      return { ...base, who: 'Withdrawal', what: 'Withdrawal' };
  }
}
