"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { VideoCard } from "./VideoCard";
import { FilterBar } from "./FilterBar";
import { SectionCard } from "./SectionCard";
import { Pagination } from "./Pagination";
import { Video } from "@/types";
import { VIDEO_SECTIONS } from "@/lib/sections";
import { useIsDesktop } from "@/lib/useIsDesktop";

const PAGE_SIZE_MOBILE = 5;
const PAGE_SIZE_DESKTOP = 12;

interface VideoTabProps {
  searchQuery?: string;
}

export function VideoTab({ searchQuery = "" }: VideoTabProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("manual");
  const [page, setPage] = useState(1);
  const isDesktop = useIsDesktop();
  const PAGE_SIZE = isDesktop ? PAGE_SIZE_DESKTOP : PAGE_SIZE_MOBILE;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "approved")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (err) setError(err.message);
      else setVideos(data as Video[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = videos;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [videos, searchQuery, sort]);

  useEffect(() => { setPage(1); }, [searchQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="videos-grid" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer" style={{ borderRadius: "var(--radius-lg)", height: 240 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: "oklch(0.70 0.20 25)" }}>
        <p style={{ fontSize: 14 }}>Erro ao carregar vídeos: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Seções — pills on desktop, cards on mobile */}
      <div style={{ marginBottom: 20 }}>
        {/* Desktop pill row */}
        <div className="section-pills-row desktop-only">
          {VIDEO_SECTIONS.map((s) => (
            <a key={s.slug} href={`/videos/secao/${s.slug}`} className="section-pill-desktop">
              {s.label}
            </a>
          ))}
        </div>
        {/* Mobile card grid */}
        <div className="mobile-only">
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>Seções</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {VIDEO_SECTIONS.map((s) => (
              <SectionCard key={s.slug} type="video" slug={s.slug} label={s.label} count={videos.filter((v) => v.section === s.slug).length} />
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar — desktop hides label */}
      <div style={{ marginBottom: 16 }}>
        <FilterBar sort={sort} onSortChange={setSort} options={[{ value: "manual", label: "Ordem do painel" }, { value: "recent", label: "Mais recentes" }, { value: "oldest", label: "Mais antigos" }, { value: "az", label: "A - Z" }]} />
      </div>

      {videos.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} aria-hidden="true">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          <p style={{ fontSize: 14 }}>Nenhum vídeo disponível ainda.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <p style={{ fontSize: 14 }}>Nenhum resultado para &ldquo;{searchQuery}&rdquo;.</p>
        </div>
      ) : (
        <>
          <section aria-label="Vídeos" className="videos-grid" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {paginated.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </section>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
