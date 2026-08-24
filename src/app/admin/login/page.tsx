"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError("Email ou senha incorretos. Tente novamente.");
    } else {
      router.push("/admin");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-coolvetica)", fontWeight: 400, fontSize: 26, letterSpacing: "0.01em" }}>
              IA MAKER{" "}
              <span style={{ fontFamily: "var(--font-alegreya)", fontStyle: "italic", fontWeight: 600, color: "var(--accent)" }}>network</span>
            </span>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Painel administrativo</p>
        </div>

        {/* Card */}
        <div style={{ borderRadius: "var(--radius-xl)", background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "32px 28px" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Entrar</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
            Acesso restrito a administradores.
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                style={{ width: "100%", padding: "13px 14px", borderRadius: "var(--radius-md)", background: "oklch(0.12 0.015 280)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 15, outline: "none" }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "13px 14px", borderRadius: "var(--radius-md)", background: "oklch(0.12 0.015 280)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 15, outline: "none" }}
              />
            </div>

            {/* Error */}
            {error && (
              <div role="alert" style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: "oklch(0.38 0.18 25 / 0.15)", border: "1px solid oklch(0.55 0.20 25 / 0.4)", display: "flex", gap: 8, alignItems: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.70 0.20 25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ fontSize: 13, color: "oklch(0.70 0.20 25)" }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: "var(--radius-md)", background: loading ? "oklch(0.35 0.14 292 / 0.5)" : "oklch(0.55 0.22 292)", border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : "0 0 24px var(--accent-glow)", transition: "all 200ms ease", marginTop: 4 }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Entrar no painel
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-faint)" }}>
          <a href="/" style={{ color: "var(--text-faint)", textDecoration: "none" }}>← Voltar ao site</a>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: var(--border-accent) !important; box-shadow: 0 0 0 3px var(--accent-glow); }
        input::placeholder { color: var(--text-faint); }
      `}</style>
    </div>
  );
}
