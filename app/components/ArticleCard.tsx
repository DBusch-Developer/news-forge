import { formatDistanceToNow } from "date-fns";
import { getFeedById } from "@/lib/rss";
import Link from "next/link";

type Article = {
  id: string;
  source: string;
  source_url: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

const GRADIENTS: Record<string, string> = {
  verge: "linear-gradient(135deg, #2D0824 0%, #4A1140 100%)",
  techcrunch: "linear-gradient(135deg, #062932 0%, #0E5363 100%)",
  "mit-tech-review": "linear-gradient(135deg, #0A2406 0%, #1A4710 100%)",
  "ars-technica": "linear-gradient(135deg, #2A1408 0%, #4F2916 100%)",
};

export function ArticleCard({ article }: { article: Article }) {
  const feed = getFeedById(article.source);
  const sourceName = feed?.name ?? article.source;
  const gradient =
    GRADIENTS[article.source] ??
    "linear-gradient(135deg, #1F0A3D 0%, #2D1857 100%)";

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
        className="h-[140px] flex items-end p-3"
        style={{
          background: gradient,
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
