import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fikora — Tu equipo de ventas con IA",
  description: "Agentes de IA que contactan tus leads por WhatsApp y llamadas en frío, cierran ventas 24/7 sin sueldo fijo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
