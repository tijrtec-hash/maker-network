"use client";

import Link from "next/link";
import { Playlist } from "@/types";

function PlaylistIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export function PlaylistCard({ playlist, count }: { playlist: Playlist; count?: number }) {
  return (
    <Link
      href={`/videos/playlist/${playlist.id}`}
      aria-label={`Ver playlist: ${playlist.title}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        background: playlist.cover_url ? `url(${playlist.cover_url}) center/cover` : "linear-gradient(135deg, oklch(0.20 0.05 292 / 0.5) 0%, oklch(0.16 0.03 280) 100%)",
        border: "1px solid var(--border-subtle)",
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 150ms ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.04 280 / 0.5)"; }}
    >
      {playlist.cover_url && <div style={{ position: "absolute", inset: 0, background: "oklch(0.05 0.01 280 / 0.55)" }} />}
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "oklch(0.45 0.20 292 / 0.30)", color: "var(--accent-bright)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
        <PlaylistIcon />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{playlist.title}</p>
        {typeof count === "number" && (
          <p style={{ fontSize: 11, color: "oklch(0.85 0.01 280)", marginTop: 2 }}>{count} {count === 1 ? "vídeo" : "vídeos"}</p>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, position: "relative", opacity: 0.8 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
