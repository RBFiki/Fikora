import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { nombre_agente, nombre_empresa, producto, tono } = await request.json();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Genera el mensaje de saludo inicial de WhatsApp para un agente llamado ${nombre_agente} de ${nombre_empresa} que vende ${producto}.
Tono: ${tono || "profesional y amable"}.
El mensaje debe: presentarse con nombre y empresa, indicar brevemente qué venden, y preguntar en qué puede ayudar.
Maximo 2 lineas. Solo el mensaje, sin comillas.`
      }],
      max_tokens: 100,
    });
    return NextResponse.json({ mensaje: res.choices[0].message.content });
  } catch {
    return NextResponse.json({ error: "Error generando preview" }, { status: 500 });
  }
}
