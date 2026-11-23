import { motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Headline from '../components/editorial/Headline';
import Reveal from '../components/ui/Reveal';
import { useAudience } from '../lib/audience';
import { INTERNATIONAL } from '../lib/launch';
import { company } from '../lib/site';

type LegalPageProps = {
  kind: 'privacy' | 'terms' | 'delete-account';
};

type Section = { heading: string; short: string; body: string[] };

// PLACEHOLDER legal drafts (retention period, notice period, dates). Replace with Credvera's reviewed text before launch —
// this is not legal advice. The "short" lines are plain summaries, not terms.
const content: Record<LegalPageProps['kind'], { title: string; intro: string; sections: Section[] }> = {
  privacy: {
    title: 'Privacy *policy*',
    intro: 'How Credvera collects, uses and protects your personal and business data.',
    sections: [
      {
        heading: 'Who we are',
        short: 'The company behind the app.',
        body: [`${company.legalName} (RC ${company.rcNumber}), of ${company.address}, operates the Credvera website and app. ${company.description} ${company.licenceStatement}`],
      },
      {
        heading: 'Information we collect',
        short: 'Who you are, how you use the app, and your payments.',
        body: [
          'Identity details such as your name, date of birth, BVN or NIN, a photo ID and a selfie for identity checks; business details such as your CAC registration; contact details; and transaction records.',
          'Device and usage information when you use our app or website, such as your device type and log data. If you use Face ID or a fingerprint, that check happens on your phone and we never receive your biometric data.',
        ],
      },
      {
        heading: 'How we use your information',
        short: 'To run your account safely, and nothing you haven’t agreed to.',
        body: [
          'To open and run your account, verify your identity as Nigerian regulations require, process payments, prevent fraud, meet our legal obligations and support you.',
          'We will only send you marketing if you agree to it, and you can opt out at any time.',
        ],
      },
      {
        heading: 'Legal basis',
        short: 'We follow the Nigeria Data Protection Act.',
        body: [
          'We process personal data in line with the Nigeria Data Protection Act 2023. We rely on our contract with you, our legal obligations, your consent (for marketing) and our legitimate interests in running a safe service.',
        ],
      },
      {
        heading: 'Who we share it with',
        short: 'Only who we must, or who you choose. We never sell it.',
        body: [
          'Our licensed payment and banking partners, identity-verification providers, service providers who work on our behalf, and regulators or law enforcement where the law requires. We do not sell your data.',
          // At launch (lib/launch.ts) the celebration and aso-ebi pages take the Earnings Passport's place.
          INTERNATIONAL
            ? 'When you share an Earnings Passport, the person with the link sees only what you chose to show, and only until the link expires or you cancel it.'
            : 'When you send a gift or spray, or order aso-ebi, on someone’s celebration or aso-ebi page, the person who made the page sees your name, what you sent or ordered, and any note, sizes or phone number you give. If you spray, your name shows on the celebration’s live screen.',
        ],
      },
      {
        heading: 'How long we keep it',
        short: 'Five years after you leave, because the law says so.',
        body: [
          'We keep account and transaction records for at least five years after your account closes, as Nigerian anti-money laundering rules require. Other data is deleted when we no longer need it.',
        ],
      },
      {
        heading: 'Your rights',
        short: 'See it, fix it, or ask us to delete it.',
        body: [
          'You can ask to access, correct or delete your data, object to certain uses, or request a copy of it. Some records must be kept by law even if you close your account.',
        ],
      },
      {
        heading: 'Contact us',
        short: 'Questions go to a real person.',
        body: [`Email ${company.email}, call ${company.phone} or write to us at ${company.address}. The same email reaches our Data Protection Officer.`],
      },
    ],
  },
  'delete-account': {
    title: 'Delete your *account*',
    intro: 'How to close your Credvera account and have your data deleted, what we delete, and what the law makes us keep.',
    sections: [
      {
        heading: 'How to ask',
        short: 'Email us from the address on your account.',
        body: [
          `Email ${company.supportEmail} from the email address on your Credvera account, with the subject “Delete my account”. Include the phone number you signed up with.`,
          'If you can’t reach that email, use the same address and tell us; we’ll confirm it’s you another way before we delete anything.',
        ],
      },
      {
        heading: 'What happens next',
        short: 'We check it’s you, then close the account.',
        body: [
          'We reply within three working days to confirm it’s you. Any money left in your account must be sent out first, to a bank account in your name.',
          'Once your balance is zero we close the account, sign you out on every device and finish the deletion within 30 days.',
        ],
      },
      {
        heading: 'What we delete',
        short: 'Everything the law lets us.',
        body: [
          'Your profile and sign-in details, saved beneficiaries and contacts you picked in the app, notes, savings goals, events, notification settings and the devices linked to your account.',
        ],
      },
      {
        heading: 'What we keep, and for how long',
        short: 'Five years, because the law says so.',
        body: [
          'Nigerian anti-money laundering rules make us keep your identity details (name, date of birth, BVN or NIN, ID and selfie) and your transaction records for at least five years after the account closes. We keep them locked away, use them only for the law, and delete them when that period ends.',
        ],
      },
      {
        heading: 'Deleting some data only',
        short: 'You don’t have to close your account.',
        body: [
          `To have some of your data deleted without closing your account, email ${company.supportEmail} and tell us what you want removed. We’ll delete what the law allows and tell you what we must keep.`,
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of *use*',
    intro: 'The terms that apply when you use Credvera’s website and app.',
    sections: [
      {
        heading: 'About these terms',
        short: 'Using Credvera means agreeing to these.',
        body: [`These terms are an agreement between you and ${company.legalName}. By opening an account or using our services, you agree to them.`],
      },
      {
        heading: 'Who can use Credvera',
        short: 'Adults, and properly registered businesses.',
        body: ['You must be at least 18, and businesses must be properly registered. We may ask for documents to verify you and your business before you can move money.'],
      },
      {
        heading: 'Your account',
        short: 'Keep your PIN to yourself.',
        body: ['Keep your login details, PIN and one-time codes private. Tell us straight away if you think someone else has accessed your account.'],
      },
      {
        heading: 'Payments and partners',
        short: 'Partners move the money, with checks the law requires.',
        body: [
          `${company.licenceStatement} Payments are subject to our partners’ terms, applicable limits and compliance checks, and may be delayed or refused where the law requires.`,
        ],
      },
      {
        heading: 'Fees',
        short: 'Shown before you pay, with notice before any change.',
        body: ['Our fees are shown on our pricing page and in the app before you confirm a payment. We will give you 30 days’ notice of any change.'],
      },
      {
        heading: 'Things you must not do',
        short: 'Nothing illegal, nothing fraudulent.',
        body: ['Use Credvera for anything illegal, fraudulent or prohibited by our partners, or try to interfere with our systems.'],
      },
      {
        heading: 'Liability',
        short: 'Our mistakes are on us.',
        body: [
          'We are responsible for losses caused by our own mistakes or negligence. We are not responsible for losses caused by events outside our reasonable control, by incorrect details you give us, or by third-party services we don’t control.',
          'Nothing in these terms limits any rights you have under Nigerian consumer protection law.',
        ],
      },
      {
        heading: 'Governing law',
        short: 'Nigerian law applies.',
        body: ['These terms are governed by the laws of the Federal Republic of Nigeria.'],
      },
      {
        heading: 'Contact us',
        short: 'Ask us anything about these terms.',
        body: [`Questions about these terms? Email ${company.email} or call ${company.phone}.`],
      },
    ],
  },
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-');

/** Privacy, terms and account deletion: the full text, with a plain summary beside each part. */
export default function LegalPage({ kind }: LegalPageProps) {
  const { audience } = useAudience();
  const { title, intro, sections } = content[kind];
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const [active, setActive] = useState(slug(sections[0]!.heading));

  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: '-25% 0px -65% 0px',
    });
    sections.forEach((s) => {
      const el = document.getElementById(slug(s.heading));
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  // Business has its own legal pages.
  if (audience === 'business' && kind !== 'delete-account') return <Navigate to={`/business/${kind}`} replace />;

  return (
    <>
      {/* How far through you are */}
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-background" style={{ scaleX: progress }} />

      <header className="mx-auto max-w-7xl px-6 pb-16 pt-32 lg:px-8 lg:pt-40">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4 border-b border-ink/10 pb-5">
            <span className="text-[13px] font-semibold text-background">Legal</span>
            <span className="ml-auto flex rounded-full bg-white p-1 text-sm font-semibold ring-1 ring-ink/10">
              {(['privacy', 'terms'] as const).map((k) => (
                <Link
                  key={k}
                  to={`/${k}`}
                  className={`rounded-full px-4 py-1.5 transition-colors ${k === kind ? 'bg-secondary text-white' : 'text-ink/55 hover:text-ink'}`}
                >
                  {k === 'privacy' ? 'Privacy' : 'Terms'}
                </Link>
              ))}
            </span>
          </div>
        </Reveal>
        <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Headline key={kind} as="h1" text={title} className="text-[clamp(2.8rem,7vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]" />
          <Reveal delay={0.2}>
            <p className="max-w-md text-lg leading-relaxed text-ink/65">{intro}</p>
            <p className="mt-3 text-sm text-ink/45">Last updated 1 September 2026</p>
          </Reveal>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 lg:grid-cols-[220px_1fr] lg:gap-20 lg:px-8 lg:pb-32">
        <nav aria-label="Contents" className="hidden lg:block">
          <ol className="sticky top-28 space-y-1 border-l border-ink/10">
            {sections.map((s, i) => {
              const id = slug(s.heading);
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`-ml-px flex gap-3 border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                      active === id ? 'border-background font-semibold text-ink' : 'border-transparent text-ink/50 hover:text-ink'
                    }`}
                  >
                    <span className="tabular-nums text-ink/30">{String(i + 1).padStart(2, '0')}</span>
                    {s.heading}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-t border-ink/15">
          {sections.map((s, i) => (
            <section key={s.heading} id={slug(s.heading)} className="grid scroll-mt-28 gap-4 border-b border-ink/10 py-10 md:grid-cols-[1fr_1.6fr] md:gap-12">
              <div>
                <p className="text-xs font-semibold tabular-nums text-ink/35">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{s.heading}</h2>
                <p className="mt-3 font-serif text-xl italic leading-snug text-background">
                  <span className="mr-2 text-[13px] font-sans font-semibold not-italic text-ink/35">In short</span>
                  {s.short}
                </p>
              </div>
              <div className="space-y-4 text-[17px] leading-relaxed text-ink/70">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
