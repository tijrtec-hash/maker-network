"use client";

import Link from "next/link";
import { Playlist } from "@/types";

function StackIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 6l2 12a2 2 0 0 0 2 1.7h8a2 2 0 0 0 2-1.7L20 6" />
      <path d="M9 10h6" /><path d="M9 14h4" />
    </svg>
  );
}

/**
 * Card de playlist com o MESMO tamanho/proporção de um card de vídeo (16:9),
 * usado dentro das páginas de seção para "compactar" vários vídeos em um só
 * bloco clicável. Ao clicar, abre a página da playlist com os vídeos dela.
 */
export function PlaylistCoverCard({ playlist, count }: { playlist: Playlist; count?: number }) {
  return (
    <Link
      href={`/videos/playlist/${playlist.id}`}
      aria-label={`Abrir playlist: ${playlist.title}`}
      style={{
        display: "block",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--bg-glass)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        textDecoration: "none",
        transition: "border-color 150ms ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.04 280 / 0.5)"; }}
    >
      {/* Área com a mesma proporção 16:9 do player de vídeo */}
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          background: playlist.cover_url
            ? `url(${playlist.cover_url}) center/cover`
            : "linear-gradient(135deg, oklch(0.22 0.06 292) 0%, oklch(0.14 0.03 280) 100%)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "oklch(0.05 0.01 280 / 0.35)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff" }}>
          <StackIcon />
          {typeof count === "number" && (
            <span style={{ fontSize: 12, fontWeight: 700, background: "oklch(0.05 0.01 280 / 0.55)", padding: "3px 10px", borderRadius: 999 }}>
              {count} {count === 1 ? "vídeo" : "vídeos"}
            </span>
          )}
        </div>
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "oklch(0.45 0.20 292 / 0.85)", padding: "3px 8px", borderRadius: 6 }}>
          Playlist
        </span>
      </div>

      {/* Title */}
      <div style={{ padding: "12px 16px 14px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: "var(--text-primary)" }}>{playlist.title}</h2>
        {playlist.description && (
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{playlist.description}</p>
        )}
      </div>
    </Link>
  );
}
