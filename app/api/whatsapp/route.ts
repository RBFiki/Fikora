import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const conversaciones = new Map();

async function getConfig() {
  try {
    const { data } = await supabase
      .from("bots")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();
    return data ?? getDefaultConfig();
  } catch {
    return getDefaultConfig();
  }
}

function getDefaultConfig() {
  return {
    nombre_empresa: "nuestra empresa",
    nombre_agente: "Sara",
    producto: "",
    tono: "profesional y amable",
    objeciones: "",
    horario_contacto: "Lunes a Viernes 9am - 6pm",
    numero_notificacion: "",
  };
}

async function notificarVendedor(telefono: string, conversacion: string, config: any) {
  if (!config.numero_notificacion) return;
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:" + config.numero_notificacion,
      body: "Nuevo lead calificado en " + config.nombre_empresa + "!\n\nTelefono: " + telefono + "\n\n" + conversacion.slice(-500) + "\n\nContactalo pronto!",
    });
  } catch (err) {
    console.error("Error notificando:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mensaje = formData.get("Body") as string;
    const telefono = formData.get("From") as string;

    const config = await getConfig();

    const empresa = config.nombre_empresa || "nuestra empresa";
    const agente = config.nombre_agente || "Sara";
    const producto = config.producto || "nuestros productos";

    const systemPrompt = `Eres ${agente}, agente de ventas de ${empresa}.
Vendemos: ${producto}.
Tono: ${config.tono}.
Horario: ${config.horario_contacto}.

Tu mision es tener una conversacion natural, entender que necesita el cliente y conectarlo con un asesor cuando este listo.
- Adapta tus preguntas al contexto del producto.
- Haz UNA pregunta a la vez.
- Cuando el cliente muestre interes real, pregunta su nombre y el mejor horario para contactarle.
- Cuando tengas nombre y horario, confirma que un asesor le contactara pronto.
- Responde siempre en español, maximo 3 lineas.
- No des precios ni hagas promesas especificas.
${config.objeciones ? "\nManejo de objeciones:\n" + config.objeciones : ""}`;

    if (!conversaciones.has(telefono)) {
      conversaciones.set(telefono, []);
    }
    const historial = conversaciones.get(telefono);
    historial.push({ role: "user", content: mensaje });

    const respuesta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...historial],
      max_tokens: 200,
    });

    const textoRespuesta = respuesta.choices[0].message.content ?? "Disculpa, hubo un error.";
    historial.push({ role: "assistant", content: textoRespuesta });

    const estaCalificado = textoRespuesta.toLowerCase().includes("asesor") &&
      (textoRespuesta.toLowerCase().includes("llamar") || textoRespuesta.toLowerCase().includes("contactar") || textoRespuesta.toLowerCase().includes("pronto"));

    if (estaCalificado) {
      const conversacionCompleta = historial.map((m: any) => m.role + ": " + m.content).join("\n");
      await supabase.from("leads").insert({
        telefono,
        estado: "calificado",
        conversacion: conversacionCompleta,
        bot_id: null,
      });
      await notificarVendedor(telefono, conversacionCompleta, config);
    }

    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>' + textoRespuesta + '</Message></Response>';
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (error) {
    console.error("Error:", error);
    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Disculpa, hubo un error tecnico.</Message></Response>';
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }
}
