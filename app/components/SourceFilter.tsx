import Link from "next/link";
import { FEEDS } from "@/lib/rss";

export function SourceFilter({ active }: { active?: string }) {
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
          <Link href="/" className={`pill ${!active ? "active" : ""}`}>
            All Sources
          </Link>
          {FEEDS.map((feed) => (
            <Link
              key={feed.id}
              href={`/?source=${feed.id}`}
              className={`pill ${active === feed.id ? "active" : ""}`}
            >
              {feed.name}
            </Link>
          ))}
        </div>
        <span
          className="font-retro uppercase ml-auto"
          style={{ fontSize: "18px", letterSpacing: "1px", color: "var(--cyan)" }}
        >
          // Sort: Newest ▾
        </span>
      </div>
    </div>
  );
}