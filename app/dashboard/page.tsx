import { supabase } from "@/lib/supabase";

export default async function Dashboard() {
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const total = leads?.length ?? 0;
  const calificados = leads?.filter((l) => l.estado === "calificado").length ?? 0;
  const nuevos = leads?.filter((l) => l.estado === "nuevo").length ?? 0;

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel Fikora</h1>
            <p className="text-zinc-400 text-sm">Leads de tu agente Sara</p>
          </div>
          <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-3 py-1 rounded-full">
            Agente activo
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total leads", value: total, color: "text-white" },
            { label: "Calificados", value: calificados, color: "text-green-400" },
            { label: "Nuevos hoy", value: nuevos, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Leads recientes</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {leads && leads.length > 0 ? (
              leads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{lead.nombre ?? "Sin nombre"}</p>
                      <p className="text-zinc-400 text-sm">{lead.telefono}</p>
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
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-zinc-500">Aun no hay leads.</p>
                <p className="text-zinc-600 text-sm mt-1">Cuando Sara califique un prospecto aparecera aqui.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
