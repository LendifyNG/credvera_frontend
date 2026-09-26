import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { businessPosts, postBySlug, postDate } from '../../lib/blog';

/** A business note, set as a memo: who it's for, numbered parts, and where to go next. */
export default function BizPostPage() {
  const { slug } = useParams();
  const post = postBySlug(slug);
  if (!post) return <Navigate to="/business/blog" replace />;
  if (post.audience !== 'business') return <Navigate to={`/blog/${post.slug}`} replace />;

  const i = businessPosts.findIndex((p) => p.slug === post.slug);
  const next = businessPosts[(i + 1) % businessPosts.length]!;
  const no = businessPosts.length - i;
  const headings = post.body.filter((b) => b.h).map((b) => b.h!);
  let section = 0;

  return (
    <article className="bg-ledger text-graphite">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 lg:px-8 lg:pt-40">
        <Link to="/business/blog" className="inline-flex items-center gap-2 font-medium text-[13px] text-graphite/55 hover:text-graphite">
          <ArrowLeft className="size-4" /> Field notes
        </Link>

        {/* The memo head */}
        <dl className="mt-10 grid gap-x-10 gap-y-3 border-y-2 border-graphite py-5 font-ledger text-[12px] sm:grid-cols-4">
          {[
            ['Note', `No. ${String(no).padStart(2, '0')}`],
            ['To', 'Business owners'],
            ['Topic', post.topic ?? 'Business'],
            ['Date · read', `${postDate(post.date)} · ${post.minutes} min`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="uppercase tracking-[0.14em] text-graphite/45">{k}</dt>
              <dd className="mt-1 text-graphite">{v}</dd>
            </div>
          ))}
        </dl>

        <h1 className="mt-12 max-w-4xl text-[clamp(2.4rem,5.4vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.045em]">{post.title}</h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-graphite/60">{post.dek}</p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
          {/* In this note */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="font-medium text-[13px] text-graphite/45">In this note</p>
              <ol className="mt-4 space-y-2.5 border-l border-graphite/15 pl-4 text-[14px] text-graphite/65">
                {headings.map((h, n) => (
                  <li key={h} className="flex gap-3">
                    <span className="font-ledger text-graphite/35">{n + 1}</span>
                    {h}
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="max-w-2xl text-[18px] leading-[1.75] text-graphite/80">
            {post.body.map((b, k) => {
              if (b.h) {
                section += 1;
                return (
                  <h2 key={k} className="mt-14 flex items-baseline gap-4 text-2xl font-semibold tracking-tight text-graphite first:mt-0">
                    <span className="font-ledger text-[14px] font-normal text-graphite/40">{String(section).padStart(2, '0')}</span>
                    {b.h}
                  </h2>
                );
              }
              if (b.list)
                return (
                  <ol key={k} className="mt-5 space-y-3">
                    {b.list.map((item, n) => (
                      <li key={item} className="grid grid-cols-[2rem_1fr] gap-2">
                        <span className="font-ledger text-[14px] text-graphite/40">{String.fromCharCode(97 + n)}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                );
              return (
                <p key={k} className={k === 0 ? 'text-[20px] text-graphite' : 'mt-5'}>
                  {b.p}
                </p>
              );
            })}
          </div>
        </div>

        {/* Where to go next */}
        <div className="mt-20 grid gap-px overflow-hidden rounded-xl bg-graphite/10 md:grid-cols-2">
          {post.related && (
            <Link to={post.related.to} className="group bg-white p-8">
              <p className="font-medium text-[13px] text-graphite/45">In the account</p>
              <p className="mt-3 flex items-center justify-between gap-4 text-2xl font-semibold tracking-tight">
                {post.related.label}
                <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </p>
            </Link>
          )}
          <Link to={`/business/blog/${next.slug}`} className="group bg-ledger p-8">
            <p className="font-medium text-[13px] text-graphite/45">Next note</p>
            <p className="mt-3 flex items-center justify-between gap-4 text-2xl font-semibold tracking-tight">
              {next.title}
              <ArrowRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </p>
          </Link>
        </div>
      </div>
    </article>
  );
}
