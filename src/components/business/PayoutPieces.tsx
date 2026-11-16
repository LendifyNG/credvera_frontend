import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { AlertCircle, Check, FileSpreadsheet, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const naira = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const nairaWhole = (n: number) => `₦${n.toLocaleString('en-NG')}`;
/** The transfer fee on one payment: ₦10 under ₦10,000, ₦20 up to ₦49,999, ₦40 from ₦50,000. */
const feeFor = (n: number) => (n < 10_000 ? 10 : n < 50_000 ? 20 : 40);
const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

/** A naira figure that counts to its new value. */
function Count({ value, className = '' }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => naira(Math.round(v)));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.9, ease });
    return () => c.stop();
  }, [mv, value]);
  return <motion.span className={`font-ledger tabular-nums ${className}`}>{text}</motion.span>;
}

// ── Opening: a payroll that pays itself, row by row ─────────────────────────

// Okafor Studios' monthly salaries, the same team used across the business pages.
const payroll = [
  { name: 'Folake Adebayo', job: 'Studio manager', last4: '1234', amount: 420_000 },
  { name: 'Emeka Obi', job: 'Senior designer', last4: '8812', amount: 310_000 },
  { name: 'Ngozi Umeh', job: 'Designer', last4: '7654', amount: 265_000 },
  { name: 'Halima Sani', job: 'Accounts', last4: '4756', amount: 240_000 },
  { name: 'Chinedu Eze', job: 'Photographer', last4: '6789', amount: 185_000 },
  { name: 'Bisi Alade', job: 'Studio assistant', last4: '8741', amount: 45_000 },
];
const PAYROLL_TOTAL = payroll.reduce((a, r) => a + r.amount, 0);
const PAYROLL_FEES = payroll.reduce((a, r) => a + feeFor(r.amount), 0);

