import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="text-white font-bold tracking-widest text-sm">FIKORA</span>
        <Link
          href="/login"
          className="text-zinc-400 hover:text-white text-sm transition-colors border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg"
        >
          Entrar al panel →
        </Link>
      </div>
    </header>
  );
}
