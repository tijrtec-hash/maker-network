"use client";

import Link from "next/link";
import { Doc } from "@/types";

interface DocCardProps {
  doc: Doc;
}

function DocIcon() {
  return (
    <svg viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <path d="M8 0H32L48 16V56C48 58.2 46.2 60 44 60H8C5.8 60 4 58.2 4 56V4C4 1.8 5.8 0 8 0Z" fill="oklch(0.22 0.03 280)" stroke="oklch(0.35 0.06 285 / 0.6)" strokeWidth="1" />
      <path d="M32 0L48 16H36C33.8 16 32 14.2 32 12V0Z" fill="oklch(0.30 0.05 285)" />
      <rect x="12" y="24" width="24" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.7)" />
      <rect x="12" y="30" width="24" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.7)" />
      <rect x="12" y="36" width="18" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.7)" />
      <rect x="12" y="42" width="20" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.5)" />
    </svg>
  );
}

export function DocCard({ doc }: DocCardProps) {
  return (
    <Link
      href={`/doc/${doc.id}`}
      aria-label={`Ver documento: ${doc.title}`}
      style={{
        display: "block",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--bg-glass)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        textDecoration: "none",
        transition: "border-color 150ms ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.04 280 / 0.5)"; }}
    >
      {/* Cover */}
      <div style={{ aspectRatio: "3/4", background: doc.cover_url ? `url(${doc.cover_url}) center/cover` : "oklch(0.16 0.025 280)", display: "flex", alignItems: "center", justifyContent: "center", padding: doc.cover_url ? 0 : "16%" }}>
        {!doc.cover_url && <DocIcon />}
      </div>

      {/* Title */}
      <div style={{ padding: "8px 10px 10px", borderTop: "1px solid oklch(0.28 0.04 280 / 0.3)" }}>
        <p style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.35, color: "var(--text-primary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {doc.title}
        </p>
      </div>
    </Link>
  );
}
