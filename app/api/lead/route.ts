import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, empresa, email, telefono } = body;

    if (!nombre || !empresa || !email || !telefono) {
      return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
    }

    console.log("🎯 Nuevo lead:", { nombre, empresa, email, telefono, fecha: new Date().toISOString() });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
