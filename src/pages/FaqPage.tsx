import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import PageHero from '../components/layout/PageHero';
import ButtonLink from '../components/ui/ButtonLink';
import Reveal from '../components/ui/Reveal';
import { company, links } from '../lib/site';

// PLACEHOLDER answers describe the planned products — confirm each one (and add
// limits and supported countries) with Credvera before launch.
const faqs = [
  {
    q: 'What is Credvera?',
    a: 'Credvera is a payments app for Nigerians. It handles business payments at home, cross-border payments, international school fees, supplier payments to China and across Africa, and payments home for Nigerians abroad.',
  },
  {
    q: 'Is Credvera a bank?',
    a: company.licenceStatement,
  },
  {
    q: 'Who is Credvera for?',
    a: 'Businesses in Nigeria — from market traders to importers and growing companies — plus families paying school fees abroad and Nigerians abroad supporting people at home.',
  },
  {
    q: 'What do I need to open an account?',
    a: 'Download the Credvera app and follow the sign-up steps. As required by Nigerian regulations, you’ll be asked to verify your identity and your business details before you can move money.',
  },
  {
    q: 'How much does Credvera cost?',
    a: 'Our fees are listed on the Pricing page for each product, and the app shows the fee before you confirm any payment.',
  },
  {
    q: 'Can I pay school fees abroad with Credvera?',
    a: 'Yes. With Study abroad you can pay tuition directly to schools abroad, save towards visa proof of funds in a Study Vault and send your student a monthly allowance.',
  },
  {
    q: 'Can I pay my suppliers in China?',
    a: 'Yes. Supplier payments lets you pay suppliers in China and across Africa, and keep your invoices with each payment.',
  },
  {
    q: 'I live abroad — can I pay bills in Nigeria?',
    a: 'Yes. With Pay Home you can pay school fees, rent and bills in Nigeria directly, and set up recurring payments for the essentials.',
  },
  {
    q: 'How do I get the app?',
    a: 'Credvera is available on Android through the Google Play Store.',
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHero eyebrow="FAQ" title="Questions, answered." intro="Straight answers about how Credvera works." />
      <section className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <Reveal delay={i * 0.04}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="text-lg font-semibold tracking-tight sm:text-xl">{item.q}</span>
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full border border-ink/15 transition-all duration-500 ${
                        isOpen ? 'rotate-45 bg-background text-white' : ''
                      }`}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 leading-relaxed text-ink/70">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              </li>
            );
          })}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink to={links.openAccount} variant="dark">
            Get the app
          </ButtonLink>
          <ButtonLink to="/contact" variant="outline-dark">
            Ask us something else
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
