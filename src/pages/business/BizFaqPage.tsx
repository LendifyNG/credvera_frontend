import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { company } from '../../lib/site';

const ease = [0.16, 1, 0.3, 1] as const;

type QA = { q: string; a: string; more?: [string, string] };
type Topic = { name: string; items: QA[] };

// TODO(credvera): confirm each answer (timings, limits, fees) before launch.
const topics: Topic[] = [
  {
    name: 'Before you open',
    items: [
      { q: 'Who can open a business account?', a: 'Businesses registered in Nigeria with the Corporate Affairs Commission. Each director and owner is checked against their BVN.' },
      { q: 'What do I need?', a: 'Your CAC registration number, the BVN of each director and owner, and your registration documents from CAC.' },
      { q: 'How long does it take?', a: 'A few minutes to apply in the app. We review your documents, usually within one or two working days, and you can use the account meanwhile.' },
      { q: 'Can I have a personal and a business account?', a: 'Yes. One person can have both, each with its own details, and switch between them in the app. Switching asks for your PIN.' },
      { q: 'How much does it cost?', a: 'Opening a business account is free. Every fee is on the business pricing page and on the payment screen before you confirm.', more: ['Business pricing', '/business/pricing'] },
    ],
  },
  {
    name: 'Getting paid',
    items: [
      { q: 'How do my customers pay me?', a: 'Send an invoice or a payment link. Your customer pays by card or bank transfer, and the invoice marks itself paid when the money lands.', more: ['Payments and invoices', '/business/payments'] },
      { q: 'Do reminders go out on their own?', a: 'Yes. If an invoice isn’t paid by its due date, a reminder goes out for you.' },
      { q: 'Can customers abroad pay me?', a: 'Yes, into dollar, pound and euro accounts in your business’s name. They pay you with local details: ACH in the US, sort code in the UK, IBAN in the euro area.', more: ['FX and currencies', '/business/fx'] },
    ],
  },
  {
    name: 'Paying out',
    items: [
      { q: 'How much is a transfer to a Nigerian bank?', a: '₦25 a transfer from a business account. The account name shows before you send.' },
      { q: 'What is a second approval?', a: 'Big payments wait for someone else to approve them before they go out. Nobody moves a large amount alone.' },
      { q: 'Can I save the people I pay often?', a: 'Yes. Staff, suppliers and landlords are saved once and paid again in a few taps.' },
    ],
  },
  {
    name: 'FX',
    items: [
      { q: 'How does converting work?', a: 'You see our rate beside the market rate. The rate is held for thirty seconds while you confirm. If it moves after that, we show you the new rate and ask again.', more: ['FX and currencies', '/business/fx'] },
      { q: 'Does it cost anything to open a currency account?', a: 'No. Dollar, pound and euro accounts are free to open.' },
    ],
  },
  {
    name: 'Suppliers',
    items: [
      { q: 'How does paying on shipment work?', a: 'You pay a 30% or 50% deposit and set the date the goods must ship by. We hold the rest and pay it when the shipping line confirms your goods are loaded.', more: ['Pay suppliers abroad', '/business/suppliers'] },
      { q: 'What if the goods don’t ship?', a: 'If nothing is loaded by the ship-by date, the held money comes back to you. Only the deposit you chose was at stake.' },
      { q: 'What does it cost to pay a supplier?', a: 'One flat fee per payment: ₦2,500 for the UK and euro countries, ₦3,500 for the United States and ₦5,000 for China.' },
      { q: 'What is Supplier Passport?', a: 'A supplier’s record with Nigerian businesses on Credvera: how many orders they’ve shipped and how often on time. We confirm shipment, not the quality of the goods.' },
    ],
  },
  {
    name: 'Cards',
    items: [
      { q: 'Which cards does a business get?', a: 'A virtual dollar card that spends from your dollar account, and a virtual naira card that spends from your naira account. Physical cards are on the way.', more: ['Business cards', '/business/cards'] },
      { q: 'Can I set limits or freeze a card?', a: 'Yes. Set a monthly limit on each card, and freeze or unfreeze it in one tap.' },
    ],
  },
  {
    name: 'Safety',
    items: [
      { q: 'How is a business account protected?', a: 'Your PIN or Face ID on every payment, a daily limit on each account, a second approval for big payments, and card details shown only after your PIN.', more: ['Business security', '/business/security'] },
      { q: 'Will Credvera ever ask for my PIN?', a: 'Never. Not by phone, chat or email. Anyone who asks for your PIN, password or codes isn’t us.' },
      { q: 'Is Credvera a bank?', a: company.licenceStatement },
    ],
  },
];

