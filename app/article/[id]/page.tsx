import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { scrapeArticle } from '@/lib/scraper';
import { getFeedById } from '@/lib/rss';
import { BriefBuilder } from '../../components/BriefBuilder';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) notFound();

  // Scrape full text on first view, cache to DB
  let fullText: string | null = article.full_text;
  let scrapeFailed = false;

  if (!fullText) {
    const scrape = await scrapeArticle(article.source_url);
    if (scrape.success) {
      fullText = scrape.text;
      const admin = createAdminClient();
      await admin.from('articles').update({ full_text: scrape.text }).eq('id', id);
    } else {
      scrapeFailed = true;
    }
  }

  const feed = getFeedById(article.source);
  const sourceName = feed?.name ?? article.source;
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'recently';

  const paragraphs = fullText
    ? fullText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <main className="max-w-[860px] mx-auto px-8 py-12">
      <Link
        href="/"
        className="font-retro uppercase mb-8 inline-block transition-opacity hover:opacity-70"
        style={{ fontSize: '16px', letterSpacing: '2px', color: 'var(--cyan)' }}
      >
        ← // Back to feed
      </Link>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span
          className="font-retro uppercase px-2.5 py-1 rounded"
          style={{
            fontSize: '14px',
            letterSpacing: '2px',
            color: 'var(--cyan)',
            background: 'rgba(34, 211, 238, 0.08)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}
        >
          {sourceName}
        </span>
        <span
          className="font-retro"
          style={{ fontSize: '14px', letterSpacing: '1px', color: 'var(--text-faint)' }}
        >
          {timeAgo}
        </span>
      </div>

      <h1
        className="font-display uppercase mb-8"
        style={{ fontSize: '36px', lineHeight: 1.15, letterSpacing: '1px' }}
      >
        {article.title}
      </h1>

      <div
        className="flex gap-3 pb-8 mb-8"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display uppercase rounded transition-opacity hover:opacity-80"
          style={{
            fontSize: '12px',
            letterSpacing: '1.5px',
            color: 'var(--cyan)',
            border: '1px solid var(--cyan)',
            background: 'transparent',
            padding: '8px 16px',
          }}
        >
          Read original →
        </a>
      </div>

      {scrapeFailed ? (
        <div
          className="p-5 rounded mb-8"
          style={{
            background: 'rgba(255, 107, 53, 0.08)',
            border: '1px solid var(--orange)',
          }}
        >
          <div
            className="font-retro uppercase mb-2 glow-orange"
            style={{ fontSize: '14px', letterSpacing: '2px', color: 'var(--orange)' }}
          >
            // Signal lost — using excerpt
          </div>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text)' }}>
            {article.excerpt}
          </p>
        </div>
      ) : (
        <article className="mb-12">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="mb-5"
              style={{ fontSize: '16px', lineHeight: 1.75, color: 'var(--text)' }}
            >
              {para}
            </p>
          ))}
        </article>
      )}

      <BriefBuilder articleId={article.id} />
    </main>
  );
}