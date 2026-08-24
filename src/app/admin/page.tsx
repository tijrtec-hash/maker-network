"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ContentType } from "@/types";
import { ManageList } from "./components/ManageList";
import { PlaylistManager } from "./components/PlaylistManager";
import { SiteSettingsManager } from "./components/SiteSettingsManager";

type AdminTab = "pendentes" | "videos" | "docs" | "prompts" | "playlists" | "config";

interface PendingRow {
  id: string;
  type: ContentType;
  title: string;
  submitted_by: string | null;
  created_at: string;
  status: string;
}

const statCards = [
  { label: "Pendentes", key: "pending", deltaLabel: "aguardando", color: "oklch(0.62 0.26 292)", bg: "oklch(0.45 0.20 292 / 0.18)", border: "var(--border-accent)" },
  { label: "Publicados", key: "approved", deltaLabel: "aprovados", color: "oklch(0.70 0.18 145)", bg: "oklch(0.40 0.15 145 / 0.15)", border: "oklch(0.55 0.18 145 / 0.5)" },
  { label: "Rejeitados", key: "rejected", deltaLabel: "rejeitados", color: "oklch(0.70 0.20 25)", bg: "oklch(0.38 0.18 25 / 0.15)", border: "oklch(0.55 0.20 25 / 0.5)" },
];

const typeColors: Record<ContentType, { bg: string; color: string; label: string }> = {
  video: { bg: "oklch(0.45 0.20 292 / 0.20)", color: "var(--accent-bright)", label: "Vídeo" },
  doc: { bg: "oklch(0.40 0.15 220 / 0.20)", color: "oklch(0.70 0.18 220)", label: "Doc" },
  prompt: { bg: "oklch(0.40 0.15 145 / 0.20)", color: "oklch(0.70 0.18 145)", label: "Prompt" },
};

