import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";
import OpenAI from "openai";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generarMensaje(nombreLead: string | null, campana: string, agente: string, empresa: string, producto: string, tono: string): Promise<string> {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres ${agente} de ${empresa}. Tu tono es ${tono}. 
Genera un mensaje de WhatsApp de apertura para una campaña llamada "${campana}".
El mensaje debe:
- Ser corto (máximo 3 líneas)
- Sonar natural y humano, no como spam
- Mencionar brevemente el producto: ${producto}
- Terminar con una pregunta abierta que invite a responder
- ${nombreLead ? `Empezar con "Hola ${nombreLead}!"` : 'Empezar con "Hola!"'}
Responde SOLO con el mensaje, sin comillas ni explicaciones.`
        }
      ],
      max_tokens: 150,
    });
    return res.choices[0].message.content ?? "";
  } catch {
    const saludo = nombreLead ? `Hola ${nombreLead}!` : "Hola!";
    return `${saludo} Soy ${agente} de ${empresa}. Te escribo por nuestra campaña "${campana}" — tenemos algo especial en ${producto} que creo puede interesarte. ¿Tienes un momento?`;
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: campana } = await supabase
      .from("campanas")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!campana) return NextResponse.json({ error: "Campana no encontrada" }, { status: 404 });
    if (campana.estado !== "borrador") return NextResponse.json({ error: "La campaña ya fue iniciada" }, { status: 400 });

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

    if (!leads?.length) return NextResponse.json({ error: "No hay leads pendientes" }, { status: 400 });

    const agente = bot?.nombre_agente || "Sara";
    const empresa = bot?.nombre_empresa || "nuestra empresa";
    const producto = bot?.producto || "nuestros productos";
    const tono = bot?.tono || "profesional y amable";

    let enviados = 0;
    const errores = [];

    for (const lead of leads) {
      try {
        const mensaje = await generarMensaje(lead.nombre, campana.nombre, agente, empresa, producto, tono);

        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: lead.telefono,
          body: mensaje,
        });

        await supabase.from("leads").update({
          estado: "contactado",
          mensaje_inicial: mensaje,
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
