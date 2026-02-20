export default function ComoFunciona() {
  const pasos = [
    {
      numero: "01",
      titulo: "Conectamos tu base de leads",
      descripcion: "Integramos el agente con tu CRM, hoja de Excel o lista de contactos. En menos de 24 horas está listo para trabajar.",
      icono: "📋",
    },
    {
      numero: "02",
      titulo: "El agente contacta por WhatsApp y llamadas",
      descripcion: "Escribe y habla como un vendedor humano. Presenta tu producto, responde preguntas y maneja objeciones en tiempo real.",
      icono: "📱",
    },
    {
      numero: "03",
      titulo: "Califica y cierra",
      descripcion: "Los prospectos interesados avanzan solos por el embudo. Tu equipo solo recibe los listos para firmar.",
      icono: "✅",
    },
  ];

  return (
    <section id="como-funciona" className="bg-zinc-900 py-32 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-medium tracking-widest uppercase">Cómo funciona</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            De lead a cliente,<br />sin intervención humana.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pasos.map((paso) => (
            <div key={paso.numero} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 hover:border-green-500/30 transition-colors">
              <div className="text-4xl mb-4">{paso.icono}</div>
              <div className="text-green-400 text-sm font-mono mb-2">{paso.numero}</div>
              <h3 className="text-xl font-bold text-white mb-3">{paso.titulo}</h3>
              <p className="text-zinc-400 leading-relaxed">{paso.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
