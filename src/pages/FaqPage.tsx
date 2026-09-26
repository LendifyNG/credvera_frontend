import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Plus, Search, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Headline from '../components/editorial/Headline';
import Reveal from '../components/ui/Reveal';
import { useAudience } from '../lib/audience';
import { company } from '../lib/site';

const ease = [0.16, 1, 0.3, 1] as const;

type Group = { id: string; title: string; items: { q: string; a: string }[] };

// TODO(credvera): confirm each answer (limits, countries, timings) before launch.
const personalGroups: Group[] = [
  {
    id: 'start',
    title: 'Getting started',
    items: [
      { q: 'What is Credvera?', a: 'An app for getting paid from abroad, paying bills and sending money at home, saving and splitting, and proving your income with Earnings Passport. There’s a business account too.' },
      { q: 'What do I need to open an account?', a: 'Your phone number, your email and your BVN or NIN. You sign up in the app, check your identity, and can start straight away. Some features open as you verify a little more.' },
      { q: 'Can I sign up from outside Nigeria?', a: 'Not yet. For now, sign-up is for people in Nigeria with a Nigerian phone number and a BVN or NIN.' },
      { q: 'How do I get the app?', a: 'Use the Get the app button on this site, which takes you to the official store listing. Don’t install Credvera from links sent to you by anyone else.' },
      { q: 'How much does it cost?', a: 'Opening an account is free, and most things are free. A transfer to a Nigerian bank is ₦10. Every fee is on the Pricing page and shown in the app before you confirm.' },
    ],
  },
  {
    id: 'abroad',
    title: 'Money from abroad',
    items: [
      { q: 'How do I get paid from Upwork, Fiverr or a client abroad?', a: 'Open a US dollar, pound or euro account in the app and share its details with your client, employer or platform. Payments land in your own name.' },
      { q: 'What do I need to receive from abroad?', a: 'Add your NIN and a selfie in the app. It takes about a minute.' },
      { q: 'Does it cost anything to receive?', a: 'No. Receiving into your dollar, pound or euro account is free.' },
      { q: 'How does converting to naira work?', a: 'You see our rate beside the market rate before you confirm, and the rate is held while you do. Keep your money in the currency for as long as you like.' },
    ],
  },
  {
    id: 'everyday',
    title: 'Everyday money',
    items: [
      { q: 'Which bills can I pay?', a: 'Airtime and data on MTN, Airtel, Glo and 9mobile; prepaid and postpaid electricity with Ikeja, Eko and Abuja Electric; DStv, GOtv and StarTimes; and government and school payments through Remita.' },
      { q: 'When do I get my electricity token?', a: 'The moment you pay. It shows in the app and stays with the payment, ready to copy or share.' },
      { q: 'Can I send money to any Nigerian bank?', a: 'Yes, for ₦10 a transfer. The name on the account shows before you send, so you know it’s the right person.' },
      { q: 'What is the dollar card for?', a: 'Paying online in dollars: streaming, courses, subscriptions and shopping. Its details show only after your PIN or Face ID and hide again on their own.' },
    ],
  },
  {
    id: 'save',
    title: 'Save and split',
    items: [
      { q: 'How do savings goals work?', a: 'Name a goal, set the amount and the date, and turn on auto-save weekly or monthly. Pause it, change it, or take money out whenever you need to. Money in a goal is kept apart from your spending money.' },
      { q: 'How does splitting a bill work?', a: 'Split any bill, or a payment you’ve already made, with the people who owe you. You see who has paid, who paid part and who hasn’t, and Credvera can send the reminder with a link to pay.' },
    ],
  },
  {
    id: 'passport',
    title: 'Earnings Passport',
    items: [
      { q: 'What is Earnings Passport?', a: 'A link you share with a landlord, embassy or lender that shows your income from abroad, checked from the payments you actually received. It replaces a pile of bank statements.' },
      { q: 'What can the person I share it with see?', a: 'Your name, that your identity was checked, your monthly income from abroad as a range, and how many months you were paid. Who paid you, only if you choose. Never your balance, exact amounts or other payments.' },
      { q: 'Can I stop sharing it?', a: 'Yes. You can see how often each Passport was opened, and cancel any of them. The link stops working straight away.' },
    ],
  },
  {
    id: 'safety',
    title: 'Safety',
    items: [
      { q: 'How is my account protected?', a: 'Your PIN or Face ID for every payment, card details that hide themselves, extra care after a new phone or a SIM change, and the account name shown before every transfer.' },
      { q: 'Will Credvera ever ask for my PIN?', a: 'Never. Not by phone, chat or email. Anyone who asks for your PIN, password or codes isn’t us.' },
      { q: 'What should I do if I lose my phone?', a: 'Contact us straight away and we’ll help you secure your account. Without your PIN or Face ID, nobody can open the app or make a payment.' },
      { q: 'Is Credvera a bank?', a: company.licenceStatement },
    ],
  },
];


