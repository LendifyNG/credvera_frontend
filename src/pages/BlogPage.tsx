import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Figure from '../components/editorial/Figure';
import Headline from '../components/editorial/Headline';
import Reveal from '../components/ui/Reveal';
import { postDate, posts } from '../lib/blog';

/** The blog: one featured post, then the rest as a list. */
export default function BlogPage() {
  const [featured, ...rest] = posts;
  if (!featured) return null;
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-32 lg:px-8 lg:pt-40">
        <Reveal>
          <div className="flex items-center gap-4 border-b border-ink/10 pb-5 text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">
            <span className="text-background">The Credvera blog</span>
            <span className="h-px w-8 bg-ink/20" />
            <span>Guides and notes on money, at home and abroad</span>
          </div>
        </Reveal>
        <Headline
          as="h1"
          text={'Notes on *money*.'}
          className="mt-12 text-[clamp(3rem,9vw,8rem)] font-semibold leading-[0.9] tracking-[-0.045em]"
        />
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <Link to={`/blog/${featured.slug}`} className="group grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Figure {...featured.cover} credit={featured.cover.credit} priority />
          <div className="pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-background">
              {featured.category} · {featured.minutes} min read
            </p>
            <h2 className="mt-4 text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-[1.02] tracking-[-0.03em] transition-colors duration-500 group-hover:text-background">
              {featured.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/60">{featured.dek}</p>
            <p className="mt-6 text-sm text-ink/45">{postDate(featured.date)}</p>
          </div>
        </Link>
      </section>

      {/* The rest */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <ul className="border-t border-ink/15">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <li>
                <Link
                  to={`/blog/${p.slug}`}
                  className="group grid gap-6 border-b border-ink/15 py-8 sm:grid-cols-[9rem_1fr_auto] sm:items-center"
                >
                  <div className="overflow-hidden rounded-xl bg-mist">
                    <img
                      src={p.cover.src}
                      alt={p.cover.alt}
                      width={p.cover.width}
                      height={p.cover.height}
                      loading="lazy"
                      className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
                      {p.category} · {postDate(p.date)}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight transition-colors duration-500 group-hover:text-background sm:text-3xl">
                      {p.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-ink/60">{p.dek}</p>
                  </div>
                  <ArrowUpRight className="hidden size-6 text-ink/30 transition-all duration-500 group-hover:rotate-45 group-hover:text-background sm:block" />
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
