import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, CircleCheck, Download, FileUp, Lightbulb, Loader2, Pause, Play, Plus, Smartphone, Trash2, Tv, Wifi, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import {
  addPayment,
  addSchedule,
  BANKS,
  money,
  nameCheck,
  payBill,
  recipients,
  removeSchedule,
  shortDate,
  toggleSchedule,
  TRANSFER_FEE,
  useDash,
  type Payment,
} from './store';
import { PinPrompt } from './ui';

const ease = [0.16, 1, 0.3, 1] as const;
const field = 'h-11 w-full rounded-lg border border-graphite/15 bg-white px-3.5 text-[15px] outline-none transition-colors placeholder:text-graphite/35 focus:border-graphite/50';
const label = 'mb-1.5 block text-[13px] font-medium text-graphite/60';
const panel = 'rounded-2xl border border-graphite/10 bg-white';
const primary = 'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-graphite px-5 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:bg-graphite/15 disabled:text-graphite/40';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

function Done({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 flex items-center gap-3 rounded-xl border border-[#cfe8c9] bg-[#eef8ea] px-4 py-3 text-[14px] font-medium text-[#1f6b33]">
      <CircleCheck className="size-5 shrink-0" />
      <span className="flex-1">{children}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-[#1f6b33]/60 hover:text-[#1f6b33]">
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

/* ---------- Pay someone ---------- */

function PaySomeone() {
  const { payments, rules } = useDash();
  const APPROVAL_OVER = rules.over;
  const [params] = useSearchParams();
  const [who, setWho] = useState(params.get('to') ?? '');
  const [fresh, setFresh] = useState(false);
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [checked, setChecked] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [text, setText] = useState(params.get('amount') ?? '');
  const [reason, setReason] = useState('');
  const [when, setWhen] = useState<'now' | 'repeat'>('now');
  const [every, setEvery] = useState<'week' | 'month'>('month');
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const saved = recipients.find((r) => r.name === who);
  const n = Number(text.replace(/\D/g, '')) || 0;
  const needsApproval = when === 'now' && n >= APPROVAL_OVER;
  const payee = fresh ? checked : saved?.name;
  const ready = !!payee && n > 0 && reason.trim().length > 1;
  const recent = payments.filter((p) => p.kind === 'out' && !p.internal && p.status === 'paid').slice(0, 4);

  // The bank's own name for the account, once there are ten digits.
  useEffect(() => {
    if (!fresh || account.length !== 10 || !bank) {
      setChecked(null);
      return;
    }
    let alive = true;
    setChecking(true);
    nameCheck(bank, account).then((name) => {
      if (!alive) return;
      setChecking(false);
      setChecked(name);
    });
    return () => {
      alive = false;
    };
  }, [fresh, bank, account]);

  const confirm = () => {
    setPin(false);
    const detail = fresh ? `${bank} · ${account.slice(0, 2)}•• ••• ${account.slice(-3)}` : saved!.detail;
    if (when === 'repeat') {
      const next = new Date();
      next.setDate(next.getDate() + (every === 'week' ? 7 : 30));
      addSchedule({ who: payee!, detail, amount: n, every, next: next.toISOString(), reason: reason.trim() });
      setDone(`${money(n)} to ${payee} every ${every}, starting ${shortDate(next.toISOString())}.`);
    } else {
      const p: Payment = addPayment({ who: payee!, what: `${reason.trim()} · ${detail.split(' · ')[0]}`, amount: n, reason: reason.trim() });
      setDone(p.status === 'waiting' ? `Sent for approval: ${money(n)} to ${payee}.` : `Paid ${money(n)} to ${payee}.`);
    }
    setText('');
    setReason('');
    setWho('');
    setAccount('');
    setFresh(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className={`${panel} p-6`}>
        <AnimatePresence>{done && <Done onClose={() => setDone(null)}>{done}</Done>}</AnimatePresence>
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Pay someone</h2>
        <p className="mt-1 text-[14px] text-graphite/55">In naira, to any Nigerian bank. For a supplier abroad, use Suppliers.</p>

        <div className="mt-6 space-y-5">
          <div>
            <span className={label}>To</span>
            <div className="flex flex-wrap gap-2">
              {recipients.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setWho(r.name);
                    setFresh(false);
                  }}
                  className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13.5px] font-medium transition-colors ${who === r.name && !fresh ? 'border-graphite bg-graphite text-white' : 'border-graphite/15 hover:border-graphite/35'}`}
                >
                  <span className={`grid size-6 place-items-center rounded-full text-[10.5px] font-semibold ${who === r.name && !fresh ? 'bg-primary text-graphite' : 'bg-[#efeee7]'}`}>{initials(r.name)}</span>
                  {r.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFresh(true);
                  setWho('');
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13.5px] font-medium ${fresh ? 'border-graphite bg-graphite text-white' : 'border-dashed border-graphite/30 hover:border-graphite/50'}`}
              >
                <Plus className="size-3.5" /> Someone new
              </button>
            </div>
            {saved && !fresh && <p className="mt-2 text-[13px] text-graphite/50">{saved.detail}</p>}
          </div>

          {fresh && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={label}>Bank</span>
                <select value={bank} onChange={(e) => setBank(e.target.value)} className={field}>
                  <option value="">Choose a bank</option>
                  {BANKS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={label}>Account number</span>
                <input inputMode="numeric" value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 digits" className={`${field} font-ledger tracking-wide`} />
              </label>
              <p className="flex items-center gap-2 text-[13.5px] sm:col-span-2">
                {checking ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-graphite/50" /> <span className="text-graphite/55">Checking the name on this account…</span>
                  </>
                ) : checked ? (
                  <>
                    <Check className="size-4 text-[#1f6b33]" /> <span className="font-semibold">{checked}</span>
                  </>
                ) : (
                  <span className="text-graphite/45">We check the name on the account before you pay.</span>
                )}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Amount</span>
              <span className="flex h-11 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 focus-within:border-graphite/50">
                <span className="text-[16px] font-medium text-graphite/40">₦</span>
                <input inputMode="numeric" value={n ? n.toLocaleString('en-NG') : ''} onChange={(e) => setText(e.target.value)} placeholder="0" className="w-full bg-transparent font-ledger text-[16px] outline-none" />
              </span>
            </label>
            <label className="block">
              <span className={label}>What it’s for</span>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Deliveries, September" className={field} />
            </label>
          </div>

          <div>
            <span className={label}>When</span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg bg-[#efeee7] p-1 text-[13.5px] font-medium">
                {(['now', 'repeat'] as const).map((w) => (
                  <button key={w} type="button" onClick={() => setWhen(w)} className={`rounded-md px-3 py-1 ${when === w ? 'bg-white shadow-sm' : 'text-graphite/55'}`}>
                    {w === 'now' ? 'Pay now' : 'Repeat it'}
                  </button>
                ))}
              </div>
              {when === 'repeat' && (
                <select value={every} onChange={(e) => setEvery(e.target.value as 'week' | 'month')} className="h-9 rounded-lg border border-graphite/15 bg-white px-2.5 text-[13.5px] font-medium outline-none">
                  <option value="week">Every week</option>
                  <option value="month">Every month</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-graphite/10 pt-5">
          <p className="text-[13.5px] text-graphite/55">
            {n ? (
              <>
                Fee {money(TRANSFER_FEE)} · total <span className="font-semibold text-graphite">{money(n + TRANSFER_FEE)}</span>
                {needsApproval && <span className="mt-1 block text-[#8a5a00]">Over {money(APPROVAL_OVER)}, so a second person approves it first.</span>}
              </>
            ) : (
              `A ${money(TRANSFER_FEE)} fee per payment.`
            )}
          </p>
          <button type="button" disabled={!ready} onClick={() => setPin(true)} className={primary}>
            {when === 'repeat' ? 'Set it up' : needsApproval ? 'Send for approval' : `Pay ${n ? money(n) : ''}`}
          </button>
        </div>
      </section>

      <section className={`${panel} p-6`}>
        <h2 className="text-[16px] font-semibold">Recently paid</h2>
        <ul className="mt-3 divide-y divide-graphite/[0.07]">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[11px] font-semibold">{initials(p.who)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{p.who}</span>
                <span className="block text-[12.5px] text-graphite/50">{shortDate(p.date)}</span>
              </span>
              <span className="font-ledger text-[14px] font-medium">−{money(p.amount, p.currency)}</span>
            </li>
          ))}
        </ul>
        <Link to="/business/app/payments?f=out" className="mt-3 inline-block text-[13.5px] font-semibold text-graphite/60 hover:text-graphite">
          All money out
        </Link>
      </section>

      <PinPrompt
        open={pin}
        title={when === 'repeat' ? `${money(n)} every ${every}` : needsApproval ? 'Send for approval' : `Pay ${money(n)}`}
        detail={`To ${payee ?? ''} · ${reason.trim()}`}
        onClose={() => setPin(false)}
        onConfirm={confirm}
      />
    </div>
  );
}

/* ---------- Bulk payments ---------- */

type Row = { name: string; bank: string; account: string; amount: number; problem?: string };

const TEMPLATE = 'Name,Bank,Account number,Amount\nKemi Adeyemi,Zenith Bank,2100000408,650000\n';

/** Reads a spreadsheet saved as CSV: name, bank, account number, amount. */
function parse(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')))
    .filter((c) => c.some(Boolean))
    .map(([name = '', bank = '', account = '', amount = '']) => {
      const n = Number(amount.replace(/[^\d.]/g, '')) || 0;
      const problem = !name ? 'No name' : !BANKS.includes(bank) ? 'Bank not recognised' : !/^\d{10}$/.test(account) ? 'Account number needs 10 digits' : n <= 0 ? 'No amount' : undefined;
      return { name, bank, account, amount: n, problem };
    });
}

function Bulk() {
  const APPROVAL_OVER = useDash().rules.over;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [file, setFile] = useState('');
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const good = rows?.filter((r) => !r.problem) ?? [];
  const bad = rows?.filter((r) => r.problem) ?? [];
  const total = good.reduce((a, r) => a + r.amount, 0);

  const template = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credvera-bulk-payments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={`${panel} p-6`}>
      <AnimatePresence>{done && <Done onClose={() => setDone(null)}>{done}</Done>}</AnimatePresence>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Bulk payments</h2>
          <p className="mt-1 max-w-xl text-[14px] text-graphite/55">Pay many people at once from one spreadsheet, like salaries. Every row is checked first; any payment over ₦500,000 waits for a second approval.</p>
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
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile(f.name);
              setRows(parse(await f.text()));
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
              {good.length} payments · <span className="font-semibold text-graphite">{money(total + good.length * TRANSFER_FEE)}</span> with fees
              {bad.length ? <span className="block text-[13px] text-[#9a3a17]">Rows to fix are left out. Fix them in the file and upload it again.</span> : null}
            </p>
            <button type="button" disabled={!good.length} onClick={() => setPin(true)} className={primary}>
              Pay {good.length} {good.length === 1 ? 'person' : 'people'}
            </button>
          </div>
        </div>
      )}

      <PinPrompt
        open={pin}
        title={`Pay ${good.length} ${good.length === 1 ? 'person' : 'people'}`}
        detail={`${money(total)} in total`}
        onClose={() => setPin(false)}
        onConfirm={() => {
          setPin(false);
          // TODO(credvera): one batch through the API, approved as a whole.
          good.forEach((r) => addPayment({ who: r.name, what: `Bulk payment · ${r.bank}`, amount: r.amount, reason: `Bulk payment, ${file}` }));
          setDone(`${good.length} payments sent. Anything over ${money(APPROVAL_OVER)} waits for approval.`);
          setRows(null);
        }}
      />
    </section>
  );
}

