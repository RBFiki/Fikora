import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request: NextRequest) {
  try {
    const { nombre, empresa, email, telefono } = await request.json();
    if (!nombre || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
    }
    await supabase.from("demos").insert({ nombre, empresa, email, telefono });
    try {
      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: "whatsapp:" + process.env.FIKORA_ADMIN_WHATSAPP,
        body: "Nueva solicitud de demo!\n\nNombre: " + nombre + "\nEmpresa: " + (empresa || "No especificada") + "\nEmail: " + email + "\nTelefono: " + (telefono || "No especificado"),
      });
    } catch (err) {
      console.error("Error notificando:", err);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error guardando solicitud" }, { status: 500 });
  }
}
