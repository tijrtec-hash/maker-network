"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { VideoTab } from "./components/VideoTab";
import { DocsTab } from "./components/DocsTab";
import { PromptsTab } from "./components/PromptsTab";
import Link from "next/link";

type Tab = "videos" | "docs" | "prompts";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("videos");

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main
        role="main"
        style={{
          flex: 1,
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          padding: "20px 16px 100px",
        }}
      >
        {activeTab === "videos" && <VideoTab />}
        {activeTab === "docs" && <DocsTab />}
        {activeTab === "prompts" && <PromptsTab />}
      </main>

      {/* Bottom bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "oklch(0.08 0.01 280 / 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid oklch(0.28 0.04 280 / 0.4)",
          padding: "10px 20px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <Link
          href="/enviar"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 0",
            borderRadius: "var(--radius-md)",
            background: "oklch(0.45 0.20 292 / 0.18)",
            border: "1px solid var(--border-accent)",
            color: "var(--accent-bright)",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            marginRight: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Enviar conteúdo
        </Link>
        <Link
          href="/admin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "oklch(0.16 0.02 280)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
          }}
          aria-label="Painel administrativo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
