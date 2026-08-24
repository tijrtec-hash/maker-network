"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PromptCard } from "./PromptCard";
import { FilterBar } from "./FilterBar";
import { SectionCard } from "./SectionCard";
import { Pagination } from "./Pagination";
import { Prompt } from "@/types";
import { PROMPT_SECTIONS } from "@/lib/sections";

const PAGE_SIZE = 12;

interface PromptsTabProps {
  searchQuery?: string;
}

export function PromptsTab({ searchQuery = "" }: PromptsTabProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("manual");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("prompts")
        .select("*")
        .eq("status", "approved")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (err) setError(err.message);
      else setPrompts(data as Prompt[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = prompts;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [prompts, searchQuery, sort]);

  useEffect(() => { setPage(1); }, [searchQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      {/* Seções — pills on desktop, cards on mobile */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-pills-row desktop-only">
          {PROMPT_SECTIONS.map((s) => (
            <a key={s.slug} href={`/prompts/secao/${s.slug}`} className="section-pill-desktop">
              {s.label}
            </a>
          ))}
        </div>
        <div className="mobile-only">
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>Seções</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {PROMPT_SECTIONS.map((s) => (
              <SectionCard key={s.slug} type="prompt" slug={s.slug} label={s.label} count={prompts.filter((p) => p.section === s.slug).length} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterBar sort={sort} onSortChange={setSort} options={[{ value: "manual", label: "Ordem do painel" }, { value: "recent", label: "Mais recentes" }, { value: "oldest", label: "Mais antigos" }, { value: "az", label: "A - Z" }]} />
      </div>

      {prompts.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} aria-hidden="true">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          <p style={{ fontSize: 14 }}>Nenhum prompt disponível ainda.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <p style={{ fontSize: 14 }}>Nenhum resultado para &ldquo;{searchQuery}&rdquo;.</p>
        </div>
      ) : (
        <>
          <section aria-label="Prompts" className="prompts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {paginated.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </section>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
