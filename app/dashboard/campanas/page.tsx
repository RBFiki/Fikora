"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Lead { nombre: string; telefono: string; }
interface Campana { id: string; nombre: string; estado: string; total_leads: number; enviados: number; respondidos: number; created_at: string; }

export default function Campanas() {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [leads, setLeads] = useState<Lead[]>([{ nombre: "", telefono: "" }]);
  const [cargando, setCargando] = useState(false);
  const [iniciando, setIniciando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { cargarCampanas(); }, []);

  const cargarCampanas = async () => {
    const res = await fetch("/api/campanas");
    const data = await res.json();
    if (Array.isArray(data)) setCampanas(data);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lineas = text.split("\n").filter((l) => l.trim());
      const parsed = lineas.slice(1).map((linea) => {
        const [nombre, telefono] = linea.split(",").map((s) => s.trim().replace(/"/g, ""));
        return { nombre: nombre || "", telefono: telefono || "" };
      }).filter((l) => l.telefono);
      if (parsed.length) setLeads(parsed);
    };
    reader.readAsText(file);
  };

  const agregarLead = () => setLeads([...leads, { nombre: "", telefono: "" }]);
  const actualizarLead = (i: number, campo: keyof Lead, valor: string) => {
    const nuevos = [...leads];
    nuevos[i][campo] = valor;
    setLeads(nuevos);
  };
  const eliminarLead = (i: number) => setLeads(leads.filter((_, idx) => idx !== i));

  const crearCampana = async () => {
    if (!nombre || !leads.filter((l) => l.telefono).length) return;
    setCargando(true);
    try {
      const res = await fetch("/api/campanas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, leads: leads.filter((l) => l.telefono) }),
      });
      if (!res.ok) throw new Error();
      setCreando(false);
      setNombre("");
      setLeads([{ nombre: "", telefono: "" }]);
      setMensaje("Campaña creada. Cuando estés listo presiona Iniciar.");
      cargarCampanas();
    } catch {
      setMensaje("Error creando la campaña.");
    } finally {
      setCargando(false);
    }
  };

  const iniciarCampana = async (id: string) => {
    setIniciando(id);
    try {
      const res = await fetch("/api/campanas/" + id, { method: "POST" });
      const data = await res.json();
      if (data.ok) setMensaje("Campaña iniciada. " + data.enviados + " mensajes enviados.");
      else setMensaje(data.error ?? "Error iniciando campaña.");
      cargarCampanas();
    } catch {
      setMensaje("Error iniciando campaña.");
    } finally {
      setIniciando(null);
    }
  };

  const estadoColor: Record<string, string> = {
    borrador: "bg-zinc-700/50 border-zinc-600 text-zinc-400",
    activa: "bg-green-500/10 border-green-500/30 text-green-400",
    completada: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Campañas</h1>
            <p className="text-zinc-400 text-sm">Contacta leads de forma proactiva</p>
          </div>
          <button
            onClick={() => setCreando(true)}
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + Nueva campaña
          </button>
        </div>

        {mensaje && (
          <div className="mb-6 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3">
            <p className="text-zinc-300 text-sm">{mensaje}</p>
          </div>
        )}

        {creando && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
            <h2 className="text-white font-semibold text-lg mb-6">Nueva campaña</h2>

            <div className="mb-6">
              <label className="block text-zinc-400 text-xs mb-2">Nombre de la campaña</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Lanzamiento chaquetas marzo"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>

            <div className="mb-4 flex items-center gap-4">
              <h3 className="text-zinc-300 text-sm font-medium">Leads</h3>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                📎 Importar CSV
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
              <span className="text-zinc-600 text-xs">Formato: nombre,telefono</span>
            </div>

            <div className="space-y-3 mb-6">
              {leads.map((lead, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    value={lead.nombre}
                    onChange={(e) => actualizarLead(i, "nombre", e.target.value)}
                    placeholder="Nombre"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                  />
                  <input
                    value={lead.telefono}
                    onChange={(e) => actualizarLead(i, "telefono", e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                  />
                  {leads.length > 1 && (
                    <button onClick={() => eliminarLead(i)} className="text-zinc-600 hover:text-red-400 transition-colors px-2">✕</button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={agregarLead} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-6">
              + Agregar lead
            </button>

            <div className="flex gap-3">
              <button
                onClick={crearCampana}
                disabled={cargando || !nombre || !leads.filter((l) => l.telefono).length}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                {cargando ? "Creando..." : "Crear campaña"}
              </button>
              <button
                onClick={() => setCreando(false)}
                className="text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {campanas.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-zinc-500">No hay campañas todavía.</p>
              <p className="text-zinc-600 text-sm mt-1">Crea tu primera campaña para contactar leads proactivamente.</p>
            </div>
          ) : (
            campanas.map((campana) => (
              <div key={campana.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">{campana.nombre}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${estadoColor[campana.estado] ?? estadoColor.borrador}`}>
                        {campana.estado}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-zinc-500 mt-2">
                      <span>{campana.total_leads} leads</span>
                      <span>{campana.enviados} enviados</span>
                      <span>{campana.respondidos} respondidos</span>
                      <span>{new Date(campana.created_at).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={"/dashboard/campanas/" + campana.id}
                      className="text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 px-3 py-2 rounded-lg transition-colors"
                    >
                      Ver leads
                    </Link>
                    {campana.estado === "borrador" && (
                      <button
                        onClick={() => iniciarCampana(campana.id)}
                        disabled={iniciando === campana.id}
                        className="text-xs bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        {iniciando === campana.id ? "Iniciando..." : "🚀 Iniciar campaña"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
