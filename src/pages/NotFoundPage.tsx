import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SplitFlap from '../components/editorial/SplitFlap';

// Where you can go instead, as rows on a departures board.
const departures = [
  { to: '/', place: 'HOME', status: 'ON TIME' },
  { to: '/personal/abroad', place: 'GET PAID FROM ABROAD', status: 'BOARDING' },
  { to: '/personal/everyday', place: 'EVERYDAY MONEY', status: 'ON TIME' },
  { to: '/personal/passport', place: 'EARNINGS PASSPORT', status: 'ON TIME' },
  { to: '/pricing', place: 'PRICING', status: 'ON TIME' },
  { to: '/faq', place: 'FAQ', status: 'ON TIME' },
];

/** A missing page, told as a cancelled flight, with the other departures to choose from. */
export default function NotFoundPage() {
  // The rows flip in one after another.
  const [rows, setRows] = useState(0);
  useEffect(() => {
    if (rows >= departures.length) return;
    const t = window.setTimeout(() => setRows((r) => r + 1), rows === 0 ? 700 : 260);
    return () => clearTimeout(t);
  }, [rows]);

  return (
    <section className="min-h-screen bg-secondary text-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8 lg:pt-40">
        <p className="text-[13px] font-semibold text-primary">Error 404</p>
        <div className="mt-6 text-[clamp(9px,2.7vw,26px)]">
          <SplitFlap text="FLIGHT 404 · CANCELLED" length={22} />
        </div>
        <h1 className="mt-10 max-w-3xl text-[clamp(2.6rem,6.5vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
          This page took a <em className="font-serif font-normal italic">wrong turn</em>.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
          It doesn’t exist, or it has moved. Pick another departure.
        </p>

        {/* Departures */}
        <div className="mt-14 overflow-hidden rounded-[1.5rem] bg-black/30 ring-1 ring-white/10">
          <div className="grid grid-cols-[1fr_auto] gap-6 border-b border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40 sm:px-8">
            <span>Destination</span>
            <span>Status</span>
          </div>
          <ul>
            {departures.map((d, i) => (
              <li key={d.to} className="border-b border-white/5 last:border-0">
                <Link to={d.to} className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5 sm:px-8">
                  <span className="min-w-0 overflow-hidden text-[clamp(9px,1.5vw,17px)]">
                    <SplitFlap text={i < rows ? d.place : ''} length={20} />
                  </span>
                  <span className={`text-[clamp(9px,1.3vw,14px)] ${d.status === 'BOARDING' ? '[&_span]:!text-[#f5c451]' : ''}`}>
                    <SplitFlap text={i < rows ? d.status : ''} length={8} />
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-white/5 text-primary transition-all duration-500 group-hover:rotate-45 group-hover:bg-primary group-hover:text-secondary">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
