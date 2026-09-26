import { photos, type Photo } from './photos';

// The blog. Short, practical guides that describe only what the app does
// today. TODO(credvera): have the team review or rewrite each post, and add
// author names, before launch.

export type Block = { h?: string; p?: string; list?: string[] };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  category: 'Personal' | 'Business' | 'Guides';
  date: string; // ISO
  minutes: number;
  cover: Photo;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: 'get-paid-from-abroad',
    title: 'How to get paid from abroad into your own dollar account',
    dek: 'Open a US dollar, pound or euro account in the app and share its details with the people who pay you.',
    category: 'Personal',
    date: '2026-09-22',
    minutes: 4,
    cover: photos.blogBridge,
    body: [
      { p: 'If you work for clients, employers or platforms outside Nigeria, you can receive their payments into an account in your own name, in their currency.' },
      { h: 'Before you start' },
      { p: 'Receiving money from abroad opens at Tier 2. In the app, add your NIN alongside your BVN and take a selfie. It usually takes about a minute.' },
      { h: 'Open the currency you need' },
      { list: ['Go to Wallets and choose Add a currency.', 'Pick US dollar, British pound or euro.', 'The account opens straight away, at a zero balance.'] },
      { h: 'Share your details' },
      { p: 'Open the currency and tap Details to see the account details to give your client. Clients who pay through PayPal can use your PayPal link instead.' },
      { h: 'When the money arrives' },
      { p: 'It lands in that currency. Keep it there, or convert it to naira when you choose. Before you convert, the app shows our rate beside the market rate, and holds the rate while you confirm.' },
    ],
  },
  {
    slug: 'what-your-landlord-sees',
    title: 'What your landlord sees on an Earnings Passport',
    dek: 'A verified page about your income from abroad, without your balance or bank statements.',
    category: 'Personal',
    date: '2026-09-18',
    minutes: 3,
    cover: photos.blogSkyline,
    body: [
      { p: 'An Earnings Passport is a link you share with a landlord, embassy or lender. It shows facts about the income you receive from abroad, checked from the payments that actually arrived in your Credvera accounts.' },
      { h: 'What they see' },
      { list: ['Your name, and that your identity was checked with your BVN', 'Your monthly income from abroad, as a range', 'How many months you were paid, and since when', 'Who paid you, only if you turn that on'] },
      { h: 'What they never see' },
      { list: ['Your balance', 'Exact amounts', 'Any other payments you make or receive'] },
      { h: 'You stay in control' },
      { p: 'You choose the months it covers and how long the link works: 7, 30 or 90 days. You can see how often it has been opened, and cancel it at any time. Once cancelled, the link stops working.' },
    ],
  },
  {
    slug: 'split-bills-without-the-reminder',
    title: 'Splitting a bill without the awkward reminder',
    dek: 'Share a bill with friends and see who has paid, who paid part, and who still owes.',
    category: 'Guides',
    date: '2026-09-12',
    minutes: 2,
    cover: photos.blogKaftan,
    body: [
      { p: 'Dinner, a shared subscription, a trip: someone pays first and then has to chase everyone else. Split bills keeps track for you.' },
      { h: 'Start a split' },
      { list: ['Choose Split bill from Payments, or open a payment you already made and tap Split this payment.', 'Add the people sharing it, and each person’s share.', 'Send them the request.'] },
      { h: 'Follow it' },
      { p: 'Each split shows who has paid in full, who has paid part, and who hasn’t paid yet. Your own Home screen shows how much you’re still owed in total.' },
    ],
  },
  {
    slug: 'pay-suppliers-when-goods-ship',
    title: 'Paying a supplier abroad only when your goods ship',
    dek: 'Pay a deposit now and have the rest held until the shipping line confirms your goods are loaded.',
    category: 'Business',
    date: '2026-09-08',
    minutes: 4,
    cover: photos.blogTraffic,
    body: [
      { p: 'Paying a new supplier in full before anything ships is a risk many importers know too well. With a Credvera business account you can pay on shipment instead.' },
      { h: 'How it works' },
      { list: ['Pay a deposit of 30% or 50% and set the date the goods must ship by.', 'We hold the balance, already converted.', 'The supplier sends the bill of lading. We check it with the shipping line.', 'Once the goods are confirmed loaded, the balance is paid to the supplier.'] },
      { h: 'If nothing ships' },
      { p: 'If the goods haven’t shipped by the date you set, you can take the held money back. That outcome is recorded on the supplier’s record.' },
      { h: 'Supplier Passport' },
      { p: 'Every order adds to a supplier’s record: how many businesses they have shipped to and how often on time. We confirm shipment, not the quality of the goods, so check them when they arrive.' },
    ],
  },
];

export const postBySlug = (slug?: string) => posts.find((p) => p.slug === slug);

export const postDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
