import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("campanas")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error obteniendo campanas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre, leads } = await request.json();
    if (!nombre || !leads?.length) {
      return NextResponse.json({ error: "Nombre y leads son requeridos" }, { status: 400 });
    }

    const { data: campana, error: errorCampana } = await supabase
      .from("campanas")
      .insert({ nombre, total_leads: leads.length, estado: "borrador" })
      .select()
      .single();
    if (errorCampana) throw errorCampana;

    const leadsParaInsertar = leads.map((lead: { nombre: string; telefono: string }) => ({
      nombre: lead.nombre,
      telefono: lead.telefono.startsWith("whatsapp:") ? lead.telefono : "whatsapp:" + lead.telefono,
      estado: "pendiente",
      tipo: "outbound",
      campana_id: campana.id,
    }));

    const { error: errorLeads } = await supabase.from("leads").insert(leadsParaInsertar);
    if (errorLeads) throw errorLeads;

    return NextResponse.json({ ok: true, campana });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error creando campana" }, { status: 500 });
  }
}
