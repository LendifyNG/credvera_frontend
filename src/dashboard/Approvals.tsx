import { useSession } from './data';
import { ComingSoon } from './ui';

/** Second approvals for big payments. The API doesn't have approval workflows yet. */
export default function Approvals() {
  const session = useSession();

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[13px] font-medium text-graphite/50">{session?.business}</p>
      <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.035em]">Approvals</h1>
      <p className="mt-1 text-[15px] text-graphite/55">Big payments, checked by a second person before they go.</p>
      <ComingSoon title="Two people for big payments" className="mt-6">
        Payments over the limit you set will wait here for someone else on the team to approve them with their own PIN. Until then, every payment goes as soon as you confirm it.
      </ComingSoon>
    </div>
  );
}
