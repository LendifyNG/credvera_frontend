import { CircleCheck, CreditCard, Loader2, Lock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { errorMessage, useCheckout, usePublicInvoice } from '../api';
import logoDark from '../assets/logo-dark.png';
import { money, shortDate, type Currency } from '../dashboard/model';

const amount = (n: string | number, currency: string) => money(Number(n), currency as Currency);

/**
 * Where a payment link lands: the invoice, who it's from, and a button that
 * opens the provider's checkout. No sign-in; the link itself is the key.
 */
export default function PayPage() {
  const { slug = '' } = useParams();
  const invoice = usePublicInvoice(slug);
  const checkout = useCheckout(slug);
  const inv = invoice.data;

  return (
    <div className="min-h-screen bg-ledger px-4 py-10 text-graphite sm:py-16">
      <div className="mx-auto max-w-lg">
        <img src={logoDark} alt="Credvera" className="mx-auto h-6 w-auto" />

        {invoice.isLoading ? (
          <Loader2 className="mx-auto mt-16 size-6 animate-spin text-graphite/40" aria-label="Loading" />
        ) : !inv ? (
          <div className="mt-12 rounded-2xl bg-white p-8 text-center ring-1 ring-graphite/10">
            <p className="text-[18px] font-semibold">We can’t open this payment link</p>
            <p className="mt-2 text-[14.5px] text-graphite/60">{invoice.error ? errorMessage(invoice.error) : 'Check the link with whoever sent it.'}</p>
          </div>
        ) : (
          <article className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_-18px_rgba(20,28,23,0.35)] ring-1 ring-graphite/10">
            <header className="border-b border-graphite/10 px-7 py-6">
              <p className="text-[13px] text-graphite/55">{inv.from ? `${inv.from} is asking you to pay` : 'Payment request'}</p>
              <p className="mt-1 font-ledger text-[32px] font-semibold tracking-[-0.03em]">{amount(inv.amount, inv.currency)}</p>
              <p className="mt-1 text-[14px] text-graphite/60">
                {inv.invoiceName} · for {inv.billedTo}
              </p>
            </header>

            <div className="px-7 py-6">
              <table className="w-full text-[14px]">
                <tbody>
                  {inv.items.map((it, n) => (
                    <tr key={n} className="border-b border-graphite/[0.07] last:border-0">
                      <td className="py-2.5">
                        {it.description}
                        {it.quantity > 1 && <span className="text-graphite/50"> × {it.quantity}</span>}
                      </td>
                      <td className="py-2.5 text-right font-ledger">{amount(it.subtotal, inv.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inv.note && <p className="mt-4 text-[14px] text-graphite/60">{inv.note}</p>}

              {inv.status === 'paid' ? (
                <p className="mt-7 flex items-center justify-center gap-2 rounded-lg bg-[#eef8ea] py-3 text-[15px] font-semibold text-[#1f6b33]">
                  <CircleCheck className="size-5" /> Paid{inv.paidAt ? ` on ${shortDate(inv.paidAt)}` : ''}. Thank you.
                </p>
              ) : inv.status !== 'pending' ? (
                <p className="mt-7 rounded-lg bg-[#efeee7] py-3 text-center text-[14.5px] text-graphite/65">
                  This link is {inv.status} and can’t take payments. Ask {inv.from ?? 'the sender'} for a new one.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={checkout.isPending}
                    // The provider's page takes the payment; it comes back here when done.
                    onClick={() => checkout.mutate(undefined, { onSuccess: ({ url }) => window.location.assign(url) })}
                    className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-graphite text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60"
                  >
                    {checkout.isPending ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />} Pay {amount(inv.amount, inv.currency)}
                  </button>
                  {checkout.error && <p className="mt-3 text-center text-[13.5px] text-[#9a3a17]">{errorMessage(checkout.error)}</p>}
                  {inv.expiresAt && <p className="mt-3 text-center text-[12.5px] text-graphite/50">Open until {shortDate(inv.expiresAt)}</p>}
                </>
              )}
            </div>
          </article>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-graphite/45">
          <Lock className="size-3" /> Secure checkout by Credvera
        </p>
      </div>
    </div>
  );
}
