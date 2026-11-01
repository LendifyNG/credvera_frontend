import { ArrowUpRight, Check, Copy, CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * The steps of paying through a Monnify collection, shared by the
 * celebration and split pages: a one-time account to transfer to, card
 * checkout, waiting for the confirmation, and a payment that ran out.
 */

/** A payment as the API tracks it: pending until Monnify confirms the money arrived. */
export type PaymentState = {
  reference: string;
  status: 'pending' | 'paid' | 'expired';
  method: 'transfer' | 'card';
  amount: string;
  account: { number: string; name: string | null; bank: string | null; expiresAt: string | null } | null;
  checkoutUrl: string | null;
};

type StatusAsk = (reference: string) => Promise<{ status: PaymentState['status'] }>;

export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/** The site's pill button: dark, with a lime circle that turns on hover. */
export function Pill({ children, disabled, onClick, type = 'button' }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-secondary py-2 pl-6 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-background disabled:opacity-40 sm:w-auto"
    >
      {children}
      <span className="grid size-9 place-items-center rounded-full bg-primary text-secondary transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight className="size-4" />
      </span>
    </button>
  );
}

export function useCountdown(until: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, until - now);
  return `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
}

/** Asks the API every few seconds until the payment is paid or can't be any more. */
export function usePaymentStatus(reference: string | null, ask: (reference: string) => Promise<{ status: PaymentState['status'] }>, onDone: (status: 'paid' | 'expired') => void) {
  useEffect(() => {
    if (!reference) return;
    let stopped = false;
    const check = async () => {
      try {
        const g = await ask(reference);
        if (!stopped && g.status !== 'pending') {
          stopped = true;
          onDone(g.status);
        }
      } catch {
        // Asked again on the next tick.
      }
    };
    check();
    const t = window.setInterval(check, 5000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);
}

/** The one-time account for this payment, with the exact amount and a clock. */
export function Transfer({ amount, what, state, ask, onDone }: { amount: number; what: string; state: PaymentState; ask: StatusAsk; onDone: (status: 'paid' | 'expired') => void }) {
  const account = state.account!;
  const left = useCountdown(account.expiresAt ? new Date(account.expiresAt).getTime() : Date.now());
  const [copied, setCopied] = useState(false);
  const [waiting, setWaiting] = useState(false);
  usePaymentStatus(state.reference, ask, onDone);
  const copy = async () => {
    await navigator.clipboard?.writeText(account.number).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div>
      <p className="text-[15px] text-ink/65">
        Transfer exactly <span className="font-semibold text-ink">{naira(amount)}</span> from your bank app to:
      </p>
      <div className="mt-4 rounded-[24px] bg-background p-6 text-white">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/45">Account number</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="whitespace-nowrap font-ledger text-[clamp(1.6rem,7.4vw,2.1rem)] font-semibold tracking-[0.01em]">{account.number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</p>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy account number"
            className="grid size-11 place-items-center rounded-full bg-primary text-ink transition-transform active:scale-95"
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-[18px]" />}
          </button>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-[14px]">
          <div>
            <dt className="text-white/45">Bank</dt>
            <dd className="mt-0.5 font-medium">{account.bank}</dd>
          </div>
          <div>
            <dt className="text-white/45">Name</dt>
            <dd className="mt-0.5 font-medium">{account.name}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[13.5px] text-ink/55">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7a8f1a] opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-[#7a8f1a]" />
        </span>
        This number is just for your {what} and works for the next {left}.
      </p>
      <div className="mt-8">
        <Pill onClick={() => setWaiting(true)} disabled={waiting}>
          {waiting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Looking for your transfer…
            </span>
          ) : (
            'I’ve sent it'
          )}
        </Pill>
        {waiting && <p className="mt-3 text-[13.5px] text-ink/55">This page updates as soon as it arrives, usually within a minute.</p>}
      </div>
    </div>
  );
}

/** Card goes through Monnify's secure checkout, which sends the payer back here. */
export function Card({ amount, state }: { amount: number; state: PaymentState }) {
  const [opening, setOpening] = useState(false);
  const pay = () => {
    if (!state.checkoutUrl) return;
    setOpening(true);
    window.location.assign(state.checkoutUrl);
  };
  return (
    <div>
      <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/10">
        <CreditCard className="size-6 text-ink" />
        <p className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">Pay {naira(amount)} by card</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">
          You’ll enter your card on our payment partner’s secure page, then come straight back here.
        </p>
      </div>
      <div className="mt-8">
        <Pill onClick={pay} disabled={opening || !state.checkoutUrl}>
          {opening ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Opening secure checkout…
            </span>
          ) : (
            `Pay ${naira(amount)}`
          )}
        </Pill>
      </div>
    </div>
  );
}

/** Back from card checkout: waiting for Monnify to confirm. */
export function Confirming({ reference, ask, onDone }: { reference: string; ask: StatusAsk; onDone: (status: 'paid' | 'expired') => void }) {
  usePaymentStatus(reference, ask, onDone);
  return (
    <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/10">
      <Loader2 className="size-6 animate-spin text-ink" />
      <p className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">Confirming your payment…</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">This takes a few seconds. Please keep this page open.</p>
    </div>
  );
}

export function Expired({ what, onAgain }: { what: string; onAgain: () => void }) {
  return (
    <div className="rounded-[24px] bg-white p-6 ring-1 ring-ink/10">
      <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">This {what} didn’t go through</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">
        The time to pay ran out, or the payment wasn’t completed. If you sent a transfer after the time ran out, it goes back to your account automatically.
      </p>
      <button type="button" onClick={onAgain} className="mt-6 text-[15px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-4">
        Start again
      </button>
    </div>
  );
}
