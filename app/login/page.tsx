"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modo, setModo] = useState<"login" | "registro">("login");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Revisa tu email para confirmar tu cuenta.");
      }
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "Email o contrasena incorrectos." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-widest">FIKORA</h1>
          <p className="text-zinc-400 text-sm mt-2">
            {modo === "login" ? "Inicia sesion en tu panel" : "Crea tu cuenta"}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {error && (
            <div className={`rounded-lg p-3 text-sm ${error.includes("email") ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><span className="animate-spin">⟳</span> Cargando...</> : modo === "login" ? "Entrar" : "Crear cuenta"}
          </button>

          <p className="text-center text-zinc-500 text-sm">
            {modo === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}{" "}
            <button
              onClick={() => { setModo(modo === "login" ? "registro" : "login"); setError(""); }}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              {modo === "login" ? "Registrate" : "Inicia sesion"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