/** One salary file, paid a row at a time: each ticks to Paid and the total climbs. */
export function PayrollRun() {
  const reduce = useReducedMotion();
  const [paid, setPaid] = useState(reduce ? payroll.length : 0);
  const [run, setRun] = useState(0);
  const finished = paid >= payroll.length;

  useEffect(() => {
    if (reduce || finished) return;
    const t = window.setTimeout(() => setPaid((p) => p + 1), paid === 0 ? 1400 : 720);
    return () => clearTimeout(t);
  }, [paid, finished, reduce, run]);

  const total = payroll.slice(0, paid).reduce((a, r) => a + r.amount, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: 0.1 }}
        className="overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-50px_rgba(28,30,33,0.45)] ring-1 ring-graphite/10"
      >
        <div className="flex items-center justify-between gap-4 border-b border-graphite/10 bg-ledger/60 px-5 py-3.5">
          <span className="flex min-w-0 items-center gap-2 text-[13.5px] font-semibold">
            <FileSpreadsheet className="size-4 shrink-0 text-graphite/55" />
            <span className="truncate">october-salaries.csv</span>
          </span>
          <span className="shrink-0 font-ledger text-[12px] text-graphite/50">
            {paid} of {payroll.length} paid
          </span>
        </div>
        <ul className="divide-y divide-graphite/[0.07]">
          {payroll.map((r, i) => {
            const state = i < paid ? 'paid' : i === paid ? 'sending' : 'waiting';
            return (
              <li key={r.name} className="relative flex items-center gap-3 px-5 py-3 sm:gap-4">
                <AnimatePresence>
                  {state === 'sending' && (
                    <motion.span
                      layoutId="payroll-sweep"
                      className="absolute inset-0 bg-primary/15"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-ledger text-[11.5px] font-semibold">{initials(r.name)}</span>
                <span className="relative min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium">{r.name}</span>
                  <span className="block truncate text-[12.5px] text-graphite/50">
                    {r.job} · •••• {r.last4}
                  </span>
                </span>
                <span className="relative font-ledger text-[14px] font-medium tabular-nums">{naira(r.amount)}</span>
                <span className="relative w-[78px] shrink-0 text-right">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={state}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.25 }}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-semibold ${
                        state === 'paid' ? 'bg-primary text-graphite' : state === 'sending' ? 'text-graphite' : 'text-graphite/35'
                      }`}
                    >
                      {state === 'paid' && <Check className="size-3.5" />}
                      {state === 'sending' && (
                        <motion.span className="size-1.5 rounded-full bg-graphite" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                      )}
                      {state === 'paid' ? 'Paid' : state === 'sending' ? 'Sending' : 'Waiting'}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </li>
            );
          })}
        </ul>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: 0.25 }}
        className="flex flex-col justify-between gap-8 rounded-2xl bg-ledger p-6 sm:p-8"
      >
        <div>
          <p className="font-medium text-[13px] text-graphite/50">Paid so far · Okafor Studios</p>
          <p className="mt-3 text-[clamp(2.2rem,4.6vw,3.9rem)] font-medium leading-none tracking-[-0.05em]">
            <Count value={total} />
          </p>
          <div className="mt-6 flex gap-1" aria-hidden>
            {payroll.map((r, i) => (
              <span key={r.name} className="h-2 flex-1 overflow-hidden rounded-[2px] bg-graphite/10">
                <motion.span
                  className="block h-full bg-graphite"
                  initial={false}
                  animate={{ width: i < paid ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease }}
                />
              </span>
            ))}
          </div>
          <p className="mt-3 font-ledger text-[12px] text-graphite/55">
            of {naira(PAYROLL_TOTAL)} · {payroll.length} people · fees {naira(PAYROLL_FEES)}
          </p>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-graphite/15 pt-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={finished ? 'done' : 'going'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-[15px] font-semibold"
            >
              {finished ? 'Everyone paid. One PIN for the lot.' : 'Confirmed once, with one PIN.'}
            </motion.p>
          </AnimatePresence>
          <button
            type="button"
            onClick={() => {
              setPaid(0);
              setRun((r) => r + 1);
            }}
            disabled={!finished}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold text-graphite/60 ring-1 ring-graphite/15 transition-colors hover:text-graphite disabled:opacity-0"
          >
            <RotateCcw className="size-3.5" /> Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── The file, checked before anything moves ─────────────────────────────────

type FileRow = { id: string; name: string; account: string; amount: number | null; fixed?: { account?: string; amount?: number } };

// November's vendors and freelancers, as the spreadsheet arrived. Two rows need fixing.
const fileRows: FileRow[] = [
  { id: 'r1', name: 'Adebayo Logistics', account: '0690044321', amount: 120_000 },
  { id: 'r2', name: 'Lagos Print Hub', account: '5102993310', amount: 86_500 },
  { id: 'r3', name: 'Emeka Obi', account: '2003458812', amount: 45_000 },
  { id: 'r4', name: 'Ngozi Umeh', account: '221098765', amount: 38_000, fixed: { account: '2210987654' } },
  { id: 'r5', name: 'Halima Sani', account: '1029384756', amount: null, fixed: { amount: 9_500 } },
  { id: 'r6', name: 'Bisi Alade', account: '3012998741', amount: 12_000 },
];

// The same check the dashboard runs on each row, in its words.
const problemOf = (r: { account: string; amount: number | null }) =>
  !/^\d{10}$/.test(r.account) ? 'Account number needs 10 digits' : !r.amount ? 'No amount' : null;

const LIMIT = 250_000;
const people = [
  { id: 'owner', name: 'Adaeze', role: 'Owner' },
  { id: 'payer', name: 'Folake', role: 'Can pay' },
] as const;

/** A spreadsheet checked row by row, the fees added, and what happens when you press Pay. */
export function FileCheck() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const [checked, setChecked] = useState(reduce ? fileRows.length : 0);
  const [fixedIds, setFixedIds] = useState<string[]>([]);
  const [who, setWho] = useState<(typeof people)[number]['id']>('payer');
  const [approvals, setApprovals] = useState(true);
  const [stage, setStage] = useState<'ready' | 'pin' | 'done'>('ready');
  const [dots, setDots] = useState(0);

  // The rows are checked in turn once the panel is in view.
  useEffect(() => {
    if (!seen || reduce || checked >= fileRows.length) return;
    const t = window.setTimeout(() => setChecked((c) => c + 1), checked === 0 ? 500 : 380);
    return () => clearTimeout(t);
  }, [seen, reduce, checked]);

  // The PIN fills, then the outcome shows.
  useEffect(() => {
    if (stage !== 'pin') return;
    if (dots >= 4) {
      const t = window.setTimeout(() => setStage('done'), 350);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setDots((d) => d + 1), 220);
    return () => clearTimeout(t);
  }, [stage, dots]);

  const rows = fileRows.map((r) => {
    const fix = fixedIds.includes(r.id) ? r.fixed : undefined;
    const account = fix?.account ?? r.account;
    const amount = fix?.amount ?? r.amount;
    return { ...r, account, amount, problem: problemOf({ account, amount }), wasFixed: !!fix };
  });
  const allChecked = checked >= fileRows.length;
  const good = rows.filter((r) => !r.problem);
  const bad = rows.filter((r) => r.problem);
  const total = good.reduce((a, r) => a + (r.amount ?? 0), 0);
  const fees = good.reduce((a, r) => a + feeFor(r.amount ?? 0), 0);
  const waits = approvals && who !== 'owner' && total >= LIMIT;

  const reset = () => {
    setStage('ready');
    setDots(0);
  };

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      {/* The file, as uploaded */}
      <div className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-medium text-[12.5px] text-white/45">Your spreadsheet, as uploaded</p>
          <p className="flex items-center gap-2 text-[13px] font-semibold text-white/80">
            <FileSpreadsheet className="size-4 text-white/50" /> november-vendors.csv
          </p>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl bg-white text-graphite">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-graphite/10 bg-ledger/70 px-4 py-2.5 text-[12px] font-medium text-graphite/50 sm:grid-cols-[1.2fr_1fr_0.9fr_1.3fr]">
            <span>Name</span>
            <span className="hidden sm:block">Account number</span>
            <span className="text-right sm:block">Amount</span>
            <span className="hidden sm:block">Check</span>
          </div>
          <ul className="divide-y divide-graphite/[0.07]">
            {rows.map((r, i) => {
              const done = i < checked;
              return (
                <motion.li
                  key={r.id}
                  layout
                  className={`relative grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-[13.5px] sm:grid-cols-[1.2fr_1fr_0.9fr_1.3fr] ${
                    i === checked && !allChecked ? 'bg-primary/15' : ''
                  }`}
                >
                  <span className="truncate font-medium">{r.name}</span>
                  <span className={`order-3 font-ledger text-[12.5px] sm:order-none ${done && r.problem?.startsWith('Account') ? 'text-[#9a3a17]' : 'text-graphite/60'}`}>
                    {r.account}
                  </span>
                  <span className="text-right font-ledger tabular-nums">{r.amount ? naira(r.amount) : <span className="text-[#9a3a17]">—</span>}</span>
                  <span className="order-4 justify-self-end sm:order-none sm:justify-self-start">
                    <AnimatePresence mode="wait" initial={false}>
                      {done ? (
                        <motion.span
                          key={r.problem ? 'bad' : 'good'}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-flex flex-wrap items-center gap-x-2 gap-y-1"
                        >
                          {r.problem ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#9a3a17]">
                                <AlertCircle className="size-3.5" /> {r.problem}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFixedIds((f) => [...f, r.id]);
                                  reset();
                                }}
                                className="rounded px-1.5 py-0.5 text-[12px] font-semibold text-graphite/70 ring-1 ring-graphite/15 hover:text-graphite"
                              >
                                Fix it
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#1f6b33]">
                              <Check className="size-3.5" /> {r.wasFixed ? 'Fixed, ready' : 'Ready'}
                            </span>
                          )}
                        </motion.span>
                      ) : (
                        <motion.span key="wait" className="text-[12.5px] text-graphite/30">
                          Checking…
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-white/60">
          Name, bank, account number and amount, one payment a row, up to 500 rows a file. Rows to fix are left out until you fix them.
        </p>
      </div>

      {/* Before you pay */}
      <div className="flex flex-col rounded-2xl bg-white p-6 text-graphite sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-medium text-[12px] text-graphite/45">Who’s paying</p>
            <div className="mt-2 flex rounded-md bg-ledger p-0.5 text-[12.5px] font-medium">
              {people.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setWho(p.id);
                    reset();
                  }}
                  className={`flex-1 rounded px-2 py-1.5 transition-colors ${who === p.id ? 'bg-graphite text-white' : 'text-graphite/55'}`}
                >
                  {p.name} · {p.role}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium text-[12px] text-graphite/45">Approvals</p>
            <div className="mt-2 flex rounded-md bg-ledger p-0.5 text-[12.5px] font-medium">
              {[false, true].map((on) => (
                <button
                  key={String(on)}
                  type="button"
                  onClick={() => {
                    setApprovals(on);
                    reset();
                  }}
                  className={`flex-1 rounded px-2 py-1.5 transition-colors ${approvals === on ? 'bg-graphite text-white' : 'text-graphite/55'}`}
                >
                  {on ? `From ${nairaWhole(LIMIT)}` : 'Off'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <dl className="mt-7 space-y-3 text-[14px]">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-graphite/55">
              {good.length} ready{bad.length && allChecked ? ` · ${bad.length} to fix` : ''}
            </dt>
            <dd>
              <Count value={allChecked ? total : 0} className="font-medium" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-graphite/55">Transfer fees, ₦10 to ₦40 each</dt>
            <dd>
              <Count value={allChecked ? fees : 0} className="font-medium" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-graphite/10 pt-4">
            <dt className="text-graphite/55">Leaves your account</dt>
            <dd className="text-[clamp(1.5rem,3vw,2rem)] font-semibold">
              <Count value={allChecked ? total + fees : 0} />
            </dd>
          </div>
        </dl>

        <div className="mt-auto pt-7">
          <AnimatePresence mode="wait" initial={false}>
            {stage === 'ready' && (
              <motion.button
                key="pay"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                disabled={!allChecked}
                onClick={() => setStage('pin')}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-graphite text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-40"
              >
                Pay {good.length} {good.length === 1 ? 'person' : 'people'}
              </motion.button>
            )}
            {stage === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-12 items-center justify-center gap-3 rounded-lg bg-ledger"
                aria-label="Confirming with a PIN"
              >
                <span className="mr-1 text-[13px] font-medium text-graphite/55">One PIN</span>
                {[0, 1, 2, 3].map((d) => (
                  <motion.span
                    key={d}
                    className="size-3 rounded-full ring-1 ring-graphite/30"
                    animate={{ backgroundColor: d < dots ? '#1c1e21' : 'rgba(28,30,33,0)', scale: d === dots - 1 ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </motion.div>
            )}
            {stage === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className={`rounded-lg px-4 py-3.5 ${waits ? 'bg-[#fbf5e6]' : 'bg-primary/30'}`}
              >
                <p className={`flex items-center gap-2 text-[14.5px] font-semibold ${waits ? 'text-[#8a5a00]' : 'text-[#1f5c30]'}`}>
                  {waits ? <AlertCircle className="size-4 shrink-0" /> : <Check className="size-4 shrink-0" />}
                  {waits ? `All ${good.length} wait for a second person` : `${good.length} payments on their way`}
                </p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-graphite/65">
                  {waits
                    ? `The total is over ${nairaWhole(LIMIT)}. Adaeze or Tunde approves with their own PIN, then they go.`
                    : approvals && who === 'owner'
                      ? 'The owner set this up, and no single payment is over the limit, so they go now.'
                      : 'They go one after another, each account named by the bank first.'}
                </p>
                <button type="button" onClick={reset} className="mt-2 text-[13px] font-semibold text-graphite/60 hover:text-graphite">
                  Start again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-4 text-[12.5px] leading-relaxed text-graphite/50">
            With approvals on, the whole file counts as one payment against the limit, so a big run can’t slip through as small rows.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Every account, named by the bank ────────────────────────────────────────

const lookups = [
  { file: 'Adebayo Logistics', last4: '4321', bank: 'ADEBAYO LOGISTICS ENTERPRISES', amount: 120_000 },
  { file: 'Lagos Print Hub', last4: '3310', bank: 'LAGOS PRINT HUB LTD', amount: 86_500 },
  { file: 'Emeka Obi', last4: '8812', bank: 'OBI EMEKA CHUKWUDI', amount: 45_000 },
  { file: 'Kola Martins', last4: '0917', bank: null, amount: 30_000 },
  { file: 'Bisi Alade', last4: '8741', bank: 'ALADE ABISOLA RUTH', amount: 12_000 },
];

/** Each row's account, named by the bank one after another. One can't be found, and only that one stops. */
export function NamesLedger() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const [named, setNamed] = useState(reduce ? lookups.length : 0);

  useEffect(() => {
    if (!seen || reduce || named >= lookups.length) return;
    const t = window.setTimeout(() => setNamed((n) => n + 1), named === 0 ? 500 : 900);
    return () => clearTimeout(t);
  }, [seen, reduce, named]);

  const sent = lookups.slice(0, named).filter((l) => l.bank);

  return (
    <div ref={ref}>
      <div className="hidden grid-cols-[1fr_1.4fr_auto] gap-6 border-b border-graphite/15 pb-3 font-medium text-[13px] text-graphite/45 md:grid">
        <span>In your file</span>
        <span>Name on the account</span>
        <span className="w-[150px] text-right">Payment</span>
      </div>
      <ul className="divide-y divide-graphite/10">
        {lookups.map((l, i) => {
          const done = i < named;
          const looking = i === named;
          return (
            <li key={l.file} className="grid gap-x-6 gap-y-1 py-5 md:grid-cols-[1fr_1.4fr_auto] md:items-center">
              <span>
                <span className="block text-[16px] font-medium">{l.file}</span>
                <span className="block font-ledger text-[12.5px] text-graphite/45">•••• {l.last4}</span>
              </span>
              <span className="min-h-[1.75rem] text-[clamp(1.05rem,2vw,1.45rem)] font-semibold tracking-[-0.02em]">
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.span
                      key="named"
                      initial={{ opacity: 0, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.5, ease }}
                      className={l.bank ? '' : 'text-[#9a3a17]'}
                    >
                      {l.bank ?? 'No account found'}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="looking"
                      exit={{ opacity: 0 }}
                      className="inline-flex gap-1.5 align-middle"
                      aria-label={looking ? 'Asking the bank' : 'Waiting'}
                    >
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="size-1.5 rounded-full bg-graphite/30"
                          animate={looking ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
                          transition={looking ? { duration: 0.9, repeat: Infinity, delay: d * 0.15 } : {}}
                        />
                      ))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="md:w-[150px] md:text-right">
                {done &&
                  (l.bank ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#1f6b33]">
                      <Check className="size-4" /> {naira(l.amount)} sent
                    </motion.span>
                  ) : (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#9a3a17]">
                      <X className="size-4" /> Didn’t go · nothing taken
                    </motion.span>
                  ))}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-t border-graphite/15 pt-6">
        <p className="max-w-xl text-[15px] leading-relaxed text-graphite/60">
          The name comes from the bank, not from your file, and it’s the name on the record. If an account can’t be found, that payment
          doesn’t go and nothing is taken. The rest carry on.
        </p>
        <div className="text-right">
          <p className="font-medium text-[13px] text-graphite/45">Sent</p>
          <p className="mt-1 text-[clamp(1.4rem,3vw,2.2rem)] font-medium tracking-[-0.04em]">
            <Count value={sent.reduce((a, l) => a + l.amount, 0)} />
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Payments that repeat ────────────────────────────────────────────────────

// Thirteen weeks from Monday 2 November 2026; today is the 16th.
const START = Date.UTC(2026, 10, 2);
const DAYS = 91;
const TODAY = 14; // 16 November, in days from the start
const DAY_MS = 86_400_000;
const dayOf = (y: number, m: number, d: number) => Math.round((Date.UTC(y, m, d) - START) / DAY_MS);
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const monthly = (day: number) =>
  [
    [2026, 10],
    [2026, 11],
    [2027, 0],
  ].map(([y, m]) => dayOf(y!, m!, Math.min(day, lastDay(y!, m!))));

const schedules = [
  { id: 's1', name: 'Folake Adebayo', what: 'Salary', amount: 420_000, every: 'month' as const, note: 'on the 28th', runs: monthly(28) },
  { id: 's2', name: 'Bisi Alade', what: 'Weekly wage', amount: 45_000, every: 'week' as const, note: 'on Fridays', runs: Array.from({ length: 13 }, (_, w) => 4 + w * 7) },
  { id: 's3', name: 'Studio rent', what: 'Mrs B. Adeyemi', amount: 600_000, every: 'month' as const, note: 'on the 31st, or the last day', runs: monthly(31) },
];
const monthMarks = [
  { label: 'Nov', at: 0 },
  { label: 'Dec', at: dayOf(2026, 11, 1) },
  { label: 'Jan', at: dayOf(2027, 0, 1) },
];
const dateOf = (d: number) => new Date(START + d * DAY_MS).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Three repeating payments on a thirteen-week strip. Pause one and its dates go quiet; start it again and it carries on. */
export function ScheduleStrip() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-20% 0px' });
  const go = seen || !!reduce;
  const [paused, setPaused] = useState<string[]>([]);

  return (
    <div ref={ref} className="space-y-3">
      {/* Months and today */}
      <div className="px-4 sm:flex sm:gap-4" aria-hidden>
        <span className="hidden sm:block sm:w-[184px] sm:shrink-0" />
        <div className="relative h-5 flex-1">
          {monthMarks.map((m) => (
            <span key={m.label} className="absolute top-0 font-medium text-[12px] text-graphite/45" style={{ left: `${(m.at / DAYS) * 100}%` }}>
              {m.label}
            </span>
          ))}
          <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded bg-graphite px-1.5 text-[11px] font-medium text-white" style={{ left: `${(TODAY / DAYS) * 100}%` }}>
            Today
          </span>
        </div>
      </div>
      {schedules.map((s, row) => {
        const off = paused.includes(s.id);
        const next = s.runs.find((d) => d > TODAY);
        return (
          <div key={s.id} className={`rounded-xl bg-white px-4 py-4 ring-1 ring-graphite/10 transition-opacity sm:flex sm:items-center sm:gap-4 ${off ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between gap-3 sm:w-[184px] sm:shrink-0">
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-semibold">{s.name}</p>
                <p className="truncate text-[12.5px] text-graphite/50">
                  {s.what} · <span className="font-ledger">{naira(s.amount)}</span>
                </p>
                <p className="mt-0.5 text-[12px] text-graphite/45">
                  {off ? 'Paused' : `Every ${s.every} ${s.note}`}
                </p>
              </div>
              <button
                type="button"
                aria-label={off ? `Resume ${s.name}` : `Pause ${s.name}`}
                onClick={() => setPaused((p) => (off ? p.filter((x) => x !== s.id) : [...p, s.id]))}
                className="grid size-8 shrink-0 place-items-center rounded-md text-graphite/55 ring-1 ring-graphite/15 transition-colors hover:text-graphite"
              >
                {off ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              </button>
            </div>

            <div className="relative mt-4 h-8 flex-1 sm:mt-0">
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-graphite/15" />
              {/* Today */}
              <span className="absolute top-0 h-full w-px bg-graphite/50" style={{ left: `${(TODAY / DAYS) * 100}%` }} />
              {s.runs.map((d, i) => {
                const past = d <= TODAY;
                const isNext = d === next && !off;
                return (
                  <motion.span
                    key={d}
                    title={`${dateOf(d)}${past ? ', paid' : off ? ', paused' : ''}`}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${(d / DAYS) * 100}%` }}
                    initial={reduce ? false : { scale: 0, opacity: 0 }}
                    animate={go ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, ease, delay: row * 0.25 + i * 0.05 }}
                  >
                    <span
                      className={`block rounded-full transition-colors duration-300 ${s.every === 'week' ? 'size-2.5' : 'size-3.5'} ${
                        past ? 'bg-graphite' : off ? 'bg-white ring-1 ring-graphite/25' : 'bg-primary ring-1 ring-graphite/40'
                      }`}
                    />
                    {isNext && (
                      <motion.span
                        className="absolute inset-0 rounded-full ring-2 ring-primary"
                        animate={{ scale: [1, 2.2], opacity: [0.9, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                  </motion.span>
                );
              })}
            </div>
            <p className="mt-2 font-ledger text-[11.5px] text-graphite/50 sm:hidden">{off ? 'Paused' : next !== undefined ? `Next ${dateOf(next)}` : ''}</p>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[12.5px] text-graphite/55">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-graphite" /> Paid
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary ring-1 ring-graphite/40" /> Coming up
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-white ring-1 ring-graphite/25" /> Paused
        </span>
      </div>
    </div>
  );
}
