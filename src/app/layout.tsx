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
      <head>
        {/* Montserrat — fonte geral do site (textos, botões, etc.) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Alegreya:ital,wght@1,500;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="ambient-bg">{children}</body>
    </html>
  );
}
