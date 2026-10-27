import { AlertCircle, Pause, Play, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { errorMessage, useScheduleAction, useSchedules } from '../../api';
import { money, shortDate } from '../model';
import { Loading } from '../ui';
import { initials, panel } from './shared';

/** Payments that repeat, next one first. Set up from Pay someone, with "Repeat it". */
export default function Scheduled() {
  const schedules = useSchedules();
  const act = useScheduleAction();
  const list = schedules.data ?? [];
  const monthly = list.filter((s) => !s.paused).reduce((a, s) => a + (s.every === 'week' ? (Number(s.amount) * 52) / 12 : Number(s.amount)), 0);

  return (
    <section className={`${panel} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Scheduled payments</h2>
          <p className="mt-1 text-[14px] text-graphite/55">
            Payments that repeat, paid on the day.{monthly ? ` About ${money(Math.round(monthly / 1000) * 1000).replace(/\.00$/, '')} a month.` : ''}
          </p>
        </div>
        <Link to="/business/app/pay" className="inline-flex h-10 items-center gap-2 rounded-lg border border-graphite/15 px-4 text-[14px] font-semibold hover:border-graphite/30">
          <Plus className="size-4" /> New schedule
        </Link>
      </div>
      {act.error && <p className="mt-4 text-[13.5px] text-[#9a3a17]">{errorMessage(act.error)}</p>}
      {schedules.isLoading ? (
        <Loading />
      ) : (
        <ul className="mt-5 divide-y divide-graphite/[0.07] border-t border-graphite/10">
          {list.map((s) => (
            <li key={s.id} className={`flex flex-wrap items-center gap-4 py-4 ${s.paused ? 'opacity-55' : ''}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efeee7] text-[11.5px] font-semibold">{initials(s.accountName)}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-medium">{s.accountName}</span>
                <span className="block text-[12.5px] text-graphite/50">
                  {s.narration ? `${s.narration} · ` : ''}
                  {s.bankName} ••••{s.accountLast4}
                </span>
                {s.lastProblem && (
                  <span className="mt-0.5 flex items-center gap-1 text-[12.5px] text-[#9a3a17]">
                    <AlertCircle className="size-3.5" /> Last one didn’t go: {s.lastProblem}
                  </span>
                )}
              </span>
              <span className="text-right">
                <span className="block font-ledger text-[15px] font-semibold">{money(Number(s.amount))}</span>
                <span className="block text-[12.5px] text-graphite/50">{s.paused ? 'Paused' : `Every ${s.every} · next ${shortDate(s.nextRunAt)}`}</span>
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  disabled={act.isPending}
                  onClick={() => act.mutate({ id: s.id, action: s.paused ? 'resume' : 'pause' })}
                  aria-label={s.paused ? 'Resume' : 'Pause'}
                  className="grid size-9 place-items-center rounded-lg text-graphite/55 hover:bg-graphite/5 hover:text-graphite"
                >
                  {s.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </button>
                <button
                  type="button"
                  disabled={act.isPending}
                  onClick={() => act.mutate({ id: s.id, action: 'cancel' })}
                  aria-label="Delete"
                  className="grid size-9 place-items-center rounded-lg text-graphite/55 hover:bg-[#f6e7e0] hover:text-[#9a3a17]"
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
          {list.length === 0 && <li className="py-10 text-center text-[14px] text-graphite/50">Nothing scheduled. Choose “Repeat it” when you pay someone.</li>}
        </ul>
      )}
    </section>
  );
}
