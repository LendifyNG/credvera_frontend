import { AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, Download, FileUp, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { errorMessage, useBanks, useBulkPayments, usePayBulk, useTransferQuote, type BankDto } from '../../api';
import { useActiveBusiness } from '../data';
import { money, shortDate } from '../model';
import { Notice, PinPrompt } from '../ui';
import { panel, primary } from './shared';

type Row = { name: string; bank: string; bankCode: string | null; account: string; amount: number; problem?: string };

const TEMPLATE = 'Name,Bank,Account number,Amount\n';

/** "GTBank", "gtbank plc" or a bank code all find Guaranty Trust. */
const squash = (s: string) => s.toLowerCase().replace(/\b(plc|limited|ltd|bank|nigeria)\b/g, '').replace(/[^a-z0-9]/g, '');

/** One CSV line's cells, with quoted cells kept whole: Excel writes "65,000" for 65000. */
function cells(line: string): string[] {
  const out: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') (cell += '"'), i++;
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') out.push(cell.trim()), (cell = '');
    else cell += ch;
  }
  out.push(cell.trim());
  return out;
}

/** Reads a spreadsheet saved as CSV: name, bank, account number, amount. */
function parse(text: string, banks: BankDto[]): Row[] {
  const byName = new Map(banks.flatMap((b) => [[squash(b.name), b.code] as const, [b.code, b.code] as const]));
  return text
    .split(/\r?\n/)
    .slice(1)
    .map(cells)
    .filter((c) => c.some(Boolean))
    .map(([name = '', bank = '', account = '', amount = '']) => {
      const n = Number(amount.replace(/[^\d.]/g, '')) || 0;
      const bankCode = byName.get(squash(bank)) ?? byName.get(bank.trim()) ?? null;
      const problem = !name ? 'No name' : !bankCode ? 'Bank not recognised' : !/^\d{10}$/.test(account) ? 'Account number needs 10 digits' : n <= 0 ? 'No amount' : undefined;
      return { name, bank, bankCode, account, amount: n, problem };
    });
}