/* ---------- Scheduled payments ---------- */

function Scheduled() {
  const { schedules } = useDash();
  const monthly = schedules.filter((s) => !s.paused).reduce((a, s) => a + (s.every === 'week' ? s.amount * 4.33 : s.amount), 0);
  return (
    <section className={`${panel} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Scheduled payments</h2>
          <p className="mt-1 text-[14px] text-graphite/55">Payments that repeat, paid on the day. About {money(Math.round(monthly / 1000) * 1000).replace(/\.00$/, "")} a month.</p>
        </div>
        <Link to="/business/app/pay" className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30">
          <Plus className="size-4" /> New schedule
        </Link>
      </div>
      <ul className="mt-5 divide-y divide-graphite/[0.07] border-t border-graphite/10">
        {[...schedules]
          .sort((a, b) => a.next.localeCompare(b.next))
          .map((s) => (
            <li key={s.id} className={`flex flex-wrap items-center gap-4 py-4 ${s.paused ? 'opacity-55' : ''}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[11.5px] font-semibold">{initials(s.who)}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-medium">{s.who}</span>
                <span className="block text-[12.5px] text-graphite/50">
                  {s.reason} · {s.detail}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-ledger text-[15px] font-semibold">{money(s.amount)}</span>
                <span className="block text-[12.5px] text-graphite/50">{s.paused ? 'Paused' : `Every ${s.every} · next ${shortDate(s.next)}`}</span>
              </span>
              <span className="flex gap-1">
                <button type="button" onClick={() => toggleSchedule(s.id)} aria-label={s.paused ? 'Resume' : 'Pause'} className="grid size-9 place-items-center rounded-lg text-graphite/55 hover:bg-graphite/5 hover:text-graphite">
                  {s.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </button>
                <button type="button" onClick={() => removeSchedule(s.id)} aria-label="Delete" className="grid size-9 place-items-center rounded-lg text-graphite/55 hover:bg-[#f6e7e0] hover:text-[#9a3a17]">
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
        {schedules.length === 0 && <li className="py-10 text-center text-[14px] text-graphite/50">Nothing scheduled. Choose “Repeat it” when you pay someone.</li>}
      </ul>
    </section>
  );
}

/* ---------- Bills ---------- */

const BILLS = [
  { kind: 'Electricity', icon: Lightbulb, billers: ['Ikeja Electric', 'Eko Electric', 'Abuja Electric'], customer: 'Meter number' },
  { kind: 'Airtime', icon: Smartphone, billers: ['MTN', 'Airtel', 'Glo', '9mobile'], customer: 'Phone number' },
  { kind: 'Data', icon: Wifi, billers: ['MTN', 'Airtel', 'Glo', '9mobile'], customer: 'Phone number' },
  { kind: 'TV', icon: Tv, billers: ['DStv', 'GOtv', 'StarTimes'], customer: 'Smartcard number' },
];

function Bills() {
  const [kind, setKind] = useState(BILLS[0]!);
  const [biller, setBiller] = useState(BILLS[0]!.billers[0]!);
  const [customer, setCustomer] = useState('');
  const [text, setText] = useState('');
  const [pin, setPin] = useState(false);
  const [receipt, setReceipt] = useState<{ biller: string; amount: number; token?: string } | null>(null);
  const n = Number(text.replace(/\D/g, '')) || 0;
  const ready = customer.replace(/\D/g, '').length >= 10 && n >= 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className={`${panel} p-6`}>
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Bills</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Paid from your naira account, with the receipt kept here.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BILLS.map((b) => (
            <button
              key={b.kind}
              type="button"
              onClick={() => {
                setKind(b);
                setBiller(b.billers[0]!);
                setReceipt(null);
              }}
              className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors ${kind.kind === b.kind ? 'border-graphite bg-graphite text-white' : 'border-graphite/12 hover:border-graphite/30'}`}
            >
              <b.icon className={`size-5 ${kind.kind === b.kind ? 'text-primary' : 'text-graphite/60'}`} />
              <span className="text-[14.5px] font-semibold">{b.kind}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Provider</span>
            <select value={biller} onChange={(e) => setBiller(e.target.value)} className={field}>
              {kind.billers.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>{kind.customer}</span>
            <input inputMode="numeric" value={customer} onChange={(e) => setCustomer(e.target.value.replace(/[^\d ]/g, ''))} className={`${field} font-ledger`} />
          </label>
          <label className="block">
            <span className={label}>Amount</span>
            <span className="flex h-11 items-center gap-2 rounded-lg border border-graphite/15 bg-white px-3.5 focus-within:border-graphite/50">
              <span className="text-[16px] font-medium text-graphite/40">₦</span>
              <input inputMode="numeric" value={n ? n.toLocaleString('en-NG') : ''} onChange={(e) => setText(e.target.value)} placeholder="0" className="w-full bg-transparent font-ledger text-[16px] outline-none" />
            </span>
          </label>
          <div className="flex items-end">
            <button type="button" disabled={!ready} onClick={() => setPin(true)} className={`${primary} w-full`}>
              Pay {n ? money(n) : ''}
            </button>
          </div>
        </div>
      </section>

      <section className={`${panel} p-6`}>
        {receipt ? (
          <div>
            <span className="grid size-10 place-items-center rounded-full bg-primary text-graphite">
              <Check className="size-5" />
            </span>
            <p className="mt-4 text-[17px] font-semibold">
              {money(receipt.amount)} paid to {receipt.biller}
            </p>
            {receipt.token ? (
              <div className="mt-5 rounded-xl bg-[#f5f4ef] p-4">
                <p className="text-[13px] text-graphite/55">Your meter token</p>
                <p className="mt-1 font-ledger text-[20px] font-semibold tracking-wide">{receipt.token}</p>
                <button type="button" onClick={() => navigator.clipboard?.writeText(receipt.token!.replace(/\s/g, '')).catch(() => {})} className="mt-3 text-[13.5px] font-semibold text-graphite/60 hover:text-graphite">
                  Copy token
                </button>
              </div>
            ) : (
              <p className="mt-2 text-[14px] text-graphite/55">It’s done. The receipt is in Transactions.</p>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-[16px] font-semibold">How it works</h2>
            <ol className="mt-4 space-y-3 text-[14px] text-graphite/65">
              <li>1. Pick the bill and the provider.</li>
              <li>2. Enter the number on the account, meter or card.</li>
              <li>3. Confirm with your PIN. Electricity shows its token right here.</li>
            </ol>
          </div>
        )}
      </section>

      <PinPrompt
        open={pin}
        title={`Pay ${money(n)}`}
        detail={`${biller} · ${customer}`}
        onClose={() => setPin(false)}
        onConfirm={() => {
          setPin(false);
          const r = payBill({ biller, kind: kind.kind, customer, amount: n });
          setReceipt({ biller, amount: n, token: r.token });
          setCustomer('');
          setText('');
        }}
      />
    </div>
  );
}

/* ---------- The page ---------- */

const SECTIONS = [
  { to: '/business/app/pay', label: 'Pay someone', end: true },
  { to: '/business/app/pay/bulk', label: 'Bulk payments' },
  { to: '/business/app/pay/scheduled', label: 'Scheduled' },
  { to: '/business/app/pay/bills', label: 'Bills' },
];

/** Paying out: one person, many at once, on a schedule, or a bill. */
export default function PayHub() {
  const { section } = useParams();
  const { session, schedules } = useDash();
  const upcoming = useMemo(() => schedules.filter((s) => !s.paused && new Date(s.next).getTime() - Date.now() < 7 * 86400000), [schedules]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Payments</h1>
          <p className="mt-1 text-[15px] text-graphite/55">
            {upcoming.length ? `${upcoming.length} scheduled ${upcoming.length === 1 ? 'payment goes' : 'payments go'} out in the next 7 days.` : 'Pay one person, many at once, on a schedule, or a bill.'}
          </p>
        </div>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite/10" aria-label="Payments">
        {SECTIONS.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            end={s.end}
            className={({ isActive }) => `-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[14.5px] font-medium transition-colors ${isActive ? 'border-graphite text-graphite' : 'border-transparent text-graphite/50 hover:text-graphite'}`}
          >
            {s.label}
          </NavLink>
        ))}
      </nav>

      <motion.div key={section ?? 'pay'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mt-6">
        {section === 'bulk' ? <Bulk /> : section === 'scheduled' ? <Scheduled /> : section === 'bills' ? <Bills /> : <PaySomeone />}
      </motion.div>
    </div>
  );
}
