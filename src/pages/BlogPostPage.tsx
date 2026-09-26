import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Figure from '../components/editorial/Figure';
import Headline from '../components/editorial/Headline';
import Reveal from '../components/ui/Reveal';
import { postBySlug, postDate, posts } from '../lib/blog';

/** One blog post, set like a magazine article. */
export default function BlogPostPage() {
  const { slug } = useParams();
  const post = postBySlug(slug);
  if (!post) return <Navigate to="/blog" replace />;
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article>
      <header className="mx-auto max-w-4xl px-6 pb-12 pt-32 lg:pt-40">
        <Reveal>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-background">
            <ArrowLeft className="size-4" /> The blog
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-background">
            {post.category} · {post.minutes} min read · {postDate(post.date)}
          </p>
        </Reveal>
        <Headline as="h1" text={post.title} className="mt-5 text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.035em]" />
        <Reveal delay={0.2}>
          <p className="mt-7 font-serif text-2xl italic leading-snug text-ink/60 sm:text-3xl">{post.dek}</p>
        </Reveal>
      </header>

      <div className="mx-auto max-w-5xl px-6">
        <Figure {...post.cover} credit={post.cover.credit} priority />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-16 text-lg leading-[1.75] text-ink/80">
        {post.body.map((b, i) =>
          b.h ? (
            <h2 key={i} className="mt-12 text-2xl font-semibold tracking-tight text-ink">
              {b.h}
            </h2>
          ) : b.list ? (
            <ul key={i} className="mt-5 space-y-3">
              {b.list.map((item) => (
                <li key={item} className="flex gap-4">
                  <span className="mt-[0.7em] h-px w-5 shrink-0 bg-background" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={i} className={i === 0 ? 'first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.85] first-letter:text-background' : 'mt-5'}>
              {b.p}
            </p>
          ),
        )}
      </div>

      <section className="mx-auto max-w-5xl border-t border-ink/15 px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">Keep reading</p>
        <div className="mt-8 grid gap-10 sm:grid-cols-2">
          {others.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background">{p.category}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight transition-colors group-hover:text-background">{p.title}</p>
              <p className="mt-2 text-ink/55">{p.dek}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
