import type { Audience } from './audience';

// Single source of truth for company details, links, statistics and navigation.
// Every statistic below is a real, published figure with its source.

// Company details as the CAC status report records them (RC 9894055). Keep the
// address, phone, email and description word for word the same as the Monnify
// dashboard and the board resolution letterhead. CAC lists no separate head
// office, so the registered address is the office address.
// TODO(credvera): the pricing below is still to be confirmed.

export const company = {
  name: 'Credvera',
  legalName: 'Credvera Technologies Limited',
  rcNumber: '9894055',
  address: '5, Aderoju Adewuyi Street, Opebi, Lagos State, Nigeria',
  email: 'credveratechnologies@gmail.com',
  supportEmail: 'credveratechnologies@gmail.com',
  phone: '+234 704 320 6643',
  supportHours: 'Monday to Friday, 8am – 6pm WAT', // placeholder
  // What the company does, in CAC's words (principal business activity), then
  // what the app does. Shown in the footer and the legal pages.
  description:
    'Credvera Technologies Limited carries on software programming, development and provision of computer applications and related digital technology solutions. Its product, Credvera, is a mobile and web app that individuals and businesses in Nigeria use to receive and make naira payments, send money to Nigerian banks, pay bills and buy airtime, save, split bills, and send invoices and payment links.',
  licenceStatement:
    'Credvera is a software company, not a bank. Payment services in the app are provided by licensed partners.',
  // Shown in the footer and sent to search engines as the company's profiles.
  // Leave a profile null until it exists; null ones are hidden.
  socials: {
    LinkedIn: 'https://www.linkedin.com/company/credvera',
    YouTube: 'https://www.youtube.com/@credvera',
    X: null,
    Instagram: null,
  } as Record<string, string | null>,
};

/** The main call to action for each audience: personal gets the app; business opens its account on the web. */
export const ctaFor = (a: Audience) =>
  a === 'business'
    ? { label: 'Open a business account', to: '/business/app/open' }
    : { label: 'Get the app', to: links.openAccount };

export const links = {
  // TODO: replace with the direct Play Store listing URL once available.
  openAccount: 'https://play.google.com/store/search?q=credvera&c=apps',
  // TODO(credvera): the real store listings once the app is published.
  appStore: 'https://apps.apple.com/ng/search?term=credvera',
  playStore: 'https://play.google.com/store/search?q=credvera&c=apps',
  contactSales: '/contact',
};

export type Stat = {
  value: number;
  prefix?: string;
  /** Short symbol right after the number, e.g. "%" or "+". */
  suffix?: string;
  /** Word unit shown smaller beside the number, e.g. "billion". */
  unit?: string;
  decimals?: number;
  label: string;
  source: string;
  sourceUrl: string;
};

export const marketStats = {
  msmes: {
    value: 39.65,
    decimals: 2,
    unit: 'million',
    label: 'small and medium businesses operate in Nigeria',
    source: 'SMEDAN & NBS, MSME Survey',
    sourceUrl: 'https://guardian.ng/business-services/over-39-65m-msmes-operate-in-nigeria-says-report/',
  },
  msmeGdp: {
    value: 46.31,
    suffix: '%',
    decimals: 2,
    label: 'of Nigeria’s GDP comes from MSMEs',
    source: 'SMEDAN & NBS, MSME Survey',
    sourceUrl: 'https://guardian.ng/business-services/over-39-65m-msmes-operate-in-nigeria-says-report/',
  },
  instantPayments: {
    value: 1.07,
    prefix: '₦',
    decimals: 2,
    unit: 'quadrillion',
    label: 'moved through NIBSS instant payments in 2024 — up 78% on 2023',
    source: 'NIBSS, via Vanguard',
    sourceUrl: 'https://www.vanguardngr.com/2025/01/nigerias-instant-payment-transactions-hit-n1-07-quadrillion-in-2024-nibss/',
  },
} satisfies Record<string, Stat>;

export type NavLinkItem = { label: string; to: string; description?: string };
export type NavGroup = { label: string; items: NavLinkItem[] };
export type NavEntry = NavLinkItem | NavGroup;

const company_: NavGroup = {
  label: 'Company',
  items: [
    { label: 'About', to: '/about', description: 'Why we built Credvera' },
    { label: 'Blog', to: '/blog', description: 'Guides and notes on money' },
    { label: 'FAQ', to: '/faq', description: 'Answers to common questions' },
    { label: 'Contact', to: '/contact', description: 'Talk to our team' },
  ],
};

// Business has its own About, Blog, FAQ and Contact pages.
const companyBusiness_: NavGroup = {
  ...company_,
  items: company_.items.map((i) =>
    i.to === '/about'
      ? { ...i, to: '/business/about', description: 'Why we built Credvera Business' }
      : i.to === '/faq'
        ? { ...i, to: '/business/faq', description: 'Answers for businesses' }
        : i.to === '/contact'
          ? { ...i, to: '/business/contact', description: 'Talk to the business team' }
          : i.to === '/blog'
            ? { ...i, to: '/business/blog', description: 'Field notes for businesses' }
            : i,
  ),
};

/** The menu for each audience. Features link to sections of that audience's home page. */
export const navByAudience: Record<Audience, NavEntry[]> = {
  personal: [
    {
      label: 'Features',
      items: [
        { label: 'Everyday money', to: '/personal/everyday', description: 'Bills, airtime and transfers to any bank' },
        { label: 'Save and split', to: '/personal/save', description: 'Goals, auto-save and getting paid back' },
      ],
    },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Security', to: '/security' },
    company_,
  ],
  business: [
    { label: 'Payments and invoices', to: '/business/payments' },
    { label: 'Pricing', to: '/business/pricing' },
    { label: 'Security', to: '/business/security' },
    companyBusiness_,
  ],
};

export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

/** Every link in an audience's menu, with groups flattened. */
export const navLinksFor = (a: Audience): NavLinkItem[] =>
  navByAudience[a].flatMap((entry) => (isGroup(entry) ? entry.items : [entry]));

/**
 * Fees for each account, as the app charges them today.
 * TODO(credvera): confirm with the partners before launch.
 */
export const pricingFor: Record<Audience, { product: string; to: string; rows: [string, string][] }[]> = {
  personal: [
    {
      product: 'Everyday account',
      to: '/personal/everyday',
      rows: [
        ['Opening an account', 'Free'],
        ['Transfers to Nigerian banks', '₦10 per transfer'],
        ['Airtime, data, electricity and TV', 'Free'],
        ['Remita bills', '₦150 service fee'],
      ],
    },
  ],
  business: [
    {
      product: 'Payments and invoices',
      to: '/business/payments',
      rows: [
        ['Opening a business account', 'Free'],
        ['Transfers to Nigerian banks', '₦25 per transfer'],
        ['Invoices and payment links', 'Free to create'],
      ],
    },
  ],
};
