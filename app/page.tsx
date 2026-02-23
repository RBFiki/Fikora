import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problema from "@/components/Problema";
import ComoFunciona from "@/components/ComoFunciona";
import FormularioContacto from "@/components/FormularioContacto";

export default function Home() {
  return (
    <main>
      <Header />
      <div className="pt-16">
        <Hero />
        <Problema />
        <ComoFunciona />
        <FormularioContacto />
      </div>
      <footer className="bg-zinc-950 border-t border-zinc-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-white font-bold tracking-widest">FIKORA</span>
          <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} Fikora. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
