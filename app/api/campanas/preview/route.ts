import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { nombre, nombreLead } = await request.json();

    const { data: bot } = await supabase
      .from("bots")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    const agente = bot?.nombre_agente || "Sara";
    const empresa = bot?.nombre_empresa || "nuestra empresa";
    const tono = bot?.tono || "profesional y amable";

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres ${agente} de ${empresa}. Tu tono es ${tono}.
Genera un mensaje de WhatsApp de apertura para una campaña llamada "${nombre}".
IMPORTANTE:
- El mensaje debe hablar SOLO del tema de la campaña: "${nombre}"
- NO menciones otros productos ni categorías
- Sé específico al tema de la campaña
- Máximo 3 líneas, natural y humano
- Termina con una pregunta abierta
- ${nombreLead ? `Empieza con "Hola ${nombreLead}!"` : 'Empieza con "Hola!"'}
Responde SOLO con el mensaje, sin comillas ni explicaciones.`
        }
      ],
      max_tokens: 150,
    });

    return NextResponse.json({ mensaje: res.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error generando preview" }, { status: 500 });
  }
}
