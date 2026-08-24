"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SiteSettings {
  instagram_handle: string | null;
  instagram_url: string | null;
  icon_url: string | null;
}

interface SiteFooterProps {
  sidebar?: boolean;
}

export function SiteFooter({ sidebar = false }: SiteFooterProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("instagram_handle,instagram_url,icon_url")
      .eq("id", "main")
      .single()
      .then(({ data }) => setSettings(data as SiteSettings | null));
  }, []);

  if (!settings?.instagram_handle && !settings?.icon_url) return null;

  if (sidebar) {
    return (
      <div style={{
        padding: "16px 20px 8px",
        borderTop: "1px solid oklch(0.18 0.03 280 / 0.6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}>
        {settings.icon_url && (
          <img
            src={settings.icon_url}
            alt="Ícone"
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <span style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center", lineHeight: 1.4 }}>
          desenvolvido por{" "}
          {settings.instagram_url ? (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-bright)", textDecoration: "none", fontWeight: 600 }}
            >
              {settings.instagram_handle}
            </a>
          ) : (
            <span style={{ color: "var(--accent-bright)", fontWeight: 600 }}>{settings.instagram_handle}</span>
          )}
        </span>
      </div>
    );
  }

  // Mobile bottom bar version
  return (
    <div style={{
      textAlign: "center",
      padding: "10px 20px 4px",
      borderTop: "1px solid oklch(0.20 0.02 280 / 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}>
      {settings.icon_url && (
        <img
          src={settings.icon_url}
          alt="Ícone"
          style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
      )}
      <span style={{ fontSize: 12, color: "oklch(0.55 0.02 280)" }}>
        desenvolvido por{" "}
        {settings.instagram_url ? (
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent-bright)", textDecoration: "none", fontWeight: 600 }}
          >
            {settings.instagram_handle}
          </a>
        ) : (
          <span style={{ color: "var(--accent-bright)", fontWeight: 600 }}>{settings.instagram_handle}</span>
        )}
      </span>
    </div>
  );
}