/** Many payments from one spreadsheet. Checked here first; the API sends them one by one. */
export default function Bulk() {
  const banks = useBanks();
  const business = useActiveBusiness();
  const threshold = business?.approvalThreshold ? Number(business.approvalThreshold) : null;
  const past = useBulkPayments();
  const payBulk = usePayBulk();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [file, setFile] = useState('');
  const [pin, setPin] = useState(false);
  const [outcome, setOutcome] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const good = useMemo(() => rows?.filter((r) => !r.problem) ?? [], [rows]);
  const bad = rows?.filter((r) => r.problem) ?? [];
  const total = good.reduce((a, r) => a + r.amount, 0);
  // The fee is the same on every payment; the largest row is the one most sure to be in range.
  const quote = useTransferQuote(good.length ? String(Math.max(...good.map((r) => r.amount))) : '');
  const fee = quote.data?.fee ?? null;

  const template = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credvera-bulk-payments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pay = (code: string) => {
    setPin(false);
    payBulk.mutate(
      { fileName: file, rows: good.map((r) => ({ name: r.name, bankCode: r.bankCode!, accountNumber: r.account, amount: String(r.amount) })), pin: code },
      {
        onSuccess: (b) => {
          setOutcome({ tone: 'good', text: `${b.count} payments on their way from ${b.fileName}.${threshold !== null ? ` Any over ${money(threshold)} waits for approval.` : ''}` });
          setRows(null);
        },
        onError: (error) => setOutcome({ tone: 'bad', text: errorMessage(error) }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <section className={`${panel} p-6`}>
        <AnimatePresence>
          {outcome && (
            <Notice tone={outcome.tone} onClose={() => setOutcome(null)}>
              {outcome.text}
            </Notice>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Bulk payments</h2>
            <p className="mt-1 max-w-xl text-[14px] text-graphite/55">
              Pay many people at once from one spreadsheet, like salaries. Every row is checked first
              {threshold !== null ? `; any payment over ${money(threshold)} waits for a second approval.` : '.'}
            </p>
          </div>
          <button type="button" onClick={template} className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30">
            <Download className="size-4" /> Download the template
          </button>
        </div>

        {!rows ? (
          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-graphite/25 bg-[#faf9f5] px-6 py-14 text-center transition-colors hover:border-graphite/45">
            <FileUp className="size-7 text-graphite/45" />
            <span className="mt-3 text-[15px] font-semibold">Upload your spreadsheet</span>
            <span className="mt-1 text-[13.5px] text-graphite/55">Saved as CSV, with name, bank, account number and amount</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={!banks.data}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f || !banks.data) return;
                setFile(f.name);
                setRows(parse(await f.text(), banks.data));
              }}
            />
          </label>
        ) : (
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3 text-[14px]">
              <span className="font-semibold">{file}</span>
              <span className="text-graphite/55">
                {good.length} ready{bad.length ? ` · ${bad.length} to fix` : ''}
              </span>
              <button type="button" onClick={() => setRows(null)} className="ml-auto text-[13.5px] font-semibold text-graphite/60 hover:text-graphite">
                Choose another file
              </button>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-graphite/10">
              <table className="w-full min-w-[620px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-graphite/10 bg-[#faf9f5] text-[12.5px] text-graphite/50">
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Bank</th>
                    <th className="px-4 py-2.5 font-medium">Account</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 font-medium">Check</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-graphite/[0.06] last:border-0">
                      <td className="px-4 py-3 font-medium">{r.name || '—'}</td>
                      <td className="px-4 py-3 text-graphite/65">{r.bank || '—'}</td>
                      <td className="px-4 py-3 font-ledger text-graphite/65">{r.account || '—'}</td>
                      <td className="px-4 py-3 text-right font-ledger">{r.amount ? money(r.amount) : '—'}</td>
                      <td className="px-4 py-3">
                        {r.problem ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9a3a17]">
                            <AlertCircle className="size-4" /> {r.problem}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1f6b33]">
                            <Check className="size-4" /> Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[14px] text-graphite/60">
                {good.length} payments · <span className="font-semibold text-graphite">{money(total + (fee ?? 0) * good.length)}</span> with fees
                {bad.length ? <span className="block text-[13px] text-[#9a3a17]">Rows to fix are left out. Fix them in the file and upload it again.</span> : null}
              </p>
              <button type="button" disabled={!good.length || payBulk.isPending} onClick={() => setPin(true)} className={primary}>
                {payBulk.isPending && <Loader2 className="size-4 animate-spin" />}
                Pay {good.length} {good.length === 1 ? 'person' : 'people'}
              </button>
            </div>
          </div>
        )}
      </section>

      {!!past.data?.length && (
        <section className={`${panel} p-6`}>
          <h2 className="text-[16px] font-semibold">Paid from spreadsheets</h2>
          <ul className="mt-3 divide-y divide-graphite/[0.07]">
            {past.data.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 text-[14px]">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{b.fileName}</span>
                  <span className="block text-[12.5px] text-graphite/50">
                    {shortDate(b.createdAt)} · {b.count} {b.count === 1 ? 'payment' : 'payments'}
                  </span>
                </span>
                <span className="text-[13px] text-graphite/60">
                  {b.waiting ? `${b.count - b.waiting} of ${b.count} sent so far` : `${b.sent} sent`}
                  {b.awaitingApproval ? ` · ${b.awaitingApproval} for approval` : ''}
                  {b.failed ? <span className="text-[#9a3a17]"> · {b.failed} didn’t go</span> : null}
                </span>
                <span className="font-ledger font-medium">{money(Number(b.total))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PinPrompt open={pin} title={`Pay ${good.length} ${good.length === 1 ? 'person' : 'people'}`} detail={`${money(total)} in total`} onClose={() => setPin(false)} onConfirm={pay} />
    </div>
  );
}