/** Business FAQ: pick a topic, pick a question, read the answer beside it. */
export default function BizFaqPage() {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  const [q, setQ] = useState(0);
  const topic = topics[t]!;
  const item = topic.items[q] ?? topic.items[0]!;
  const total = topics.reduce((n, x) => n + x.items.length, 0);

  const pickTopic = (i: number) => {
    setT(i);
    setQ(0);
  };

  return (
    <>
      <header className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-32 lg:px-8 lg:pt-40">
          <div className="flex items-center justify-between border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>Business · FAQ</span>
            <span>{total} questions</span>
          </div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mt-12 text-[clamp(2.8rem,6.4vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.05em]"
          >
            Questions a business asks.
            <br />
            <span className="text-graphite/45">Answered plainly.</span>
          </motion.h1>
        </div>
      </header>

      <section className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
          {/* Topics */}
          <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] lg:mx-0 lg:px-0">
            <div className="flex w-max gap-1 rounded-lg bg-graphite/[0.06] p-1">
              {topics.map((x, i) => (
                <button
                  key={x.name}
                  type="button"
                  onClick={() => pickTopic(i)}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-[14px] font-medium transition-colors ${
                    i === t ? 'bg-white text-graphite shadow-sm' : 'text-graphite/55 hover:text-graphite'
                  }`}
                >
                  {x.name}
                  <span className="font-ledger text-[11px] text-graphite/40">{x.items.length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reader: questions on the left, the answer on the right */}
          <div className="mt-8 grid overflow-hidden rounded-2xl bg-white ring-1 ring-graphite/10 lg:grid-cols-[0.9fr_1.1fr]">
            <ol className="divide-y divide-graphite/[0.08] lg:border-r lg:border-graphite/10">
              {topic.items.map((x, i) => {
                const on = i === q;
                return (
                  <li key={x.q}>
                    <button
                      type="button"
                      onClick={() => setQ(i)}
                      aria-pressed={on}
                      className={`grid w-full grid-cols-[2.5rem_1fr] gap-3 px-6 py-5 text-left transition-colors ${on ? 'bg-graphite text-white' : 'hover:bg-ledger'}`}
                    >
                      <span className={`font-ledger text-[12px] ${on ? 'text-primary' : 'text-graphite/40'}`}>{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[16px] font-medium leading-snug">{x.q}</span>
                    </button>
                    {/* Phones: the answer opens under its question */}
                    {on && <p className="px-6 pb-6 pt-4 text-[16px] leading-relaxed text-graphite/70 lg:hidden">{x.a}</p>}
                  </li>
                );
              })}
            </ol>

            <div className="hidden min-h-[420px] p-10 lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${t}-${q}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <p className="font-medium text-[13px] text-graphite/45">
                    {topic.name} · {String(q + 1).padStart(2, '0')}
                  </p>
                  <h2 className="mt-4 text-[clamp(1.8rem,2.6vw,2.4rem)] font-semibold leading-tight tracking-[-0.03em]">{item.q}</h2>
                  <p className="mt-6 text-[18px] leading-relaxed text-graphite/70">{item.a}</p>
                  {item.more && (
                    <Link to={item.more[1]} className="group mt-10 inline-flex items-center gap-2 border-b border-graphite/20 pb-1 text-[15px] font-semibold">
                      Read: {item.more[0]}
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <Link to="/business/contact" className="group mt-14 flex items-center justify-between gap-6 border-t border-graphite/15 pt-8">
            <span>
              <span className="block font-medium text-[13px] text-graphite/45">Not here?</span>
              <span className="mt-2 block text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-2">
                Ask the team. We reply within one working day.
              </span>
            </span>
            <span className="grid size-14 shrink-0 place-items-center rounded-md bg-graphite text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="size-5" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
