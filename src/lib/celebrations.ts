/**
 * Celebration pages at /c/:slug. Organisers create them in the Credvera app;
 * guests open the link or scan the QR on the invitation and send a gift.
 * Same events as the app's example data (src/data/celebrations.ts there).
 * TODO: load from the celebrations API, and create a Flutterwave dynamic
 * virtual account or checkout session per gift.
 */

export type CelebrationKind = 'wedding' | 'birthday' | 'naming' | 'burial' | 'other';
export type CelebrationTheme = 'ink' | 'lime' | 'paper';

export type Celebration = {
  slug: string;
  kind: CelebrationKind;
  title: string; // "Chidi & Amaka"
  date: string; // ISO date of the event
  message?: string;
  theme: CelebrationTheme;
  closed?: boolean;
};

export const KIND_LINE: Record<CelebrationKind, string> = {
  wedding: 'The wedding of',
  birthday: 'Celebrating',
  naming: 'The naming of',
  burial: 'Celebrating the life of',
  other: 'Join us for',
};

const events: Celebration[] = [
  {
    slug: 'chidi-and-amaka',
    kind: 'wedding',
    title: 'Chidi & Amaka',
    date: '2026-11-28',
    message: 'Your presence is the gift. If you’d like to bless us further, here’s how.',
    theme: 'ink',
  },
  {
    slug: 'mama-at-60',
    kind: 'birthday',
    title: 'Mama at 60',
    date: '2026-12-12',
    message: 'Help us make Mama’s 60th unforgettable.',
    theme: 'lime',
  },
  { slug: 'baby-zara', kind: 'naming', title: 'Baby Zara', date: '2026-08-15', theme: 'paper', closed: true },
];

export const findCelebration = (slug: string) => events.find((e) => e.slug === slug.toLowerCase());

// A one-time account for one gift: valid for an hour, for the exact amount.
// TODO: POST to the API, which asks Flutterwave for a dynamic virtual account.
export function oneTimeAccount(slug: string) {
  const number = `8${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`;
  return { number, bank: 'Credvera Partner Bank', name: `Credvera / ${findCelebration(slug)?.title ?? 'Celebration'}`, expiresAt: Date.now() + 60 * 60 * 1000 };
}
