"use client";

import { useState } from "react";
import Link from "next/link";
import { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
}

function PromptIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32 }} aria-hidden="true">
      <rect x="4" y="4" width="14" height="14" rx="4" fill="oklch(0.35 0.06 285 / 0.5)" />
      <rect x="22" y="4" width="14" height="14" rx="4" fill="oklch(0.35 0.06 285 / 0.5)" />
      <rect x="4" y="22" width="14" height="14" rx="4" fill="oklch(0.35 0.06 285 / 0.5)" />
      <rect x="22" y="22" width="14" height="14" rx="4" fill="oklch(0.35 0.06 285 / 0.5)" />
    </svg>
  );
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = prompt.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const blob = new Blob([prompt.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Link
      href={`/prompt/${prompt.id}`}
      aria-label={`Ver prompt: ${prompt.title}`}
      style={{
        display: "flex",
        flexDirection: "column",
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
      {/* Cover */}
      <div
        style={{
          aspectRatio: "1/0.75",
          background: prompt.cover_url
            ? `url(${prompt.cover_url}) center/cover`
            : "linear-gradient(135deg, oklch(0.16 0.03 292) 0%, oklch(0.20 0.04 280) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!prompt.cover_url && <PromptIcon />}
      </div>

      {/* Content */}
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.35, color: "var(--text-primary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {prompt.title}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <button onClick={handleDownload} aria-label={`Baixar prompt: ${prompt.title}`}
            style={{ flex: 1, padding: "6px 0", borderRadius: 8, background: "oklch(0.22 0.03 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Baixar
          </button>
          <button onClick={handleCopy} aria-label={copied ? "Copiado!" : `Copiar prompt: ${prompt.title}`}
            style={{ flex: 1, padding: "6px 0", borderRadius: 8, background: copied ? "oklch(0.45 0.18 145 / 0.25)" : "oklch(0.45 0.20 292 / 0.20)", border: `1px solid ${copied ? "oklch(0.55 0.18 145 / 0.5)" : "var(--border-accent)"}`, color: copied ? "oklch(0.75 0.18 145)" : "var(--accent-bright)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 200ms ease" }}>
            {copied ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Copiado</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copiar</>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
