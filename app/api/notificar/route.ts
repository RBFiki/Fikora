import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { telefono_lead, resumen } = await request.json();

    const numeroVendedor = process.env.VENDEDOR_WHATSAPP;
    if (!numeroVendedor) throw new Error("VENDEDOR_WHATSAPP no configurado");

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:" + numeroVendedor,
      body: "Nuevo lead calificado!\n\nTelefono: " + telefono_lead + "\n\n" + resumen + "\n\nContactalo pronto!",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error notificando:", error);
    return NextResponse.json({ error: "Error enviando notificacion" }, { status: 500 });
  }
}
