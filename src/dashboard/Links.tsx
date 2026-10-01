import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { errorMessage, usePaymentLinks, type PaymentLinkDto } from '../api';
import { useSession } from './data';
import { amount, byCurrency, CopyLink, Made, NewRequest, RequestDetail, StatusPill, valueOf, whenText } from './requests';
import { Loading } from './ui';

const DAY = 86400000;
const panel = 'rounded-2xl border border-graphite/10 bg-white';

/**
 * Payment links: the link behind each request, ready to share on WhatsApp,
 * email or anywhere. The customer pays on it by card or bank transfer.
 */
export default function Links() {
  const links = usePaymentLinks();
  const session = useSession();
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [made, setMade] = useState<PaymentLinkDto | null>(null);

  const all = useMemo(() => links.data ?? [], [links.data]);
  const live = all.filter((l) => l.status === 'pending');
  const paid30 = all.filter((l) => l.status === 'paid' && l.paidAt && Date.now() - new Date(l.paidAt).getTime() < 30 * DAY);
  const current = all.find((l) => l.reference === open);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Payment links</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Share a link on WhatsApp, email or anywhere. Your customer pays by card or bank transfer.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
          <Plus className="size-4" /> New link
        </button>
      </div>

      <section className="mt-6 grid overflow-hidden rounded-2xl border border-graphite/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-graphite/10">
        {[
          { label: 'Collected, last 30 days', value: byCurrency(paid30.map((l) => ({ currency: l.currency, value: valueOf(l) }))), tone: 'text-[#1f6b33]' },
          { label: 'Open links', value: String(live.length) },
          { label: 'Paid links', value: String(all.filter((l) => l.status === 'paid').length) },
        ].map((s, i) => (
          <div key={s.label} className={`min-w-0 px-6 py-5 ${i ? 'border-t border-graphite/10 sm:border-t-0' : ''}`}>
            <p className="text-[13px] font-medium text-graphite/55">{s.label}</p>
            <p className={`mt-1 truncate font-ledger text-[22px] font-semibold tracking-[-0.02em] ${s.tone ?? ''}`}>{s.value}</p>
          </div>
        ))}
      </section>

      <Made link={made} onClose={() => setMade(null)} />

      <section className={`${panel} mt-6 overflow-x-auto`}>
        {links.isLoading ? (
          <Loading />
        ) : links.error ? (
          <p className="py-14 text-center text-[14px] text-[#9a3a17]">{errorMessage(links.error)}</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-graphite/10 text-[12.5px] text-graphite/45">
                <th className="py-3 pl-5 pr-4 font-medium">Link</th>
                <th className="py-3 pr-4 text-right font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">When</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-5" />
              </tr>
            </thead>
            <tbody>
              {all.map((l) => (
                <tr
                  key={l.reference}
                  tabIndex={0}
                  onClick={() => setOpen(l.reference)}
                  onKeyDown={(e) => e.key === 'Enter' && setOpen(l.reference)}
                  className="cursor-pointer border-b border-graphite/[0.06] outline-none transition-colors last:border-0 hover:bg-[#faf9f5] focus-visible:bg-[#faf9f5]"
                >
                  <td className="py-3.5 pl-5 pr-4">
                    <span className="block font-medium">{l.invoiceName}</span>
                    <span className="block text-[12.5px] text-graphite/45">For {l.recipient.name}</span>
                  </td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right font-ledger">{amount(Number(l.amount), l.currency)}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-graphite/60">{whenText(l)}</td>
                  <td className="py-3.5 pr-4">
                    <StatusPill status={l.status} />
                  </td>
                  <td className="py-3.5 pr-5 text-right">{l.status === 'pending' && <CopyLink url={l.url} />}</td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <p className="text-[15px] font-medium">No payment links yet</p>
                    <p className="mt-1 text-[14px] text-graphite/50">Make one and share it; your customer pays by card or bank transfer.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <AnimatePresence>
        {current && <RequestDetail key={current.reference} link={current} onClose={() => setOpen(null)} />}
        {creating && (
          <NewRequest
            existing={all}
            onClose={() => setCreating(false)}
            onDone={(l) => {
              setCreating(false);
              setMade(l);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
