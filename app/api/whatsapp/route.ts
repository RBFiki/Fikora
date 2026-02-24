import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function getConfig() {
  try {
    const { data } = await supabase.from("bots").select("*").eq("id", "00000000-0000-0000-0000-000000000001").single();
    return data ?? getDefaultConfig();
  } catch { return getDefaultConfig(); }
}

function getDefaultConfig() {
  return { nombre_empresa: "nuestra empresa", nombre_agente: "Sara", producto: "", tono: "profesional y amable", objeciones: "", horario_contacto: "Lunes a Viernes 9am - 6pm", numero_notificacion: "" };
}

async function getHistorial(telefono: string) {
  try {
    const { data } = await supabase.from("conversaciones").select("historial").eq("telefono", telefono).single();
    return data?.historial ?? [];
  } catch { return []; }
}

async function saveHistorial(telefono: string, historial: any[]) {
  await supabase.from("conversaciones").upsert({ telefono, historial, updated_at: new Date().toISOString() });
}

async function extraerDatos(historial: any[]): Promise<{ nombre: string | null; horario: string | null }> {
  try {
    const conversacion = historial.map((m) => m.role + ": " + m.content).join("\n");
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extrae el nombre y horario preferido del cliente de esta conversacion. 
Responde SOLO con JSON valido en este formato exacto:
{"nombre": "Rafael", "horario": "en 1 hora"}
Si no encuentras el dato, usa null.
{"nombre": null, "horario": null}`
        },
        { role: "user", content: conversacion }
      ],
      max_tokens: 50,
    });
    const texto = res.choices[0].message.content ?? "{}";
    const limpio = texto.replace(/```json|```/g, "").trim();
    return JSON.parse(limpio);
  } catch {
    return { nombre: null, horario: null };
  }
}

async function notificarVendedor(telefono: string, nombre: string | null, conversacion: string, config: any) {
  if (!config.numero_notificacion) return;
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:" + config.numero_notificacion,
      body: "Nuevo lead en " + config.nombre_empresa + "!\n\n" +
        (nombre ? "Nombre: " + nombre + "\n" : "") +
        "Telefono: " + telefono + "\n\n" +
        conversacion.slice(-400) + "\n\nContactalo pronto!",
    });
  } catch (err) { console.error("Error notificando:", err); }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mensaje = formData.get("Body") as string;
    const telefono = formData.get("From") as string;

    const config = await getConfig();
    const historial = await getHistorial(telefono);

    const systemPrompt = `Eres ${config.nombre_agente || "Sara"}, agente de ventas de ${config.nombre_empresa || "nuestra empresa"}.
Vendemos: ${config.producto || "nuestros productos"}.
Tono: ${config.tono}.
Horario de atencion: ${config.horario_contacto}.
Tu mision es tener una conversacion natural y conectar al cliente con un asesor cuando este listo.
- Haz UNA pregunta a la vez.
- Cuando el cliente muestre interes, pregunta su nombre y horario para contactarle.
- Cuando tengas nombre y horario, confirma que un asesor le contactara pronto.
- Responde en español, maximo 3 lineas. No des precios.
${config.objeciones ? "\nObjeciones:\n" + config.objeciones : ""}`;

    historial.push({ role: "user", content: mensaje });

    const respuesta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...historial],
      max_tokens: 200,
    });

    const textoRespuesta = respuesta.choices[0].message.content ?? "Disculpa, hubo un error.";
    historial.push({ role: "assistant", content: textoRespuesta });
    await saveHistorial(telefono, historial);

    const estaCalificado = textoRespuesta.toLowerCase().includes("asesor") &&
      (textoRespuesta.toLowerCase().includes("contactar") || textoRespuesta.toLowerCase().includes("llamar") || textoRespuesta.toLowerCase().includes("pronto"));

    if (estaCalificado) {
      const { nombre, horario } = await extraerDatos(historial);
      const conversacionCompleta = historial.map((m: any) => m.role + ": " + m.content).join("\n");
      await supabase.from("leads").insert({
        telefono,
        nombre,
        horario_preferido: horario,
        estado: "calificado",
        conversacion: conversacionCompleta,
        bot_id: null,
      });
      await notificarVendedor(telefono, nombre, conversacionCompleta, config);
    }

    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>' + textoRespuesta + '</Message></Response>';
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (error) {
    console.error("Error:", error);
    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Disculpa, hubo un error tecnico.</Message></Response>';
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }
}
