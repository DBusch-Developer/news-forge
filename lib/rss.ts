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
