import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function getConfig() {
  try {
    const { data } = await supabase.from("bots").select("*").order("created_at", { ascending: true }).limit(1).single();
    return data ?? defaultConfig();
  } catch { return defaultConfig(); }
}

function defaultConfig() {
  return { nombre_empresa: "nuestra empresa", nombre_agente: "Sara", producto: "", tono: "profesional y amable", objeciones: "", horario_contacto: "Lunes a Viernes 9am-6pm", numero_notificacion: "", calendly_link: "" };
}

async function getHistorial(telefono: string) {
  try {
    const { data } = await supabase.from("conversaciones").select("historial").eq("telefono", telefono).single();
    return data?.historial ?? [];
  } catch { return []; }
}

async function saveHistorial(telefono: string, historial: any[]) {
  try {
    await supabase.from("conversaciones").upsert({ telefono, historial, updated_at: new Date().toISOString() });
  } catch (err) { console.error("Error guardando historial:", err); }
}

async function analizarConversacion(historial: any[]): Promise<{ nombre: string | null; horario: string | null; calificado: boolean; }> {
  try {
    const conversacion = historial.map((m) => m.role + ": " + m.content).join("\n");
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `Analiza esta conversacion de ventas y responde SOLO con JSON valido:
{"nombre": "nombre del cliente o null", "horario": "horario preferido o null", "calificado": true o false}

Un lead esta CALIFICADO solo si SE CUMPLEN LAS TRES condiciones:
1. El cliente mostro interes claro y especifico en el producto
2. El cliente dio su nombre
3. El agente confirmo que un asesor lo va a contactar

Si falta CUALQUIERA, calificado debe ser false.`
      }, { role: "user", content: conversacion }],
      max_tokens: 100,
    });
    return JSON.parse(res.choices[0].message.content?.replace(/```json|```/g, "").trim() ?? "{}");
  } catch { return { nombre: null, horario: null, calificado: false }; }
}

async function leadYaExiste(telefono: string): Promise<boolean> {
  try {
    const hace1hora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from("leads").select("id").eq("telefono", telefono).eq("tipo", "inbound").gte("created_at", hace1hora);
    return (data?.length ?? 0) > 0;
  } catch { return false; }
}

async function notificarVendedor(telefono: string, nombre: string | null, conversacion: string, config: any) {
  if (!config.numero_notificacion) return;
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:" + config.numero_notificacion,
      body: "Nuevo lead calificado en " + config.nombre_empresa + "!\n\n" +
        (nombre ? "Nombre: " + nombre + "\n" : "") +
        "Telefono: " + telefono.replace("whatsapp:", "") + "\n\n" +
        "Ultimo mensaje:\n" + conversacion.slice(-300),
    });
  } catch (err) { console.error("Error notificando:", err); }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mensaje = formData.get("Body") as string;
    const telefono = formData.get("From") as string;

    const [config, historial] = await Promise.all([getConfig(), getHistorial(telefono)]);

    const esPrimerMensaje = historial.length === 0;
    const calendlyInstruccion = config.calendly_link
      ? `Cuando el cliente confirme su disponibilidad para hablar con un asesor, incluye este link para agendar la cita: ${config.calendly_link}`
      : "";

    const systemPrompt = `Eres ${config.nombre_agente}, agente de ventas de ${config.nombre_empresa}.
Vendemos: ${config.producto || "nuestros productos"}.
Tono: ${config.tono}.
Horario de atencion: ${config.horario_contacto}.

${esPrimerMensaje ? `PRIMER MENSAJE: Preséntate diciendo tu nombre y de qué empresa eres. Ejemplo: "¡Hola! Soy ${config.nombre_agente} de ${config.nombre_empresa}. ${config.producto ? `Te puedo ayudar con ${config.producto}.` : ""} ¿En qué te puedo ayudar?"` : ""}

Tu mision es calificar prospectos siguiendo ESTE ORDEN:
1. Presentate con tu nombre y empresa (solo en el primer mensaje)
2. Entiende que necesita el cliente
3. Pregunta su nombre
4. Pregunta cuando puede hablar con un asesor
5. Confirma que un asesor lo contactara pronto
${calendlyInstruccion}

IMPORTANTE: Haz UNA pregunta a la vez. Maximo 3 lineas. No des precios.
${config.objeciones ? "\nManejo de objeciones:\n" + config.objeciones : ""}`;

    historial.push({ role: "user", content: mensaje });

    const respuesta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...historial],
      max_tokens: 200,
    });

    const textoRespuesta = respuesta.choices[0].message.content ?? "Disculpa, hubo un error.";
    historial.push({ role: "assistant", content: textoRespuesta });
    await saveHistorial(telefono, historial);

    const yaExiste = await leadYaExiste(telefono);
    if (!yaExiste) {
      const analisis = await analizarConversacion(historial);
      if (analisis.calificado) {
        const conversacionCompleta = historial.map((m: any) => m.role + ": " + m.content).join("\n");
        await supabase.from("leads").insert({
          telefono, nombre: analisis.nombre, horario_preferido: analisis.horario,
          estado: "calificado", conversacion: conversacionCompleta, tipo: "inbound",
        });
        await notificarVendedor(telefono, analisis.nombre, conversacionCompleta, config);
      }
    }

    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>' + textoRespuesta + '</Message></Response>';
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (error) {
    console.error("Error:", error);
    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Disculpa, hubo un error tecnico.</Message></Response>';
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }
}
