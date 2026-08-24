"use client";

import { useState } from "react";
import { Video } from "@/types";
import { getYouTubeEmbedUrl, getYouTubeThumbnail, isEmbeddableUrl } from "@/lib/youtube";
import { VideoModal } from "./VideoModal";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [open, setOpen] = useState(false);

  // Prote\u00e7\u00e3o retroativa: se o v\u00eddeo foi salvo com uma URL n\u00e3o-embeddable
  // (ex: youtube.com/watch?v=...), convertemos aqui na renderiza\u00e7\u00e3o para
  // que o iframe n\u00e3o seja recusado pelo YouTube.
  const embedSrc = isEmbeddableUrl(video.embed_url)
    ? video.embed_url
    : getYouTubeEmbedUrl(video.embed_url) ?? video.embed_url;

  const thumbnail = video.thumbnail_url || getYouTubeThumbnail(embedSrc);

  return (
    <>
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
        {/* Thumbnail with play button \u2014 abre o v\u00eddeo em popup ao clicar.
            Usamos <div role="button"> + aspect-ratio em vez de <button> + padding-bottom%,
            pois v\u00e1rios navegadores m\u00f3veis (Safari/iOS em especial) t\u00eam bugs conhecidos
            de padding percentual em elementos <button>, o que "achatava" o card. */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}
          aria-label={`Tocar v\u00eddeo: ${video.title}`}
          style={{
            position: "relative",
            display: "block",
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor: "var(--bg-raised)",
            backgroundImage: thumbnail ? `url(${thumbnail})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: "oklch(0.05 0.01 280 / 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms ease",
            }}
            className="video-card-play-overlay"
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "oklch(0.62 0.26 292 / 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px oklch(0.62 0.26 292 / 0.4)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
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

      {open && <VideoModal embedUrl={embedSrc} title={video.title} onClose={() => setOpen(false)} />}
    </>
  );
}
