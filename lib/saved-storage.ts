const KEY = "newsforge_saved";

export function getSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isArticleSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export function toggleSavedArticle(id: string): boolean {
  const current = getSavedIds();
  const updated = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated.includes(id);
}