import { posts } from './blog';
import { company } from './site';

// What search engines, AI assistants and link previews (WhatsApp, X,
// LinkedIn) see for each page: title, description, canonical address, share
// image and structured data. The build writes these into each page's HTML
// (scripts/prerender.mjs) and the app keeps them up to date as you move
// between pages (applyMeta, called from App).
//
// A new public page needs an entry in `pages` below; it then goes into the
// sitemap and gets its own prerendered HTML. Blog posts are picked up from
// src/lib/blog.ts on their own.

export const SITE_URL = 'https://credvera.co';

type Page = { title: string; description: string };

const pages: Record<string, Page> = {
  '/': {
    title: 'Credvera — Get paid from abroad, pay bills and save',
    description:
      'Get paid from abroad into your own dollar, pound and euro accounts, pay bills and airtime, send to any Nigerian bank, save and split bills. One app.',
  },
  '/personal/abroad': {
    title: 'Get paid from abroad | Credvera',
    description:
      'Receive payments from clients, employers and platforms abroad into US, UK and euro account details in your own name. Keep the currency or convert to naira.',
  },
  '/personal/everyday': {
    title: 'Everyday money | Credvera',
    description:
      'Top up airtime, buy electricity, renew your TV, pay Remita and government bills, send to any Nigerian bank and pay online with a dollar card.',
  },
  '/personal/save': {
    title: 'Save and split | Credvera',
    description:
      'Set savings goals for school fees, rent or a new laptop, let Credvera save for you, and split bills with friends to see who still owes you.',
  },
  '/personal/passport': {
    title: 'Earnings Passport | Credvera',
    description:
      'Prove your income without a bank statement. Earnings Passport shares a link to your income from abroad, verified from the payments you received.',
  },
  '/pricing': {
    title: 'Pricing | Credvera',
    description:
      'Opening a Credvera account is free and most things cost nothing. A transfer to a Nigerian bank is ₦10. You see every fee before you confirm.',
  },
  '/security': {
    title: 'Security | Credvera',
    description:
      'Your PIN on every payment, card details that hide themselves, extra care on a new phone and the name shown before you send. How Credvera keeps you safe.',
  },
  '/about': {
    title: 'About | Credvera',
    description:
      'Across apps, banks and borders, in naira and in dollars: Credvera is building one place for all of your money. Meet the company behind the app.',
  },
  '/faq': {
    title: 'FAQ | Credvera',
    description:
      'Answers about opening a Credvera account, getting paid from abroad, bills and transfers, saving and splitting, fees and keeping your account safe.',
  },
  '/contact': {
    title: 'Contact | Credvera',
    description:
      'Talk to people, not a bot. Reach the Credvera team about your account, a payment or getting your business set up, by email or phone.',
  },
  '/blog': {
    title: 'Blog | Credvera',
    description: 'Short, practical guides to getting paid from abroad, paying rent and splitting bills with Credvera.',
  },
  '/privacy': {
    title: 'Privacy policy | Credvera',
    description: 'How Credvera Technologies Limited collects, uses and protects your personal data when you use the Credvera app and website.',
  },
  '/terms': {
    title: 'Terms of use | Credvera',
    description: 'The terms that apply when you use the Credvera app and website.',
  },
  '/business': {
    title: 'Credvera for business — Payments, invoices, FX and supplier payments',
    description:
      'A business account for Nigerian companies: collect payments, send invoices and payment links, hold and convert dollars, pounds and euros, and pay suppliers abroad.',
  },
  '/business/payments': {
    title: 'Payments and invoices | Credvera Business',
    description:
      'Collect payments, pay staff and vendors, and send invoices with a payment link from one Credvera business account, with bulk payments and approvals.',
  },
  '/business/fx': {
    title: 'FX and currencies | Credvera Business',
    description:
      'Hold, receive and convert US dollars, pounds and euros at a clear rate, shown beside the market rate before you confirm.',
  },
  '/business/suppliers': {
    title: 'Pay suppliers abroad | Credvera Business',
    description:
      'Pay suppliers in the UK, Europe, the US and China, and pay when it ships. Check who you are paying with Supplier Passport.',
  },
  '/business/cards': {
    title: 'Business cards | Credvera Business',
    description: 'Dollar and naira cards for your business’s online spend, from Credvera Business.',
  },
  '/business/pricing': {
    title: 'Pricing | Credvera Business',
    description:
      'Free to open, ₦25 per transfer to a Nigerian bank, free invoices and payment links, and a flat fee for each payment to a supplier abroad.',
  },
  '/business/security': {
    title: 'Security | Credvera Business',
    description:
      'How Credvera Business keeps company money safe: team roles, approvals on big payments, your PIN on every payment and the name shown before you send.',
  },
  '/business/about': {
    title: 'About | Credvera Business',
    description: 'Why we built Credvera Business: one account for Nigerian businesses to get paid, pay suppliers and work across currencies.',
  },
  '/business/faq': {
    title: 'FAQ | Credvera Business',
    description:
      'Answers for businesses about opening an account, payments and invoices, FX, paying suppliers abroad, team access and fees.',
  },
  '/business/contact': {
    title: 'Contact | Credvera Business',
    description: 'Talk to the Credvera Business team about opening an account, payments, FX or paying suppliers abroad.',
  },
  '/business/blog': {
    title: 'Field notes | Credvera Business',
    description: 'Field notes for Nigerian businesses: getting paid, approvals on big payments, customers abroad and paying suppliers.',
  },
  '/business/privacy': {
    title: 'Privacy notice | Credvera Business',
    description: 'How Credvera Technologies Limited collects, uses and protects business and personal data on Credvera Business.',
  },
  '/business/terms': {
    title: 'Terms of use | Credvera Business',
    description: 'The terms that apply when your business uses Credvera Business.',
  },
};

