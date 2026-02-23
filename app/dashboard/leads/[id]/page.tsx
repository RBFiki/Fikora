import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LeadDetalle({ params }: { params: { id: string } }) {
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!lead) notFound();

  const mensajes = lead.conversacion
    ? lead.conversacion.split("\n").filter((l: string) => l.trim())
    : [];

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm">
            ← Volver
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{lead.nombre ?? "Sin nombre"}</h1>
            <p className="text-zinc-400 text-sm">{lead.telefono?.replace("whatsapp:", "")}</p>
          </div>
          <span className={`ml-auto text-xs px-3 py-1 rounded-full border ${
            lead.estado === "calificado"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
          }`}>
            {lead.estado}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: "Telefono", value: lead.telefono?.replace("whatsapp:", "") },
            { label: "Horario preferido", value: lead.horario_preferido ?? "No especificado" },
            { label: "Fecha", value: new Date(lead.created_at).toLocaleDateString("es-ES") },
            { label: "Estado", value: lead.estado },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">{item.label}</p>
              <p className="text-white text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Conversacion completa</h2>
          </div>
          <div className="p-6 space-y-4">
            {mensajes.length > 0 ? (
              mensajes.map((linea: string, i: number) => {
                const esAgente = linea.startsWith("assistant:");
                const esUsuario = linea.startsWith("user:");
                const texto = linea.replace(/^(assistant|user):/, "").trim();
                if (!texto) return null;
                return (
                  <div key={i} className={`flex ${esAgente ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                      esAgente
                        ? "bg-zinc-800 text-white rounded-tl-sm"
                        : esUsuario
                        ? "bg-green-500/20 border border-green-500/30 text-green-100 rounded-tr-sm"
                        : "bg-zinc-700 text-zinc-300"
                    }`}>
                      {texto}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 text-sm text-center">No hay conversacion registrada.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
