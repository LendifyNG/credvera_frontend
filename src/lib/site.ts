import type { Audience } from './audience';

// Single source of truth for company details, links, statistics and navigation.
// Every statistic below is a real, published figure with its source.

// TODO(credvera): the company details, contact channels and pricing below (and the
// legal copy in pages/LegalPage.tsx) are dummy data — replace before launch.

export const company = {
  name: 'Credvera',
  legalName: 'Credvera Technologies Limited', // placeholder
  rcNumber: '0000000', // placeholder CAC number
  address: 'Victoria Island, Lagos, Nigeria', // placeholder
  email: 'hello@credvera.com', // placeholder
  supportEmail: 'support@credvera.com', // placeholder
  phone: '+234 800 000 0000', // placeholder
  supportHours: 'Monday to Friday, 8am – 6pm WAT', // placeholder
  licenceStatement:
    'Credvera is a financial technology company, not a bank. Payment services are provided by licensed partners.',
  socials: {
    linkedin: '#', // placeholder
    x: '#', // placeholder
    instagram: '#', // placeholder
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
  remittances: {
    value: 21.8,
    prefix: '$',
    decimals: 1,
    unit: 'billion',
    label: 'sent home by Nigerians abroad in 2025 — steady on 2024’s $21.81B',
    source: 'CBN Quarterly Statistical Bulletin, via Vanguard',
    sourceUrl: 'https://www.vanguardngr.com/2026/05/diaspora-remittances-stabilises-at-21-8bn-in-2025-amid-global-pressures/',
  },
  remittanceCost: {
    value: 8.37,
    suffix: '%',
    decimals: 2,
    label: 'average cost of sending $200 to sub-Saharan Africa (Q2 2024) — the most expensive region in the world',
    source: 'World Bank, Remittance Prices Worldwide, Issue 50',
    sourceUrl: 'https://documents1.worldbank.org/curated/en/099053025160028284/pdf/P179351-76a83153-ca40-4b65-b83c-36e40b0711e7.pdf',
  },
  educationSpend: {
    value: 1.39,
    prefix: '$',
    decimals: 2,
    unit: 'billion',
    label: 'spent by Nigerians on foreign education in the first half of 2025 — the highest since 2021',
    source: 'CBN data, via BusinessDay',
    sourceUrl: 'https://businessday.ng/education/article/nigeria-spent-1-39bn-on-foreign-education-highest-in-5yrs-cbn-report-indicates/',
  },
  ukFunds: {
    value: 13761,
    prefix: '£',
    label: 'maintenance funds a London student must show for a UK visa, held for 28 days (from Nov 2025)',
    source: 'UK student visa rules, via VisaHQ',
    sourceUrl: 'https://www.visahq.com/news/2025-11-11/gb/student-visa-maintenance-funds-jump-today-as-new-financial-thresholds-take-effect/',
  },
  canadaFunds: {
    value: 22895,
    prefix: 'CA$',
    label: 'proof of funds for a Canadian study permit, on top of tuition (from Sept 2025)',
    source: 'IRCC rules, via CIC News',
    sourceUrl: 'https://www.cicnews.com/2025/09/increased-fund-requirements-for-study-permits-take-effect-0959314.html',
  },
  chinaImports: {
    value: 14.15,
    prefix: '₦',
    decimals: 2,
    unit: 'trillion',
    label: 'of goods Nigeria imported from China in 2024 — its largest supplier, up 114% on 2023',
    source: 'NBS, via Nairametrics',
    sourceUrl: 'https://nairametrics.com/2025/03/11/china-india-dominate-as-nigerias-largest-trading-partners-in-2024-hit-n20-31-trillion/',
  },
  intraAfricaRouting: {
    value: 80,
    suffix: '%+',
    label: 'of payments between African countries are routed through Europe or the US — costing up to $5bn a year',
    source: 'Afreximbank, via Africa Renewal (UN)',
    sourceUrl: 'https://africarenewal.un.org/en/magazine/new-pan-african-payments-system-provides-big-relief-african-traders',
  },
  migrants: {
    value: 2.1,
    decimals: 1,
    unit: 'million',
    label: 'Nigerian migrants were living abroad in 2024',
    source: 'UN Population Division, via Migration Policy Institute',
    sourceUrl: 'https://www.migrationpolicy.org/journal/country-profile/nigeria-aims-capitalize-regional-integration-amid-evolving-emigration',
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
        { label: 'Get paid from abroad', to: '/personal/abroad', description: 'Dollar, pound and euro accounts in your name' },
        { label: 'Everyday money', to: '/personal/everyday', description: 'Bills, airtime, transfers and a dollar card' },
        { label: 'Save and split', to: '/personal/save', description: 'Goals, auto-save and getting paid back' },
        { label: 'Earnings Passport', to: '/personal/passport', description: 'Prove your income without a bank statement' },
      ],
    },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Security', to: '/security' },
    company_,
  ],
  business: [
    {
      label: 'Features',
      items: [
        { label: 'Payments and invoices', to: '/business/payments', description: 'Collect, pay and send invoices with a link' },
        { label: 'FX and currencies', to: '/business/fx', description: 'Hold, receive and convert at a clear rate' },
        { label: 'Pay suppliers abroad', to: '/business/suppliers', description: 'Pay when it ships, with Supplier Passport' },
        { label: 'Business cards', to: '/business/cards', description: 'Dollar and naira cards for online spend' },
      ],
    },
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
 * TODO(credvera): confirm with the partner bank and Verto before launch; the
 * FX margin is still to be set (FX_MARGIN_PERCENT in the app).
 */
export const pricingFor: Record<Audience, { product: string; to: string; rows: [string, string][] }[]> = {
  personal: [
    {
      product: 'Everyday account',
      to: '/personal/everyday',
      rows: [
        ['Opening an account', 'Free'],
        ['Transfers to Nigerian banks', '₦10 per transfer'],
        ['Airtime, TV and Remita bills', 'Free'],
      ],
    },
    {
      product: 'Money from abroad',
      to: '/personal/abroad',
      rows: [
        ['Dollar, pound and euro accounts', 'Free to open'],
        ['Receiving money', 'Free'],
        ['Converting', 'Our rate, shown beside the market rate'],
      ],
    },
    {
      product: 'Earnings Passport',
      to: '/personal/passport',
      rows: [['Creating and sharing a Passport', 'Free']],
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
    {
      product: 'FX and currencies',
      to: '/business/fx',
      rows: [
        ['Currency accounts', 'Free to open'],
        ['Converting', 'Our rate, shown beside the market rate'],
      ],
    },
    {
      product: 'Paying suppliers abroad',
      to: '/business/suppliers',
      rows: [
        ['UK and euro countries', '₦2,500 per payment'],
        ['United States', '₦3,500 per payment'],
        ['China', '₦5,000 per payment'],
      ],
    },
  ],
};
