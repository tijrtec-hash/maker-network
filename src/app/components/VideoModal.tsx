"use client";

import { useEffect, useState } from "react";

interface VideoModalProps {
  embedUrl: string;
  title: string;
  onClose: () => void;
}

// Contador global de modais abertos. Usar um contador (em vez de guardar o
// valor anterior de `overflow` por instância) evita que o scroll do body
// fique travado permanentemente quando dois modais chegam a coexistir por
// um instante (ex.: troca rápida de vídeo, fechamento com animação em
// andamento). Só removemos o "hidden" quando o último modal desmonta.
let openModalCount = 0;

export function VideoModal({ embedUrl, title, onClose }: VideoModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));

    openModalCount += 1;
    document.documentElement.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      cancelAnimationFrame(raf);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.documentElement.style.overflow = "";
      }
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 240);
  };

  const autoplaySrc = embedUrl.includes("?") ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: visible ? "oklch(0.03 0.01 280 / 0.85)" : "oklch(0.03 0.01 280 / 0)",
        backdropFilter: visible ? "blur(20px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(20px)" : "blur(0px)",
        transition: "background 320ms ease, backdrop-filter 320ms ease, -webkit-backdrop-filter 320ms ease",
        padding: 16,
      }}
    >
      <button
        onClick={handleClose}
        aria-label="Fechar vídeo"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "oklch(0.16 0.02 280 / 0.9)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: visible ? 1 : 0,
          transition: "opacity 250ms ease",
          zIndex: 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(95vw, calc(90vh * 16 / 9))",
          aspectRatio: "16 / 9",
          borderRadius: 16,
          overflow: "hidden",
          background: "#000",
          boxShadow: "0 0 0 1px oklch(0.55 0.22 290 / 0.35), 0 40px 100px oklch(0.02 0.01 280 / 0.9)",
          transform: visible ? "scale(1)" : "scale(0.7)",
          opacity: visible ? 1 : 0,
          transition: "transform 340ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease",
        }}
      >
        <iframe
          src={autoplaySrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
    </div>
  );
}