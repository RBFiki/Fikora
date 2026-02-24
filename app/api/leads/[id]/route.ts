import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("estado")
      .eq("id", params.id)
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { estado } = await request.json();
    const { error } = await supabase
      .from("leads")
      .update({ estado })
      .eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error actualizando" }, { status: 500 });
  }
}
