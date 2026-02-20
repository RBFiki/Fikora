"use client";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, zinc 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-32">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Agentes de IA para ventas</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Tu equipo de ventas<br />
          <span className="text-green-400">que nunca duerme.</span>
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Agentes de IA que contactan tus leads por <strong className="text-white">WhatsApp</strong> y <strong className="text-white">llamadas en frío</strong>, califican prospectos y cierran ventas — 24/7, sin sueldo fijo, sin excusas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#contacto" className="inline-flex items-center justify-center px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-lg rounded-lg transition-colors">
            Ver una demo en vivo
          </a>
          <a href="#como-funciona" className="inline-flex items-center justify-center px-8 py-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium text-lg rounded-lg transition-colors">
            Cómo funciona →
          </a>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 grid grid-cols-3 gap-8 max-w-lg">
          {[
            { value: "24/7", label: "Sin pausas ni fines de semana" },
            { value: "10×", label: "Más contactos que un vendedor" },
            { value: "0", label: "Sueldo fijo, comisiones ni IMSS" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-green-400 mb-1">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
