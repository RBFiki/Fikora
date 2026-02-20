export default function Problema() {
  const problemas = [
    {
      titulo: "Tu equipo de ventas es caro y no escala",
      descripcion: "Un vendedor cuesta $1,500–$3,000/mes entre sueldo, comisiones y prestaciones. Y solo puede llamar a 40–60 personas al día.",
    },
    {
      titulo: "Los leads se enfrían mientras nadie los llama",
      descripcion: "El 78% de los clientes compra al primero que los contacta. Si tardas más de 5 minutos en responder, ya perdiste.",
    },
    {
      titulo: "Los vendedores humanos tienen días malos",
      descripcion: "Llegan tarde, se enferman, renuncian. Un agente de IA trabaja igual de bien a las 3am del domingo que el lunes a las 9am.",
    },
  ];

  return (
    <section className="bg-zinc-950 py-32 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-red-400 text-sm font-medium tracking-widest uppercase">El problema</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Escalar ventas con humanos<br />es lento y caro.
          </h2>
        </div>

        <div className="space-y-4">
          {problemas.map((p, i) => (
            <div key={i} className="flex gap-6 bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-red-500/20 transition-colors">
              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-red-400 text-sm font-bold">✗</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{p.titulo}</h3>
                <p className="text-zinc-400 leading-relaxed">{p.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
