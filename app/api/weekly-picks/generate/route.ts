import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateWeeklyPicks } from '@/lib/groq';

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

export async function POST() {
  try {
    const admin = createAdminClient();
    const weekStart = getWeekStart();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: articles } = await admin
      .from('articles')
      .select('id, title, source, excerpt')
      .gte('published_at', sevenDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(50);

    if (!articles || articles.length < 5) {
      return NextResponse.json(
        { error: 'Not enough articles in the last 7 days to curate' },
        { status: 422 }
      );
    }

    const picks = await generateWeeklyPicks(articles);

    const enrichedPicks = picks
      .slice(0, 5)
      .map((pick, idx) => {
        const article = articles[pick.article_index];
        if (!article) return null;
        return {
          week_start: weekStart,
          article_id: article.id,
          rank: idx + 1,
          reasoning: pick.reasoning,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (enrichedPicks.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate valid picks' },
        { status: 500 }
      );
    }

    // Replace this week's picks
    await admin.from('weekly_picks').delete().eq('week_start', weekStart);
    const { error: insertError } = await admin
      .from('weekly_picks')
      .insert(enrichedPicks);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      count: enrichedPicks.length,
      week_start: weekStart,
    });
  } catch (err) {
    console.error('Weekly picks generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}