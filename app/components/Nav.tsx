import Link from "next/link";

export function Nav() {
  return (
    <nav style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-3xl uppercase tracking-wider">
          <span className="glow-cyan" style={{ color: "var(--cyan)" }}>NEWS</span>
          <span className="glow-pink" style={{ color: "var(--pink)" }}>FORGE</span>
        </Link>

        <div className="flex items-center gap-7">
          <Link href="/" className="nav-link">// Feed</Link>
          <Link href="/top" className="nav-link">// Top</Link>
          <Link href="/saved" className="nav-link">// Saved</Link>
          <button className="btn-pink-outline">Sign in</button>
        </div>
      </div>
    </nav>
  );
}