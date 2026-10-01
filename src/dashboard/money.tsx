import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePayInAccount } from './data';
import type { Currency } from './model';
import { ComingSoon, Loading } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;

export const CURRENCIES: { code: Currency; name: string; flag: string }[] = [
  { code: 'NGN', name: 'Naira', flag: 'ng' },
  { code: 'USD', name: 'US Dollar', flag: 'us' },
  { code: 'GBP', name: 'British Pound', flag: 'gb' },
  { code: 'EUR', name: 'Euro', flag: 'eu' },
];

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-graphite/40 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-7 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold tracking-tight">{title}</p>
              <button type="button" onClick={onClose} aria-label="Close" className="text-graphite/40 hover:text-graphite">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The naira account to transfer into, straight from the bank that issued it. */
export function AddMoney({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { account, ready, isLoading } = usePayInAccount('NGN');
  const [copied, setCopied] = useState(false);

  const copy = (number: string) => {
    navigator.clipboard?.writeText(number).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Modal open={open} title="Add money" onClose={onClose}>
      {isLoading ? (
        <Loading />
      ) : ready && account ? (
        <>
          <p className="mt-1 text-[14px] text-graphite/55">Send naira from any Nigerian bank to these details. It arrives in seconds.</p>
          <dl className="mt-6 divide-y divide-graphite/10 rounded-2xl bg-ledger px-5">
            {[
              ['Account name', account.accountName],
              ['Bank', account.bankName],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3.5 text-[14px]">
                <dt className="text-graphite/55">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-[14px] text-graphite/55">Account number</dt>
              <dd className="flex items-center gap-3">
                <span className="font-ledger text-[17px] font-semibold tracking-wide">{account.accountNumber}</span>
                <button type="button" onClick={() => copy(account.accountNumber!)} className="inline-flex items-center gap-1.5 rounded-full bg-graphite px-3 py-1.5 text-[12px] font-semibold text-white">
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? 'Copied' : 'Copy'}
                </button>
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <div className="mt-4 text-[14px] leading-relaxed text-graphite/60">
          <p>{account?.unavailableReason ?? 'Your naira account isn’t open yet, so there are no details to pay into.'}</p>
          <Link to="/business/app/accounts" onClick={onClose} className="mt-5 inline-flex h-10 items-center rounded-lg bg-graphite px-4 text-[14px] font-semibold text-white hover:bg-black">
            Go to Accounts
          </Link>
        </div>
      )}
    </Modal>
  );
}

/** Converting between your own balances. The FX API isn't live yet. */
export function ConvertPanel() {
  return (
    <ComingSoon title="Convert between your currencies">
      You’ll be able to move money between your naira, dollar, pound and euro balances at a rate held while you confirm. Today’s rates are on the FX page.
    </ComingSoon>
  );
}

export function Convert({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="Convert" onClose={onClose}>
      <div className="mt-5">
        <ConvertPanel />
      </div>
    </Modal>
  );
}
