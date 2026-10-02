import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
import { errorMessage, useServiceRequest, useSignedIn } from '../api';

const SYMBOL: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };
const amount = (v: string, c: string) => `${SYMBOL[c] ?? `${c} `}${Number(v).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
/** A line's Lagos wall time, `2026-10-01 00:47:56`, as `1 Oct 2026, 00:47`. */
const lineTime = (at: string) => `${new Date(`${at.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}, ${at.slice(11, 16)}`;
const stamp = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });

/**
 * An official statement as Credvera issued it, on a page of its own so it
 * prints cleanly. It shows the issued copy, never a recomputed one.
 */
export default function OfficialStatement() {
  const { id } = useParams();
  const signedIn = useSignedIn();
  const request = useServiceRequest(id);
  if (!signedIn) return <Navigate to="/business/app/sign-in" replace />;

  const s = request.data?.statement;

  return (
    <div className="min-h-screen bg-[#f5f4ef] px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-[860px] items-center justify-between gap-3 print:hidden">
        <Link to="/business/app/reports" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-graphite/60 hover:text-graphite">
          <ArrowLeft className="size-4" /> Back to Reports
        </Link>
        {s && (
          <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
            <Printer className="size-4" /> Print or save as PDF
          </button>
        )}
      </div>

      {request.isLoading ? (
        <Loader2 className="mx-auto mt-16 size-5 animate-spin text-graphite/40" aria-label="Loading" />
      ) : request.error ? (
        <p className="mt-16 text-center text-[14px] text-[#a3261b]">{errorMessage(request.error)}</p>
      ) : !s ? (
        <p className="mt-16 text-center text-[14px] text-graphite/60">This statement hasn’t been issued yet.</p>
      ) : (
        <article className="mx-auto max-w-[860px] bg-white p-10 text-[13px] shadow-[0_1px_2px_rgba(20,28,23,0.08),0_12px_32px_-16px_rgba(20,28,23,0.25)] print:max-w-none print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-graphite/15 pb-6">
            <div>
              <img src={logoDark} alt="Credvera" className="h-6 w-auto" />
              <p className="mt-5 text-[16px] font-semibold">{s.holder}</p>
              <p className="text-graphite/60">
                {s.currency} account
                {s.accountNumber ? ` ${s.accountNumber}` : ''}
                {s.bankName ? ` · ${s.bankName}` : ''}
              </p>
              {request.data?.details.addressedTo && <p className="mt-3 text-graphite/70">To: {request.data.details.addressedTo}</p>}
            </div>
            <div className="text-right">
              <p className="text-[22px] font-semibold tracking-[-0.02em]">Account statement</p>
              <p className="text-graphite/60">
                {longDay(s.from)} to {longDay(s.to)}
              </p>
              <p className="mt-3 text-[12px] text-graphite/50">Reference</p>
              <p className="font-ledger text-[14px] font-semibold">{s.reference}</p>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-[#f5f4ef] p-4 sm:grid-cols-4 print:bg-[#f5f4ef]">
            {[
              ['Opening balance', s.opening],
              ['Money in', s.totalIn],
              ['Money out', s.totalOut],
              ['Closing balance', s.closing],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11.5px] text-graphite/55">{label}</p>
                <p className="font-ledger text-[14px] font-semibold">{amount(value!, s.currency)}</p>
              </div>
            ))}
          </div>

          <table className="mt-6 w-full">
            <thead>
              <tr className="border-b border-graphite/20 text-left text-[11.5px] text-graphite/50">
                <th className="pb-2 font-medium">Date (WAT)</th>
                <th className="pb-2 font-medium">Details</th>
                <th className="pb-2 text-right font-medium">Money in</th>
                <th className="pb-2 text-right font-medium">Money out</th>
                <th className="pb-2 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-graphite/[0.07]">
                <td className="py-2 pr-3 text-graphite/55">{longDay(s.from)}</td>
                <td className="py-2 pr-3 font-medium" colSpan={3}>
                  Opening balance
                </td>
                <td className="py-2 text-right font-ledger">{amount(s.opening, s.currency)}</td>
              </tr>
              {s.lines.map((l, i) => (
                <tr key={`${l.reference}-${i}`} className="border-b border-graphite/[0.07] align-top [break-inside:avoid]">
                  <td className="whitespace-nowrap py-2 pr-3 text-graphite/55">{lineTime(l.at)}</td>
                  <td className="py-2 pr-3">{l.details}</td>
                  <td className="whitespace-nowrap py-2 text-right font-ledger text-[#1f6b33]">{l.moneyIn ? amount(l.moneyIn, s.currency) : ''}</td>
                  <td className="whitespace-nowrap py-2 text-right font-ledger">{l.moneyOut ? amount(l.moneyOut, s.currency) : ''}</td>
                  <td className="whitespace-nowrap py-2 pl-3 text-right font-ledger">{amount(l.balance, s.currency)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-3 text-graphite/55">{longDay(s.to)}</td>
                <td className="py-2 pr-3 font-medium" colSpan={3}>
                  Closing balance
                </td>
                <td className="py-2 text-right font-ledger font-semibold">{amount(s.closing, s.currency)}</td>
              </tr>
            </tbody>
          </table>
          {s.lines.length === 0 && <p className="mt-2 text-graphite/55">Nothing moved in this account in this period.</p>}

          <footer className="mt-10 border-t border-graphite/15 pt-5 text-[12px] leading-relaxed text-graphite/60">
            <p>
              Issued by Credvera Operations on {stamp(s.issuedAt)}, prepared by {s.issuedBy}. Taken from Credvera’s ledger as it stood when issued. To confirm this statement, write to Credvera quoting reference{' '}
              <span className="font-semibold text-graphite">{s.reference}</span>.
            </p>
          </footer>
        </article>
      )}
    </div>
  );
}
