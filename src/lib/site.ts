// Single source of truth for company details, links, statistics and navigation.
// Every statistic below is a real, published figure with its source.

/**
 * TODO(credvera): company details, contact channels, pricing and legal copy are
 * PLACEHOLDERS until Credvera supplies real ones. While this is true, the
 * Contact, Pricing and legal pages show a small "sample content" note.
 */
export const PLACEHOLDER_CONTENT = true;

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

export const links = {
  // TODO: replace with the direct Play Store listing URL once available.
  openAccount: 'https://play.google.com/store/search?q=credvera&c=apps',
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

export const nav: NavEntry[] = [
  {
    label: 'Products',
    items: [
      { label: 'Business payments', to: '/business-payments', description: 'Collect, pay and track naira payments' },
      { label: 'Cross-border payments', to: '/cross-border', description: 'Pay and get paid beyond Nigeria' },
      { label: 'Study abroad', to: '/study-abroad', description: 'School fees, proof of funds and allowances' },
      { label: 'Supplier payments', to: '/supplier-payments', description: 'Pay suppliers in China and across Africa' },
      { label: 'Pay Home', to: '/pay-home', description: 'For Nigerians abroad paying bills at home' },
    ],
  },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Security', to: '/security' },
  {
    label: 'Company',
    items: [
      { label: 'About', to: '/about', description: 'Why we built Credvera' },
      { label: 'FAQ', to: '/faq', description: 'Answers to common questions' },
      { label: 'Contact', to: '/contact', description: 'Talk to our team' },
    ],
  },
];

export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

/** Every page link in menu order, with groups flattened. */
export const navLinks: NavLinkItem[] = nav.flatMap((entry) => (isGroup(entry) ? entry.items : [entry]));

/** Credvera's four core pillars, shown in brand colours by the opening intro. */
export const pillars = [
  { word: 'Collect', bg: '#7fde80', fg: '#011504' },
  { word: 'Pay out', bg: '#063c1a', fg: '#7fde80' },
  { word: 'Cross-border', bg: '#ffffff', fg: '#011504' },
  { word: 'Secure', bg: '#011504', fg: '#7fde80' },
] as const;

/** PLACEHOLDER pricing — replace every figure with Credvera's real fees before launch. */
export const pricing = [
  {
    product: 'Business payments',
    to: '/business-payments',
    rows: [
      ['Account opening', 'Free'],
      ['Monthly fee', '₦0'],
      ['Local transfers', '₦25 per transfer'],
      ['Collections', '1% (capped at ₦2,000)'],
    ],
  },
  {
    product: 'Cross-border payments',
    to: '/cross-border',
    rows: [
      ['Outgoing transfers', 'From $5 per transfer'],
      ['Receiving from abroad', 'Free'],
      ['Currency conversion', 'From 1.5% above mid-market'],
    ],
  },
  {
    product: 'Study abroad',
    to: '/study-abroad',
    rows: [
      ['School fee payments', 'From $10 per payment'],
      ['Study Vault', 'Free to open'],
      ['Monthly allowance transfers', 'From $3 per transfer'],
    ],
  },
  {
    product: 'Supplier payments',
    to: '/supplier-payments',
    rows: [
      ['China (CNY) payments', 'From 1% per payment'],
      ['Africa payments', 'From 0.8% per payment'],
    ],
  },
  {
    product: 'Pay Home',
    to: '/pay-home',
    rows: [
      ['Bill and school fee payments', 'From $2 per payment'],
      ['Recurring payments', 'Free to set up'],
    ],
  },
] as const;
