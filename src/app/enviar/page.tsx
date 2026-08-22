"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

type ContentType = "video" | "doc" | "prompt";
type DocInputMode = "link" | "upload";

interface FormState {
  type: ContentType;
  title: string;
  url: string;
  text: string;
  submitter: string;
  file: File | null;
  docMode: DocInputMode;
  cover: File | null;
  coverPreview: string | null;
}

const typeLabels: Record<ContentType, string> = { video: "Vídeo", doc: "Documento", prompt: "Prompt" };

const typeIcons: Record<ContentType, React.ReactNode> = {
  video: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  prompt: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

const ACCEPTED_DOC = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv";
const ACCEPTED_IMG = "image/jpeg,image/png,image/webp,image/gif";
const MAX_DOC = 50 * 1024 * 1024;
const MAX_IMG = 5 * 1024 * 1024;

export default function EnviarPage() {
  const [form, setForm] = useState<FormState>({ type: "video", title: "", url: "", text: "", submitter: "", file: null, docMode: "link", cover: null, coverPreview: null });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileError(null);
    if (file.size > MAX_DOC) { setFileError("Arquivo muito grande. Limite: 50 MB."); return; }
    const name = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setForm((f) => ({ ...f, file, title: f.title || name }));
  };

  const handleCover = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Selecione uma imagem (JPG, PNG, WebP ou GIF)."); return; }
    if (file.size > MAX_IMG) { setError("Imagem muito grande. Limite: 5 MB."); return; }
    const preview = URL.createObjectURL(file);
    setForm((f) => { if (f.coverPreview) URL.revokeObjectURL(f.coverPreview); return { ...f, cover: file, coverPreview: preview }; });
  };

  const uploadCover = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: err } = await supabase.storage.from("covers").upload(path, file, { cacheControl: "3600", upsert: false });
    if (err) throw err;
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.type === "doc" && form.docMode === "upload" && !form.file) { setFileError("Selecione um arquivo."); return; }

    // Valida e normaliza o link do YouTube antes de salvar. Links no formato
    // "watch?v=..." são bloqueados pelo YouTube dentro de iframe — por isso
    // convertemos sempre para o formato /embed/, que é o único que funciona.
    let videoEmbedUrl = form.url;
    if (form.type === "video") {
      const embed = getYouTubeEmbedUrl(form.url);
      if (!embed) { setError("Link do YouTube inválido. Cole a URL completa do vídeo (ex: https://youtube.com/watch?v=... ou https://youtu.be/...)."); return; }
      videoEmbedUrl = embed;
    }

    setLoading(true);
    try {
      let coverUrl: string | null = null;
      if (form.cover) coverUrl = await uploadCover(form.cover);

      if (form.type === "video") {
        const { error: err } = await supabase.from("videos").insert({ title: form.title, embed_url: videoEmbedUrl, submitted_by: form.submitter || null, status: "pending" });
        if (err) throw err;
      } else if (form.type === "doc") {
        let fileUrl: string | null = null;
        let storagePath: string | null = null;
        if (form.docMode === "upload" && form.file) {
          const ext = form.file.name.split(".").pop();
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: upErr } = await supabase.storage.from("docs").upload(path, form.file, { cacheControl: "3600", upsert: false });
          if (upErr) throw upErr;
          const { data: urlData } = supabase.storage.from("docs").getPublicUrl(path);
          fileUrl = urlData.publicUrl; storagePath = path;
        } else { fileUrl = form.url; }
        const { error: err } = await supabase.from("docs").insert({ title: form.title, file_url: fileUrl, storage_path: storagePath, cover_url: coverUrl, submitted_by: form.submitter || null, status: "pending" });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("prompts").insert({ title: form.title, content: form.text, cover_url: coverUrl, submitted_by: form.submitter || null, status: "pending" });
        if (err) throw err;
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    if (form.coverPreview) URL.revokeObjectURL(form.coverPreview);
    setForm({ type: "video", title: "", url: "", text: "", submitter: "", file: null, docMode: "link", cover: null, coverPreview: null });
    setError(null); setFileError(null); setSubmitted(false);
  };

  if (submitted) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "oklch(0.45 0.20 292 / 0.20)", border: "2px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 0 32px var(--accent-glow)" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>Conteúdo enviado!</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, textAlign: "center", lineHeight: 1.5, marginBottom: 32 }}>Seu envio está em análise e será publicado após aprovação.</p>
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        <button onClick={reset} style={{ flex: 1, padding: "14px", borderRadius: "var(--radius-md)", background: "oklch(0.45 0.20 292 / 0.18)", border: "1px solid var(--border-accent)", color: "var(--accent-bright)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Enviar outro</button>
        <a href="/" style={{ flex: 1, padding: "14px", borderRadius: "var(--radius-md)", background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontWeight: 500, fontSize: 15, textDecoration: "none", textAlign: "center" }}>Voltar</a>
      </div>
    </div>
  );

  const label = (text: string) => ({ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 8 });
  const input = { width: "100%", padding: "13px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 15, outline: "none" };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.08 0.01 280 / 0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <a href="/" aria-label="Voltar" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </a>
        <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>Enviar conteúdo</h1>
      </header>

      <main style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "24px 16px 48px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Type */}
          <fieldset style={{ border: "none", padding: 0 }}>
            <legend style={label("Tipo de conteúdo")}>Tipo de conteúdo</legend>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {(["video", "doc", "prompt"] as ContentType[]).map((t) => {
                const active = form.type === t;
                return (
                  <label key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: "var(--radius-md)", background: active ? "oklch(0.45 0.20 292 / 0.18)" : "var(--bg-glass)", border: `1px solid ${active ? "var(--border-accent)" : "var(--border-subtle)"}`, color: active ? "var(--accent-bright)" : "var(--text-muted)", cursor: "pointer", transition: "all 150ms ease", boxShadow: active ? "0 0 16px var(--accent-glow)" : "none" }}>
                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => setForm((f) => ({ ...f, type: t, file: null, url: "", docMode: "link", cover: null, coverPreview: null }))} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
                    {typeIcons[t]}
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{typeLabels[t]}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Title */}
          <div>
            <label htmlFor="title" style={label("Título *")}>Título *</label>
            <input id="title" type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Nome do conteúdo" style={input} />
          </div>

          {/* Video URL */}
          {form.type === "video" && (
            <div>
              <label htmlFor="url" style={label("Link do vídeo *")}>Link do vídeo *</label>
              <input id="url" type="url" required value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://youtube.com/..." style={input} />
            </div>
          )}

          {/* Doc */}
          {form.type === "doc" && (
            <div>
              <p style={label("Origem do documento *")}>Origem do documento *</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {(["link", "upload"] as DocInputMode[]).map((mode) => {
                  const active = form.docMode === mode;
                  return (
                    <button key={mode} type="button" onClick={() => { setForm((f) => ({ ...f, docMode: mode, url: "", file: null })); setFileError(null); }}
                      style={{ padding: "10px", borderRadius: "var(--radius-md)", background: active ? "oklch(0.45 0.20 292 / 0.18)" : "var(--bg-glass)", border: `1px solid ${active ? "var(--border-accent)" : "var(--border-subtle)"}`, color: active ? "var(--accent-bright)" : "var(--text-muted)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 150ms ease" }}>
                      {mode === "link"
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>}
                      {mode === "link" ? "Colar link" : "Arquivo local"}
                    </button>
                  );
                })}
              </div>
              {form.docMode === "link" && <input type="url" required value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://drive.google.com/..." style={input} />}
              {form.docMode === "upload" && (
                <div>
                  <input ref={fileRef} type="file" accept={ACCEPTED_DOC} aria-label="Selecionar arquivo" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }} />
                  {!form.file ? (
                    <div role="button" tabIndex={0} aria-label="Área de upload"
                      onClick={() => fileRef.current?.click()}
                      onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                      style={{ border: `2px dashed ${dragOver ? "var(--accent)" : fileError ? "oklch(0.55 0.20 25/0.7)" : "oklch(0.30 0.05 280/0.8)"}`, borderRadius: "var(--radius-md)", padding: "32px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "oklch(0.45 0.20 292/0.08)" : "oklch(0.12 0.015 280/0.5)", transition: "all 150ms ease" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "var(--accent)" : "var(--text-faint)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }} aria-hidden="true"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{dragOver ? "Solte o arquivo aqui" : "Clique ou arraste um arquivo"}</p>
                      <p style={{ fontSize: 12, color: "var(--text-faint)" }}>PDF, DOC, DOCX, XLS, XLSX, PPT, TXT, MD · Máx. 50 MB</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "oklch(0.45 0.20 292/0.10)", border: "1px solid var(--border-accent)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "oklch(0.20 0.03 280)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.file.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{formatBytes(form.file.size)}</p>
                      </div>
                      <button type="button" aria-label="Remover arquivo" onClick={() => { setForm((f) => ({ ...f, file: null })); setFileError(null); if (fileRef.current) fileRef.current.value = ""; }}
                        style={{ background: "oklch(0.38 0.18 25/0.18)", border: "1px solid oklch(0.55 0.20 25/0.4)", borderRadius: 8, padding: "6px 10px", color: "oklch(0.70 0.20 25)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  )}
                  {fileError && <p role="alert" style={{ fontSize: 12, color: "oklch(0.70 0.20 25)", marginTop: 8 }}>{fileError}</p>}
                </div>
              )}
            </div>
          )}

          {/* Prompt */}
          {form.type === "prompt" && (
            <div>
              <label htmlFor="text" style={label("Texto do prompt *")}>Texto do prompt *</label>
              <textarea id="text" required value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} placeholder="Cole o texto completo do prompt aqui..." rows={6}
                style={{ ...input, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
            </div>
          )}

          {/* Cover image — doc and prompt only */}
          {(form.type === "doc" || form.type === "prompt") && (
            <div>
              <p style={label("Imagem de capa (opcional)")}>Imagem de capa (opcional)</p>
              <input ref={coverRef} type="file" accept={ACCEPTED_IMG} aria-label="Selecionar imagem de capa" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCover(f); }} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }} />
              {!form.cover ? (
                <button type="button" onClick={() => coverRef.current?.click()}
                  style={{ width: "100%", padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-glass)", border: "1px dashed oklch(0.30 0.05 280/0.8)", color: "var(--text-muted)", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  Adicionar imagem de capa
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>JPG, PNG, WebP · Máx. 5 MB</span>
                </button>
              ) : (
                <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "16/7" }}>
                  <img src={form.coverPreview!} alt="Pré-visualização da capa" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button type="button" aria-label="Remover imagem de capa"
                    onClick={() => { if (form.coverPreview) URL.revokeObjectURL(form.coverPreview); setForm((f) => ({ ...f, cover: null, coverPreview: null })); if (coverRef.current) coverRef.current.value = ""; }}
                    style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: "50%", background: "oklch(0.08 0.01 280/0.85)", border: "1px solid oklch(0.28 0.04 280/0.5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submitter */}
          <div>
            <label htmlFor="submitter" style={label("Seu nome (opcional)")}>Seu nome (opcional)</label>
            <input id="submitter" type="text" value={form.submitter} onChange={(e) => setForm((f) => ({ ...f, submitter: e.target.value }))} placeholder="Como quer ser creditado" style={input} />
          </div>

          {/* Error */}
          {error && (
            <div role="alert" style={{ padding: "12px 14px", borderRadius: "var(--radius-md)", background: "oklch(0.38 0.18 25/0.15)", border: "1px solid oklch(0.55 0.20 25/0.4)", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="oklch(0.70 0.20 25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p style={{ fontSize: 13, color: "oklch(0.70 0.20 25)", lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          {/* Notice */}
          <div style={{ padding: "12px 14px", borderRadius: "var(--radius-md)", background: "oklch(0.45 0.20 292/0.08)", border: "1px solid oklch(0.45 0.20 292/0.25)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>O conteúdo enviado passará por revisão antes de ser publicado na plataforma.</p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "15px", borderRadius: "var(--radius-md)", background: loading ? "oklch(0.35 0.14 292/0.5)" : "oklch(0.55 0.22 292)", border: "none", color: "#fff", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : "0 0 24px var(--accent-glow)", transition: "all 200ms ease" }}>
            {loading
              ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Enviando...</>
              : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>Enviar conteúdo</>}
          </button>
        </form>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: var(--border-accent) !important; box-shadow: 0 0 0 3px var(--accent-glow); }
        input::placeholder, textarea::placeholder { color: var(--text-faint); }
      `}</style>
    </div>
  );
}
