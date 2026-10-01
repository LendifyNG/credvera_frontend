import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronDown, FileText, Mail, MessageCircleQuestion, Search, Send, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useBusinessContent, useProfile } from '../api';
import { company } from '../lib/site';
import { usePayments } from './data';
import { money, reference, shortDate } from './model';

const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

type Topic = { key: string; title: string; icon: typeof Send; qa: [string, string][] };

/** Answers about what the dashboard does today; nothing promised that isn't built. */
const TOPICS: Topic[] = [
  {
    key: 'payments',
    title: 'Payments',
    icon: Send,
    qa: [
      ['How much does a payment cost?', 'A naira payment to any Nigerian bank has a small flat fee. You see the fee and the total before you confirm with your PIN.'],
      ['How long does a payment take?', 'Most arrive within minutes. If the receiving bank is slow, the payment shows as in progress until it confirms.'],
      ['A payment failed. Where is my money?', 'Back in your account. When a payment fails or is reversed, the full amount, fee included, is returned and the payment says so.'],
      ['Can I pay bills from the dashboard?', 'Yes: airtime, data and electricity, under Payments. TV subscriptions are on their way.'],
    ],
  },
  {
    key: 'getpaid',
    title: 'Getting paid',
    icon: FileText,
    qa: [
      ['How do customers pay me?', 'By bank transfer to your account details (under Accounts), or through an invoice: each one has a link they pay on by card or bank transfer.'],
      ['How long does an invoice link stay open?', '30 days. After that it shows as expired and can’t take payments; send a new one.'],
      ['Can I stop a link being paid?', 'Yes. Open the invoice and cancel it. Anyone opening the link is told it no longer takes payments.'],
      ['When does the money arrive?', 'As soon as the payment is confirmed. It shows under Transactions and the invoice is marked paid.'],
    ],
  },
  {
    key: 'business',
    title: 'Your business account',
    icon: Building2,
    qa: [
      ['How long does the review take?', 'Usually one or two working days. Two people on our team check every business.'],
      ['Can I use the account while it’s being reviewed?', 'You can receive money straight away. Sending money opens once the business is approved.'],
      ['We were asked for more information.', 'Open the banner at the top of the dashboard. It shows what we need; make the change and send the application again.'],
    ],
  },
  {
    key: 'security',
    title: 'Account and security',
    icon: ShieldCheck,
    qa: [
      ['How do I change my password or PIN?', 'In Settings, under Security. Changing your password signs out your other devices.'],
      ['I think someone else signed in.', 'Go to Settings, then Security, and sign out everywhere. Then change your password and PIN, and email us.'],
      ['What happens after wrong passwords?', 'After five wrong tries the account locks for 15 minutes, to keep it safe.'],
      ['Is Credvera a bank?', company.licenceStatement],
    ],
  },
];

