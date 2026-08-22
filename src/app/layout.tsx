import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA MAKER Network",
  description: "Rede premium de conteúdos relacionados à inteligência artificial.",
  themeColor: "#0a0a12",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="ambient-bg">{children}</body>
    </html>
  );
}
