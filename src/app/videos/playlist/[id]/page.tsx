"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Video, Playlist } from "@/types";
import { VideoCard } from "@/app/components/VideoCard";
import { notFound } from "next/navigation";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: pl } = await supabase.from("playlists").select("*").eq("id", id).single();
      setPlaylist(pl as Playlist | null);

      if (pl) {
        const { data: links } = await supabase
          .from("playlist_videos")
          .select("sort_order, videos(*)")
          .eq("playlist_id", id)
          .order("sort_order", { ascending: true });
        const vids = (links || [])
          .map((l: unknown) => (l as { videos: Video }).videos)
          .filter((v: Video) => v && v.status === "approved");
        setVideos(vids);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (!loading && !playlist) return notFound();

  return (
    <div className="detail-shell detail-wide">
      <div className="detail-card">
      <header className="detail-header" style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.08 0.01 280 / 0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <Link href="/" aria-label="Voltar" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "oklch(0.16 0.02 280)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{playlist?.title ?? "Playlist"}</span>
      </header>

      <main className="detail-main" style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "20px 16px 48px" }}>
        {playlist?.cover_url && (
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 20, aspectRatio: "16/6", background: `url(${playlist.cover_url}) center/cover` }} />
        )}
        {playlist?.description && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>{playlist.description}</p>
        )}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ borderRadius: "var(--radius-lg)", height: 240 }} />)}
          </div>
        ) : videos.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-faint)" }}>
            <p style={{ fontSize: 14 }}>Nenhum vídeo nesta playlist ainda.</p>
          </div>
        ) : (
          <section className="video-list-grid" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {videos.map((video) => <VideoCard key={video.id} video={video} />)}
          </section>
        )}
      </main>
      </div>
    </div>
  );
}
