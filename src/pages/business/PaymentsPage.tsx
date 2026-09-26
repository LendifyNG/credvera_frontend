import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import payCard from '../../assets/photos/business/pay-card.webp';
import payInvoice from '../../assets/photos/business/pay-invoice.webp';
import payLink from '../../assets/photos/business/pay-link.webp';
import payTransfer from '../../assets/photos/business/pay-transfer.webp';
import BizClose from '../../components/business/BizClose';
import InvoiceAnatomy from '../../components/business/InvoiceAnatomy';
import PaymentLedger from '../../components/business/PaymentLedger';
import Reveal from '../../components/ui/Reveal';
import { businessPages } from '../../lib/businessPages';

const PATH = '/business/payments';
const INDEX = businessPages.findIndex((p) => p.to === PATH);
const ease = [0.16, 1, 0.3, 1] as const;

// The ways a customer pays you, each a real moment (Pexels photos 7620901,
// 7970825, 5447329, 7688191). Shown whole, at their own shapes.
const frames = [
  { src: payCard, w: 900, h: 1350, caption: 'Card, online', note: 'From your payment link or invoice.', alt: 'A man holding his bank card while paying on his phone' },
  { src: payTransfer, w: 900, h: 600, caption: 'Bank transfer', note: 'From any Nigerian bank app.', alt: 'A man making a transfer on his phone' },
  { src: payLink, w: 900, h: 600, caption: 'Payment link', note: 'Sent on WhatsApp, Instagram or email.', alt: 'Someone opening a link on their phone' },
  { src: payInvoice, w: 900, h: 676, caption: 'Invoice', note: 'Paid in full, or reminded on time.', alt: 'Two people going over an invoice' },
];

// One salary payment, from request to paid. Example names and times.
const approval = [
  { time: '09:12', who: 'Tunde, Finance', what: 'Asks to pay Kemi Adeyemi ₦650,000', note: 'Salary for September · Zenith Bank' },
  { time: '09:40', who: 'You', what: 'Approve it with your PIN', note: 'Big payments need a second person' },
  { time: '09:40', who: 'Kemi Adeyemi', what: 'Paid ₦650,000.00', note: '₦25 fee · a receipt for both of you' },
];

/** Business: getting paid and paying out. */
export default function PaymentsPage() {
  const reduce = useReducedMotion();
  // The strip slides left as the page scrolls past it, so every frame gets its turn.
  const sheet = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);
  useEffect(() => {
    const measure = () => setOverflow(Math.max(0, (strip.current?.scrollWidth ?? 0) - (sheet.current?.clientWidth ?? 0)));
    measure();
    window.addEventListener('resize', measure);
    const imgs = strip.current?.querySelectorAll('img') ?? [];
    imgs.forEach((im) => im.addEventListener('load', measure));
    return () => {
      window.removeEventListener('resize', measure);
      imgs.forEach((im) => im.removeEventListener('load', measure));
    };
  }, []);
  const { scrollYProgress } = useScroll({ target: sheet, offset: ['start end', 'end start'] });
  const sheetX = useTransform(scrollYProgress, [0.3, 0.95], [0, -overflow]);
  return (
    <>
      {/* 1. Opening: every way a customer pays, as a contact sheet of real moments */}
      <header className="bg-ledger text-graphite">
        <div className="mx-auto max-w-7xl px-6 pt-32 lg:px-8 lg:pt-40">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
            <span>
              {String(INDEX + 1).padStart(2, '0')} · Payments and invoices
            </span>
            <span>Card · Transfer · Link · Invoice</span>
          </div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mt-12 max-w-5xl text-[clamp(2.8rem,6.4vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.05em]"
          >
            Get paid every way
            <br />
            <span className="text-graphite/45">your customers pay.</span>
          </motion.h1>
        </div>

        {/* The sheet: tall frames at their own shapes, gliding sideways as you scroll */}
        <div ref={sheet} className={`${reduce ? "overflow-x-auto" : "overflow-hidden"} pb-20 pt-14 lg:pb-24`}>
          <motion.div ref={strip} className="flex w-max gap-3 px-6 lg:px-8" style={reduce ? undefined : { x: sheetX }}>
            {frames.map((f, i) => (
              <motion.figure
                key={f.caption}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.2 + i * 0.1 }}
                className="shrink-0"
              >
                <img
                  src={f.src}
                  alt={f.alt}
                  width={f.w}
                  height={f.h}
                  decoding="async"
                  className="block h-[clamp(260px,38vw,480px)] w-auto rounded-lg"
                />
                <figcaption className="mt-3 flex items-baseline gap-3 font-medium text-[13px]">
                  <span className="text-graphite/40">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-graphite/80">{f.caption}</span>
                </figcaption>
                <p className="mt-1 pl-7 text-[13px] leading-snug text-graphite/55">{f.note}</p>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </header>

      {/* 2. An invoice, taken apart */}
      <section className="bg-white text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <h2 className="mb-14 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            An invoice,
            <br />
            <span className="text-graphite/45">taken apart.</span>
          </h2>
          <InvoiceAnatomy />
        </div>
      </section>

      {/* 3. Every payment, one list */}
      <section className="bg-ledger text-graphite">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Every payment.
              <br />
              <span className="text-graphite/45">One list.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-graphite/65">
              Money in and money out, together. Filter it, search it, and hand it to your accountant as it is.
            </p>
            <p className="mt-6 font-medium text-[13px] text-graphite/45">Try the filters →</p>
          </div>
          <PaymentLedger />
        </div>
      </section>

      {/* 4. A second pair of eyes */}
      <section className="bg-graphite text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              A second
              <br />
              <span className="text-white/45">pair of eyes.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/65">
              Big payments wait for someone else to approve them. Small ones go straight out, for ₦25, with the account name shown
              before you send.
            </p>
          </div>
          <ol className="relative">
            <span aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-white/20" />
            {approval.map((s, i) => (
              <Reveal key={s.what} delay={i * 0.12}>
                <li className="relative grid grid-cols-[1.5rem_4rem_1fr] gap-3 pb-10 last:pb-0">
                  <span className={`mt-1.5 size-[11px] rounded-full ring-4 ring-graphite ${i === approval.length - 1 ? 'bg-primary' : 'bg-white'}`} />
                  <span className="pt-0.5 font-ledger text-[12px] text-white/45">{s.time}</span>
                  <span>
                    <span className="block font-medium text-[13px] text-white/45">{s.who}</span>
                    <span className="mt-1 block text-xl font-semibold tracking-tight">{s.what}</span>
                    <span className="mt-1 block text-[14px] text-white/55">{s.note}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <BizClose path={PATH} />
    </>
  );
}
