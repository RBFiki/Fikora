import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DetalleCampana({ params }: { params: { id: string } }) {
  const { data: campana } = await supabase
    .from("campanas")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!campana) notFound();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("campana_id", params.id)
    .order("created_at", { ascending: false });

  const estadoColor: Record<string, string> = {
    pendiente: "bg-zinc-700/50 border-zinc-600 text-zinc-400",
    contactado: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    calificado: "bg-green-500/10 border-green-500/30 text-green-400",
    cerrado: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    descartado: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/campanas" className="text-zinc-400 hover:text-white transition-colors text-sm">
            ← Campañas
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{campana.nombre}</h1>
            <p className="text-zinc-400 text-sm">{campana.total_leads} leads · {campana.enviados} enviados</p>
          </div>
          <span className={`ml-auto text-xs px-3 py-1 rounded-full border ${
            campana.estado === "activa"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
          }`}>
            {campana.estado}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total leads", value: campana.total_leads, color: "text-white" },
            { label: "Enviados", value: campana.enviados, color: "text-blue-400" },
            { label: "Respondidos", value: campana.respondidos, color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Leads de la campaña</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {leads && leads.length > 0 ? (
              leads.map((lead) => (
                <Link key={lead.id} href={"/dashboard/leads/" + lead.id} className="block p-5 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{lead.nombre ?? "Sin nombre"}</p>
                      <p className="text-zinc-400 text-sm">{lead.telefono?.replace("whatsapp:", "")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${estadoColor[lead.estado] ?? estadoColor.pendiente}`}>
                        {lead.estado}
                      </span>
                      {lead.contactado_at && (
                        <span className="text-zinc-600 text-xs">
                          {new Date(lead.contactado_at).toLocaleDateString("es-ES")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-zinc-500">No hay leads en esta campaña.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
