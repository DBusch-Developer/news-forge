export type FeedConfig = {
  id: string;
  name: string;
  url: string;
};

export const FEEDS: FeedConfig[] = [
  {
    id: "verge",
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    id: "mit-tech-review",
    name: "MIT Tech Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
  },
  {
    id: "ars-technica",
    name: "Ars Technica",
    url: "https://arstechnica.com/ai/feed/",
  },
];

export function getFeedById(id: string): FeedConfig | undefined {
  return FEEDS.find((f) => f.id === id);
}

type RawItem = Record<string, unknown> & {
  enclosure?: { url?: string; type?: string };
  mediaContent?: Array<{ $?: { url?: string } }>;
  mediaThumbnail?: Array<{ $?: { url?: string } }>;
  content?: string;
  contentEncoded?: string;
};

export function extractImage(item: unknown): string | null {
  const i = item as RawItem;

  // 1. media:content (Media RSS — most major outlets)
  if (i.mediaContent?.length) {
    const url = i.mediaContent[0]?.$?.url;
    if (url) return url;
  }

  // 2. media:thumbnail
  if (i.mediaThumbnail?.length) {
    const url = i.mediaThumbnail[0]?.$?.url;
    if (url) return url;
  }

  // 3. enclosure (RSS 2.0 standard, must be image type)
  if (i.enclosure?.url && i.enclosure.type?.startsWith('image/')) {
    return i.enclosure.url;
  }

  // 4. First <img> in content
  const html = i.contentEncoded || i.content || '';
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  if (match) return match[1];

  return null;
}

export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const html = await response.text();

    // 1. og:image / twitter:image — flexible attribute order
    const metaImage =
      findMeta(html, 'og:image') ||
      findMeta(html, 'og:image:secure_url') ||
      findMeta(html, 'twitter:image') ||
      findMeta(html, 'twitter:image:src');
    if (metaImage) return resolveUrl(metaImage, url);

    // 2. JSON-LD structured data (where MIT and many serious publishers hide it)
    const jsonLdImage = extractJsonLdImage(html);
    if (jsonLdImage) return resolveUrl(jsonLdImage, url);

    // 3. First content <img> that isn't a logo/icon/tracker
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (/logo|icon|avatar|sprite|tracker|pixel|spacer/i.test(src)) continue;
      if (src.startsWith('data:')) continue;
      return resolveUrl(src, url);
    }

    return null;
  } catch {
    return null;
  }
}

function findMeta(html: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Tries property=, name=, in either attribute order
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

function extractJsonLdImage(html: string): string | null {
  const scriptRegex =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      const found = findImageInJson(data);
      if (found) return found;
    } catch {
      // skip malformed JSON-LD blocks
    }
  }
  return null;
}

function findImageInJson(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.image === 'string') return o.image;
  if (Array.isArray(o.image) && typeof o.image[0] === 'string') return o.image[0] as string;
  if (o.image && typeof o.image === 'object') {
    const url = (o.image as Record<string, unknown>).url;
    if (typeof url === 'string') return url;
  }
  if (Array.isArray(o['@graph'])) {
    for (const item of o['@graph'] as unknown[]) {
      const found = findImageInJson(item);
      if (found) return found;
    }
  }
  return null;
}

function resolveUrl(src: string, base: string): string | null {
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}