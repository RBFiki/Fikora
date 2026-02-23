import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { producto } = await request.json();
    const respuesta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: "Genera exactamente 5 objeciones comunes para un vendedor de " + producto + " y como manejarlas. Formato: Si dicen que [objecion]: [como responder en una frase]. Una por linea, sin numeracion, solo las 5 lineas."
      }],
      max_tokens: 300,
    });
    const objeciones = respuesta.choices[0].message.content ?? "";
    return NextResponse.json({ objeciones });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error generando objeciones" }, { status: 500 });
  }
}
