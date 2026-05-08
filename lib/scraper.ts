import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

type ScrapeResult = {
  text: string;
  byline: string | null;
  success: boolean;
  error?: string;
};

export async function scrapeArticle(url: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { text: '', byline: null, success: false, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      return { text: '', byline: null, success: false, error: 'No readable content found' };
    }

    return {
      text: article.textContent.trim(),
      byline: article.byline ?? null,
      success: true,
    };
  } catch (err) {
    return {
      text: '',
      byline: null,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}