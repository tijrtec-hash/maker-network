"use client";

import { useState } from "react";
import { VideoTab } from "./components/VideoTab";
import { DocsTab } from "./components/DocsTab";
import { PromptsTab } from "./components/PromptsTab";
import { SiteFooter } from "./components/SiteFooter";
import { SearchBar } from "./components/SearchBar";
import Link from "next/link";

type Tab = "videos" | "docs" | "prompts";

const tabLabels: Record<Tab, string> = {
  videos: "vídeos",
  docs: "docs",
  prompts: "prompts",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [query, setQuery] = useState("");

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP LAYOUT  (≥ 768 px)
          Hidden on mobile via CSS class
      ══════════════════════════════════════ */}
      <div className="desktop-layout">
        {/* outer shell with rounded corners + drop-shadow */}
        <div className="desktop-shell">

          {/* ── Sidebar ── */}
          <aside className="sidebar">
            {/* ADM circle */}
            <div style={{ padding: "0 20px 28px", display: "flex", justifyContent: "center" }}>
              <Link href="/admin" aria-label="Painel ADM"
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, oklch(0.65 0.28 292), oklch(0.28 0.20 292))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", textDecoration: "none",
                  boxShadow: "0 0 28px oklch(0.62 0.26 292 / 0.5)",
                  flexShrink: 0,
                }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </Link>
            </div>

            {/* Nav */}
            <nav style={{ padding: "0 16px", flex: 1 }}>
              {(["videos", "docs", "prompts"] as Tab[]).map((tab) => {
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => { setActiveTab(tab); setQuery(""); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "13px 14px", marginBottom: 4,
                      background: active ? "oklch(0.11 0.025 285)" : "none",
                      border: "none", borderRadius: "var(--radius-sm)",
                      color: active ? "var(--accent-bright)" : "var(--text-muted)",
                      fontWeight: active ? 700 : 500, fontSize: 16,
                      cursor: "pointer", position: "relative",
                      fontFamily: "var(--font-body)",
                    }}>
                    {tabLabels[tab]}
                    {active && (
                      <span style={{
                        position: "absolute", bottom: 7, left: 14,
                        width: 44, height: 2, borderRadius: 1,
                        background: "var(--accent)", boxShadow: "0 0 8px var(--accent)",
                      }} />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Enviar conteúdo */}
            <div style={{ padding: "0 16px 12px" }}>
              <Link href="/enviar"
                style={{
                  display: "block", textAlign: "center",
                  padding: "12px 0", borderRadius: 999,
                  background: "var(--accent)", color: "#fff",
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                  boxShadow: "0 0 18px var(--accent-glow)",
                  fontFamily: "var(--font-body)",
                }}>
                Enviar conteúdo
              </Link>
            </div>

            {/* Footer credit in sidebar */}
            <SiteFooter sidebar />
          </aside>

          {/* ── Main area ── */}
          <div className="desktop-main">

            {/* Top bar: logo + search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 20,
              padding: "20px 28px 16px",
              borderBottom: "1px solid oklch(0.18 0.03 280 / 0.5)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-coolvetica)", fontWeight: 400, fontSize: 26, color: "var(--text-primary)" }}>
                  IA MAKER
                </span>
                <span style={{ fontFamily: "var(--font-alegreya)", fontStyle: "italic", fontWeight: 600, fontSize: 22, color: "var(--accent)" }}>
                  network
                </span>
              </div>
              <div style={{ flex: 1, maxWidth: 380 }}>
                <SearchBar value={query} onChange={setQuery} placeholder="Buscar..." />
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 32px" }}>
              {activeTab === "videos" && <VideoTab searchQuery={query} />}
              {activeTab === "docs" && <DocsTab searchQuery={query} />}
              {activeTab === "prompts" && <PromptsTab searchQuery={query} />}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE LAYOUT  (< 768 px)
          Hidden on desktop via CSS class
      ══════════════════════════════════════ */}
      <div className="mobile-layout">

        {/* Sticky mobile header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "oklch(0.08 0.01 280 / 0.92)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)",
        }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "var(--font-coolvetica)", fontWeight: 400, fontSize: 22, color: "var(--text-primary)" }}>IA MAKER</span>
                <span style={{ fontFamily: "var(--font-alegreya)", fontStyle: "italic", fontWeight: 600, fontSize: 19, color: "var(--accent)" }}>network</span>
              </div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
            </div>
            <nav style={{ display: "flex", gap: 4 }} role="tablist" aria-label="Categorias">
              {(["videos", "docs", "prompts"] as Tab[]).map((tab) => {
                const active = activeTab === tab;
                return (
                  <button key={tab} role="tab" aria-selected={active}
                    onClick={() => { setActiveTab(tab); setQuery(""); }}
                    style={{
                      flex: 1, paddingTop: 8, paddingBottom: 12,
                      fontWeight: active ? 700 : 500, fontSize: 14,
                      color: active ? "var(--accent-bright)" : "var(--text-muted)",
                      background: "none", border: "none", cursor: "pointer",
                      position: "relative", textTransform: "lowercase",
                    }}>
                    {tab}
                    {active && <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 2, borderRadius: 1, background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Mobile content */}
        <main style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "20px 16px 128px" }}>
          {activeTab === "videos" && <VideoTab searchQuery={query} />}
          {activeTab === "docs" && <DocsTab searchQuery={query} />}
          {activeTab === "prompts" && <PromptsTab searchQuery={query} />}
        </main>

        {/* Mobile bottom bar */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
          background: "oklch(0.08 0.01 280 / 0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid oklch(0.28 0.04 280 / 0.4)",
        }}>
          <SiteFooter />
          <div style={{ padding: "10px 20px 20px", display: "flex", gap: 8, maxWidth: 480, margin: "0 auto" }}>
            <Link href="/enviar" style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "12px 0", borderRadius: "var(--radius-md)",
              background: "oklch(0.45 0.20 292 / 0.18)", border: "1px solid var(--border-accent)",
              color: "var(--accent-bright)", fontWeight: 600, fontSize: 14, textDecoration: "none",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Enviar conteúdo
            </Link>
            <Link href="/admin" aria-label="Admin" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px 16px", borderRadius: "var(--radius-md)",
              background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)", textDecoration: "none",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