// Signed-in and private pages: a tab title, but never indexed.
const privateTitles: Record<string, string> = {
  '/business/app': 'Home | Credvera Business',
  '/business/app/payments': 'Transactions | Credvera Business',
  '/business/app/accounts': 'Accounts | Credvera Business',
  '/business/app/pay': 'Payments | Credvera Business',
  '/business/app/pay/bulk': 'Bulk payments | Credvera Business',
  '/business/app/pay/scheduled': 'Scheduled payments | Credvera Business',
  '/business/app/pay/bills': 'Bills | Credvera Business',
  '/business/app/fx': 'FX | Credvera Business',
  '/business/app/fx/convert': 'Convert | Credvera Business',
  '/business/app/fx/alerts': 'Rate alerts | Credvera Business',
  '/business/app/cards': 'Cards | Credvera Business',
  '/business/app/invoices': 'Invoices | Credvera Business',
  '/business/app/links': 'Payment links | Credvera Business',
  '/business/app/customers': 'Customers | Credvera Business',
  '/business/app/suppliers/orders': 'Protected orders | Credvera Business',
  '/business/app/suppliers/checks': 'Invoice checks | Credvera Business',
  '/business/app/suppliers': 'Suppliers | Credvera Business',
  '/business/app/team/roles': 'Roles and approvals | Credvera Business',
  '/business/app/team': 'Team | Credvera Business',
  '/business/app/reports': 'Reports | Credvera Business',
  '/business/app/settings': 'Settings | Credvera Business',
  '/business/app/help': 'Help | Credvera Business',
  '/business/app/settings/security': 'Security | Credvera Business',
  '/business/app/settings/notifications': 'Notifications | Credvera Business',
  '/business/app/settings/documents': 'Documents | Credvera Business',
  '/business/app/reports/cash-flow': 'Cash flow | Credvera Business',
  '/business/app/reports/reconciliation': 'Reconciliation | Credvera Business',
  '/business/app/reports/profit': 'Order profit | Credvera Business',
  '/business/app/approvals': 'Approvals | Credvera Business',
  '/business/app/sign-in': 'Sign in | Credvera Business',
  '/business/app/open': 'Open a business account | Credvera Business',
};

function privateTitle(path: string): string | null {
  if (privateTitles[path]) return privateTitles[path];
  if (path.startsWith('/business/app/statements/')) return 'Official statement | Credvera Business';
  if (path.startsWith('/business/app/join/')) return 'Join a team | Credvera Business';
  if (path.startsWith('/business/app')) return 'Credvera Business';
  if (path.startsWith('/pay/')) return 'Pay | Credvera';
  if (path.startsWith('/s/')) return 'Pay your share | Credvera';
  if (path === '/verify' || path.startsWith('/verify/')) return 'Staff card check | Credvera';
  if (path.startsWith('/c/')) return 'Send a gift | Credvera';
  return null;
}

const postPath = (p: (typeof posts)[number]) => (p.audience === 'business' ? `/business/blog/${p.slug}` : `/blog/${p.slug}`);

/** Every page that belongs in search results, for the sitemap and the prerender. */
export const indexablePaths: string[] = [...Object.keys(pages), ...posts.map(postPath)];

/** When each page last changed, where we know it (blog posts). */
export const lastModified: Record<string, string> = Object.fromEntries(posts.map((p) => [postPath(p), p.date]));

const isBusiness = (path: string) => path === '/business' || path.startsWith('/business/');

