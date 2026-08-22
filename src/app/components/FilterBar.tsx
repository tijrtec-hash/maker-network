"use client";

interface SortOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  sort: string;
  onSortChange: (value: string) => void;
  options?: SortOption[];
}

const defaultOptions: SortOption[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "az", label: "A - Z" },
];

export function FilterBar({ sort, onSortChange, options = defaultOptions }: FilterBarProps) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
      {options.map((opt) => {
        const active = sort === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            aria-pressed={active}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: active ? "oklch(0.45 0.20 292 / 0.22)" : "oklch(0.16 0.02 280)",
              border: `1px solid ${active ? "var(--border-accent)" : "var(--border-subtle)"}`,
              color: active ? "var(--accent-bright)" : "var(--text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
