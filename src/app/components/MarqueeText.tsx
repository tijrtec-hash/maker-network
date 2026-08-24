"use client";

import { useEffect, useId, useRef, useState } from "react";

interface MarqueeTextProps {
  text: string;
  style?: React.CSSProperties;
  className?: string;
}

const STATIC_MS = 2000; // tempo parado no in\u00edcio antes de rolar
const PAUSE_MS = 2000; // tempo parado no final, com o texto todo revelado
const FADE_MS = 400; // dura\u00e7\u00e3o do esmaecer/reaparecer
const PX_PER_SECOND = 38; // velocidade da rolagem

/**
 * Texto que se comporta como um "letreiro digital": quando cabe no espa\u00e7o
 * dispon\u00edvel, fica est\u00e1tico normalmente. Quando \u00e9 maior que o container,
 * ele fica parado por 2s, rola suavemente at\u00e9 revelar o restante, pausa
 * por 2s no final, esmaece e reaparece do in\u00edcio, reiniciando o loop.
 * Uma vinheta leve nas bordas esquerda/direita suaviza o corte do texto.
 */
export function MarqueeText({ text, style, className }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);
  const [scrollMs, setScrollMs] = useState(0);
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const textEl = textRef.current;
      if (!container || !textEl) return;
      const overflow = Math.ceil(textEl.scrollWidth - container.clientWidth);
      if (overflow > 2) {
        setDistance(overflow);
        setScrollMs(Math.min(6000, Math.max(900, (overflow / PX_PER_SECOND) * 1000)));
      } else {
        setDistance(0);
        setScrollMs(0);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  const animating = distance > 0;
  const animName = `marquee-${uid}`;
  const totalMs = STATIC_MS + scrollMs + PAUSE_MS + FADE_MS + FADE_MS;

  const pStaticEnd = (STATIC_MS / totalMs) * 100;
  const pScrollEnd = ((STATIC_MS + scrollMs) / totalMs) * 100;
  const pPauseEnd = ((STATIC_MS + scrollMs + PAUSE_MS) / totalMs) * 100;
  const pFadeOutEnd = ((STATIC_MS + scrollMs + PAUSE_MS + FADE_MS) / totalMs) * 100;
  const pResetPoint = Math.min(99.9, pFadeOutEnd + 0.1);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        WebkitMaskImage: animating
          ? "linear-gradient(to right, transparent 0, black 10px, black calc(100% - 10px), transparent 100%)"
          : undefined,
        maskImage: animating
          ? "linear-gradient(to right, transparent 0, black 10px, black calc(100% - 10px), transparent 100%)"
          : undefined,
        ...style,
      }}
    >
      {animating && (
        <style>{`
          @keyframes ${animName} {
            0% { transform: translateX(0); opacity: 1; }
            ${pStaticEnd}% { transform: translateX(0); opacity: 1; }
            ${pScrollEnd}% { transform: translateX(-${distance}px); opacity: 1; }
            ${pPauseEnd}% { transform: translateX(-${distance}px); opacity: 1; }
            ${pFadeOutEnd}% { transform: translateX(-${distance}px); opacity: 0; }
            ${pResetPoint}% { transform: translateX(0); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      )}
      <span
        ref={textRef}
        style={{
          display: animating ? "inline-block" : "block",
          whiteSpace: "nowrap",
          overflow: animating ? "visible" : "hidden",
          textOverflow: animating ? undefined : "ellipsis",
          width: animating ? undefined : "100%",
          willChange: animating ? "transform, opacity" : undefined,
          animation: animating ? `${animName} ${totalMs}ms linear infinite` : undefined,
        }}
      >
        {text}
      </span>
    </div>
  );
}
