"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Nav() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <nav style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-5 md:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl md:text-3xl uppercase tracking-wider"
          onClick={close}
        >
          <span className="glow-cyan" style={{ color: "var(--cyan)" }}>NEWS</span>
          <span className="glow-pink" style={{ color: "var(--pink)" }}>FORGE</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <Link href="/" className="nav-link">// Feed</Link>
          <Link href="/top" className="nav-link">// Top</Link>
          <Link href="/saved" className="nav-link">// Saved</Link>
          <button className="btn-pink-outline">Sign in</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          style={{
            background: "transparent",
            border: "1px solid var(--cyan)",
            borderRadius: "4px",
            padding: "8px",
            cursor: "pointer",
            color: "var(--cyan)",
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div
          className="md:hidden"
          style={{
            background: "var(--bg-card)",
            borderTop: "1px solid var(--border)",
            padding: "1.25rem 1.5rem 1.5rem",
          }}
        >
          <div className="flex flex-col gap-5">
            <Link href="/" className="nav-link" onClick={close} style={{ fontSize: "22px" }}>
              // Feed
            </Link>
            <Link href="/top" className="nav-link" onClick={close} style={{ fontSize: "22px" }}>
              // Top
            </Link>
            <Link href="/saved" className="nav-link" onClick={close} style={{ fontSize: "22px" }}>
              // Saved
            </Link>
            <button
              className="btn-pink-outline"
              style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
            >
              Sign in
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}