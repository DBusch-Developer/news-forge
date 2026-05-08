import * as cheerio from 'cheerio';

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
      return {
        text: '',
        byline: null,
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Strip non-content elements
    $(
      'script, style, nav, header, footer, aside, form, button, ' +
        '[class*="ad-"], [class*="ads-"], [class*="advert"], [id*="ad-"], ' +
        '[class*="related"], [class*="recommended"], [class*="newsletter"], ' +
        '[class*="comments"], [class*="social"], [class*="share"], ' +
        '[class*="sidebar"], [aria-hidden="true"]'
    ).remove();

    // Try common article container selectors in order of preference
    const selectors = [
      'article',
      '[role="article"]',
      'main article',
      '.article-body',
      '.article-content',
      '.entry-content',
      '.post-content',
      '.story-body',
      '.content-body',
      'main',
    ];

    let bestText = '';
    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const text = $(el)
          .find('p, h2, h3, h4, li, blockquote')
          .map((_, p) => $(p).text().trim())
          .get()
          .filter((t) => t.length > 20)
          .join('\n\n');
        if (text.length > bestText.length) {
          bestText = text;
        }
      });
      if (bestText.length > 500) break; // good enough, stop searching
    }

    // Fallback: all body paragraphs
    if (bestText.length < 200) {
      bestText = $('body p')
        .map((_, p) => $(p).text().trim())
        .get()
        .filter((t) => t.length > 30)
        .join('\n\n');
    }

    // Clean whitespace
    bestText = bestText
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const byline =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('[rel="author"]').first().text().trim() ||
      null;

    if (!bestText || bestText.length < 100) {
      return {
        text: '',
        byline: null,
        success: false,
        error: 'Insufficient content extracted',
      };
    }

    return { text: bestText, byline, success: true };
  } catch (err) {
    return {
      text: '',
      byline: null,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}