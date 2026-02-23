"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccionesLead({ id, estadoActual }: { id: string; estadoActual: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState<string | null>(null);

  const cambiarEstado = async (estado: string) => {
    setCargando(estado);
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      });
      router.refresh();
    } catch {
      console.error("Error cambiando estado");
    } finally {
      setCargando(null);
    }
  };

  const botones = [
    { estado: "calificado", label: "Calificado", color: "border-green-500/30 text-green-400 hover:bg-green-500/10" },
    { estado: "contactado", label: "Contactado", color: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" },
    { estado: "cerrado", label: "Venta cerrada", color: "border-purple-500/30 text-purple-400 hover:bg-purple-500/10" },
    { estado: "descartado", label: "Descartado", color: "border-zinc-600 text-zinc-500 hover:bg-zinc-800" },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-white font-medium mb-4">Cambiar estado</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {botones.map((btn) => (
          <button
            key={btn.estado}
            onClick={() => cambiarEstado(btn.estado)}
            disabled={estadoActual === btn.estado || cargando !== null}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors disabled:opacity-40 ${
              estadoActual === btn.estado
                ? btn.color + " opacity-100 cursor-default"
                : btn.color
            }`}
          >
            {cargando === btn.estado ? "..." : btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
