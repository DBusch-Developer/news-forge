"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSavedIds } from "@/lib/saved-storage";
import { ArticleCard } from "../components/ArticleCard";

type Article = {
  id: string;
  source: string;
  source_url: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
};

export default function SavedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getSavedIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    fetch("/api/articles/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-12">
      <div
        className="font-retro uppercase mb-3 glow-green"
        style={{ fontSize: "20px", letterSpacing: "4px", color: "var(--green)" }}
      >
        // Your archive
      </div>
      <h1
        className="font-display uppercase mb-3"
        style={{ fontSize: "44px", letterSpacing: "2px" }}
      >
        Saved <span className="glow-cyan" style={{ color: "var(--cyan)" }}>// articles</span>
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}>
        Saved on this device. Stays in your browser — no account needed.
      </p>

      {loading ? (
        <div
          className="text-center py-16 font-retro"
          style={{ fontSize: "20px", color: "var(--text-muted)", letterSpacing: "1px" }}
        >
          // Loading transmissions...
        </div>
      ) : articles.length === 0 ? (
        <div
          className="text-center py-16 font-retro"
          style={{ fontSize: "18px", color: "var(--text-muted)", letterSpacing: "1px" }}
        >
          // No saved articles yet.{" "}
          <Link href="/" style={{ color: "var(--cyan)", textDecoration: "underline" }}>
            Browse the feed
          </Link>{" "}
          and tap ☆ Save on anything you want to come back to.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}