const organization = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: company.name,
  legalName: company.legalName,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand/credvera-mark.png`, width: 512, height: 512 },
  description: company.description,
  email: company.email,
  telephone: company.phone.replace(/\s/g, ''),
  foundingDate: '2026-09-28',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5, Aderoju Adewuyi Street',
    addressLocality: 'Opebi',
    addressRegion: 'Lagos State',
    addressCountry: 'NG',
  },
  identifier: { '@type': 'PropertyValue', propertyID: 'CAC RC number', value: company.rcNumber },
  areaServed: { '@type': 'Country', name: 'Nigeria' },
  // Only real profiles; placeholders ('#') are left out.
  sameAs: Object.values(company.socials).filter((u): u is string => !!u && u.startsWith('http')),
};

export type Meta = {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  url: string;
  image: string;
  imageAlt: string;
  type: 'website' | 'article';
  noindex: boolean;
  jsonLd: object[];
};

/** The head tags for any address on the site. */
export function metaFor(pathname: string): Meta {
  const path = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  const business = isBusiness(path);
  const base = {
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    image: `${SITE_URL}/og/${business ? 'business' : 'personal'}.png`,
    imageAlt: business ? 'Credvera Business' : 'Credvera',
    type: 'website' as const,
    noindex: false,
    jsonLd: [] as object[],
  };

  const page = pages[path];
  if (page) {
    const jsonLd: object[] = [];
    if (path === '/') {
      jsonLd.push({ '@context': 'https://schema.org', ...organization });
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: company.name,
        url: `${SITE_URL}/`,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en',
      });
    } else {
      jsonLd.push(breadcrumbs(path, page.title));
    }
    return { ...base, ...page, jsonLd };
  }

  const post = posts.find((p) => postPath(p) === path);
  if (post) {
    const suffix = post.audience === 'business' ? 'Credvera Business' : 'Credvera';
    const image = post.cover ? `${SITE_URL}${post.cover.src}` : base.image;
    return {
      ...base,
      title: `${post.title} | ${suffix}`,
      description: post.dek,
      type: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.dek,
          datePublished: post.date,
          dateModified: post.date,
          image: [image],
          mainEntityOfPage: base.url,
          author: { '@id': `${SITE_URL}/#organization`, '@type': 'Organization', name: company.name },
          publisher: { '@id': `${SITE_URL}/#organization`, '@type': 'Organization', name: company.name },
          inLanguage: 'en',
        },
        breadcrumbs(path, post.title),
      ],
    };
  }

  const title = privateTitle(path) ?? 'Page not found | Credvera';
  return { ...base, title, description: pages['/']!.description, noindex: true };
}

function breadcrumbs(path: string, title: string) {
  const home = isBusiness(path) ? { name: 'Credvera Business', url: `${SITE_URL}/business` } : { name: 'Credvera', url: `${SITE_URL}/` };
  const items = [home];
  const parent = path.match(/^(\/business)?\/blog\//) ? path.replace(/\/[^/]+$/, '') : null;
  if (parent && pages[parent]) items.push({ name: pages[parent]!.title.split(' | ')[0]!, url: `${SITE_URL}${parent}` });
  if (path !== '/business') items.push({ name: title.split(' | ')[0]!, url: `${SITE_URL}${path}` });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** JSON for a <script type="application/ld+json">, safe to put inside HTML. */
export const jsonLdText = (data: object) => JSON.stringify(data).replace(/</g, '\\' + 'u003c');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The <head> tags for a page, as HTML. Used by the build. */
export function headTags(m: Meta): string {
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    m.noindex ? `<meta name="robots" content="noindex, nofollow" />` : `<link rel="canonical" href="${m.url}" />`,
    `<meta property="og:site_name" content="Credvera" />`,
    `<meta property="og:type" content="${m.type}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    m.noindex ? '' : `<meta property="og:url" content="${m.url}" />`,
    `<meta property="og:image" content="${m.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`,
    `<meta property="og:locale" content="en_NG" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${m.image}" />`,
    ...m.jsonLd.map((d) => `<script type="application/ld+json" data-seo>${jsonLdText(d)}</script>`),
  ];
  return tags.filter(Boolean).join('\n    ');
}

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string | null) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (value === null) return el?.remove();
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const named = (key: 'name' | 'property', name: string) => () => {
  const el = document.createElement('meta');
  el.setAttribute(key, name);
  return el;
};

/** Brings the live page's head in line with `m` after moving to another page. */
export function applyMeta(m: Meta) {
  document.title = m.title;
  setTag('meta[name="description"]', named('name', 'description'), 'content', m.description);
  setTag('meta[name="robots"]', named('name', 'robots'), 'content', m.noindex ? 'noindex, nofollow' : null);
  setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', m.noindex ? null : m.url);
  const og: [string, string][] = [
    ['og:type', m.type],
    ['og:title', m.title],
    ['og:description', m.description],
    ['og:url', m.url],
    ['og:image', m.image],
    ['og:image:alt', m.imageAlt],
  ];
  og.forEach(([p, v]) => setTag(`meta[property="${p}"]`, named('property', p), 'content', v));
  setTag('meta[name="twitter:title"]', named('name', 'twitter:title'), 'content', m.title);
  setTag('meta[name="twitter:description"]', named('name', 'twitter:description'), 'content', m.description);
  setTag('meta[name="twitter:image"]', named('name', 'twitter:image'), 'content', m.image);
  document.head.querySelectorAll('script[data-seo]').forEach((s) => s.remove());
  m.jsonLd.forEach((d) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.dataset.seo = '';
    s.textContent = jsonLdText(d);
    document.head.appendChild(s);
  });
}
