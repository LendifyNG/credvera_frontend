import { AnimatePresence } from 'framer-motion';
import { Check, Lightbulb, Loader2, Smartphone, Tv, Wifi, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import {
  errorMessage,
  useBuyAirtime,
  useBuyData,
  useBuyElectricity,
  useDataBundles,
  useElectricityProviders,
  useMeterLookup,
  type BillResultDto,
  type MeterType,
  type Network,
} from '../../api';
import { money } from '../model';
import { ComingSoon, Notice, PinPrompt } from '../ui';
import { field, label, NairaInput, nairaFrom, panel, primary } from './shared';

/** What a form hands the page once it's filled in: enough to confirm and pay. */
type Purchase = {
  title: string;
  detail: string;
  amount: number;
  buy: (pin: string) => Promise<BillResultDto>;
};

type FormProps = { onPay: (purchase: Purchase) => void; busy: boolean };

const NETWORKS: { code: Network; name: string }[] = [
  { code: 'MTN', name: 'MTN' },
  { code: 'AIRTEL', name: 'Airtel' },
  { code: 'GLO', name: 'Glo' },
  { code: '9MOBILE', name: '9mobile' },
];

const networkName = (code: Network) => NETWORKS.find((n) => n.code === code)!.name;

/** Squad refuses airtime below this. */
const MIN_AIRTIME = 50;

const isNigerianMobile = (phone: string) => /^(\+?234|0)\d{10}$/.test(phone.replace(/\s/g, ''));

function NetworkSelect({ value, onChange }: { value: Network; onChange: (n: Network) => void }) {
  return (
    <label className="block">
      <span className={label}>Network</span>
      <select value={value} onChange={(e) => onChange(e.target.value as Network)} className={field}>
        {NETWORKS.map((n) => (
          <option key={n.code} value={n.code}>
            {n.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function PhoneInput({ value, onChange, title = 'Phone number' }: { value: string; onChange: (v: string) => void; title?: string }) {
  return (
    <label className="block">
      <span className={label}>{title}</span>
      <input inputMode="tel" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d+ ]/g, ''))} placeholder="0803 000 0000" className={`${field} font-ledger`} />
    </label>
  );
}

// ── Airtime ──────────────────────────────────────────────────────────────────

function AirtimeForm({ onPay, busy }: FormProps) {
  const buy = useBuyAirtime();
  const [network, setNetwork] = useState<Network>('MTN');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const amount = nairaFrom(text);
  const ready = isNigerianMobile(phone) && amount >= MIN_AIRTIME && !busy;

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <NetworkSelect value={network} onChange={setNetwork} />
      <PhoneInput value={phone} onChange={setPhone} />
      <label className="block">
        <span className={label}>Amount (from {money(MIN_AIRTIME)})</span>
        <NairaInput value={amount} onChange={setText} />
      </label>
      <div className="flex items-end">
        <button
          type="button"
          disabled={!ready}
          onClick={() => onPay({ title: `${networkName(network)} airtime`, detail: phone, amount, buy: (pin) => buy.mutateAsync({ phoneNumber: phone, amount, pin }) })}
          className={`${primary} w-full`}
        >
          Pay {amount ? money(amount) : ''}
        </button>
      </div>
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

function DataForm({ onPay, busy }: FormProps) {
  const buy = useBuyData();
  const [network, setNetwork] = useState<Network>('MTN');
  const [phone, setPhone] = useState('');
  const [planCode, setPlanCode] = useState('');
  const bundles = useDataBundles(network);
  const plan = bundles.data?.find((b) => b.plan_code === planCode);
  // The plan's own price is what's charged; the API ignores any other figure.
  const amount = plan ? Number(plan.bundle_price) : 0;
  const ready = isNigerianMobile(phone) && !!plan && !busy;

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <NetworkSelect
        value={network}
        onChange={(n) => {
          setNetwork(n);
          setPlanCode('');
        }}
      />
      <PhoneInput value={phone} onChange={setPhone} />
      <label className="block sm:col-span-2">
        <span className={label}>Plan</span>
        <select value={planCode} onChange={(e) => setPlanCode(e.target.value)} disabled={bundles.isLoading} className={field}>
          <option value="">{bundles.isLoading ? 'Loading plans…' : bundles.error ? 'Plans are unavailable right now' : 'Choose a plan'}</option>
          {bundles.data?.map((b) => (
            <option key={b.plan_code} value={b.plan_code}>
              {b.bundle_value} · {b.bundle_validity} · {money(Number(b.bundle_price))}
            </option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            plan &&
            onPay({
              title: `${plan.bundle_value} ${networkName(network)} data`,
              detail: phone,
              amount,
              buy: (pin) => buy.mutateAsync({ phoneNumber: phone, network, planCode: plan.plan_code, pin }),
            })
          }
          className={`${primary} w-full`}
        >
          Pay {amount ? money(amount) : ''}
        </button>
      </div>
    </div>
  );
}

// ── Electricity ──────────────────────────────────────────────────────────────

function ElectricityForm({ onPay, busy }: FormProps) {
  const providers = useElectricityProviders();
  const lookup = useMeterLookup();
  const buy = useBuyElectricity();
  const [provider, setProvider] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('prepaid');
  const [meterNumber, setMeterNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');

  const meter = lookup.data;
  const amount = nairaFrom(text);
  const minimum = meter?.minimumVend ?? 0;
  const ready = !!meter && amount >= Math.max(1, minimum) && isNigerianMobile(phone) && !busy;

  // Any change to the meter details means the owner has to be checked again.
  const changeMeter = (update: () => void) => {
    update();
    lookup.reset();
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Provider</span>
          <select value={provider} onChange={(e) => changeMeter(() => setProvider(e.target.value))} disabled={providers.isLoading} className={field}>
            <option value="">{providers.isLoading ? 'Loading…' : 'Choose a provider'}</option>
            {providers.data?.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className={label}>Meter type</span>
          <div className="flex h-11 rounded-lg bg-[#efeee7] p-1 text-[14px] font-medium">
            {(['prepaid', 'postpaid'] as const).map((t) => (
              <button key={t} type="button" onClick={() => changeMeter(() => setMeterType(t))} className={`flex-1 rounded-md capitalize ${meterType === t ? 'bg-white shadow-sm' : 'text-graphite/55'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className={label}>Meter number</span>
          <input inputMode="numeric" value={meterNumber} onChange={(e) => changeMeter(() => setMeterNumber(e.target.value.replace(/\D/g, '').slice(0, 20)))} className={`${field} font-ledger`} />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={!provider || meterNumber.length < 6 || lookup.isPending}
            onClick={() => lookup.mutate({ provider, meterNumber, meterType })}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-graphite/15 text-[15px] font-semibold hover:border-graphite/35 disabled:opacity-50"
          >
            {lookup.isPending && <Loader2 className="size-4 animate-spin" />} Check the meter
          </button>
        </div>
      </div>

      {lookup.error && <p className="text-[13.5px] text-[#9a3a17]">{errorMessage(lookup.error)}</p>}

      {meter && (
        <>
          <div className="flex items-start gap-2 rounded-xl bg-[#f5f4ef] p-4 text-[14px]">
            <Check className="mt-0.5 size-4 shrink-0 text-[#1f6b33]" />
            <span>
              <span className="block font-semibold">{meter.customerName}</span>
              <span className="block text-graphite/55">{meter.address}</span>
              {minimum > 0 && <span className="block text-graphite/55">The least you can buy is {money(minimum)}.</span>}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Amount</span>
              <NairaInput value={amount} onChange={setText} />
            </label>
            <PhoneInput value={phone} onChange={setPhone} title="Phone for the receipt" />
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={() =>
              onPay({
                title: 'Electricity',
                detail: `${meter.customerName} · ${meterNumber}`,
                amount,
                buy: (pin) => buy.mutateAsync({ reference: meter.reference, amount, phoneNumber: phone, pin }),
              })
            }
            className={`${primary} w-full`}
          >
            Pay {amount ? money(amount) : ''}
          </button>
        </>
      )}
    </div>
  );
}

// ── The page ─────────────────────────────────────────────────────────────────

const KINDS: { kind: string; icon: LucideIcon; Form?: (props: FormProps) => React.ReactNode }[] = [
  { kind: 'Electricity', icon: Lightbulb, Form: ElectricityForm },
  { kind: 'Airtime', icon: Smartphone, Form: AirtimeForm },
  { kind: 'Data', icon: Wifi, Form: DataForm },
  { kind: 'TV', icon: Tv },
];

type Receipt = { title: string; amount: number; result: BillResultDto };

/** Bills paid from the naira account, each confirmed with the PIN. */
export default function Bills() {
  const [kind, setKind] = useState(KINDS[0]!);
  const [pending, setPending] = useState<Purchase | null>(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirm = async (pin: string) => {
    const purchase = pending!;
    setPending(null);
    setBusy(true);
    setError(null);
    try {
      setReceipt({ title: purchase.title, amount: purchase.amount, result: await purchase.buy(pin) });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const Form = kind.Form;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className={`${panel} p-6`}>
        <AnimatePresence>
          {error && (
            <Notice tone="bad" onClose={() => setError(null)}>
              {error}
            </Notice>
          )}
        </AnimatePresence>
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Bills</h2>
        <p className="mt-1 text-[14px] text-graphite/55">Paid from your naira account, with the receipt kept in Transactions.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KINDS.map((b) => (
            <button
              key={b.kind}
              type="button"
              onClick={() => {
                setKind(b);
                setReceipt(null);
                setError(null);
              }}
              className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors ${kind.kind === b.kind ? 'border-graphite bg-graphite text-white' : 'border-graphite/12 hover:border-graphite/30'}`}
            >
              <b.icon className={`size-5 ${kind.kind === b.kind ? 'text-primary' : 'text-graphite/60'}`} />
              <span className="text-[14.5px] font-semibold">{b.kind}</span>
            </button>
          ))}
        </div>

        {/* Keyed so switching bills starts each form fresh. */}
        {Form ? (
          <Form key={kind.kind} onPay={setPending} busy={busy} />
        ) : (
          <ComingSoon title="TV subscriptions" className="mt-6">
            DStv, GOtv and StarTimes renewals are on their way.
          </ComingSoon>
        )}
      </section>

      <section className={`${panel} p-6`}>
        {busy ? (
          <p className="flex items-center gap-2 text-[14px] text-graphite/60">
            <Loader2 className="size-4 animate-spin" /> Paying…
          </p>
        ) : receipt ? (
          <div>
            <span className="grid size-10 place-items-center rounded-full bg-primary text-graphite">
              <Check className="size-5" />
            </span>
            <p className="mt-4 text-[17px] font-semibold">
              {money(receipt.amount)} · {receipt.title}
            </p>
            <p className="mt-2 text-[14px] text-graphite/55">
              {receipt.result.status === 'success' ? 'It’s done.' : 'Submitted. We’ll confirm it shortly.'} The receipt is in Transactions.
            </p>
            <p className="mt-4 text-[13px] text-graphite/45">Reference {receipt.result.reference}</p>
          </div>
        ) : (
          <div>
            <h2 className="text-[16px] font-semibold">How it works</h2>
            <ol className="mt-4 space-y-3 text-[14px] text-graphite/65">
              <li>1. Pick the bill.</li>
              <li>2. Enter the phone or meter number. For electricity, we check the meter’s owner first.</li>
              <li>3. Confirm with your PIN.</li>
            </ol>
          </div>
        )}
      </section>

      <PinPrompt open={!!pending} title={`Pay ${money(pending?.amount ?? 0)}`} detail={pending ? `${pending.title} · ${pending.detail}` : undefined} onClose={() => setPending(null)} onConfirm={confirm} />
    </div>
  );
}
