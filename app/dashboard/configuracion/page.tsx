"use client";

import { useState, useEffect } from "react";

export default function Configuracion() {
  const [form, setForm] = useState({
    nombre_agente: "",
    nombre_empresa: "",
    producto: "",
    tono: "",
    objeciones: "",
    horario_contacto: "",
    numero_notificacion: "",
    calendly_link: "",
  });
  const [cargando, setCargando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [generandoObjeciones, setGenerandoObjeciones] = useState(false);
  const [previewMensaje, setPreviewMensaje] = useState("");
  const [generandoPreview, setGenerandoPreview] = useState(false);

  useEffect(() => {
    fetch("/api/bot-config")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setForm((prev) => ({ ...prev, ...data }));
      });
  }, []);

  const guardar = async () => {
    setCargando(true);
    setGuardado(false);
    try {
      await fetch("/api/bot-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } finally {
      setCargando(false);
    }
  };

  const generarObjeciones = async () => {
    if (!form.producto) return;
    setGenerandoObjeciones(true);
    try {
      const res = await fetch("/api/bot-config/objeciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto: form.producto, empresa: form.nombre_empresa }),
      });
      const data = await res.json();
      if (data.objeciones) setForm((prev) => ({ ...prev, objeciones: data.objeciones }));
    } finally {
      setGenerandoObjeciones(false);
    }
  };

  const generarPreview = async () => {
    if (!form.nombre_agente || !form.nombre_empresa) return;
    setGenerandoPreview(true);
    try {
      const res = await fetch("/api/bot-config/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.mensaje) setPreviewMensaje(data.mensaje);
    } finally {
      setGenerandoPreview(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Configuracion</h1>
          <p className="text-zinc-400 text-sm mt-1">Personaliza tu agente de ventas</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-2">Nombre del agente</label>
              <input
                value={form.nombre_agente}
                onChange={(e) => setForm({ ...form, nombre_agente: e.target.value })}
                placeholder="Sofia, Carlos, Sara..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-2">Nombre de la empresa</label>
              <input
                value={form.nombre_empresa}
                onChange={(e) => setForm({ ...form, nombre_empresa: e.target.value })}
                placeholder="DenSeguros, Indigal..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-2">Producto o servicio</label>
            <input
              value={form.producto}
              onChange={(e) => setForm({ ...form, producto: e.target.value })}
              placeholder="seguros de vida, hogar y vehiculos..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-2">Tono de comunicacion</label>
            <input
              value={form.tono}
              onChange={(e) => setForm({ ...form, tono: e.target.value })}
              placeholder="profesional y cercano, amigable, formal..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-2">Horario de atencion</label>
            <input
              value={form.horario_contacto}
              onChange={(e) => setForm({ ...form, horario_contacto: e.target.value })}
              placeholder="Lunes a Viernes 9am - 6pm"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-2">WhatsApp para notificaciones</label>
            <input
              value={form.numero_notificacion}
              onChange={(e) => setForm({ ...form, numero_notificacion: e.target.value })}
              placeholder="+57 300 123 4567"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-2">Link de Calendly</label>
            <input
              value={form.calendly_link}
              onChange={(e) => setForm({ ...form, calendly_link: e.target.value })}
              placeholder="https://calendly.com/tu-empresa/reunion"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-zinc-400 text-xs">Manejo de objeciones</label>
              <button
                onClick={generarObjeciones}
                disabled={!form.producto || generandoObjeciones}
                className="text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {generandoObjeciones ? "Generando..." : "✨ Generar con IA"}
              </button>
            </div>
            <textarea
              value={form.objeciones}
              onChange={(e) => setForm({ ...form, objeciones: e.target.value })}
              placeholder="Ej: Si dice que es caro, menciona que tenemos planes desde $50/mes..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm resize-none"
            />
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-zinc-400 text-sm font-medium">Preview del saludo inicial</p>
              <button
                onClick={generarPreview}
                disabled={!form.nombre_agente || !form.nombre_empresa || generandoPreview}
                className="text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {generandoPreview ? "Generando..." : "✨ Ver preview"}
              </button>
            </div>
            {previewMensaje && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                <p className="text-green-400 text-sm">{previewMensaje}</p>
              </div>
            )}
          </div>

          <button
            onClick={guardar}
            disabled={cargando}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            {cargando ? "Guardando..." : guardado ? "✓ Guardado" : "Guardar configuracion"}
          </button>
        </div>
      </div>
    </main>
  );
}
