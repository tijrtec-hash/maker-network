"use client";

import { Video } from "@/types";
import { getYouTubeEmbedUrl, isEmbeddableUrl } from "@/lib/youtube";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  // Proteção retroativa: se o vídeo foi salvo com uma URL não-embeddable
  // (ex: youtube.com/watch?v=...), convertemos aqui na renderização para
  // que o iframe não seja recusado pelo YouTube.
  const embedSrc = isEmbeddableUrl(video.embed_url)
    ? video.embed_url
    : getYouTubeEmbedUrl(video.embed_url) ?? video.embed_url;

  return (
    <article
      style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--bg-glass)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Embed */}
      <div style={{ position: "relative", paddingBottom: "56.25%", background: "var(--bg-raised)" }}>
        <iframe
          src={embedSrc}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          loading="lazy"
        />
      </div>

      {/* Title */}
      <div style={{ padding: "12px 16px 14px" }}>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.4,
            color: "var(--text-primary)",
          }}
        >
          {video.title}
        </h2>
      </div>
    </article>
  );
}
