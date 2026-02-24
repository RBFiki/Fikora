import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: campana } = await supabase
      .from("campanas")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!campana) return NextResponse.json({ error: "Campana no encontrada" }, { status: 404 });

    const { data: bot } = await supabase
      .from("bots")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .eq("campana_id", params.id)
      .eq("estado", "pendiente");

    if (!leads?.length) {
      return NextResponse.json({ error: "No hay leads pendientes" }, { status: 400 });
    }

    const agente = bot?.nombre_agente || "Sara";
    const empresa = bot?.nombre_empresa || "nuestra empresa";
    const producto = bot?.producto || "nuestros productos";

    const mensajeInicial = `Hola! Soy ${agente} de ${empresa}. Te contacto porque creemos que ${producto} puede ser justo lo que necesitas. ¿Tienes un momento para contarte más?`;

    let enviados = 0;
    const errores = [];

    for (const lead of leads) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: lead.telefono,
          body: (lead.nombre ? `Hola ${lead.nombre}! ` : "Hola! ") + `Soy ${agente} de ${empresa}. Te contacto porque creemos que ${producto} puede ser justo lo que necesitas. ¿Tienes un momento para contarte más?`,
        });

        await supabase.from("leads").update({
          estado: "contactado",
          mensaje_inicial: mensajeInicial,
          contactado_at: new Date().toISOString(),
        }).eq("id", lead.id);

        enviados++;
      } catch (err) {
        console.error("Error enviando a", lead.telefono, err);
        errores.push(lead.telefono);
      }
    }

    await supabase.from("campanas").update({
      estado: "activa",
      enviados,
    }).eq("id", params.id);

    return NextResponse.json({ ok: true, enviados, errores });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error iniciando campana" }, { status: 500 });
  }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: campana } = await supabase
      .from("campanas")
      .select("*")
      .eq("id", params.id)
      .single();

    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .eq("campana_id", params.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ campana, leads });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
