"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Prompt } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function PromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();
      setPrompt(data as Prompt | null);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.content);
    } catch {
      const el = document.createElement("textarea");
      el.value = prompt.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!prompt) return;
    const blob = new Blob([prompt.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }} aria-label="Carregando">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!prompt) return notFound();

  return (
    <div className="detail-shell">
      <div className="detail-card">
      {/* Header */}
      <header className="detail-header" style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.08 0.01 280 / 0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <Link href="/" aria-label="Voltar" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-muted)" }}>Prompt</span>
      </header>

      <main className="detail-main" style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "28px 16px 48px" }}>
        {/* Cover */}
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: prompt.cover_url ? `url(${prompt.cover_url}) center/cover` : "linear-gradient(135deg, oklch(0.16 0.04 292) 0%, oklch(0.20 0.03 145) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, aspectRatio: "16/7" }}>
          {!prompt.cover_url && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.15 292 / 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          )}
        </div>

        {/* Title & meta */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>{prompt.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {prompt.submitted_by && (
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                {prompt.submitted_by}
              </span>
            )}
            <span style={{ fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {new Date(prompt.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 20 }} />

        {/* Prompt content */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>Conteúdo do prompt</p>
          <div style={{ borderRadius: "var(--radius-md)", background: "oklch(0.12 0.015 280)", border: "1px solid var(--border-subtle)", padding: "16px", position: "relative" }}>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
              {prompt.content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleDownload}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: "var(--radius-md)", background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Baixar
          </button>
          <button onClick={handleCopy}
            style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: "var(--radius-md)", background: copied ? "oklch(0.40 0.15 145 / 0.25)" : "oklch(0.55 0.22 292)", border: `1px solid ${copied ? "oklch(0.55 0.18 145 / 0.6)" : "transparent"}`, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: copied ? "none" : "0 0 20px var(--accent-glow)", transition: "all 200ms ease" }}>
            {copied ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                Copiado!
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copiar prompt
              </>
            )}
          </button>
        </div>
      </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
