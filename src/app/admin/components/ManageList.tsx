"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ContentType } from "@/types";
import { EditModal, ManageRow } from "./EditModal";

interface ManageListProps {
  type: ContentType;
}

const tableMap: Record<ContentType, string> = { video: "videos", doc: "docs", prompt: "prompts" };

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "oklch(0.45 0.20 292 / 0.20)", color: "var(--accent-bright)", label: "Pendente" },
  approved: { bg: "oklch(0.40 0.15 145 / 0.20)", color: "oklch(0.70 0.18 145)", label: "Aprovado" },
  rejected: { bg: "oklch(0.38 0.18 25 / 0.18)", color: "oklch(0.70 0.20 25)", label: "Rejeitado" },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusStyle[status] ?? statusStyle.pending;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

export function ManageList({ type }: ManageListProps) {
  const [rows, setRows] = useState<ManageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ManageRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(tableMap[type]).select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    setRows((data as ManageRow[]) || []);
    setLoading(false);
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const current = rows[index];
    const target = rows[targetIndex];

    // Troca os valores de sort_order entre os dois itens e reflete localmente
    // de forma otimista para o usuário ver o movimento na hora.
    const newRows = [...rows];
    newRows[index] = target;
    newRows[targetIndex] = current;
    setRows(newRows);

    const currentOrder = current.sort_order ?? index;
    const targetOrder = target.sort_order ?? targetIndex;

    await Promise.all([
      supabase.from(tableMap[type]).update({ sort_order: targetOrder }).eq("id", current.id),
      supabase.from(tableMap[type]).update({ sort_order: currentOrder }).eq("id", target.id),
    ]);
  };

  useEffect(() => {
    load();
    const channelName = `manage-${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase.channel(channelName);
    channel.on("postgres_changes", { event: "*", schema: "public", table: tableMap[type] }, load);
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.")) return;
    setDeletingId(id);
    const { error } = await supabase.from(tableMap[type]).delete().eq("id", id);
    setDeletingId(null);
    if (!error) setRows((r) => r.filter((row) => row.id !== id));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 0" }}>
        {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 72, borderRadius: "var(--radius-md)" }} />)}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-faint)" }}>
        <p style={{ fontSize: 14 }}>Nenhum item cadastrado.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, index) => (
          <div key={row.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 0", borderBottom: "1px solid oklch(0.20 0.02 280 / 0.8)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, paddingTop: 2 }}>
              <button
                onClick={() => handleMove(index, -1)}
                disabled={index === 0}
                aria-label={`Mover para cima: ${row.title}`}
                style={{ width: 26, height: 22, borderRadius: 6, background: "oklch(0.18 0.02 280)", border: "1px solid var(--border-subtle)", color: index === 0 ? "var(--text-faint)" : "var(--text-muted)", cursor: index === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: index === 0 ? 0.4 : 1 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
              <button
                onClick={() => handleMove(index, 1)}
                disabled={index === rows.length - 1}
                aria-label={`Mover para baixo: ${row.title}`}
                style={{ width: 26, height: 22, borderRadius: 6, background: "oklch(0.18 0.02 280)", border: "1px solid var(--border-subtle)", color: index === rows.length - 1 ? "var(--text-faint)" : "var(--text-muted)", cursor: index === rows.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: index === rows.length - 1 ? 0.4 : 1 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: 5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{row.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StatusBadge status={row.status} />
                <span style={{ fontSize: 11, color: "var(--text-faint)" }}>Por: {row.submitted_by || "Anônimo"}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => setEditing(row)}
                aria-label={`Editar: ${row.title}`}
                style={{ width: 32, height: 32, borderRadius: 8, background: "oklch(0.18 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                disabled={deletingId === row.id}
                aria-label={`Excluir: ${row.title}`}
                style={{ width: 32, height: 32, borderRadius: 8, background: "oklch(0.30 0.15 25 / 0.15)", border: "1px solid oklch(0.55 0.20 25 / 0.4)", color: "oklch(0.70 0.20 25)", cursor: deletingId === row.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: deletingId === row.id ? 0.5 : 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditModal
          type={type}
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setRows((r) => r.map((row) => (row.id === updated.id ? updated : row)));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
