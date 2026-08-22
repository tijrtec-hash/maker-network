"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Doc } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";

function DocIcon() {
  return (
    <svg viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 80 }} aria-hidden="true">
      <path d="M8 0H32L48 16V56C48 58.2 46.2 60 44 60H8C5.8 60 4 58.2 4 56V4C4 1.8 5.8 0 8 0Z" fill="oklch(0.22 0.03 280)" stroke="oklch(0.35 0.06 285 / 0.6)" strokeWidth="1" />
      <path d="M32 0L48 16H36C33.8 16 32 14.2 32 12V0Z" fill="oklch(0.30 0.05 285)" />
      <rect x="12" y="24" width="24" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.7)" />
      <rect x="12" y="30" width="24" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.7)" />
      <rect x="12" y="36" width="18" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.7)" />
      <rect x="12" y="42" width="20" height="2" rx="1" fill="oklch(0.55 0.05 285 / 0.5)" />
    </svg>
  );
}

export default function DocPage({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("docs")
        .select("*")
        .eq("id", params.id)
        .eq("status", "approved")
        .single();
      setDoc(data as Doc | null);
      setLoading(false);
    }
    load();
  }, [params.id]);

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

  if (!doc) return notFound();

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.08 0.01 280 / 0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <Link href="/" aria-label="Voltar" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-muted)" }}>Documento</span>
      </header>

      <main style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "28px 16px 48px" }}>
        {/* Cover */}
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: doc.cover_url ? `url(${doc.cover_url}) center/cover` : "linear-gradient(135deg, oklch(0.16 0.03 292) 0%, oklch(0.20 0.04 280) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, aspectRatio: "16/7" }}>
          {!doc.cover_url && <DocIcon />}
        </div>

        {/* Meta */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>{doc.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {doc.submitted_by && (
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                {doc.submitted_by}
              </span>
            )}
            <span style={{ fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {new Date(doc.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 24 }} />

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {doc.file_url && doc.file_url !== "#" && (
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "15px", borderRadius: "var(--radius-md)", background: "oklch(0.55 0.22 292)", border: "none", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 0 24px var(--accent-glow)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Abrir documento
            </a>
          )}
          <Link href="/"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: "var(--radius-md)", background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            Voltar para a lista
          </Link>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
