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

  const campos = [
    { key: "nombre_agente", label: "Nombre del agente", placeholder: "Sofia, Carlos, Sara..." },
    { key: "nombre_empresa", label: "Nombre de la empresa", placeholder: "DenSeguros, Indigal..." },
    { key: "producto", label: "Producto o servicio", placeholder: "seguros de vida, hogar y vehiculos..." },
    { key: "tono", label: "Tono de comunicacion", placeholder: "profesional y cercano, amigable, formal..." },
    { key: "horario_contacto", label: "Horario de atencion", placeholder: "Lunes a Viernes 9am - 6pm" },
    { key: "numero_notificacion", label: "WhatsApp para notificaciones", placeholder: "+57 300 123 4567" },
    { key: "calendly_link", label: "Link de Calendly", placeholder: "https://calendly.com/tu-empresa/reunion" },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Configuracion</h1>
          <p className="text-zinc-400 text-sm mt-1">Personaliza tu agente de ventas</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          {campos.map((campo) => (
            <div key={campo.key}>
              <label className="block text-zinc-400 text-xs mb-2">{campo.label}</label>
              <input
                value={form[campo.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}
                placeholder={campo.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>
          ))}

          <div>
            <label className="block text-zinc-400 text-xs mb-2">Manejo de objeciones</label>
            <textarea
              value={form.objeciones}
              onChange={(e) => setForm({ ...form, objeciones: e.target.value })}
              placeholder="Ej: Si dice que es caro, menciona que tenemos planes desde $50/mes..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm resize-none"
            />
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
