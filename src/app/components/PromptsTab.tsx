"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PromptCard } from "./PromptCard";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { Prompt } from "@/types";

export function PromptsTab() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("prompts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (err) setError(err.message);
      else setPrompts(data as Prompt[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = prompts;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [prompts, query, sort]);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer" style={{ borderRadius: "var(--radius-lg)", height: 180 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: "oklch(0.70 0.20 25)" }}>
        <p style={{ fontSize: 14 }}>Erro ao carregar prompts: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar prompts..." />
      <FilterBar sort={sort} onSortChange={setSort} />

      {prompts.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} aria-hidden="true">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          <p style={{ fontSize: 14 }}>Nenhum prompt disponível ainda.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <p style={{ fontSize: 14 }}>Nenhum resultado para &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <section aria-label="Prompts" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {filtered.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </section>
      )}
    </div>
  );
}
