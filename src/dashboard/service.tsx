import { FileCheck2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, useCancelServiceRequest, useRequestClosure, useRequestStatement, useServiceRequests, useWallets, type ServiceRequestDto, type ServiceRequestStatus } from '../api';
import { useActiveBusiness } from './data';
import { CURRENCIES } from './money';

// Requests that go to Credvera's operations team: an official statement, and
// closing the account. Each shows where it stands and what the team said.

const panel = 'rounded-2xl border border-graphite/10 bg-white';
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';
const label = 'mb-1.5 block text-[13px] font-medium text-graphite/60';
const primary = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40';
const quiet = 'text-[13.5px] font-semibold text-graphite/60 underline-offset-4 hover:text-graphite hover:underline disabled:opacity-40';

const STATUS: Record<ServiceRequestStatus, { label: string; tone: string }> = {
  new: { label: 'Sent', tone: 'bg-[#efeee7] text-graphite/70' },
  in_progress: { label: 'Being prepared', tone: 'bg-[#e4ecf7] text-[#1d4f91]' },
  done: { label: 'Ready', tone: 'bg-[#e3f1e6] text-[#1f6b33]' },
  declined: { label: 'Declined', tone: 'bg-[#fbe9e7] text-[#a3261b]' },
  cancelled: { label: 'Withdrawn', tone: 'bg-[#efeee7] text-graphite/50' },
};

