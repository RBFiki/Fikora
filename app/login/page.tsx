"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Completa todos los campos"); return; }
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMensaje("Revisa tu email para confirmar tu cuenta.");
      }
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesion");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">FIKORA</h1>
          <p className="text-zinc-500 text-sm">Ventas conversacionales con IA</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="flex bg-zinc-800 rounded-xl p-1 mb-8">
            {(["login", "registro"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setModo(m); setError(""); setMensaje(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  modo === m
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Iniciar sesion" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="tu@empresa.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {mensaje && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-green-400 text-sm">{mensaje}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={cargando}
            className="w-full mt-6 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            {cargando ? "Cargando..." : modo === "login" ? "Entrar al panel" : "Crear cuenta"}
          </button>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Fikora · Ventas conversacionales con IA
        </p>
      </div>
    </main>
  );
}
