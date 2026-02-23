"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Configuracion() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generando, setGenerando] = useState(false);
  const [config, setConfig] = useState({
    nombre_agente: "Aura",
    producto: "seguros de vida, auto y hogar",
    tono: "profesional y amable",
    objeciones: "",
    horario_contacto: "Lunes a Viernes 9am - 6pm",
    numero_notificacion: "",
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem("bot_config");
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setGuardado(false);
    setErrorMsg("");
  };

  const handleGenerarObjeciones = async () => {
    if (!config.producto) return;
    setGenerando(true);
    try {
      const res = await fetch("/api/generar-objeciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto: config.producto }),
      });
      const data = await res.json();
      if (data.objeciones) {
        setConfig({ ...config, objeciones: data.objeciones });
        setGuardado(false);
      }
    } catch {
      setErrorMsg("No se pudieron generar las objeciones.");
    } finally {
      setGenerando(false);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/bot-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Error del servidor");
      localStorage.setItem("bot_config", JSON.stringify(config));
      setGuardado(true);
    } catch {
      setErrorMsg("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Configuracion del bot</h1>
          <p className="text-zinc-400 text-sm">Los cambios se aplican de inmediato</p>
        </div>

        <div className="space-y-6">
          {[
            { name: "nombre_agente", label: "Nombre del agente", placeholder: "Aura" },
            { name: "producto", label: "Producto o servicio que vende", placeholder: "Seguros de vida, auto y hogar" },
            { name: "tono", label: "Tono de comunicacion", placeholder: "Profesional y amable" },
            { name: "horario_contacto", label: "Horario de atencion", placeholder: "Lunes a Viernes 9am - 6pm" },
          ].map((campo) => (
            <div key={campo.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-zinc-300 mb-3">{campo.label}</label>
              <input
                name={campo.name}
                value={config[campo.name as keyof typeof config]}
                onChange={handleChange}
                placeholder={campo.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>
          ))}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-zinc-300">Manejo de objeciones</label>
              <button
                onClick={handleGenerarObjeciones}
                disabled={generando || !config.producto}
                className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-lg transition-colors"
              >
                {generando ? <><span className="animate-spin">⟳</span> Generando...</> : "✨ Generar con IA"}
              </button>
            </div>
            <textarea
              name="objeciones"
              value={config.objeciones}
              onChange={handleChange}
              placeholder="Haz clic en Generar con IA o escribe tus objeciones..."
              rows={6}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none text-sm"
            />
          </div>

          <div className="bg-zinc-900 border border-amber-500/20 rounded-xl p-6">
            <label className="block text-sm font-medium text-amber-400 mb-1">Numero de WhatsApp para notificaciones</label>
            <p className="text-zinc-500 text-xs mb-3">Cuando tu agente califique un lead, te avisamos aqui inmediatamente</p>
            <input
              name="numero_notificacion"
              value={config.numero_notificacion}
              onChange={handleChange}
              placeholder="+57 300 123 4567"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Vista previa del primer mensaje</h3>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-green-400 text-sm">
                Hola! Soy {config.nombre_agente}, agente de ventas de {config.producto}. Me gustaria conocer tus necesidades. En que te puedo ayudar hoy?
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {guardando ? <><span className="animate-spin">⟳</span> Guardando...</> : guardado ? "✓ Cambios guardados" : "Guardar configuracion"}
          </button>
        </div>
      </div>
    </main>
  );
}
