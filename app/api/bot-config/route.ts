import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    const { error } = await supabase
      .from("bots")
      .upsert({
        id: "00000000-0000-0000-0000-000000000001",
        nombre_agente: config.nombre_agente,
        producto: config.producto,
        tono: config.tono,
        objeciones: config.objeciones,
        horario_contacto: config.horario_contacto,
        numero_notificacion: config.numero_notificacion,
        activo: true,
      });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error guardando config:", error);
    return NextResponse.json({ error: "Error guardando configuracion" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      nombre_agente: "Sara",
      producto: "seguros de vida, auto y hogar",
      tono: "profesional y amable",
      objeciones: "",
      horario_contacto: "Lunes a Viernes 9am - 6pm",
      numero_notificacion: "",
    });
  }
}
