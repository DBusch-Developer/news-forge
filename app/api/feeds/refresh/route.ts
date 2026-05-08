import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import { FEEDS } from "@/lib/rss";

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsForge/1.0)",
  },
  timeout: 15000,
});

function truncate(text: string, max: number): string {
  if (!text) return "";
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trim() + "…";
}

export async function POST() {
  const admin = createAdminClient();
  const results: Array<{
    source: string;
    new: number;
    total: number;
    error?: string;
  }> = [];

  await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);

        const articles = parsed.items
          .filter((item) => item.link && item.title)
          .map((item) => ({
            source: feed.id,
            source_url: item.link!.trim(),
            title: item.title!.trim(),
            excerpt: truncate(item.contentSnippet || "", 500),
            published_at:
              item.isoDate || item.pubDate || new Date().toISOString(),
          }));

        const { data, error } = await admin
          .from("articles")
          .upsert(articles, {
            onConflict: "source_url",
            ignoreDuplicates: true,
          })
          .select("id");

        if (error) {
          results.push({
            source: feed.id,
            new: 0,
            total: articles.length,
            error: error.message,
          });
        } else {
          results.push({
            source: feed.id,
            new: data?.length ?? 0,
            total: articles.length,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.push({ source: feed.id, new: 0, total: 0, error: msg });
      }
    }),
  );

  return NextResponse.json({
    ok: true,
    results,
    new_total: results.reduce((sum, r) => sum + r.new, 0),
  });
}
