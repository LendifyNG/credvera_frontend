import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { company } from '../../lib/site';

type Kind = 'privacy' | 'terms';
type Clause = { title: string; items: string[] };

// PLACEHOLDER business legal drafts. Replace with Credvera's reviewed text
// before launch; this is not legal advice. Kept to what the app does today.
const docs: Record<Kind, { title: string; glance: [string, string][]; clauses: Clause[] }> = {
  terms: {
    title: 'Business terms of use',
    glance: [
      ['Who they cover', 'Businesses registered in Nigeria, and the people who use the account for them'],
      ['Fees', 'As on the business pricing page, shown before you confirm, with 30 days’ notice of changes'],
      ['Pay on shipment', 'We confirm shipment with the shipping line, not the quality of the goods'],
      ['Held money', 'Returned to you if the goods are not loaded by the ship-by date'],
      ['Law', 'The laws of the Federal Republic of Nigeria'],
    ],
    clauses: [
      {
        title: 'These terms',
        items: [
          `These terms are an agreement between ${company.legalName} and the business that opens a Credvera business account.`,
          'The person who opens the account confirms they are authorised to accept these terms for the business.',
        ],
      },
      {
        title: 'Who can use a business account',
        items: [
          'The business must be registered with the Corporate Affairs Commission.',
          'Each director and owner must be verified against their BVN before the business can pay.',
          'We may ask for further documents, and may pause the account until we receive them.',
        ],
      },
      {
        title: 'Using the account',
        items: [
          'Keep PINs, passwords and one-time codes private. Every payment needs a PIN or Face ID.',
          'Large payments may need a second approval before they are sent. You are responsible for who you allow to request and approve payments.',
          'Tell us straight away if you think someone has accessed the account without permission.',
        ],
      },
      {
        title: 'Payments and partners',
        items: [
          company.licenceStatement,
          'Payments are subject to our partners’ terms, limits and compliance checks, and may be delayed or refused where the law requires.',
        ],
      },
      {
        title: 'Invoices and payment links',
        items: [
          'You are responsible for what you sell and for the accuracy of the invoices you send.',
          'Customers pay through our payment partner by card or bank transfer. A payment is yours once it has been received into your account.',
        ],
      },
      {
        title: 'Paying suppliers on shipment',
        items: [
          'You choose a deposit and a ship-by date. The deposit is paid to the supplier when you confirm.',
          'We hold the balance and pay it to the supplier when the shipping line confirms the goods are loaded.',
          'If the goods are not loaded by the ship-by date, the held balance is returned to you. The deposit is a matter between you and your supplier.',
          'We confirm shipment. We do not inspect goods or guarantee their quality.',
        ],
      },
      {
        title: 'Currencies and converting',
        items: [
          'Our rate is shown beside the market rate before you convert, and is held for thirty seconds while you confirm.',
          'If the rate changes after the hold, you are asked to confirm the new rate before anything is converted.',
        ],
      },
      {
        title: 'Business cards',
        items: [
          'Cards spend only from the account they are linked to, within any limits you set.',
          'You can freeze a card at any time. Card details are shown only after your PIN.',
        ],
      },
      {
        title: 'Fees',
        items: ['Fees are listed on the business pricing page and shown on each payment before you confirm. We will give you at least 30 days’ notice of any change.'],
      },
      {
        title: 'What you must not do',
        items: [
          'Use the account for anything illegal or fraudulent, or for goods and services our partners do not allow.',
          'Try to interfere with our systems or use the account on behalf of a business that has not been verified.',
        ],
      },
      {
        title: 'Liability',
        items: [
          'We are responsible for losses caused by our own mistakes or negligence.',
          'We are not responsible for losses caused by events outside our reasonable control, by incorrect details you give us, or by a supplier or customer.',
        ],
      },
      {
        title: 'Law and contact',
        items: ['These terms are governed by the laws of the Federal Republic of Nigeria.', `Questions about these terms: ${company.supportEmail}.`],
      },
    ],
  },
  privacy: {
    title: 'Business privacy notice',
    glance: [
      ['Who we are', `${company.legalName}, operating Credvera`],
      ['What we hold', 'Business details, directors’ and owners’ identity, payments, invoices and supplier records'],
      ['Shared with', 'Our payment partners, verification providers, and regulators where the law requires'],
      ['Kept for', 'At least five years after the account closes, as anti-money-laundering rules require'],
      ['The law', 'The Nigeria Data Protection Act 2023'],
    ],
    clauses: [
      {
        title: 'Who this covers',
        items: [
          'This notice covers the business that holds a Credvera business account, and the people connected to it: directors, owners and anyone who uses the account.',
          `${company.legalName} is responsible for the personal data described here.`,
        ],
      },
      {
        title: 'What we collect',
        items: [
          'Business details, including CAC registration and registration documents.',
          'Identity details of directors and owners, including name, date of birth and BVN.',
          'Payments, invoices, payment links, supplier details and orders, and device and usage information from the app.',
        ],
      },
      {
        title: 'Your customers’ details',
        items: [
          'When you send an invoice or payment link, we process your customer’s name, contact details and payment to deliver it.',
          'You should only give us customer details you are allowed to share, and tell your customers how you use them.',
        ],
      },
      {
        title: 'Supplier Passport',
        items: [
          'Supplier Passport shows other businesses on Credvera a supplier’s record: how many orders they have shipped and how often on time.',
          'It is built from order outcomes. It does not show your business’s name, amounts or other details to anyone else.',
        ],
      },
      {
        title: 'How we use it',
        items: [
          'To open and run the account, verify the business as Nigerian regulations require, process payments, prevent fraud and meet our legal obligations.',
          'We send marketing only if you agree to it, and you can opt out at any time.',
        ],
      },
      {
        title: 'Who we share it with',
        items: ['Our licensed payment and banking partners, identity and business verification providers, service providers acting for us, and regulators or law enforcement where the law requires.', 'We do not sell data.'],
      },
      {
        title: 'How long we keep it',
        items: ['Account and payment records are kept for at least five years after the account closes, as Nigerian anti-money-laundering rules require. Other data is deleted when we no longer need it.'],
      },
      {
        title: 'Rights',
        items: ['Directors, owners and users can ask to see, correct or delete their personal data, object to certain uses, or ask for a copy. Some records must be kept by law.'],
      },
      {
        title: 'Contact',
        items: [`Email ${company.supportEmail} or write to us at ${company.address}. Our Data Protection Officer can be reached at dpo@credvera.com.`],
      },
    ],
  },
};

