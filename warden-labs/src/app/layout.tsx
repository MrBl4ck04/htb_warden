import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warden Labs — Entrena. Hackea. Certifícate.",
  description: "Plataforma de entrenamiento en ciberseguridad de Warden Academy. Prepárate para tus certificaciones con máquinas de Hack The Box organizadas en paths de aprendizaje.",
  icons: { icon: '/imagenpestana.png' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
