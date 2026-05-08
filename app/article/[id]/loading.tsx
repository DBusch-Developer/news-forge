export default function Loading() {
  return (
    <main className="max-w-[860px] mx-auto px-8 py-12">
      <div
        className="font-retro uppercase glow-green"
        style={{ fontSize: '20px', letterSpacing: '4px', color: 'var(--green)' }}
      >
        // Receiving transmission...
      </div>
      <div
        className="font-retro mt-3"
        style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '1px' }}
      >
        Scraping article. Takes a few seconds the first time.
      </div>
    </main>
  );
}