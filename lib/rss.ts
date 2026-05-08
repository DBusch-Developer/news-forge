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
