"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { VideoCard } from "./VideoCard";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { Video } from "@/types";

export function VideoTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (err) setError(err.message);
      else setVideos(data as Video[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = videos;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [videos, query, sort]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar vídeos..." />
      <FilterBar sort={sort} onSortChange={setSort} />

      {videos.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} aria-hidden="true">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          <p style={{ fontSize: 14 }}>Nenhum vídeo disponível ainda.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
          <p style={{ fontSize: 14 }}>Nenhum resultado para &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <section aria-label="Vídeos" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </section>
      )}
    </div>
  );
}
