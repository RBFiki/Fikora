import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function Dashboard() {
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: bot } = await supabase
    .from("bots")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  const total = leads?.length ?? 0;
  const calificados = leads?.filter((l) => l.estado === "calificado").length ?? 0;
  const hoy = new Date().toISOString().split("T")[0];
  const nuevosHoy = leads?.filter((l) => l.created_at?.startsWith(hoy)).length ?? 0;
  const conversion = total > 0 ? Math.round((calificados / total) * 100) : 0;
  const nombreAgente = bot?.nombre_agente ?? "tu agente";
  const nombreEmpresa = bot?.nombre_empresa ?? "";

  const ultimosSiete = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const fecha = d.toISOString().split("T")[0];
    const count = leads?.filter((l) => l.created_at?.startsWith(fecha)).length ?? 0;
    return { fecha: d.toLocaleDateString("es-ES", { weekday: "short" }), count };
  });

  const maxCount = Math.max(...ultimosSiete.map((d) => d.count), 1);

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel Fikora</h1>
            <p className="text-zinc-400 text-sm">
              {nombreAgente}{nombreEmpresa ? " · " + nombreEmpresa : ""}
            </p>
          </div>
          <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-3 py-1 rounded-full">
            Agente activo
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total leads", value: total, color: "text-white", sub: "historico" },
            { label: "Calificados", value: calificados, color: "text-green-400", sub: "listos para contactar" },
            { label: "Nuevos hoy", value: nuevosHoy, color: "text-amber-400", sub: "ultimas 24 horas" },
            { label: "Conversion", value: conversion + "%", color: "text-blue-400", sub: "leads calificados" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-zinc-600 text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-6">Leads ultimos 7 dias</h3>
            <div className="flex items-end gap-2 h-32">
              {ultimosSiete.map((dia) => (
                <div key={dia.fecha} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-zinc-500 text-xs">{dia.count > 0 ? dia.count : ""}</span>
                  <div
                    className="w-full bg-green-500/20 border border-green-500/30 rounded-t-md transition-all"
                    style={{ height: `${(dia.count / maxCount) * 100}%`, minHeight: dia.count > 0 ? "8px" : "2px" }}
                  />
                  <span className="text-zinc-500 text-xs">{dia.fecha}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Tasa de conversion</span>
                <span className="text-white font-bold">{conversion}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: conversion + "%" }} />
              </div>
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Pendientes de contactar</span>
                  <span className="text-amber-400">{calificados}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Sin calificar</span>
                  <span className="text-zinc-400">{total - calificados}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-white font-semibold">Leads recientes</h2>
            <span className="text-zinc-500 text-xs">{total} total</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {leads && leads.length > 0 ? (
              leads.map((lead) => (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`} className="block p-6 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{lead.nombre ?? "Sin nombre"}</p>
                      <p className="text-zinc-400 text-sm">{lead.telefono?.replace("whatsapp:", "")}</p>
                      {lead.horario_preferido && (
                        <p className="text-zinc-500 text-xs mt-1">Horario: {lead.horario_preferido}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        lead.estado === "calificado"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
                      }`}>
                        {lead.estado}
                      </span>
                      <span className="text-zinc-600 text-xs">
                        {new Date(lead.created_at).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-zinc-500">Aun no hay leads.</p>
                <p className="text-zinc-600 text-sm mt-1">Cuando {nombreAgente} califique un prospecto aparecera aqui.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
