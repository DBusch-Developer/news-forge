import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const weekStart = getWeekStart();

    const { data: picks, error } = await supabase
      .from('weekly_picks')
      .select(
        `
        rank,
        reasoning,
        week_start,
        article:articles (
          id, source, source_url, title, excerpt, image_url, published_at
        )
      `
      )
      .eq('week_start', weekStart)
      .order('rank', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ picks: picks ?? [], week_start: weekStart });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}