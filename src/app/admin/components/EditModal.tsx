"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ContentType } from "@/types";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { SECTIONS_BY_TYPE } from "@/lib/sections";

export interface ManageRow {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  submitted_by?: string | null;
  embed_url?: string;
  file_url?: string;
  content?: string;
  cover_url?: string;
  storage_path?: string;
  sort_order?: number;
  section?: string | null;
}

interface EditModalProps {
  type: ContentType;
  item: ManageRow;
  onClose: () => void;
  onSaved: (updated: ManageRow) => void;
}

const tableMap: Record<ContentType, string> = { video: "videos", doc: "docs", prompt: "prompts" };

const typeLabel: Record<ContentType, string> = { video: "vídeo", doc: "documento", prompt: "prompt" };

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.04em", margin: "14px 0 6px" };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" as const };

export function EditModal({ type, item, onClose, onSaved }: EditModalProps) {
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.embed_url || item.file_url || "");
  const [content, setContent] = useState(item.content || "");
  const [status, setStatus] = useState(item.status);
  const [section, setSection] = useState(item.section || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) { setError("O título não pode ficar vazio."); return; }

    const patch: Record<string, unknown> = { title: title.trim(), status, section: section || null };

    if (type === "video") {
      const embed = getYouTubeEmbedUrl(url) ?? url;
      if (!embed) { setError("Link do YouTube inválido."); return; }
      patch.embed_url = embed;
    } else if (type === "doc") {
      if (!url.trim()) { setError("Informe o link do arquivo."); return; }
      patch.file_url = url.trim();
    } else {
      if (!content.trim()) { setError("O conteúdo não pode ficar vazio."); return; }
      patch.content = content;
    }

    setSaving(true);
    const { data, error: err } = await supabase
      .from(tableMap[type])
      .update(patch)
      .eq("id", item.id)
      .select()
      .single();
    setSaving(false);

    if (err) { setError(err.message); return; }
    onSaved(data as ManageRow);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "oklch(0.05 0.01 280 / 0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "oklch(0.11 0.015 280)", borderTopLeftRadius: 20, borderTopRightRadius: 20, border: "1px solid var(--border-subtle)", borderBottom: "none", padding: "16px 20px 28px", maxHeight: "88vh", overflowY: "auto" }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border-subtle)", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Editar {typeLabel[type]}</h2>
        <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 8 }}>Por: {item.submitted_by || "Anônimo"}</p>

        <label style={labelStyle}>Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />

        {type === "video" && (
          <>
            <label style={labelStyle}>Link do YouTube</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} placeholder="https://youtube.com/watch?v=..." />
          </>
        )}
        {type === "doc" && (
          <>
            <label style={labelStyle}>Link do arquivo</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} />
          </>
        )}
        {type === "prompt" && (
          <>
            <label style={labelStyle}>Conteúdo</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={7} style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }} />
          </>
        )}

        <label style={labelStyle}>Seção</label>
        <select value={section} onChange={(e) => setSection(e.target.value)} style={inputStyle}>
          <option value="">Sem seção</option>
          {SECTIONS_BY_TYPE[type].map((s) => (
            <option key={s.slug} value={s.slug}>{s.label}</option>
          ))}
        </select>

        <label style={labelStyle}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as ManageRow["status"])} style={inputStyle}>
          <option value="pending">Pendente</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
        </select>

        {error && <p style={{ color: "oklch(0.70 0.20 25)", fontSize: 13, marginTop: 10 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} disabled={saving} style={{ flex: 1, padding: "13px", borderRadius: 10, background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "13px", borderRadius: 10, background: "oklch(0.45 0.20 292 / 0.25)", border: "1px solid var(--border-accent)", color: "var(--accent-bright)", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
