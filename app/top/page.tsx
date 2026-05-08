'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFeedById } from '@/lib/rss';

type Article = {
  id: string;
  source: string;
  source_url: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
};

type Pick = {
  rank: number;
  reasoning: string;
  week_start: string;
  article: Article;
};

export default function TopPage() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPicks();
  }, []);

  async function fetchPicks() {
    try {
      const res = await fetch('/api/weekly-picks');
      const data = await res.json();
      setPicks(data.picks ?? []);
    } catch {
      setError('Failed to load picks');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/weekly-picks/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      await fetchPicks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-12">
      <div
        className="font-retro uppercase mb-3 glow-orange"
        style={{ fontSize: '20px', letterSpacing: '4px', color: 'var(--orange)' }}
      >
        // Signal from the future
      </div>
      <h1
        className="font-display uppercase mb-3"
        style={{ fontSize: '44px', letterSpacing: '2px' }}
      >
        AI{' '}
        <span className="glow-orange" style={{ color: 'var(--orange)' }}>
          // pick of the week
        </span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        Llama 3.3 reads the last 7 days of articles and picks the 5 worth your attention.
      </p>

      {loading ? (
        <div
          className="text-center py-16 font-retro"
          style={{ fontSize: '20px', color: 'var(--text-muted)', letterSpacing: '1px' }}
        >
          // Loading transmissions...
        </div>
      ) : picks.length === 0 ? (
        <EmptyState onGenerate={generate} generating={generating} error={error} />
      ) : (
        <PicksDisplay picks={picks} onRegenerate={generate} generating={generating} error={error} />
      )}
    </main>
  );
}

function EmptyState({
  onGenerate,
  generating,
  error,
}: {
  onGenerate: () => void;
  generating: boolean;
  error: string | null;
}) {
  return (
    <div
      className="rounded-lg p-12 text-center"
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 20, 147, 0.04) 0%, rgba(255, 107, 53, 0.04) 100%)',
        border: '1px solid var(--orange)',
      }}
    >
      <div
        className="font-retro uppercase mb-3 glow-orange"
        style={{ fontSize: '16px', letterSpacing: '4px', color: 'var(--orange)' }}
      >
        // No picks for this week yet
      </div>
      <p
        className="mx-auto"
        style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '480px' }}
      >
        Generate this week&apos;s picks — Llama 3.3 reads the last 7 days of articles and ranks the top 5.
      </p>

      {error && (
        <div className="font-retro mb-4" style={{ color: 'var(--orange)', letterSpacing: '1px' }}>
          // {error}
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={generating}
        className="font-display uppercase rounded transition-all"
        style={{
          fontSize: '14px',
          letterSpacing: '2px',
          color: '#0A0118',
          background: generating ? 'var(--text-muted)' : 'var(--orange)',
          border: 'none',
          padding: '14px 32px',
          cursor: generating ? 'wait' : 'pointer',
          boxShadow: generating ? 'none' : '0 0 24px rgba(255, 107, 53, 0.4)',
        }}
      >
        {generating ? '// Curating...' : "⚡ Generate this week's picks"}
      </button>
      {generating && (
        <p
          className="font-retro mt-3"
          style={{ fontSize: '14px', color: 'var(--text-faint)', letterSpacing: '1px' }}
        >
          Llama 3.3 reading the past week · 10–15 seconds
        </p>
      )}
    </div>
  );
}

function PicksDisplay({
  picks,
  onRegenerate,
  generating,
  error,
}: {
  picks: Pick[];
  onRegenerate: () => void;
  generating: boolean;
  error: string | null;
}) {
  return (
    <>
      <div
        className="rounded-lg p-8 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 20, 147, 0.04) 0%, rgba(255, 107, 53, 0.04) 100%)',
          border: '1px solid var(--orange)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,107,53,0.03), rgba(255,107,53,0.03) 1px, transparent 1px, transparent 4px)',
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
          {picks.map((pick) => (
            <PickRow key={pick.rank} pick={pick} />
          ))}
        </div>
      </div>

      {error && (
        <div
          className="font-retro text-center mt-4"
          style={{ color: 'var(--orange)', letterSpacing: '1px' }}
        >
          // {error}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={onRegenerate}
          disabled={generating}
          className="font-display uppercase rounded"
          style={{
            fontSize: '12px',
            letterSpacing: '1.5px',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            background: 'transparent',
            padding: '8px 16px',
            cursor: generating ? 'wait' : 'pointer',
          }}
        >
          {generating ? '// Curating...' : 'Regenerate picks'}
        </button>
      </div>
    </>
  );
}

function PickRow({ pick }: { pick: Pick }) {
  const feed = getFeedById(pick.article.source);
  const sourceName = feed?.name ?? pick.article.source;

  return (
    <Link
      href={`/article/${pick.article.id}`}
      className="block p-3.5 rounded transition-opacity hover:opacity-80"
      style={{
        background: 'rgba(10, 1, 24, 0.6)',
        border: '1px solid var(--border)',
        textDecoration: 'none',
      }}
    >
      <div className="flex gap-3.5">
        <div
          className="font-display"
          style={{
            fontSize: '26px',
            color: 'var(--orange)',
            lineHeight: 1,
            textShadow: '0 0 8px rgba(255, 107, 53, 0.4)',
            minWidth: '36px',
          }}
        >
          {String(pick.rank).padStart(2, '0')}
        </div>
        <div className="flex-1">
          <div
            className="font-retro uppercase mb-1"
            style={{ fontSize: '14px', letterSpacing: '1.5px', color: 'var(--cyan)' }}
          >
            {sourceName}
          </div>
          <h4
            className="font-medium leading-snug mb-2"
            style={{ fontSize: '14px', color: 'var(--text)' }}
          >
            {pick.article.title}
          </h4>
          <div
            className="font-retro"
            style={{
              fontSize: '14px',
              color: 'var(--pink)',
              letterSpacing: '0.5px',
              lineHeight: 1.4,
            }}
          >
            // {pick.reasoning}
          </div>
        </div>
      </div>
    </Link>
  );
}