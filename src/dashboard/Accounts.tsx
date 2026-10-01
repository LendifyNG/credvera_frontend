import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, Check, Copy, Plus, Share2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { errorMessage, useOpenWallet, useProvisionVirtualAccount } from '../api';
import { useBalances, usePayInAccount, usePayments, useSession } from './data';
import { AddMoney, CURRENCIES } from './money';
import { kindOf, money, settled, shortDate, type Currency, type Payment } from './model';

const ease = [0.16, 1, 0.3, 1] as const;
const DAY = 86400000;

// Each currency's own colour, as on its card in the app.

/** Who each account is for, in a line. */
const TAKES: Record<Currency, string> = {
  NGN: 'Transfers from any Nigerian bank. They arrive in seconds.',
  USD: 'Payments from clients, marketplaces and banks in the US.',
  GBP: 'Payments from clients and banks in the UK.',
  EUR: 'Payments from clients and banks in Europe.',
};

/** The last four digits of an account's pay-in number, once it has one. */
function NumberHint({ code }: { code: Currency }) {
  const { account, ready, wallet } = usePayInAccount(code);
  if (!wallet) return <span>Not open yet</span>;
  if (!ready || !account?.accountNumber) return <span>Details on their way</span>;
  return (
    <>
      <span className="font-ledger">•• {account.accountNumber.slice(-4)}</span>
      <CopyButton text={account.accountNumber} label="" />
    </>
  );
}

/**
 * The details to share with a payer, or what stands in the way: no wallet in
 * this currency yet, or a pay-in account the provider hasn't issued.
 */
function PayInDetails({ code }: { code: Currency }) {
  const c = CURRENCIES.find((x) => x.code === code)!;
  const { wallet, account, ready, isLoading } = usePayInAccount(code);
  const open = useOpenWallet();
  const provision = useProvisionVirtualAccount();
  const [shared, setShared] = useState(false);

  if (isLoading) return <p className="mt-4 text-[14px] text-graphite/50">Loading…</p>;

  if (!wallet) {
    return (
      <div className="mt-4 text-[14px] text-graphite/60">
        <p>You don’t have a {c.name.toLowerCase()} account yet. It’s free to open.</p>
        <button type="button" disabled={open.isPending} onClick={() => open.mutate(code)} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-graphite text-[14px] font-semibold text-white hover:bg-black disabled:opacity-50">
          {open.isPending ? 'Opening…' : `Open a ${c.name} account`}
        </button>
        {open.error && <p className="mt-3 text-[#9a3a17]">{errorMessage(open.error)}</p>}
      </div>
    );
  }

  if (!ready || !account) {
    return (
      <div className="mt-4 text-[14px] text-graphite/60">
        <p>{account?.unavailableReason ?? 'The bank details for this account are still being issued.'}</p>
        <button type="button" disabled={provision.isPending} onClick={() => provision.mutate(wallet.id)} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg border border-graphite/15 text-[14px] font-semibold hover:border-graphite/30 disabled:opacity-50">
          {provision.isPending ? 'Asking the bank…' : 'Try again'}
        </button>
        {provision.error && <p className="mt-3 text-[#9a3a17]">{errorMessage(provision.error)}</p>}
      </div>
    );
  }

  const rows: [string, string][] = [
    ['Account name', account.accountName ?? ''],
    ['Account number', account.accountNumber ?? ''],
    ['Bank', account.bankName ?? ''],
    ...(account.rails?.iban ? ([['IBAN', account.rails.iban]] as [string, string][]) : []),
    ...(account.rails?.sortCode ? ([['Sort code', account.rails.sortCode]] as [string, string][]) : []),
    ...(account.rails?.routingNumber ? ([['Routing number', account.rails.routingNumber]] as [string, string][]) : []),
    ...(account.rails?.swiftBic ? ([['SWIFT / BIC', account.rails.swiftBic]] as [string, string][]) : []),
    ['Currency', `${c.name} (${code})`],
  ];
  const all = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `${c.name} account details`, text: all });
      else throw new Error('no share');
    } catch {
      navigator.clipboard?.writeText(all).catch(() => {});
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    }
  };

  return (
    <>
      <dl className="mt-4 divide-y divide-graphite/[0.08] text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-graphite/55">{k}</dt>
            <dd className="flex items-center gap-1 text-right font-medium">
              <span className={k === 'Account number' || k === 'IBAN' ? 'font-ledger tracking-wide' : ''}>{v}</span>
              {k === 'Account number' && <CopyButton text={v} label="" />}
            </dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={share} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-graphite text-[14px] font-semibold text-white hover:bg-black">
        {shared ? <Check className="size-4" /> : <Share2 className="size-4" />} {shared ? 'Details copied' : 'Share details'}
      </button>
    </>
  );
}

/** Money in and out of one account over the last 30 days, conversions left out. */
function month(payments: Payment[], c: Currency) {
  const since = Date.now() - 30 * DAY;
  let inflow = 0;
  let outflow = 0;
  for (const p of payments) {
    if (p.currency !== c || !settled(p) || new Date(p.date).getTime() < since) continue;
    if (p.kind === 'in') inflow += p.amount;
    else outflow += p.amount;
  }
  return { inflow, outflow };
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      aria-label={`${label} ${text}`}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-graphite/55 hover:bg-graphite/5 hover:text-graphite"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? 'Copied' : label}
    </button>
  );
}

