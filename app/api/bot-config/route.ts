import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data } = await supabase
      .from("bots")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    return NextResponse.json(data ?? {});
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: botExistente } = await supabase
      .from("bots")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (botExistente) {
      await supabase.from("bots").update(body).eq("id", botExistente.id);
    } else {
      await supabase.from("bots").insert({ ...body, user_id: "246fdf77-8e2d-4d43-b58d-d826eb1da9b4" });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