/** Today in Lagos, YYYY-MM-DD. */
const today = () => new Date(Date.now() + 3_600_000).toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() + 3_600_000 - n * 86_400_000).toISOString().slice(0, 10);
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const asked = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function Status({ status }: { status: ServiceRequestStatus }) {
  return <span className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-[12.5px] font-medium ${STATUS[status].tone}`}>{STATUS[status].label}</span>;
}

/** On Reports: ask for a statement Credvera issues with a reference, and see the ones asked for. */
export function OfficialStatements() {
  const wallets = useWallets();
  const requests = useServiceRequests();
  const ask = useRequestStatement();
  const cancel = useCancelServiceRequest();
  const currencies = CURRENCIES.filter((c) => wallets.data?.some((w) => w.currency === c.code));
  const [currency, setCurrency] = useState('NGN');
  const [from, setFrom] = useState(() => daysAgo(89));
  const [to, setTo] = useState(today);
  const [purpose, setPurpose] = useState('');
  const [addressedTo, setAddressedTo] = useState('');
  const [sent, setSent] = useState<ServiceRequestDto | null>(null);

  const mine = (requests.data ?? []).filter((r) => r.kind === 'statement');
  const ready = purpose.trim().length >= 3 && from && to && from <= to;

  return (
    <section className={`${panel} mt-6 p-6`}>
      <div className="flex items-start gap-3">
        <FileCheck2 className="mt-0.5 size-5 shrink-0 text-graphite/45" />
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Official statement</h2>
          <p className="mt-0.5 max-w-2xl text-[14px] text-graphite/60">
            For an embassy, a lender or an auditor: a statement prepared and issued by our operations team, with a reference they can quote. You’ll find it here, ready to print, once it’s issued.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            ask.mutate(
              { currency, from, to, purpose: purpose.trim(), ...(addressedTo.trim() ? { addressedTo: addressedTo.trim() } : {}) },
              {
                onSuccess: (r) => {
                  setSent(r);
                  setPurpose('');
                  setAddressedTo('');
                },
              },
            );
          }}
        >
          <label className="block">
            <span className={label}>Account</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={field}>
              {(currencies.length ? currencies : CURRENCIES.slice(0, 1)).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>What it’s for</span>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={120} placeholder="For example, a visa application" className={field} />
          </label>
          <label className="block">
            <span className={label}>From</span>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className={label}>To</span>
            <input type="date" value={to} max={today()} onChange={(e) => setTo(e.target.value)} className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Addressed to (optional)</span>
            <input value={addressedTo} onChange={(e) => setAddressedTo(e.target.value)} maxLength={120} placeholder="For example, The Embassy of the Netherlands, Lagos" className={field} />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={!ready || ask.isPending} className={primary}>
              {ask.isPending && <Loader2 className="size-4 animate-spin" />} Ask for the statement
            </button>
            {ask.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(ask.error)}</p>}
            {sent && !ask.error && (
              <p className="text-[13.5px] text-graphite/65">
                Sent. Your reference is <span className="font-semibold">{sent.reference}</span>.
              </p>
            )}
          </div>
        </form>

        <div>
          <p className="text-[13px] font-medium text-graphite/55">Asked for</p>
          {mine.length ? (
            <ul className="mt-2 divide-y divide-graphite/[0.07]">
              {mine.map((r) => (
                <li key={r.id} className="py-3 text-[14px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {r.details.currency} · {longDay(r.details.from!)} to {longDay(r.details.to!)}
                    </span>
                    <Status status={r.status} />
                  </div>
                  <p className="mt-0.5 text-[13px] text-graphite/55">
                    {r.reference} · {r.details.purpose} · asked {asked(r.createdAt)}
                  </p>
                  {r.resolutionNote && <p className="mt-1 text-[13.5px] text-graphite/75">“{r.resolutionNote}”</p>}
                  <div className="mt-1.5 flex gap-4">
                    {r.hasStatement && (
                      <Link to={`/business/app/statements/${r.id}`} className="text-[13.5px] font-semibold text-graphite underline-offset-4 hover:underline">
                        View and print
                      </Link>
                    )}
                    {r.status === 'new' && (
                      <button type="button" className={quiet} disabled={cancel.isPending} onClick={() => cancel.mutate(r.id)}>
                        Withdraw
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] text-graphite/50">{requests.isLoading ? 'Loading…' : 'Nothing asked for yet.'}</p>
          )}
          {cancel.error && <p className="mt-2 text-[13.5px] text-[#a3261b]">{errorMessage(cancel.error)}</p>}
        </div>
      </div>
    </section>
  );
}

/** In Settings: ask for the business account to be closed, and follow the request. */
export function CloseAccount() {
  const business = useActiveBusiness();
  const requests = useServiceRequests();
  const ask = useRequestClosure();
  const cancel = useCancelServiceRequest();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!business) return null;
  const latest = (requests.data ?? []).find((r) => r.kind === 'account_closure');
  const pending = latest && (latest.status === 'new' || latest.status === 'in_progress');

  return (
    <section className={`${panel} p-6`}>
      <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Close this account</h2>
      {business.closedAt ? (
        <p className="mt-1 text-[14px] text-graphite/60">{business.name}’s account is closed. Its history and statements stay here.</p>
      ) : pending ? (
        <div className="mt-2 text-[14px]">
          <div className="flex flex-wrap items-center gap-2">
            <span>You asked us to close {business.name}’s account.</span>
            <Status status={latest.status} />
          </div>
          <p className="mt-1 text-graphite/60">
            Reference {latest.reference}. We close it once nothing is left in it: move any money out and let payments on their way arrive. We’ll be in touch if anything is needed.
          </p>
          {latest.status === 'new' && (
            <button type="button" className={`${quiet} mt-2`} disabled={cancel.isPending} onClick={() => cancel.mutate(latest.id)}>
              Withdraw the request
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="mt-1 max-w-2xl text-[14px] text-graphite/60">
            Our operations team closes the account once nothing is left in it. Move any money out first. After it closes, nobody can send from it or pay into it, and open payment links stop working.
          </p>
          {latest?.status === 'declined' && latest.resolutionNote && (
            <p className="mt-2 text-[13.5px] text-graphite/75">
              Your last request ({latest.reference}) was declined: “{latest.resolutionNote}”
            </p>
          )}
          {open ? (
            <form
              className="mt-4 max-w-xl space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (reason.trim().length < 3) return;
                ask.mutate(reason.trim(), { onSuccess: () => setOpen(false) });
              }}
            >
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} placeholder="Why you’re closing it" aria-label="Reason" className="w-full resize-none rounded-lg border border-graphite/15 px-3.5 py-2.5 text-[15px] outline-none placeholder:text-graphite/35 focus:border-graphite/50" />
              {ask.error && <p className="text-[13.5px] text-[#a3261b]">{errorMessage(ask.error)}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={reason.trim().length < 3 || ask.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#a3261b] px-4 text-[14px] font-semibold text-white hover:bg-[#8f1c13] disabled:opacity-40">
                  {ask.isPending && <Loader2 className="size-4 animate-spin" />} Ask us to close it
                </button>
                <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setOpen(true)} className="mt-4 inline-flex h-10 items-center rounded-lg border border-[#e8c4bf] px-4 text-[14px] font-semibold text-[#a3261b] hover:bg-[#fbe9e7]">
              Close {business.name}’s account
            </button>
          )}
        </>
      )}
      {cancel.error && <p className="mt-2 text-[13.5px] text-[#a3261b]">{errorMessage(cancel.error)}</p>}
    </section>
  );
}
