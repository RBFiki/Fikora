import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { estado } = await request.json();
    const { error } = await supabase
      .from("leads")
      .update({ estado })
      .eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error actualizando lead" }, { status: 500 });
  }
}
