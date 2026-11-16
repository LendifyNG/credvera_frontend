// The business feature pages, in order. Used by the business home page index,
// the menu and footer (via site.ts), and each page's "Next" link.
import { INTERNATIONAL } from './launch';

const withAbroad = [
  {
    to: '/business/payments',
    label: 'Payments and invoices',
    proof: 'Invoices and payment links, paid by card or transfer. From ₦10 to pay any Nigerian bank.',
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

// At launch (lib/launch.ts) the naira features take the international places:
// payouts for FX, protected orders for suppliers abroad, team for cards.
const atLaunch = [
  withAbroad[0],
  {
    to: '/business/payouts',
    label: 'Bulk and scheduled payouts',
    proof: 'Pay your whole team from one list, or on a date you set. From ₦10 a transfer.',
  },
  {
    to: '/business/suppliers',
    label: 'Protected supplier payments',
    proof: 'Pay a deposit now. The rest is held until the goods are on their way.',
  },
  {
    to: '/business/team',
    label: 'Team and approvals',
    proof: 'Invite your team, set who can pay, and approve big payments before they go.',
  },
] as const;

export type BusinessPage = { to: string; label: string; proof: string };

export const businessPages: readonly [BusinessPage, BusinessPage, BusinessPage, BusinessPage] = INTERNATIONAL ? withAbroad : atLaunch;
