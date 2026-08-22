"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DocCard } from "./DocCard";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { Doc } from "@/types";

export function DocsTab() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("docs")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (err) setError(err.message);
      else setDocs(data as Doc[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = docs;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [docs, query, sort]);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="shimmer" style={{ borderRadius: "var(--radius-md)", aspectRatio: "3/4" }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: "oklch(0.70 0.20 25)" }}>
        <p style={{ fontSize: 14 }}>Erro ao carregar documentos: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar documentos..." />
      <FilterBar sort={sort} onSortChange={setSort} />

      {docs.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <p style={{ fontSize: 14 }}>Nenhum documento disponível ainda.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <p style={{ fontSize: 14 }}>Nenhum resultado para &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <section aria-label="Documentos" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </section>
      )}
    </div>
  );
}