function TypeBadge({ type }: { type: ContentType }) {
  const c = typeColors[type];
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600 }}>
      {c.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

function ContentThumb({ type }: { type: ContentType }) {
  if (type === "video") return (
    <div style={{ width: 72, height: 72, borderRadius: 10, background: "oklch(0.16 0.03 292)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    </div>
  );
  if (type === "doc") return (
    <div style={{ width: 72, height: 72, borderRadius: 10, background: "oklch(0.14 0.02 280)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 4 }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
      <span style={{ fontSize: 9, fontWeight: 700, color: "oklch(0.70 0.18 220)", background: "oklch(0.38 0.14 220 / 0.25)", padding: "1px 4px", borderRadius: 3 }}>DOC</span>
    </div>
  );
  return (
    <div style={{ width: 72, height: 72, borderRadius: 10, background: "oklch(0.14 0.025 145 / 0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(0.65 0.18 145)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    </div>
  );
}

function PendingCard({ item, onAction }: { item: PendingRow; onAction: (id: string, type: ContentType, action: "approved" | "rejected") => void }) {
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const handle = async (action: "approved" | "rejected") => {
    setLoading(action);
    await onAction(item.id, item.type, action);
    setLoading(null);
  };
  return (
    <article style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid oklch(0.20 0.02 280 / 0.8)" }}>
      <ContentThumb type={item.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: "var(--text-primary)", marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{item.title}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Por: {item.submitted_by || "Anônimo"}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <TypeBadge type={item.type} />
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{timeAgo(item.created_at)}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => handle("approved")} disabled={!!loading} aria-label={`Aprovar: ${item.title}`}
            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "oklch(0.40 0.15 145 / 0.20)", border: "1px solid oklch(0.55 0.18 145 / 0.5)", color: "oklch(0.70 0.18 145)", fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, opacity: loading === "rejected" ? 0.5 : 1 }}>
            {loading === "approved"
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>}
            Aprovar
          </button>
          <button onClick={() => handle("rejected")} disabled={!!loading} aria-label={`Rejeitar: ${item.title}`}
            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "oklch(0.38 0.18 25 / 0.18)", border: "1px solid oklch(0.55 0.20 25 / 0.45)", color: "oklch(0.70 0.20 25)", fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, opacity: loading === "approved" ? 0.5 : 1 }}>
            {loading === "rejected"
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
            Rejeitar
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("pendentes");
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadAll = async () => {
    setLoadingData(true);
    const tables = ["videos", "docs", "prompts"] as const;
    const rows: PendingRow[] = [];
    let pCount = 0, aCount = 0, rCount = 0;
    await Promise.all(tables.map(async (table) => {
      const { data } = await supabase.from(table).select("id,title,submitted_by,created_at,status");
      if (data) {
        for (const row of data) {
          if (row.status === "pending") {
            rows.push({ ...row, type: table === "videos" ? "video" : table === "docs" ? "doc" : "prompt" });
            pCount++;
          } else if (row.status === "approved") aCount++;
          else if (row.status === "rejected") rCount++;
        }
      }
    }));
    rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setPending(rows);
    setStats({ pending: pCount, approved: aCount, rejected: rCount });
    setLoadingData(false);
  };

  useEffect(() => {
    loadAll();
    // Get current user email
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    // Realtime subscriptions
    const channels = ["videos", "docs", "prompts"].map((table) => {
      const channelName = `realtime-${table}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        loadAll();
      }).subscribe();
      return channel;
    });
    return () => { 
      channels.forEach((c) => supabase.removeChannel(c)); 
    };
  }, []);

  const handleAction = async (id: string, type: ContentType, action: "approved" | "rejected") => {
    const table = type === "video" ? "videos" : type === "doc" ? "docs" : "prompts";
    const { error } = await supabase.from(table).update({ status: action }).eq("id", id);
    if (!error) {
      setPending((p) => p.filter((item) => item.id !== id));
      setStats((s) => ({ ...s, pending: s.pending - 1, [action]: s[action as keyof typeof s] + 1 }));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const statDisplay = [
    { ...statCards[0], value: stats.pending },
    { ...statCards[1], value: stats.approved },
    { ...statCards[2], value: stats.rejected },
  ];

  const adminTabs: { id: AdminTab; label: string }[] = [
    { id: "pendentes", label: "Pendentes" },
    { id: "videos", label: "Vídeos" },
    { id: "docs", label: "Docs" },
    { id: "prompts", label: "Prompts" },
    { id: "playlists", label: "Playlists" },
    { id: "config", label: "Config" },
  ];

  const tabContent = (
    <>
      {activeTab === "pendentes" && (
        loadingData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0" }}>
            {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 88, borderRadius: "var(--radius-md)" }} />)}
          </div>
        ) : pending.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-faint)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
            <p style={{ fontSize: 14 }}>Nenhum conteúdo pendente</p>
          </div>
        ) : (
          pending.map((item) => <PendingCard key={`${item.type}-${item.id}`} item={item} onAction={handleAction} />)
        )
      )}
      {activeTab === "playlists" && <PlaylistManager />}
      {activeTab === "config" && <SiteSettingsManager />}
      {(activeTab === "videos" || activeTab === "docs" || activeTab === "prompts") && (
        <ManageList type={activeTab === "videos" ? "video" : activeTab === "docs" ? "doc" : "prompt"} />
      )}
    </>
  );

  return (
    <>
      {/* ══ DESKTOP ADMIN LAYOUT ══ */}
      <div className="admin-shell-desktop">
        <div className="admin-shell-inner">

          {/* Sidebar */}
          <aside className="admin-sidebar-desktop">
            {/* Logo */}
            <div style={{ padding: "0 20px 24px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-coolvetica)", fontWeight: 400, fontSize: 18, color: "var(--text-primary)" }}>IA MAKER</span>
                <span style={{ fontFamily: "var(--font-alegreya)", fontStyle: "italic", fontWeight: 600, fontSize: 15, color: "var(--accent)" }}>network</span>
              </div>
              <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>{userEmail ?? ""}</p>
            </div>

            {/* Stat pills */}
            <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
              {statDisplay.map((card) => (
                <div key={card.label} style={{ borderRadius: 10, background: card.bg, border: `1px solid ${card.border}`, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: card.color, fontWeight: 600 }}>{card.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: card.color, fontVariantNumeric: "tabular-nums" }}>{loadingData ? "—" : card.value}</span>
                </div>
              ))}
            </div>

            {/* Nav tabs */}
            <nav style={{ flex: 1, padding: "0 12px" }}>
              {adminTabs.map(({ id, label }) => {
                const active = activeTab === id;
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", textAlign: "left",
                      padding: "10px 12px", marginBottom: 3,
                      background: active ? "oklch(0.11 0.025 285)" : "none",
                      border: "none", borderRadius: "var(--radius-sm)",
                      color: active ? "var(--accent-bright)" : "var(--text-muted)",
                      fontWeight: active ? 700 : 500, fontSize: 14,
                      cursor: "pointer", position: "relative",
                      fontFamily: "var(--font-body)",
                    }}>
                    {label}
                    {id === "pendentes" && pending.length > 0 && (
                      <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "2px 7px" }}>{pending.length}</span>
                    )}
                    {active && <span style={{ position: "absolute", bottom: 5, left: 12, width: 36, height: 2, borderRadius: 1, background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />}
                  </button>
                );
              })}
            </nav>

            <div style={{ flex: 1 }} />

            {/* Actions */}
            <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={loadAll}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: "var(--radius-sm)", background: "oklch(0.14 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.13" /></svg>
                Atualizar
              </button>
              <a href="/"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: "var(--radius-sm)", background: "oklch(0.14 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", fontSize: 12, fontWeight: 500, fontFamily: "var(--font-body)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                Ver site
              </a>
              <button onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: "var(--radius-sm)", background: "oklch(0.20 0.10 25 / 0.20)", border: "1px solid oklch(0.45 0.18 25 / 0.4)", color: "oklch(0.70 0.18 25)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sair
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="admin-content-desktop">
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 32px" }}>
              {tabContent}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE ADMIN LAYOUT ══ */}
      <div className="admin-mobile">
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.08 0.01 280 / 0.90)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.20 0.02 280 / 0.8)" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={loadAll} aria-label="Atualizar" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.13" /></svg>
            </button>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-coolvetica)", fontWeight: 400, fontSize: 18, color: "var(--text-primary)" }}>IA MAKER</span>
              <span style={{ fontFamily: "var(--font-alegreya)", fontStyle: "italic", fontWeight: 600, fontSize: 15, color: "var(--accent)" }}>network</span>
            </div>
            <button onClick={handleLogout} aria-label="Sair" style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", padding: "6px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Sair
            </button>
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "20px 16px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Painel ADM</h1>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{userEmail ?? "Carregando..."}</p>
            </div>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: "var(--radius-md)", background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Site
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
            {statDisplay.map((card) => (
              <div key={card.label} style={{ borderRadius: "var(--radius-md)", background: card.bg, border: `1px solid ${card.border}`, padding: "10px 10px 8px" }}>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{card.label}</p>
                <p style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: card.color, fontVariantNumeric: "tabular-nums" }}>{loadingData ? "—" : card.value}</p>
              </div>
            ))}
          </div>

          <div style={{ borderRadius: "var(--radius-lg)", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid oklch(0.20 0.02 280 / 0.8)", overflowX: "auto" }} role="tablist">
              {adminTabs.map(({ id, label }) => {
                const active = activeTab === id;
                return (
                  <button key={id} role="tab" aria-selected={active} onClick={() => setActiveTab(id)}
                    style={{ flex: "0 0 auto", padding: "11px 10px", fontWeight: active ? 700 : 500, fontSize: 11, color: active ? "var(--accent-bright)" : "var(--text-muted)", background: "none", border: "none", cursor: "pointer", position: "relative", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                    {label}
                    {id === "pendentes" && pending.length > 0 && (
                      <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 999, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{pending.length}</span>
                    )}
                    {active && <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 2, borderRadius: 1, background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "8px 14px 16px" }}>
              {tabContent}
            </div>
          </div>
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}