"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Prompt } from "@/types";
import { PromptCard } from "@/app/components/PromptCard";
import { PROMPT_SECTIONS } from "@/lib/sections";

export default function PromptSectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const section = PROMPT_SECTIONS.find((s) => s.slug === slug);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("prompts")
        .select("*")
        .eq("status", "approved")
        .eq("section", slug)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      setPrompts((data as Prompt[]) || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.08 0.01 280 / 0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <Link href="/" aria-label="Voltar" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{section?.label ?? "Seção"}</span>
      </header>

      <main style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "20px 16px 48px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer" style={{ borderRadius: "var(--radius-lg)", height: 180 }} />)}
          </div>
        ) : prompts.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
            <p style={{ fontSize: 14 }}>Nenhum prompt nesta seção ainda.</p>
          </div>
        ) : (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
          </section>
        )}
      </main>
    </div>
  );
}
