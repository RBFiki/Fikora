import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { producto, empresa } = await request.json();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Genera un guion corto de manejo de objeciones para un agente de ventas de ${empresa || "una empresa"} que vende ${producto}.
Incluye 3-4 objeciones comunes con respuestas naturales y persuasivas.
Formato: "Si dice X: responde Y"
Maximo 150 palabras. Solo el texto, sin titulos ni explicaciones.`
      }],
      max_tokens: 200,
    });
    return NextResponse.json({ objeciones: res.choices[0].message.content });
  } catch {
    return NextResponse.json({ error: "Error generando objeciones" }, { status: 500 });
  }
}
