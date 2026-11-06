import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { businessPosts, postDate } from '../../lib/blog';

const ease = [0.16, 1, 0.3, 1] as const;
const topics = ['All', 'Getting paid', 'Controls', 'FX', 'Suppliers'] as const;

/** Business notes, listed like a journal's contents page. */
export default function BizBlogPage() {
  const reduce = useReducedMotion();
  const [topic, setTopic] = useState<(typeof topics)[number]>('All');
  const [hover, setHover] = useState<string | null>(null);
  const list = businessPosts.filter((p) => topic === 'All' || p.topic === topic);

  return (
    <section className="min-h-screen bg-ledger text-graphite">
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-32 lg:px-8 lg:pt-40">
        <div className="flex items-center justify-between border-b border-graphite/15 pb-5 font-medium text-[13px] text-graphite/50">
          <span>Business · Notes</span>
          <span>{businessPosts.length} notes</span>
        </div>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="mt-12 text-[clamp(2.8rem,6.4vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.05em]"
        >
          Field notes
          <br />
          <span className="text-graphite/45">for Nigerian businesses.</span>
        </motion.h1>

        <div className="mt-14 flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`rounded-md px-3.5 py-1.5 text-[14px] font-medium transition-colors ${
                t === topic ? 'bg-graphite text-white' : 'text-graphite/60 ring-1 ring-graphite/15 hover:text-graphite'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Contents */}
        <div className="mt-8 border-t-2 border-graphite">
          <div className="hidden grid-cols-[4rem_1fr_9rem_6rem_8rem] gap-6 border-b border-graphite/15 py-3 font-medium text-[13px] text-graphite/45 md:grid">
            <span>No.</span>
            <span>Note</span>
            <span>Topic</span>
            <span>Read</span>
            <span className="text-right">Date</span>
          </div>
          <ol>
            {list.map((p) => {
              const no = businessPosts.length - businessPosts.indexOf(p);
              const open = hover === p.slug;
              return (
                <li key={p.slug} onMouseEnter={() => setHover(p.slug)} onMouseLeave={() => setHover(null)} className="border-b border-graphite/15">
                  <Link
                    to={`/business/blog/${p.slug}`}
                    className="group grid gap-2 py-6 md:grid-cols-[4rem_1fr_9rem_6rem_8rem] md:items-baseline md:gap-6"
                  >
                    <span className="font-ledger text-[13px] text-graphite/40">{String(no).padStart(2, '0')}</span>
                    <span>
                      <span className="block text-[clamp(1.3rem,2.2vw,1.8rem)] font-semibold leading-snug tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1.5">
                        {p.title}
                      </span>
                      <AnimatePresence initial={false}>
                        {(open || reduce) && (
                          <motion.span
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease }}
                            className="block overflow-hidden"
                          >
                            <span className="mt-2 block max-w-2xl text-[15px] leading-relaxed text-graphite/60">{p.dek}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span className="font-medium text-[13px] text-graphite/55">{p.topic}</span>
                    <span className="font-ledger text-[12px] text-graphite/55">{p.minutes} min</span>
                    <span className="flex items-center justify-between gap-3 font-ledger text-[12px] text-graphite/55 md:justify-end">
                      {postDate(p.date)}
                      <ArrowRight className="size-4 text-graphite/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-graphite md:hidden" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          {list.length === 0 && <p className="py-10 text-graphite/50">No notes on this yet.</p>}
        </div>
      </div>
    </section>
  );
}
