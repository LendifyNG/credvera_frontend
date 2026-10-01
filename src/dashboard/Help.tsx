import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, Check, ChevronDown, CreditCard, FileText, Mail, Search, Send, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { company } from '../lib/site';
import { money, reportProblem, shortDate, useDash } from './store';
import { usePayments } from './data';

const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';

type Topic = { key: string; title: string; icon: typeof Send; qa: [string, string][] };

/** Answers about what the dashboard does today; nothing promised that isn't built. */
function useTopics(limit: number): Topic[] {
  const l = money(limit).replace(/\.00$/, '');
  return [
    {
      key: 'payments',
      title: 'Payments',
      icon: Send,
      qa: [
        ['How much does a payment cost?', 'A naira payment to any Nigerian bank has a small flat fee. You see the fee and the total before you confirm.'],
        ['Why is my payment waiting?', `Payments of ${l} or more wait for a second person to approve them. You’ll find them under Approvals. The limit is set in Team.`],
        ['How do I pay many people at once?', 'Use Bulk payments. Download the template, fill in one row per person, and upload it. Each row is checked before anything is paid.'],
        ['Can I pay the same person every month?', 'Yes. When you pay someone, choose “Repeat it”. You can pause or delete it any time under Scheduled payments.'],
      ],
    },
    {
      key: 'fx',
      title: 'FX',
      icon: ArrowLeftRight,
      qa: [
        ['Is there a markup on conversions?', 'No. The rate you see is the rate you get, shown before you confirm.'],
        ['Does converting count as money in?', 'No. Moving money between your own currencies shows in Transactions, but it’s never counted as money in or out, so your reports stay honest.'],
        ['How do rate alerts work?', 'Choose a currency, above or below, and the rate you want. We tell you by email and in the app when it’s reached.'],
      ],
    },
    {
      key: 'cards',
      title: 'Cards',
      icon: CreditCard,
      qa: [
        ['What’s the difference between virtual and physical cards?', 'Virtual cards are ready straight away for paying online, in any of your four currencies. Physical cards are naira debit cards for shops and cash, delivered in 3 to 5 working days.'],
        ['How do I stop a card being used?', 'Open it under Cards and press Freeze. Payments are declined until you unfreeze it.'],
        ['Where are my card details?', 'Open the card and press Show details. You’ll need your PIN, and they hide again after 30 seconds.'],
      ],
    },
    {
      key: 'getpaid',
      title: 'Invoices and links',
      icon: FileText,
      qa: [
        ['How do customers pay an invoice?', 'Every invoice has a payment link and your account details, so they can pay online or by bank transfer.'],
        ['A customer paid but the invoice still shows unpaid.', 'Go to Reports, then Reconciliation. Match the payment to the invoice and it’s marked paid.'],
        ['What’s a reusable payment link?', 'One anyone can pay any number of times, like a price list. A one-time link closes after it’s paid.'],
      ],
    },
    {
      key: 'team',
      title: 'Team and approvals',
      icon: Users,
      qa: [
        ['Can someone approve their own payment?', 'No. Whoever asks for a payment can never approve it.'],
        ['What can an accountant see?', 'Everything, and they can download statements. They can’t move money.'],
        ['How do I change the approval limit?', 'In Team, under Roles and approvals. It asks for your PIN, and new payments follow it straight away.'],
      ],
    },
    {
      key: 'security',
      title: 'Account and security',
      icon: ShieldCheck,
      qa: [
        ['How do I sign in without a password?', 'Scan the code on the sign-in page with the Credvera app and approve on your phone, or use a code by text and your PIN.'],
        ['I think someone else signed in.', 'Go to Settings, then Security, and sign out the devices you don’t recognise. Then change your PIN in the app and report it to us below.'],
        ['Is Credvera a bank?', company.licenceStatement],
      ],
    },
  ];
}

/** Help: answers first, then a way to report a problem or reach us. */
export default function Help() {
  const { rules, cases, profile } = useDash();
  const { payments } = usePayments();
  const topics = useTopics(rules.over);
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState(topics[0]!.key);
  const [open, setOpen] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [about, setAbout] = useState('');
  const [detail, setDetail] = useState('');
  const [sent, setSent] = useState(false);

  const hits = useMemo(() => {
    if (!q.trim()) return null;
    const t = q.toLowerCase();
    return topics.flatMap((tp) => tp.qa.filter(([a, b]) => `${a} ${b}`.toLowerCase().includes(t)).map((qa) => ({ topic: tp.title, qa })));
  }, [q, topics]);
  const current = topics.find((t) => t.key === topic)!;
  const recent = payments.filter((p) => !p.internal).slice(0, 12);

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
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, for example “approval” or “card”" aria-label="Search help" className="w-full bg-transparent text-[15px] outline-none placeholder:text-graphite/35" />
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
              {hits.length === 0 && <p className="py-6 text-[14.5px] text-graphite/55">Nothing yet. Report it on the right and we’ll answer you directly.</p>}
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
            <p className="mt-1 text-[13.5px] text-graphite/55">We’ll reply by email to {profile.email}.</p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (subject.trim().length < 3 || detail.trim().length < 5) return;
                reportProblem({ subject: subject.trim(), about: about || undefined, detail: detail.trim() });
                setSubject('');
                setAbout('');
                setDetail('');
                setSent(true);
                window.setTimeout(() => setSent(false), 3500);
              }}
            >
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What’s wrong, in a few words" className={field} aria-label="Subject" />
              <select value={about} onChange={(e) => setAbout(e.target.value)} className={field} aria-label="Which transaction">
                <option value="">It’s not about one transaction</option>
                {recent.map((p) => (
                  <option key={p.id} value={`${p.who} · ${p.kind === 'in' ? '+' : '−'}${money(p.amount, p.currency)}`}>
                    {p.who} · {p.kind === 'in' ? '+' : '−'}
                    {money(p.amount, p.currency)} · {shortDate(p.date)}
                  </option>
                ))}
              </select>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={4} placeholder="Tell us what happened" className="w-full resize-none rounded-lg border border-graphite/15 bg-white px-3.5 py-2.5 text-[15px] outline-none placeholder:text-graphite/35 focus:border-graphite/50" aria-label="What happened" />
              <div className="flex items-center gap-3">
                <button type="submit" className="inline-flex h-10 items-center rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
                  Send it
                </button>
                <AnimatePresence>
                  {sent && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[13.5px] font-medium text-[#1f6b33]">
                      <Check className="size-4" /> Sent. It’s below.
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </section>

          <section className={`${panel} p-6`}>
            <h2 className="text-[16px] font-semibold">Your reports</h2>
            <ul className="mt-2 divide-y divide-graphite/[0.07]">
              {cases.map((c) => (
                <li key={c.id} className="py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-[14.5px] font-medium">{c.subject}</span>
                      <span className="block text-[12.5px] text-graphite/50">
                        {c.about ? `${c.about} · ` : ''}
                        {shortDate(c.created)}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[12px] font-medium ${c.status === 'answered' ? 'bg-[#e3f1e0] text-[#1f6b33]' : 'bg-[#fbf0d6] text-[#8a5a00]'}`}>{c.status === 'answered' ? 'Answered' : 'Open'}</span>
                  </div>
                  {c.reply && <p className="mt-2 rounded-lg bg-[#f5f4ef] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-graphite/70">{c.reply}</p>}
                </li>
              ))}
              {cases.length === 0 && <li className="py-5 text-[14px] text-graphite/50">No reports yet.</li>}
            </ul>
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
