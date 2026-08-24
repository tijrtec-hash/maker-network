"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page numbers to show: always first, last, current ±1, with ellipsis
  const pages: (number | "...")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (page > 3) pages.push("...");
  if (page > 2) add(page - 1);
  add(page);
  if (page < totalPages - 1) add(page + 1);
  if (page < totalPages - 2) pages.push("...");
  add(totalPages);

  const btn = (label: React.ReactNode, target: number, disabled: boolean, ariaLabel: string) => (
    <button
      key={ariaLabel}
      onClick={() => !disabled && onPageChange(target)}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        minWidth: 32, height: 32, padding: "0 6px",
        borderRadius: 8,
        background: "oklch(0.16 0.02 280)",
        border: "1px solid var(--border-subtle)",
        color: disabled ? "var(--text-faint)" : "var(--text-muted)",
        fontSize: 13, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "16px 0 4px", flexWrap: "wrap" }}>
      {btn("«", 1, page === 1, "Primeira página")}
      {btn("‹", page - 1, page === 1, "Página anterior")}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} style={{ fontSize: 13, color: "var(--text-faint)", padding: "0 2px" }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-label={`Página ${p}`}
            aria-current={p === page ? "page" : undefined}
            style={{
              minWidth: 32, height: 32, padding: "0 6px",
              borderRadius: 8,
              background: p === page ? "oklch(0.45 0.20 292 / 0.22)" : "oklch(0.16 0.02 280)",
              border: `1px solid ${p === page ? "var(--border-accent)" : "var(--border-subtle)"}`,
              color: p === page ? "var(--accent-bright)" : "var(--text-muted)",
              fontSize: 13, fontWeight: p === page ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        )
      )}

      {btn("›", page + 1, page === totalPages, "Próxima página")}
      {btn("»", totalPages, page === totalPages, "Última página")}
    </div>
  );
}
