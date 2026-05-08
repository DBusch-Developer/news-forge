import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { scrapeArticle } from '@/lib/scraper';
import { generateBrief } from '@/lib/groq';
import { getFeedById } from '@/lib/rss';

export async function POST(req: NextRequest) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: 'Missing articleId' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: article, error: fetchError } = await admin
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Use cached full_text if we have it; otherwise scrape, cache, and use that.
    // Fall back to excerpt if scraping fails.
    let textForBrief = article.full_text;

    if (!textForBrief) {
      const scrape = await scrapeArticle(article.source_url);
      if (scrape.success) {
        textForBrief = scrape.text;
        await admin
          .from('articles')
          .update({ full_text: scrape.text })
          .eq('id', articleId);
      } else {
        textForBrief = article.excerpt;
      }
    }

    if (!textForBrief) {
      return NextResponse.json(
        { error: 'No article content available' },
        { status: 422 }
      );
    }

    const sourceName = getFeedById(article.source)?.name ?? article.source;
    const brief = await generateBrief({
      title: article.title,
      source: sourceName,
      text: textForBrief,
    });

    return NextResponse.json({ ok: true, brief });
  } catch (err) {
    console.error('Brief generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}