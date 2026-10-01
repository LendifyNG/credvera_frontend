import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { Page } from './types';

// Payment requests: an invoice with a link the customer pays through, by card
// or bank. Acting for a business, they are the business's and settle into its
// wallet (the client sends X-Business-Id).

export type PaymentLinkStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

export type PaymentLinkItemDto = { description: string; rate: string; quantity: number; subtotal: string };

export type PaymentLinkDto = {
  reference: string;
  invoiceName: string;
  note: string | null;
  currency: string;
  amount: string;
  status: PaymentLinkStatus;
  /** The shareable page the customer pays on. */
  url: string;
  recipient: { name: string; email: string | null; phone: string | null; address: string | null };
  items: PaymentLinkItemDto[];
  paidAt: string | null;
  paidAmount: string | null;
  payerName: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type CreatePaymentLinkInput = {
  invoiceName: string;
  currency: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  note?: string;
  items: { description: string; rate: number; quantity: number }[];
};

/** The invoice as the person paying sees it, from the public page. */
export type PublicInvoiceDto = {
  reference: string;
  from: string | null;
  invoiceName: string;
  note: string | null;
  currency: string;
  amount: string;
  status: PaymentLinkStatus;
  billedTo: string;
  items: PaymentLinkItemDto[];
  expiresAt: string | null;
  paidAt: string | null;
};

// Small businesses raise far fewer than this; the API caps a page at 100.
const LIMIT = 100;

export const paymentLinksApi = {
  list: () => http.get<Page<PaymentLinkDto>>('/payment-links', { params: { limit: LIMIT } }).then((page) => page.data),
  currencies: () => http.get<{ currency: string }[]>('/payment-links/currencies').then((rows) => rows.map((r) => r.currency)),
  create: (input: CreatePaymentLinkInput) => http.post<PaymentLinkDto>('/payment-links', input),
  cancel: (reference: string) => http.post<PaymentLinkDto>(`/payment-links/${reference}/cancel`),

  // The payer's side: no sign-in.
  view: (slug: string) => http.get<PublicInvoiceDto>(`/pay/${slug}`, { skipAuth: true }),
  checkout: (slug: string) => http.post<{ url: string }>(`/pay/${slug}/checkout`, undefined, { skipAuth: true }),
};

/** Every payment request raised, newest first. */
export function usePaymentLinks() {
  return useQuery({ queryKey: queryKeys.paymentLinks, queryFn: paymentLinksApi.list, enabled: useSignedIn() });
}

/** Currencies a request can be raised in. */
export function usePaymentLinkCurrencies() {
  return useQuery({ queryKey: queryKeys.paymentLinkCurrencies, queryFn: paymentLinksApi.currencies, enabled: useSignedIn(), staleTime: Infinity });
}

function useRemember() {
  const client = useQueryClient();
  return (link: PaymentLinkDto) =>
    client.setQueryData<PaymentLinkDto[]>(queryKeys.paymentLinks, (links = []) => [link, ...links.filter((l) => l.reference !== link.reference)]);
}

export function useCreatePaymentLink() {
  const remember = useRemember();
  return useMutation({ mutationFn: paymentLinksApi.create, onSuccess: remember });
}

export function useCancelPaymentLink() {
  const remember = useRemember();
  return useMutation({ mutationFn: paymentLinksApi.cancel, onSuccess: remember });
}

/** The public pay page's invoice. */
export function usePublicInvoice(slug: string) {
  return useQuery({ queryKey: queryKeys.publicInvoice(slug), queryFn: () => paymentLinksApi.view(slug), retry: false });
}

export function useCheckout(slug: string) {
  return useMutation({ mutationFn: () => paymentLinksApi.checkout(slug) });
}
