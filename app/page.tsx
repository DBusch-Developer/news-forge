import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "./components/ArticleCard";
import { SourceFilter } from "./components/SourceFilter";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(60);

  if (params.source) {
    query = query.eq("source", params.source);
  }

  const { data: articles } = await query;

  return (
    <main>
      {/* HERO */}
      <section
        className="py-20 text-center relative overflow-hidden"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)",
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 relative">
          <div
            className="font-retro uppercase mb-5 glow-green"
            style={{ fontSize: "22px", letterSpacing: "4px", color: "var(--green)" }}
          >
            // Broadcasting from the future
          </div>
          <h1
            className="font-display uppercase mb-6"
            style={{ fontSize: "68px", lineHeight: 1.05, letterSpacing: "2px" }}
          >
            AI news,<br />
            <span className="glow-pink" style={{ color: "var(--pink)" }}>forged</span>{" "}
            for{" "}
            <span className="glow-cyan" style={{ color: "var(--cyan)" }}>builders</span>
          </h1>
          <p
            className="max-w-[580px] mx-auto"
            style={{ fontSize: "17px", color: "var(--text-muted)" }}
          >
            Browse the latest AI news from trusted sources. Generate cohort-ready presentation briefs in seconds.
          </p>
        </div>
      </section>

      {/* FILTER */}
      <SourceFilter active={params.source} />

      {/* FEED */}
      <section className="py-9 pb-16">
        <div className="max-w-[1200px] mx-auto px-8">
          <h2
            className="font-display uppercase mb-6"
            style={{ fontSize: "22px", letterSpacing: "2px" }}
          >
            Latest <span style={{ color: "var(--cyan)" }}>// transmissions</span>
          </h2>

          {!articles || articles.length === 0 ? (
            <div
              className="text-center py-16 font-retro"
              style={{ fontSize: "20px", color: "var(--text-muted)", letterSpacing: "1px" }}
            >
              {params.source
                ? `// No articles from this source yet`
                : `// No articles yet — run the RSS ingestion to populate`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}