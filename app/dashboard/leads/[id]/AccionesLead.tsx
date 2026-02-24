"use client";

import { useState, useEffect } from "react";

export default function AccionesLead({ id, estadoActual }: { id: string; estadoActual: string }) {
  const [estado, setEstado] = useState(estadoActual);
  const [cargando, setCargando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads/" + id)
      .then((r) => r.json())
      .then((data) => { if (data.estado) setEstado(data.estado); })
      .catch(() => {});
  }, [id]);

  const cambiarEstado = async (nuevoEstado: string) => {
    if (nuevoEstado === estado) return;
    setCargando(nuevoEstado);
    try {
      const res = await fetch("/api/leads/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) setEstado(nuevoEstado);
    } catch {
      console.error("Error cambiando estado");
    } finally {
      setCargando(null);
    }
  };

  const botones = [
    { estado: "calificado", label: "Calificado", activo: "bg-green-500/20 border-green-500 text-green-400", inactivo: "border-zinc-700 text-zinc-500 hover:border-green-500/30 hover:text-green-400" },
    { estado: "contactado", label: "Contactado", activo: "bg-blue-500/20 border-blue-500 text-blue-400", inactivo: "border-zinc-700 text-zinc-500 hover:border-blue-500/30 hover:text-blue-400" },
    { estado: "cerrado", label: "Venta cerrada", activo: "bg-purple-500/20 border-purple-500 text-purple-400", inactivo: "border-zinc-700 text-zinc-500 hover:border-purple-500/30 hover:text-purple-400" },
    { estado: "descartado", label: "Descartado", activo: "bg-zinc-700 border-zinc-500 text-zinc-300", inactivo: "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300" },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-white font-medium mb-4">Estado del lead</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {botones.map((btn) => (
          <button
            key={btn.estado}
            onClick={() => cambiarEstado(btn.estado)}
            disabled={cargando !== null}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              estado === btn.estado ? btn.activo : btn.inactivo
            }`}
          >
            {cargando === btn.estado ? "..." : btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
