import Link from "next/link";

export default function GraciasPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-8">
        <span className="text-green-400 text-2xl">✓</span>
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">¡Listo, te contactamos pronto!</h1>
      <p className="text-zinc-400 text-lg max-w-md mb-10">
        Uno de nuestros especialistas te escribirá en menos de 24 horas para agendar tu demo.
      </p>
      <Link href="/" className="text-green-400 hover:text-green-300 transition-colors">
        ← Volver al inicio
      </Link>
    </main>
  );
}