/** One account's details to share, and its latest transactions, in a panel from the right. */
function Details({ code, onClose }: { code: Currency; onClose: () => void }) {
  const { payments } = usePayments();
  const { balances } = useBalances();
  const c = CURRENCIES.find((x) => x.code === code)!;
  const recent = payments.filter((p) => p.currency === code).slice(0, 5);

  return (
    <motion.div className="fixed inset-0 z-50 bg-graphite/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`${c.name} account`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => e.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite/10 px-6 py-4">
          <p className="text-[15px] font-semibold">{c.name} account</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/45 hover:text-graphite">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <img src={`https://flagcdn.com/w80/${c.flag}.png`} alt="" className="size-10 rounded-full object-cover ring-1 ring-graphite/10" />
            <div>
              <p className="font-ledger text-[26px] font-semibold leading-none tracking-[-0.02em]">{money(balances[code], code)}</p>
            </div>
          </div>
        </div>

        <div className="mx-6 mt-7 rounded-xl bg-[#f5f4ef] p-5">
          <p className="text-[14px] font-semibold">Details to get paid</p>
          <p className="mt-1 text-[13px] text-graphite/55">{TAKES[code]}</p>
          <PayInDetails code={code} />
        </div>

        <div className="px-6 py-7">
          <div className="flex items-baseline justify-between">
            <p className="text-[14px] font-semibold">Latest in this account</p>
            <Link to={`/business/app/payments?a=${code}`} className="text-[13px] font-semibold text-graphite/55 hover:text-graphite">
              See all
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-graphite/[0.07]">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-graphite/15">
                  {p.kind === 'in' ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{p.who}</span>
                  <span className="block text-[12.5px] text-graphite/50">
                    {shortDate(p.date)} · {kindOf(p)}
                  </span>
                </span>
                <span className={`font-ledger text-[14px] font-medium ${p.kind === 'in' ? 'text-[#1f6b33]' : ''}`}>
                  {p.kind === 'in' ? '+' : '−'}
                  {money(p.amount, p.currency)}
                </span>
              </li>
            ))}
            {recent.length === 0 && <li className="py-6 text-[14px] text-graphite/50">Nothing in this account yet.</li>}
          </ul>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/** The business's four currency accounts: what's in each, and the details to get paid into it. */
export default function Accounts() {
  const navigate = useNavigate();
  const { convert } = useOutletContext<{ convert: () => void }>();
  const session = useSession();
  const { balances } = useBalances();
  const { payments } = usePayments();
  const [open, setOpen] = useState<Currency | null>(null);
  const [adding, setAdding] = useState(false);

  const months = useMemo(() => Object.fromEntries(CURRENCIES.map((c) => [c.code, month(payments, c.code)])) as Record<Currency, { inflow: number; outflow: number }>, [payments]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Accounts</h1>
          <p className="mt-1 text-[15px] text-graphite/55">Your money in four currencies, and the details to get paid into each.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={convert} className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-4 text-[14px] font-semibold hover:border-graphite/30">
            <ArrowLeftRight className="size-4" /> Convert
          </button>
          <button type="button" onClick={() => setAdding(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-[14px] font-semibold text-graphite hover:brightness-95">
            <Plus className="size-4" /> Add money
          </button>
        </div>
      </div>

      {/* One panel per account */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {CURRENCIES.map((c) => {
          const m = months[c.code];
          return (
            <section
              key={c.code}
              role="button"
              tabIndex={0}
              onClick={() => setOpen(c.code)}
              onKeyDown={(e) => e.key === 'Enter' && setOpen(c.code)}
              className="group cursor-pointer rounded-2xl border border-graphite/10 bg-white p-6 outline-none transition-colors hover:border-graphite/25 focus-visible:border-graphite/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <img src={`https://flagcdn.com/w80/${c.flag}.png`} alt="" className="size-8 rounded-full object-cover ring-1 ring-graphite/10" />
                  <span>
                    <span className="block text-[15px] font-semibold">{c.name}</span>
                    <span className="flex items-center text-[12.5px] text-graphite/50">
                      <NumberHint code={c.code} />
                    </span>
                  </span>
                </span>
                <span className="rounded-md bg-[#efeee7] px-2 py-0.5 text-[12px] font-medium text-graphite/60">{c.code}</span>
              </div>

              <p className="mt-6 font-ledger text-[28px] font-semibold leading-none tracking-[-0.03em]">{money(balances[c.code], c.code)}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#f5f4ef] p-4 text-[13px]">
                <div>
                  <p className="text-graphite/55">In, last 30 days</p>
                  <p className="mt-0.5 font-ledger text-[15px] font-semibold text-[#1f6b33]">+{money(m.inflow, c.code)}</p>
                </div>
                <div>
                  <p className="text-graphite/55">Out, last 30 days</p>
                  <p className="mt-0.5 font-ledger text-[15px] font-semibold">−{money(m.outflow, c.code)}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/business/app/pay');
                  }}
                  className="inline-flex h-9 items-center rounded-lg border border-graphite/15 px-3 text-[13.5px] font-semibold hover:border-graphite/30"
                >
                  Pay from it
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    convert();
                  }}
                  className="inline-flex h-9 items-center rounded-lg px-3 text-[13.5px] font-semibold text-graphite/70 hover:bg-graphite/5"
                >
                  Convert
                </button>
                <span className="ml-auto flex items-center gap-1.5 text-[13.5px] font-semibold text-graphite/60 group-hover:text-graphite">
                  Details <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </section>
          );
        })}
      </div>

      <AnimatePresence>{open && <Details key={open} code={open} onClose={() => setOpen(null)} />}</AnimatePresence>
      <AddMoney open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
