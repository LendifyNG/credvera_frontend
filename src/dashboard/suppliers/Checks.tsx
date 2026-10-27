import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, CircleCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { errorMessage, useCheckInvoice, useInvoiceChecks, useSuppliers, type InvoiceCheckDto } from '../../api';
import { money, shortDate } from '../model';
import { field, label, panel, primary } from '../pay/shared';

const RESULT: Record<InvoiceCheckDto['result'], { title: string; body: string; tone: string }> = {
  match: { title: 'Looks right', body: 'The bank details match the account you’ve paid before.', tone: 'border-[#cfe8c9] bg-[#eef8ea] text-[#1f6b33]' },
  changed: { title: 'The bank details have changed', body: 'This invoice asks you to pay a different account from before. Call the supplier on a number you already have before paying. Changed details are the most common invoice fraud.', tone: 'border-[#f0cdbf] bg-[#fcf0ea] text-[#9a3a17]' },
  new: { title: 'A new supplier', body: 'You haven’t paid them before, so there’s nothing to compare yet. Check the details with them directly before the first payment.', tone: 'border-[#ecdcae] bg-[#fbf5e6] text-[#8a5a00]' },
};

/** Before paying an invoice: the account on it, against the one the supplier's been paid at. */
export default function Checks() {
  const suppliers = useSuppliers();
  const checks = useInvoiceChecks();
  const check = useCheckInvoice();
  const choices = suppliers.data ?? [];
  const [supplierId, setSupplierId] = useState('');
  const [invoice, setInvoice] = useState('');
  const [account, setAccount] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<InvoiceCheckDto | null>(null);
  const sup = choices.find((s) => s.id === supplierId) ?? choices[0];
  const amount = Number(text.replace(/[^\d.]/g, '')) || 0;
  const ready = !!sup && invoice.trim() && account.length === 10 && !check.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={`${panel} p-6`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Check a supplier invoice</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Before you pay, copy the bank details from the invoice. We compare them with the account you’ve paid before.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            check.mutate(
              { supplierId: sup!.id, input: { invoiceNumber: invoice.trim(), accountNumber: account, ...(amount ? { amount: String(amount) } : {}) } },
              {
                onSuccess: (r) => {
                  setResult(r);
                  setInvoice('');
                  setAccount('');
                  setText('');
                },
              },
            );
          }}
        >
          <label className="block">
            <span className={label}>Supplier</span>
            <select value={sup?.id ?? ''} onChange={(e) => setSupplierId(e.target.value)} className={field}>
              {choices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>Invoice number</span>
              <input value={invoice} maxLength={60} onChange={(e) => setInvoice(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className={label}>Amount (NGN)</span>
              <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} className={`${field} font-ledger`} />
            </label>
          </div>
          <label className="block">
            <span className={label}>Account number on the invoice</span>
            <input inputMode="numeric" value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 digits" className={`${field} font-ledger`} />
          </label>
          <button type="submit" disabled={!ready} className={primary}>
            {check.isPending && <Loader2 className="size-4 animate-spin" />}
            Check it
          </button>
          {!choices.length && !suppliers.isLoading && <p className="text-[13.5px] text-graphite/55">Save a supplier first, then check their invoices here.</p>}
          {check.error && <p className="text-[13.5px] text-[#9a3a17]">{errorMessage(check.error)}</p>}
        </form>
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-6 rounded-xl border px-4 py-3.5 ${RESULT[result.result].tone}`}>
              <p className="flex items-center gap-2 text-[14.5px] font-semibold">
                {result.result === 'match' ? <CircleCheck className="size-4" /> : <AlertTriangle className="size-4" />} {RESULT[result.result].title}
              </p>
              <p className="mt-1 text-[13.5px] opacity-90">{RESULT[result.result].body}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Checked before</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {(checks.data ?? []).map((k) => (
            <li key={k.id} className="flex items-start gap-3 py-3.5">
              <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${k.result === 'match' ? 'bg-[#e3f1e0] text-[#1f6b33]' : k.result === 'changed' ? 'bg-[#f6e7e0] text-[#9a3a17]' : 'bg-[#fbf0d6] text-[#8a5a00]'}`}>
                {k.result === 'match' ? <Check className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">
                  {k.supplierName} · {k.invoiceNumber}
                </span>
                <span className="block text-[12.5px] text-graphite/50">
                  {RESULT[k.result].title} · {shortDate(k.checkedAt)}
                </span>
              </span>
              {k.amount ? <span className="font-ledger text-[13.5px] font-medium">{money(Number(k.amount))}</span> : null}
            </li>
          ))}
          {!checks.isLoading && !checks.data?.length && <li className="py-8 text-center text-[14px] text-graphite/50">Nothing checked yet.</li>}
        </ul>
      </section>
    </div>
  );
}
