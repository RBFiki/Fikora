"use client";

import { useState } from "react";

export default function FormularioContacto() {
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", telefono: "" });
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) { setError("Nombre y email son requeridos"); return; }
    setCargando(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setEnviado(true);
    } catch {
      setError("Hubo un error. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (enviado) {
    return (
      <section className="bg-zinc-950 py-24 px-6" id="demo">
        <div className="max-w-5xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">Solicitud recibida</h3>
            <p className="text-zinc-400">Te contactamos en menos de 24 horas para agendar tu demo.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-950 py-24 px-6" id="demo">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-green-400 text-sm font-medium tracking-wide uppercase">Empieza hoy</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">Agenda una demo<br />en 30 minutos.</h2>
            <p className="text-zinc-400 mb-8">Te mostramos el agente funcionando en vivo con tu producto. Sin PowerPoints, sin promesas vacías.</p>
            <ul className="space-y-3">
              {["Demo en vivo con tu caso de uso", "Estimado de leads que puedes contactar", "Sin compromiso de contratación"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="space-y-4">
              {[
                { name: "nombre", label: "Nombre completo", placeholder: "Ana García" },
                { name: "empresa", label: "Empresa", placeholder: "Acme S.A." },
                { name: "email", label: "Email", placeholder: "ana@empresa.com", type: "email" },
                { name: "telefono", label: "WhatsApp / Teléfono", placeholder: "+52 55 1234 5678" },
              ].map((campo) => (
                <div key={campo.name}>
                  <label className="block text-zinc-400 text-xs mb-2">{campo.label}</label>
                  <input
                    type={campo.type ?? "text"}
                    name={campo.name}
                    value={form[campo.name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={campo.placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={cargando}
              className="w-full mt-6 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors text-sm"
            >
              {cargando ? "Enviando..." : "Quiero ver la demo →"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
