"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Video, Playlist } from "@/types";
import { VideoCard } from "@/app/components/VideoCard";
import { PlaylistCoverCard } from "@/app/components/PlaylistCoverCard";
import { VIDEO_SECTIONS } from "@/lib/sections";

export default function VideoSectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistCounts, setPlaylistCounts] = useState<Record<string, number>>({});
  const [playlistedVideoIds, setPlaylistedVideoIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const section = VIDEO_SECTIONS.find((s) => s.slug === slug);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "approved")
        .eq("section", slug)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      setVideos((data as Video[]) || []);

      // Playlists vinculadas a esta seção específica
      const { data: pls } = await supabase
        .from("playlists")
        .select("*")
        .eq("section", slug)
        .order("sort_order", { ascending: true });
      setPlaylists((pls as Playlist[]) || []);

      if (pls && pls.length > 0) {
        const playlistIds = pls.map((p) => p.id);
        const { data: links } = await supabase
          .from("playlist_videos")
          .select("playlist_id, video_id")
          .in("playlist_id", playlistIds);
        const counts: Record<string, number> = {};
        const videoIds = new Set<string>();
        (links || []).forEach((l: { playlist_id: string; video_id: string }) => {
          counts[l.playlist_id] = (counts[l.playlist_id] || 0) + 1;
          videoIds.add(l.video_id);
        });
        setPlaylistCounts(counts);
        setPlaylistedVideoIds(videoIds);
      } else {
        setPlaylistCounts({});
        setPlaylistedVideoIds(new Set());
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  // Vídeos desta seção que NÃO fazem parte de nenhuma playlist — mostrados avulsos
  const looseVideos = videos.filter((v) => !playlistedVideoIds.has(v.id));

  return (
    <div className="detail-shell detail-wide">
      <div className="detail-card">
      <header className="detail-header" style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.08 0.01 280 / 0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <Link href="/" aria-label="Voltar" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{section?.label ?? "Seção"}</span>
      </header>

      <main className="detail-main" style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "20px 16px 48px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ borderRadius: "var(--radius-lg)", height: 240 }} />)}
          </div>
        ) : videos.length === 0 && playlists.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
            <p style={{ fontSize: 14 }}>Nenhum vídeo nesta seção ainda.</p>
          </div>
        ) : (
          <section className="video-list-grid" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {playlists.map((pl) => (
              <PlaylistCoverCard key={pl.id} playlist={pl} count={playlistCounts[pl.id] || 0} />
            ))}
            {looseVideos.map((video) => <VideoCard key={video.id} video={video} />)}
          </section>
        )}
      </main>
      </div>
    </div>
  );
}
