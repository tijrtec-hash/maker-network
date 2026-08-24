"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DocCard } from "./DocCard";
import { FilterBar } from "./FilterBar";
import { SectionCard } from "./SectionCard";
import { Pagination } from "./Pagination";
import { Doc } from "@/types";
import { DOC_SECTIONS } from "@/lib/sections";

const PAGE_SIZE = 15;

interface DocsTabProps {
  searchQuery?: string;
}

export function DocsTab({ searchQuery = "" }: DocsTabProps) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("manual");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("docs")
        .select("*")
        .eq("status", "approved")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (err) setError(err.message);
      else setDocs(data as Doc[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = docs;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [docs, searchQuery, sort]);

  useEffect(() => { setPage(1); }, [searchQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      {/* Seções — pills on desktop, cards on mobile */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-pills-row desktop-only">
          {DOC_SECTIONS.map((s) => (
            <a key={s.slug} href={`/docs/secao/${s.slug}`} className="section-pill-desktop">
              {s.label}
            </a>
          ))}
        </div>
        <div className="mobile-only">
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>Seções</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {DOC_SECTIONS.map((s) => (
              <SectionCard key={s.slug} type="doc" slug={s.slug} label={s.label} count={docs.filter((d) => d.section === s.slug).length} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterBar sort={sort} onSortChange={setSort} options={[{ value: "manual", label: "Ordem do painel" }, { value: "recent", label: "Mais recentes" }, { value: "oldest", label: "Mais antigos" }, { value: "az", label: "A - Z" }]} />
      </div>

      {docs.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <p style={{ fontSize: 14 }}>Nenhum documento disponível ainda.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <p style={{ fontSize: 14 }}>Nenhum resultado para &ldquo;{searchQuery}&rdquo;.</p>
        </div>
      ) : (
        <>
          <section aria-label="Documentos" className="docs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {paginated.map((doc) => <DocCard key={doc.id} doc={doc} />)}
          </section>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
