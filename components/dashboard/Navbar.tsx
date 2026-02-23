"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const links = [
    { href: "/dashboard", label: "Leads" },
    { href: "/dashboard/configuracion", label: "Configuracion" },
  ];

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <span className="text-white font-bold tracking-widest text-sm">FIKORA</span>
          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-zinc-500 hover:text-white text-sm transition-colors"
        >
          Cerrar sesion
        </button>
      </div>
    </nav>
  );
}
