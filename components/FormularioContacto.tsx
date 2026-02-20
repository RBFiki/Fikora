"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormularioContacto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value,
      empresa: (form.elements.namedItem("empresa") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      telefono: (form.elements.namedItem("telefono") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al enviar");
      router.push("/gracias");
    } catch {
      setError("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contacto" className="bg-zinc-900 py-32 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-green-400 text-sm font-medium tracking-widest uppercase">Empieza hoy</span>
            <h2 className="mt-3 text-4xl font-bold text-white mb-6">
              Agenda una demo<br />en 30 minutos.
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Te mostramos el agente funcionando en vivo con tu producto. Sin PowerPoints, sin promesas vacías.
            </p>
            <ul className="space-y-3">
              {[
                "Demo en vivo con tu caso de uso",
                "Estimado de leads que puedes contactar",
                "Sin compromiso de contratación",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-zinc-300">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 space-y-5">
            {[
              { name: "nombre", label: "Nombre completo", type: "text", placeholder: "Ana García" },
              { name: "empresa", label: "Empresa", type: "text", placeholder: "Acme S.A." },
              { name: "email", label: "Email", type: "email", placeholder: "ana@empresa.com" },
              { name: "telefono", label: "WhatsApp / Teléfono", type: "tel", placeholder: "+52 55 1234 5678" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-zinc-300 mb-2">{field.label}</label>
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required
                  disabled={loading}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                />
              </div>
            ))}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Enviando...</>
              ) : (
                "Quiero ver la demo →"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
