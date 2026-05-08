import { createClient } from '@/lib/supabase/server';
import { getFeedById } from '@/lib/rss';
import { BriefBuilder } from '../../components/BriefBuilder';
import { SaveButton } from '../../components/SaveButton';
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

  const feed = getFeedById(article.source);
  const sourceName = feed?.name ?? article.source;
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'recently';

  return (
    <main className="max-w-[860px] mx-auto px-6 md:px-8 py-12">
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
        className="flex gap-3 pb-8 mb-8 flex-wrap"
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
        <SaveButton articleId={article.id} />
      </div>

      {/* Excerpt block */}
      {article.excerpt && (
        <div className="mb-12">
          <div
            className="font-retro uppercase mb-3"
            style={{ fontSize: '14px', letterSpacing: '2px', color: 'var(--cyan)' }}
          >
            // Excerpt
          </div>
          <p style={{ fontSize: '17px', lineHeight: 1.75, color: 'var(--text)' }}>
            {article.excerpt}
          </p>
          <div
            className="font-retro mt-4"
            style={{ fontSize: '13px', color: 'var(--text-faint)', letterSpacing: '1px' }}
          >
            // Tap Build Brief for an AI summary of the full article
          </div>
        </div>
      )}

      <BriefBuilder articleId={article.id} />
    </main>
  );
}