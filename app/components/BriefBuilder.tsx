"use client";

import { useState } from "react";

type Brief = {
  summary: string;
  why_it_matters: string;
  your_take_prompt: string;
  discussion_questions: string[];
  topic_tags: string[];
};

export function BriefBuilder({ articleId }: { articleId: string }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setBrief(null);

    try {
      const res = await fetch("/api/brief/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setBrief(data.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div
          className="font-retro uppercase glow-pink"
          style={{
            fontSize: "22px",
            letterSpacing: "4px",
            color: "var(--pink)",
          }}
        >
          // Forging brief...
        </div>
        <div
          className="font-retro mt-3"
          style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            letterSpacing: "1px",
          }}
        >
          Routing through Llama 3.3 · 5–10 seconds
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <div
          className="font-retro uppercase mb-3 glow-orange"
          style={{
            fontSize: "16px",
            letterSpacing: "2px",
            color: "var(--orange)",
          }}
        >
          // Transmission failed
        </div>
        <div style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          {error}
        </div>
        <button onClick={generate} className="btn-pink-outline">
          Retry
        </button>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="text-center py-8">
        <button
          onClick={generate}
          className="font-display uppercase rounded transition-all"
          style={{
            fontSize: "14px",
            letterSpacing: "2px",
            color: "#0A0118",
            background: "var(--pink)",
            border: "none",
            padding: "14px 32px",
            cursor: "pointer",
            boxShadow: "0 0 24px rgba(255, 20, 147, 0.4)",
          }}
        >
          ⚡ Build Brief
        </button>
        <p
          className="font-retro mt-3"
          style={{
            fontSize: "14px",
            color: "var(--text-faint)",
            letterSpacing: "1px",
          }}
        >
          // Generates a 2-min presentation brief in seconds
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-8 mt-8"
      style={{
        background: "rgba(255, 20, 147, 0.04)",
        border: "1px solid var(--pink)",
      }}
    >
      <div
        className="font-retro uppercase mb-2 glow-pink"
        style={{ fontSize: "14px", letterSpacing: "4px", color: "var(--pink)" }}
      >
        // Brief generated
      </div>
      <h2
        className="font-display uppercase mb-8"
        style={{
          fontSize: "24px",
          letterSpacing: "1.5px",
          color: "var(--text)",
        }}
      >
        Your 2-min brief
      </h2>

      {brief.topic_tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {brief.topic_tags.map((tag, i) => (
            <span
              key={i}
              className="font-retro uppercase px-2.5 py-1 rounded"
              style={{
                fontSize: "13px",
                letterSpacing: "1.5px",
                color: "var(--orange)",
                background: "rgba(255, 107, 53, 0.1)",
                border: "1px solid rgba(255, 107, 53, 0.3)",
              }}
            >
              # {tag}
            </span>
          ))}
        </div>
      )}

      <Section label="// Summary" color="var(--cyan)">
        <p style={{ fontSize: "16px", lineHeight: 1.7 }}>{brief.summary}</p>
      </Section>

      <Section label="// Why it matters" color="var(--green)">
        <p style={{ fontSize: "16px", lineHeight: 1.7 }}>
          {brief.why_it_matters}
        </p>
      </Section>

      <Section label="// Your take" color="var(--pink)">
        <p style={{ fontSize: "16px", lineHeight: 1.7, fontStyle: "italic" }}>
          &ldquo;{brief.your_take_prompt}&rdquo;
        </p>
      </Section>

      <Section label="// Discussion questions" color="var(--orange)">
        <ol
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {brief.discussion_questions.map((q, i) => (
            <li key={i} style={{ fontSize: "16px", lineHeight: 1.7 }}>
              <span
                className="font-retro mr-2"
                style={{ color: "var(--orange)", fontSize: "14px" }}
              >
                {i + 1}.
              </span>
              {q}
            </li>
          ))}
        </ol>
      </Section>

      <div
        className="flex gap-3 pt-6 mt-8"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={() =>
            navigator.clipboard.writeText(formatForClipboard(brief))
          }
          className="font-display uppercase rounded transition-all"
          style={{
            fontSize: "12px",
            letterSpacing: "1.5px",
            color: "var(--cyan)",
            border: "1px solid var(--cyan)",
            background: "transparent",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Copy to clipboard
        </button>
        <button
          onClick={generate}
          className="font-display uppercase rounded"
          style={{
            fontSize: "12px",
            letterSpacing: "1.5px",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            background: "transparent",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}

function Section({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div
        className="font-retro uppercase mb-2"
        style={{ fontSize: "14px", letterSpacing: "2px", color }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function formatForClipboard(brief: Brief): string {
  return [
    `SUMMARY:\n${brief.summary}`,
    `\nWHY IT MATTERS:\n${brief.why_it_matters}`,
    `\nYOUR TAKE PROMPT:\n${brief.your_take_prompt}`,
    `\nDISCUSSION QUESTIONS:\n${brief.discussion_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`,
    `\nTAGS: ${brief.topic_tags.join(", ")}`,
  ].join("\n");
}
