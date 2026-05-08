import { formatDistanceToNow } from "date-fns";
import { getFeedById } from "@/lib/rss";
import Link from "next/link";

type Article = {
  id: string;
  source: string;
  source_url: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
};

const SOURCE_PALETTES: Record<string, [string, string, string]> = {
  verge:             ['#2D0824', '#4A1140', '#7A1F5E'],
  techcrunch:        ['#062932', '#0E5363', '#137A89'],
  'mit-tech-review': ['#0A2406', '#1A4710', '#2B6F1A'],
  'ars-technica':    ['#2A1408', '#4F2916', '#7C3F1F'],
};

function uniqueGradient(article: { id: string; source: string }): string {
  const hash = Math.abs(
    article.id.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  );
  const angle = (hash % 18) * 20;       // 0, 20, …, 340
  const offset = 30 + (hash % 40);      // 30 – 69
  const palette = SOURCE_PALETTES[article.source] ?? ['#1F0A3D', '#2D1857', '#4A2880'];
  return `linear-gradient(${angle}deg, ${palette[0]} 0%, ${palette[1]} ${offset}%, ${palette[2]} 100%)`;
}

export function ArticleCard({ article }: { article: Article }) {
  const feed = getFeedById(article.source);
  const sourceName = feed?.name ?? article.source;
const gradient = uniqueGradient(article);

  const hoursOld = article.published_at
    ? (Date.now() - new Date(article.published_at).getTime()) / 3_600_000
    : 999;
  const eyebrow =
    hoursOld < 24
      ? { text: "// New today", color: "var(--green)" }
      : hoursOld < 72
        ? { text: "// Recent", color: "var(--cyan)" }
        : null;

  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : "recently";

  return (
    <article
      className="rounded-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="h-[140px] flex items-end p-3 relative"
        style={{
          background: article.image_url
            ? `linear-gradient(to top, rgba(10, 1, 24, 0.85) 0%, rgba(10, 1, 24, 0.2) 50%, transparent 100%), url(${article.image_url})`
            : gradient,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "var(--bg-elev)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          className="font-retro uppercase px-2.5 py-1 rounded"
          style={{
            fontSize: "16px",
            letterSpacing: "2px",
            color: "var(--cyan)",
            background: "rgba(10, 1, 24, 0.85)",
            border: "1px solid rgba(34, 211, 238, 0.3)",
          }}
        >
          {sourceName}
        </span>
      </div>

      <div className="p-[18px] flex-1 flex flex-col">
        {eyebrow && (
          <span
            className="font-retro uppercase mb-2.5 inline-block w-fit"
            style={{
              fontSize: "14px",
              letterSpacing: "2px",
              color: eyebrow.color,
            }}
          >
            {eyebrow.text}
          </span>
        )}

        <Link
          href={`/article/${article.id}`}
          className="hover:opacity-80 transition-opacity"
        >
          <h3
            className="font-semibold leading-snug mb-2.5"
            style={{ fontSize: "17px", color: "var(--text)" }}
          >
            {article.title}
          </h3>
        </Link>

        <p
          className="leading-relaxed mb-3.5 flex-1"
          style={{
            fontSize: "13.5px",
            color: "var(--text-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>

        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span
            className="font-retro"
            style={{
              fontSize: "14px",
              letterSpacing: "1px",
              color: "var(--text-faint)",
            }}
          >
            {timeAgo}
          </span>
          <div className="flex items-center gap-3">
            <span
              className="font-retro flex items-center gap-1.5"
              style={{
                fontSize: "16px",
                letterSpacing: "1px",
                color: "var(--green)",
              }}
            >
              ▲ 0
            </span>
            <Link
              href={`/article/${article.id}`}
              className="font-display uppercase rounded transition-all"
              style={{
                fontSize: "11px",
                letterSpacing: "1.5px",
                color: "var(--pink)",
                border: "1px solid var(--pink)",
                background: "transparent",
                padding: "6px 12px",
                textDecoration: "none",
              }}
            >
              Build Brief
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
