"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.04em", margin: "14px 0 6px" };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" as const };

export function SiteSettingsManager() {
  const [handle, setHandle] = useState("");
  const [url, setUrl] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", "main").single().then(({ data }) => {
      if (data) {
        setHandle(data.instagram_handle || "");
        setUrl(data.instagram_url || "");
        setIconUrl(data.icon_url || null);
      }
    });
  }, []);

  const handleIconSelect = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Selecione uma imagem (JPG, PNG, WebP)."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Imagem muito grande. Limite: 2 MB."); return; }
    setIconFile(file);
    const prev = URL.createObjectURL(file);
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconPreview(prev);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      let newIconUrl = iconUrl;

      if (iconFile) {
        const ext = iconFile.name.split(".").pop();
        const path = `icon-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("site").upload(path, iconFile, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("site").getPublicUrl(path);
        newIconUrl = data.publicUrl;
      }

      const { error: err } = await supabase.from("site_settings").update({
        instagram_handle: handle.trim() || null,
        instagram_url: url.trim() || null,
        icon_url: newIconUrl,
        updated_at: new Date().toISOString(),
      }).eq("id", "main");
      if (err) throw err;

      setIconUrl(newIconUrl);
      setIconFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ borderRadius: "var(--radius-md)", background: "oklch(0.14 0.02 280)", border: "1px solid var(--border-subtle)", padding: "16px", marginBottom: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Rodapé do site</p>
        <p style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 12 }}>Aparece no rodapé da home como "desenvolvido por @seu-instagram"</p>

        <label style={labelStyle}>Seu @instagram (ex: @seuusuario)</label>
        <input value={handle} onChange={(e) => setHandle(e.target.value)} style={inputStyle} placeholder="@seuusuario" />

        <label style={labelStyle}>Link do instagram</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} placeholder="https://instagram.com/seuusuario" />

        <label style={labelStyle}>Ícone / foto de perfil</label>
        <input ref={iconRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleIconSelect(f); }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {(iconPreview || iconUrl) && (
            <img src={iconPreview || iconUrl!} alt="Ícone" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-accent)", flexShrink: 0 }} />
          )}
          <button type="button" onClick={() => iconRef.current?.click()}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "oklch(0.18 0.02 280)", border: "1px dashed var(--border-subtle)", color: "var(--text-muted)", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            {iconPreview || iconUrl ? "Trocar ícone" : "Fazer upload do ícone"}
          </button>
        </div>
        <p style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 4 }}>JPG, PNG, WebP · Máx. 2 MB</p>

        {error && <p style={{ color: "oklch(0.70 0.20 25)", fontSize: 12, marginTop: 8 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ marginTop: 14, width: "100%", padding: "12px", borderRadius: 10, background: saved ? "oklch(0.40 0.15 145 / 0.25)" : "oklch(0.45 0.20 292 / 0.25)", border: `1px solid ${saved ? "oklch(0.55 0.18 145 / 0.6)" : "var(--border-accent)"}`, color: saved ? "oklch(0.70 0.18 145)" : "var(--accent-bright)", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Salvando..." : saved ? "✓ Salvo" : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
