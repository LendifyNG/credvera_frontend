// The business feature pages, in order. Used by the business home page index,
// the menu and footer (via site.ts), and each page's "Next" link.
export const businessPages = [
  {
    to: '/business/payments',
    label: 'Payments and invoices',
    proof: 'Invoices and payment links, paid by card or transfer. ₦25 to pay any Nigerian bank.',
  },
  {
    to: '/business/fx',
    label: 'FX and currencies',
    proof: 'Dollar, pound and euro accounts in your name. Our rate beside the market rate.',
  },
  {
    to: '/business/suppliers',
    label: 'Pay suppliers abroad',
    proof: 'Pay when the goods ship. One flat fee, from ₦2,500.',
  },
  {
    to: '/business/cards',
    label: 'Business cards',
    proof: 'A dollar card for software and ads, a naira card for everyday costs.',
  },
] as const;

export type BusinessPage = (typeof businessPages)[number];