/** Help: answers first, then a way to reach a person. */
export default function Help() {
  const profile = useProfile();
  const { payments } = usePayments();
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]!.key);
  const [open, setOpen] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [about, setAbout] = useState('');
  const [detail, setDetail] = useState('');

  // Answers the Credvera team publishes from the company dashboard, after the built-in ones.
  const content = useBusinessContent();
  const topics = useMemo<Topic[]>(() => {
    const published = content.data?.help ?? [];
    return published.length ? [...TOPICS, { key: 'more', title: 'More answers', icon: MessageCircleQuestion, qa: published.map((h) => [h.title, h.body]) }] : TOPICS;
  }, [content.data]);

  const hits = useMemo(() => {
    if (!q.trim()) return null;
    const t = q.toLowerCase();
    return topics.flatMap((tp) => tp.qa.filter(([a, b]) => `${a} ${b}`.toLowerCase().includes(t)).map((qa) => ({ topic: tp.title, qa })));
  }, [q, topics]);
  const current = topics.find((t) => t.key === topic) ?? topics[0]!;
  const recent = payments.slice(0, 12);

  // The report goes to a person by email, written for them: what, which payment, and who's asking.
  const mail = () => {
    const lines = [detail.trim(), ''];
    if (about) lines.push(`About: ${about}`);
    if (profile.data) lines.push(`From: ${profile.data.firstName} ${profile.data.lastName}, ${profile.data.email}`);
    const body = lines.join('\n');
    return `mailto:${company.supportEmail}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`;
  };
  const ready = subject.trim().length >= 3 && detail.trim().length >= 5;

  const QA = ({ qa, id }: { qa: [string, string]; id: string }) => (
    <li className="border-b border-graphite/[0.07] last:border-0">
      <button type="button" onClick={() => setOpen(open === id ? null : id)} aria-expanded={open === id} className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-medium">
        {qa[0]}
        <ChevronDown className={`size-4 shrink-0 text-graphite/45 transition-transform ${open === id ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open === id && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-4 text-[14.5px] leading-relaxed text-graphite/65">
            {qa[1]}
          </motion.p>
        )}
      </AnimatePresence>
    </li>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">How can we help?</h1>
      <label className="mt-5 flex h-12 max-w-xl items-center gap-3 rounded-xl border border-graphite/15 bg-white px-4 focus-within:border-graphite/40">
        <Search className="size-5 text-graphite/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, for example “invoice” or “PIN”" aria-label="Search help" className="w-full bg-transparent text-[15px] outline-none placeholder:text-graphite/35" />
      </label>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className={`${panel} p-6`}>
          {hits ? (
            <>
              <p className="text-[14px] text-graphite/55">
                {hits.length} {hits.length === 1 ? 'answer' : 'answers'} for “{q.trim()}”
              </p>
              <ul className="mt-2">
                {hits.map((h) => (
                  <QA key={h.qa[0]} qa={h.qa} id={h.qa[0]} />
                ))}
              </ul>
              {hits.length === 0 && <p className="py-6 text-[14.5px] text-graphite/55">Nothing yet. Email us on the right and a person will answer.</p>}
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setTopic(t.key);
                      setOpen(null);
                    }}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13.5px] font-medium transition-colors ${topic === t.key ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 hover:border-graphite/35'}`}
                  >
                    <t.icon className="size-4" /> {t.title}
                  </button>
                ))}
              </div>
              <ul className="mt-3">
                {current.qa.map((qa) => (
                  <QA key={qa[0]} qa={qa} id={qa[0]} />
                ))}
              </ul>
            </>
          )}
        </section>

        <div className="space-y-6">
          <section className={`${panel} p-6`}>
            <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Report a problem</h2>
            <p className="mt-1 text-[13.5px] text-graphite/55">It opens an email to our support team, ready to send. We reply to {profile.data?.email ?? 'your email'}.</p>
            <div className="mt-4 space-y-3">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What’s wrong, in a few words" className={field} aria-label="Subject" />
              <select value={about} onChange={(e) => setAbout(e.target.value)} className={field} aria-label="Which transaction">
                <option value="">It’s not about one transaction</option>
                {recent.map((p) => (
                  <option key={p.id} value={`${p.who} · ${p.kind === 'in' ? '+' : '−'}${money(p.amount, p.currency)} · ${shortDate(p.date)} · ref ${reference(p)}`}>
                    {p.who} · {p.kind === 'in' ? '+' : '−'}
                    {money(p.amount, p.currency)} · {shortDate(p.date)}
                  </option>
                ))}
              </select>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={4} placeholder="Tell us what happened" className="w-full resize-none rounded-lg border border-graphite/15 bg-white px-3.5 py-2.5 text-[15px] outline-none placeholder:text-graphite/35 focus:border-graphite/50" aria-label="What happened" />
              <a
                href={ready ? mail() : undefined}
                aria-disabled={!ready}
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold ${ready ? 'bg-graphite text-white hover:bg-black' : 'pointer-events-none bg-graphite/15 text-graphite/40'}`}
              >
                <Mail className="size-4" /> Write the email
              </a>
            </div>
          </section>

          <section className="rounded-2xl bg-graphite p-6 text-white">
            <p className="text-[15px] font-semibold">Talk to a person</p>
            <p className="mt-1 text-[13.5px] text-white/60">{company.supportHours}</p>
            <a href={`mailto:${company.supportEmail}`} className="mt-4 inline-flex items-center gap-2 text-[14.5px] font-semibold text-primary hover:underline">
              <Mail className="size-4" /> {company.supportEmail}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
