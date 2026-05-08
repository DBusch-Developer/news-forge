import Link from "next/link";
import { FEEDS } from "@/lib/rss";

function buildUrl(source?: string, sort?: string): string {
  const params = new URLSearchParams();
  if (source) params.set("source", source);
  if (sort && sort !== "newest") params.set("sort", sort); // "newest" is default — keep URL clean
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function SourceFilter({
  active,
  sort,
}: {
  active?: string;
  sort?: string;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-[1200px] mx-auto px-8 py-7 flex items-center gap-4 flex-wrap">
        <span
          className="font-retro uppercase glow-green"
          style={{ fontSize: "18px", letterSpacing: "2px", color: "var(--green)" }}
        >
          // Filter:
        </span>
        <div className="flex gap-2.5 flex-wrap">
          <Link href={buildUrl(undefined, sort)} className={`pill ${!active ? "active" : ""}`}>
            All Sources
          </Link>
          {FEEDS.map((feed) => (
            <Link
              key={feed.id}
              href={buildUrl(feed.id, sort)}
              className={`pill ${active === feed.id ? "active" : ""}`}
            >
              {feed.name}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex gap-2.5 items-center">
          <span
            className="font-retro uppercase"
            style={{ fontSize: "18px", letterSpacing: "1px", color: "var(--cyan)" }}
          >
            // Sort:
          </span>
          <Link
            href={buildUrl(active, "newest")}
            className={`pill ${(!sort || sort === "newest") ? "active" : ""}`}
          >
            Newest
          </Link>
          <Link
            href={buildUrl(active, "oldest")}
            className={`pill ${sort === "oldest" ? "active" : ""}`}
          >
            Oldest
          </Link>
        </div>
      </div>
    </div>
  );
}