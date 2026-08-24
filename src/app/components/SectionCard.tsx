"use client";

import Link from "next/link";
import { MarqueeText } from "./MarqueeText";

interface SectionCardProps {
  type: "video" | "doc" | "prompt";
  slug: string;
  label: string;
  count?: number;
}

const typeIcon: Record<string, React.ReactNode> = {
  video: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  ),
  doc: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  prompt: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

export function SectionCard({ type, slug, label, count }: SectionCardProps) {
  return (
    <Link
      href={`/${type}s/secao/${slug}`}
      aria-label={`Ver seção: ${label}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 14px",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-glass)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        textDecoration: "none",
        transition: "border-color 150ms ease, transform 150ms ease",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.04 280 / 0.5)"; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "oklch(0.45 0.20 292 / 0.18)", color: "var(--accent-bright)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {typeIcon[type]}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <MarqueeText text={label} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }} />
        {typeof count === "number" && (
          <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{count} {count === 1 ? "item" : "itens"}</p>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