// Example questions that cycle in the empty search box.
const hints = ['How do I get paid from Upwork?', 'When do I get my electricity token?', 'Can I stop sharing my Passport?', 'Will Credvera ever ask for my PIN?'];

/** Wraps each match of the search in a lime highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${safe})`, 'ig'));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded-[3px] bg-primary/60 px-0.5 text-ink">
            {p}
          </mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** FAQ: search across every answer, or browse by topic. */
export default function FaqPage() {
  const { audience } = useAudience();
  // Business has its own FAQ.
  const toBusiness = audience === 'business';
  const groups = personalGroups;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(groups[0]!.items[0]!.q);
  const [hint, setHint] = useState(0);
  const [active, setActive] = useState(groups[0]!.id);

  useEffect(() => {
    const t = window.setInterval(() => setHint((h) => (h + 1) % hints.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Which topic is on screen, for the index.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' },
    );
    groups.forEach((g) => {
      const el = document.getElementById(g.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [groups, query]);

  const q = query.trim();
  const shown = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !q || `${i.q} ${i.a}`.toLowerCase().includes(q.toLowerCase())) }))
    .filter((g) => g.items.length);
  const count = shown.reduce((n, g) => n + g.items.length, 0);

  if (toBusiness) return <Navigate to="/business/faq" replace />;

  return (
    <>
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-32 lg:px-8 lg:pt-40">
        <Reveal>
          <p className="border-b border-ink/10 pb-5 text-[13px] font-semibold text-background">FAQ</p>
        </Reveal>
        <Headline as="h1" text={'Ask us\n*anything*.'} className="mt-12 text-[clamp(2.8rem,7vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]" />

        {/* Search */}
        <Reveal delay={0.2}>
          <div className="relative mt-12 max-w-3xl">
            <Search className="pointer-events-none absolute left-6 top-1/2 size-6 -translate-y-1/2 text-ink/35" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search the questions"
              className="h-[4.5rem] w-full rounded-full bg-white pl-16 pr-16 text-xl shadow-[0_20px_50px_-30px_rgba(1,21,4,0.35)] outline-none ring-1 ring-ink/10 transition-shadow focus:ring-2 focus:ring-background [&::-webkit-search-cancel-button]:hidden"
            />
            {/* The example question, cycling while the box is empty */}
            {!query && (
              <span className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 overflow-hidden text-xl text-ink/35">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={hint}
                    className="block whitespace-nowrap"
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    {hints[hint]}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-mist text-ink/60 hover:text-ink">
                <X className="size-4" />
              </button>
            )}
          </div>
          <p className="mt-4 pl-6 text-sm text-ink/45" aria-live="polite">
            {q ? `${count} ${count === 1 ? 'answer' : 'answers'} for “${q}”` : `${groups.reduce((n, g) => n + g.items.length, 0)} questions, answered plainly`}
          </p>
        </Reveal>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 lg:grid-cols-[220px_1fr] lg:gap-20 lg:px-8 lg:pb-32">
        {/* Topics */}
        <nav aria-label="Topics" className="hidden lg:block">
          <ul className="sticky top-28 space-y-1 border-l border-ink/10">
            {shown.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className={`-ml-px flex items-center justify-between border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                    active === g.id ? 'border-background font-semibold text-ink' : 'border-transparent text-ink/50 hover:text-ink'
                  }`}
                >
                  {g.title}
                  <span className="tabular-nums text-ink/30">{g.items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {shown.map((g) => (
            <div key={g.id} id={g.id} className="scroll-mt-28 pb-12">
              <h2 className="font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] italic leading-none">{g.title}</h2>
              <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {g.items.map((item) => {
                  const isOpen = open === item.q || !!q;
                  return (
                    <li key={item.q}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-6 py-5 text-left"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(open === item.q ? null : item.q)}
                      >
                        <span className="text-lg font-semibold tracking-tight sm:text-xl">
                          <Highlight text={item.q} query={q} />
                        </span>
                        <span className={`grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-ink/15 transition-all duration-500 ${isOpen ? 'rotate-45 bg-secondary text-primary ring-secondary' : ''}`}>
                          <Plus className="size-4" />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease }}
                            className="overflow-hidden"
                          >
                            <p className="max-w-2xl pb-6 text-[17px] leading-relaxed text-ink/70">
                              <Highlight text={item.a} query={q} />
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Nothing matched, or still stuck */}
          <div className="rounded-[1.75rem] bg-secondary p-8 text-white sm:p-10">
            <p className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight tracking-[-0.02em]">
              {count === 0 ? <>Nothing on “{q}” yet.</> : 'Still have a question?'}
            </p>
            <p className="mt-2 text-white/60">Ask the team. We reply within one working day.</p>
            <Link
              to="/contact"
              className="group mt-7 inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[15px] font-semibold text-secondary transition-colors hover:bg-[#9aeb9b]"
            >
              Ask us instead
              <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
