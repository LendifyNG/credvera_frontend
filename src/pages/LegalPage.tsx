import PageHero from '../components/layout/PageHero';
import PlaceholderNote from '../components/ui/PlaceholderNote';
import { company } from '../lib/site';

type LegalPageProps = {
  kind: 'privacy' | 'terms';
};

type Section = { heading: string; body: string[] };

// PLACEHOLDER legal drafts with dummy details (retention period, notice period,
// DPO contact, dates). Replace with Credvera's reviewed text before launch —
// this is not legal advice.
const content: Record<LegalPageProps['kind'], { title: string; intro: string; sections: Section[] }> = {
  privacy: {
    title: 'Privacy policy',
    intro: 'How Credvera collects, uses and protects your personal and business data.',
    sections: [
      {
        heading: 'Who we are',
        body: [
          `${company.legalName} (RC ${company.rcNumber}) operates the Credvera website and app. ${company.licenceStatement}`,
        ],
      },
      {
        heading: 'Information we collect',
        body: [
          'Identity details such as your name, date of birth, BVN or NIN and a photo ID; business details such as your CAC registration; contact details; and transaction records.',
          'Device and usage information when you use our app or website, such as your device type and log data.',
        ],
      },
      {
        heading: 'How we use your information',
        body: [
          'To open and run your account, verify your identity as Nigerian regulations require, process payments, prevent fraud, meet our legal obligations and support you.',
          'We will only send you marketing if you agree to it, and you can opt out at any time.',
        ],
      },
      {
        heading: 'Legal basis',
        body: [
          'We process personal data in line with the Nigeria Data Protection Act 2023. We rely on our contract with you, our legal obligations, your consent (for marketing) and our legitimate interests in running a safe service.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'Our licensed payment and banking partners, identity-verification providers, service providers who work on our behalf, and regulators or law enforcement where the law requires. We do not sell your data.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'We keep account and transaction records for at least five years after your account closes, as Nigerian anti-money laundering rules require. Other data is deleted when we no longer need it.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can ask to access, correct or delete your data, object to certain uses, or request a copy of it. Some records must be kept by law even if you close your account.',
        ],
      },
      {
        heading: 'Contact us',
        body: [
          `Email ${company.supportEmail} or write to us at ${company.address}. You can reach our Data Protection Officer at dpo@credvera.com.`,
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'The terms that apply when you use Credvera’s website and app.',
    sections: [
      {
        heading: 'About these terms',
        body: [`These terms are an agreement between you and ${company.legalName}. By opening an account or using our services, you agree to them.`],
      },
      {
        heading: 'Who can use Credvera',
        body: ['You must be at least 18, and businesses must be properly registered. We may ask for documents to verify you and your business before you can move money.'],
      },
      {
        heading: 'Your account',
        body: ['Keep your login details, PIN and one-time codes private. Tell us straight away if you think someone else has accessed your account.'],
      },
      {
        heading: 'Payments and partners',
        body: [
          `${company.licenceStatement} Payments are subject to our partners’ terms, applicable limits and compliance checks, and may be delayed or refused where the law requires.`,
        ],
      },
      {
        heading: 'Fees',
        body: ['Our fees are shown on our pricing page and in the app before you confirm a payment. We will give you 30 days’ notice of any change.'],
      },
      {
        heading: 'Things you must not do',
        body: ['Use Credvera for anything illegal, fraudulent or prohibited by our partners, or try to interfere with our systems.'],
      },
      {
        heading: 'Liability',
        body: [
          'We are responsible for losses caused by our own mistakes or negligence. We are not responsible for losses caused by events outside our reasonable control, by incorrect details you give us, or by third-party services we don’t control.',
          'Nothing in these terms limits any rights you have under Nigerian consumer protection law.',
        ],
      },
      {
        heading: 'Governing law',
        body: ['These terms are governed by the laws of the Federal Republic of Nigeria.'],
      },
      {
        heading: 'Contact us',
        body: [`Questions about these terms? Email ${company.supportEmail}.`],
      },
    ],
  },
};

export default function LegalPage({ kind }: LegalPageProps) {
  const { title, intro, sections } = content[kind];

  return (
    <>
      <PageHero eyebrow="Legal" title={title} intro={intro} />
      <section className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
        <PlaceholderNote className="mb-12">Draft text for layout — the final {title.toLowerCase()} will replace it before launch.</PlaceholderNote>
        <p className="text-sm text-ink/50">Last updated: 1 September 2026</p>
        <div className="mt-10 space-y-12">
          {sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="flex gap-4 text-xl font-semibold tracking-tight sm:text-2xl">
                <span className="text-primary [text-shadow:0_0_0_#063c1a]">{String(i + 1).padStart(2, '0')}</span>
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 pl-10 leading-relaxed text-ink/70">
                {section.body.map((p) => (
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
