import Reveal from '../ui/Reveal';

// Today's rates as the app shows them: our rate beside the market rate.
// TODO(credvera): read live rates from the rates API; the margin is still to
// be set (FX_MARGIN_PERCENT in the app is 0 today).
const rates = [
  { code: 'USD', flag: 'us', name: 'US dollar', ours: 1535, market: 1535 },
  { code: 'GBP', flag: 'gb', name: 'British pound', ours: 2065, market: 2065 },
  { code: 'EUR', flag: 'eu', name: 'Euro', ours: 1790, market: 1790 },
];

const naira = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

/** A ticket of today's rates: our rate, the market rate, and the difference. */
export default function RateTicket() {
  return (
    <Reveal>
      <div className="relative mx-auto max-w-xl rounded-[1.75rem] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(1,21,4,0.35)] ring-1 ring-ink/5">
        <div className="rounded-[1.4rem] border border-dashed border-ink/15 px-6 pb-6 pt-5 sm:px-8">
          <div className="flex items-baseline justify-between text-[13px] font-semibold text-ink/45">
            <span>Today’s rates</span>
            <span>For 1 unit, in naira</span>
          </div>
          <ul className="mt-5 divide-y divide-dashed divide-ink/15">
            {rates.map((r) => (
              <li key={r.code} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4">
                <img src={`https://flagcdn.com/w40/${r.flag}.png`} alt="" className="h-5 w-7 rounded-[3px] object-cover" loading="lazy" />
                <div>
                  <p className="font-semibold">{r.code}</p>
                  <p className="text-sm text-ink/50">{r.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold tabular-nums tracking-tight">{naira(r.ours)}</p>
                  <p className="text-sm tabular-nums text-ink/45">Market {naira(r.market)}</p>
                </div>
              </li>
            ))}
          </ul>
          {/* Perforation */}
          <div className="relative -mx-6 my-2 border-t border-dashed border-ink/15 sm:-mx-8">
            <span className="absolute -left-3 -top-3 size-6 rounded-full bg-paper" />
            <span className="absolute -right-3 -top-3 size-6 rounded-full bg-paper" />
          </div>
          <p className="pt-4 text-sm leading-relaxed text-ink/60">
            You see both rates before you convert, and the rate is held while you confirm.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