/** Business legal pages, set like an agreement: key facts first, then numbered clauses. */
export default function BizLegalPage({ kind }: { kind: Kind }) {
  const doc = docs[kind];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.n))),
      { rootMargin: '-30% 0px -60% 0px' },
    );
    document.querySelectorAll('[data-clause]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [kind]);

  return (
    <article className="bg-ledger text-graphite">
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-32 lg:px-8 lg:pt-40">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-5">
          <span className="font-medium text-[13px] text-graphite/50">Business · Legal</span>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md bg-graphite/[0.06] p-0.5 text-[13px] font-medium">
              {(['terms', 'privacy'] as const).map((k) => (
                <Link key={k} to={`/business/${k}`} className={`rounded px-3 py-1.5 transition-colors ${k === kind ? 'bg-white shadow-sm' : 'text-graphite/55 hover:text-graphite'}`}>
                  {k === 'terms' ? 'Terms' : 'Privacy'}
                </Link>
              ))}
            </div>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium ring-1 ring-graphite/15 hover:bg-white">
              <Printer className="size-3.5" /> Print
            </button>
          </div>
        </div>

        <h1 className="mt-12 text-[clamp(2.6rem,5.6vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.045em]">{doc.title}</h1>
        <p className="mt-4 font-ledger text-[12px] text-graphite/50">Effective 1 September 2026 · Draft for review</p>

        {/* Schedule A: at a glance */}
        <section className="mt-12 overflow-hidden rounded-xl bg-white ring-1 ring-graphite/10">
          <p className="border-b border-graphite/10 px-6 py-3 font-medium text-[13px] text-graphite/50">At a glance</p>
          <dl>
            {doc.glance.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-graphite/[0.07] px-6 py-4 last:border-0 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="font-medium text-[13px] text-graphite/50">{k}</dt>
                <dd className="text-[15px] leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Where you are */}
        <nav aria-label="Clauses" className="sticky top-20 z-10 -mx-6 mt-14 overflow-x-auto bg-ledger/95 px-6 py-3 backdrop-blur [scrollbar-width:none] print:hidden">
          <ol className="flex w-max gap-1">
            {doc.clauses.map((c, i) => (
              <li key={c.title}>
                <a
                  href={`#clause-${i + 1}`}
                  title={c.title}
                  className={`grid size-9 place-items-center rounded-md font-ledger text-[12px] transition-colors ${i === active ? 'bg-graphite text-white' : 'text-graphite/50 hover:bg-white'}`}
                >
                  {i + 1}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="mt-6">
          {doc.clauses.map((c, i) => (
            <li key={c.title} id={`clause-${i + 1}`} data-clause data-n={i} className="scroll-mt-40 border-t border-graphite/15 py-10">
              <h2 className="flex items-baseline gap-5 text-2xl font-semibold tracking-tight">
                <span className="w-10 shrink-0 font-ledger text-[15px] font-normal text-graphite/40">{i + 1}.</span>
                {c.title}
              </h2>
              <ol className="mt-5 space-y-4">
                {c.items.map((item, j) => (
                  <li key={j} className="grid grid-cols-[3.75rem_1fr] gap-2 text-[16px] leading-relaxed text-graphite/75">
                    <span className="pr-4 text-right font-ledger text-[13px] leading-[1.9] text-graphite/40">
                      {i + 1}.{j + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}
