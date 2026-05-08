"use client";

import { useState, useEffect } from "react";
import { isArticleSaved, toggleSavedArticle } from "@/lib/saved-storage";

export function SaveButton({ articleId }: { articleId: string }) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isArticleSaved(articleId));
  }, [articleId]);

  if (!mounted) {
    // Render a non-interactive placeholder during SSR to avoid hydration mismatch
    return (
      <div
        style={{
          fontSize: "12px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          fontFamily: "var(--font-display)",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
          background: "transparent",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        ☆ Save
      </div>
    );
  }

  return (
    <button
      onClick={() => setSaved(toggleSavedArticle(articleId))}
      style={{
        fontSize: "12px",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        fontFamily: "var(--font-display)",
        color: saved ? "var(--green)" : "var(--text-muted)",
        border: `1px solid ${saved ? "var(--green)" : "var(--border)"}`,
        background: saved ? "rgba(57, 255, 20, 0.05)" : "transparent",
        padding: "8px 16px",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {saved ? "✓ Saved" : "☆ Save"}
    </button>
  );
}