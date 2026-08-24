/**
 * Converte qualquer formato de URL do YouTube (watch, youtu.be, shorts, embed)
 * para o formato de embed correto, que é o único aceito dentro de um <iframe>.
 *
 * O YouTube bloqueia (via X-Frame-Options/CSP) o carregamento de
 * youtube.com/watch?v=... dentro de iframes — por isso vídeos colados
 * nesse formato aparecem com "conexão recusada".
 *
 * Retorna null se a URL não for reconhecida como um link do YouTube válido.
 */
export function getYouTubeEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = url.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.split("/embed/")[1]?.split("/")[0] || null;
    } else if (url.pathname.startsWith("/shorts/")) {
      videoId = url.pathname.split("/shorts/")[1]?.split("/")[0] || null;
    } else if (url.pathname.startsWith("/live/")) {
      videoId = url.pathname.split("/live/")[1]?.split("/")[0] || null;
    }
  } else {
    return null;
  }

  if (!videoId) return null;
  videoId = videoId.split("?")[0].split("&")[0];

  return `https://www.youtube.com/embed/${videoId}`;
}

/** Verifica se uma URL j\u00e1 est\u00e1 pronta para ser usada em iframe. */
export function isEmbeddableUrl(url: string): boolean {
  return /youtube(-nocookie)?\.com\/embed\//.test(url) || /player\.vimeo\.com\/video\//.test(url);
}

/**
 * Extrai a URL da thumbnail de alta resolu\u00e7\u00e3o a partir de uma URL de embed
 * do YouTube (ex: https://www.youtube.com/embed/VIDEO_ID). Retorna null se
 * n\u00e3o for poss\u00edvel identificar o v\u00eddeo (ex: Vimeo).
 */
export function getYouTubeThumbnail(embedUrl: string): string | null {
  const match = embedUrl.match(/youtube(?:-nocookie)?\.com\/embed\/([^/?&]+)/);
  if (!match) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}
