import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    const admin = createAdminClient();
    const { data } = await admin
      .from("articles")
      .select("*")
      .in("id", ids)
      .order("published_at", { ascending: false });

    return NextResponse.json({ articles: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}