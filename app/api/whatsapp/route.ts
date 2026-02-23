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
    nombre_agente: "Sara",
    producto: "seguros de vida, auto y hogar",
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
      body: "Nuevo lead calificado!\n\nTelefono: " + telefono + "\n\nResumen:\n" + conversacion.slice(-500) + "\n\nContactalo pronto!",
    });
    console.log("Vendedor notificado:", config.numero_notificacion);
  } catch (err) {
    console.error("Error notificando vendedor:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mensaje = formData.get("Body") as string;
    const telefono = formData.get("From") as string;

    const config = await getConfig();

    const systemPrompt = "Eres " + config.nombre_agente + ", agente de ventas de " + config.producto + ". Tu tono es " + config.tono + ". Tu mision es calificar prospectos y conectarlos con un asesor humano. Horario: " + config.horario_contacto + ". Adapta tus preguntas al contexto del producto. Haz UNA pregunta a la vez. Cuando el prospecto muestre interes real, pregunta su nombre y el mejor horario para que un asesor le llame. Cuando tengas nombre y horario, confirma que un asesor le contactara. Responde en español, maximo 3 lineas. No des precios. " + (config.objeciones ? "Objeciones:\n" + config.objeciones : "");

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
      (textoRespuesta.toLowerCase().includes("llamar") || textoRespuesta.toLowerCase().includes("contactar"));

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
