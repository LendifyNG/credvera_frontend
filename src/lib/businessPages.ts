// The business feature pages, in order. Used by the business home page index,
// the menu and footer (via site.ts), and each page's "Next" link.
export const businessPages = [
  {
    to: '/business/payments',
    label: 'Payments and invoices',
    proof: 'Invoices and payment links, paid by card or transfer. From ₦10 to pay any Nigerian bank.',
  },
] as const;

export type BusinessPage = (typeof businessPages)[number];
