/**
 * Staff ID cards, checked by /verify/:id (the QR code on the back of each card).
 * TODO: move to the staff admin's API so cards can be issued, renewed and
 * cancelled without a website release.
 */

export type StaffCard = {
  id: string; // as printed on the card, e.g. CRV-0001
  name: string;
  role: string;
  team: string;
  photo: string; // under /public
  issued: string; // ISO date
  expires: string; // ISO date, the card stops being valid after this day
  cancelled?: boolean; // lost, stolen or the holder has left
};

const cards: StaffCard[] = [
  {
    id: 'CRV-0001',
    name: 'Joshua Peter',
    role: 'Co-founder & Director',
    team: 'Executive',
    photo: '/staff/crv-0001.jpg',
    issued: '2026-10-22',
    expires: '2028-10-31',
  },
];

export type CardCheck =
  | { state: 'valid'; card: StaffCard }
  | { state: 'expired'; card: StaffCard }
  | { state: 'cancelled'; card: StaffCard }
  | { state: 'unknown'; id: string };

/** Card numbers are matched however they're typed: crv0001, CRV 0001, CRV-0001. */
export function normaliseId(raw: string) {
  const digits = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^CRV/, '');
  return digits ? `CRV-${digits.padStart(4, '0')}` : '';
}

export function checkCard(raw: string, now = new Date()): CardCheck {
  const id = normaliseId(raw);
  const card = cards.find((c) => c.id === id);
  if (!card) return { state: 'unknown', id: id || raw };
  if (card.cancelled) return { state: 'cancelled', card };
  const lastDay = new Date(`${card.expires}T23:59:59+01:00`);
  return now > lastDay ? { state: 'expired', card } : { state: 'valid', card };
}
