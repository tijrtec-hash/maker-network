export interface SectionDef {
  slug: string;
  label: string;
}

export const VIDEO_SECTIONS: SectionDef[] = [
  { slug: "aulas-completas", label: "Aulas Completas" },
  { slug: "dicas-rapidas", label: "Dicas Rápidas" },
  { slug: "tutoriais", label: "Tutoriais" },
  { slug: "cases-aplicacoes", label: "Cases e Aplicações" },
];

export const DOC_SECTIONS: SectionDef[] = [
  { slug: "guias-manuais", label: "Guias e Manuais" },
  { slug: "ebooks", label: "E-books" },
  { slug: "planilhas", label: "Planilhas" },
];

export const PROMPT_SECTIONS: SectionDef[] = [
  { slug: "produtividade", label: "Produtividade" },
  { slug: "marketing-copy", label: "Marketing e Copy" },
  { slug: "programacao", label: "Programação" },
  { slug: "escrita-conteudo", label: "Escrita e Conteúdo" },
  { slug: "analise-dados", label: "Análise de Dados" },
  { slug: "criatividade-design", label: "Criatividade e Design" },
];

export const SECTIONS_BY_TYPE: Record<"video" | "doc" | "prompt", SectionDef[]> = {
  video: VIDEO_SECTIONS,
  doc: DOC_SECTIONS,
  prompt: PROMPT_SECTIONS,
};

export function sectionLabel(type: "video" | "doc" | "prompt", slug: string | null | undefined): string | null {
  if (!slug) return null;
  const found = SECTIONS_BY_TYPE[type].find((s) => s.slug === slug);
  return found ? found.label : null;
}
