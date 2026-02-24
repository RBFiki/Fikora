"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-white font-bold tracking-tight">FIKORA</span>
        <div className="flex gap-1">
          {[
            { href: "/dashboard", label: "Leads" },
            { href: "/dashboard/configuracion", label: "Configuracion" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-zinc-400 hover:text-white text-sm transition-colors"
      >
        Cerrar sesion
      </button>
    </nav>
  );
}
