"use client";

import { useState } from "react";

const tabs = ["videos", "docs", "prompts"] as const;
type Tab = (typeof tabs)[number];

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "oklch(0.08 0.01 280 / 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid oklch(0.28 0.04 280 / 0.4)",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              IA MAKER{" "}
              <span style={{ color: "var(--accent)" }}>Network</span>
            </span>
          </div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 10px var(--accent)",
            }}
          />
        </div>

        {/* Tabs */}
        <nav
          style={{
            display: "flex",
            gap: 4,
            paddingBottom: 0,
          }}
          role="tablist"
          aria-label="Categorias"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab)}
                style={{
                  flex: 1,
                  paddingTop: 8,
                  paddingBottom: 12,
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  letterSpacing: "0.01em",
                  color: active ? "var(--accent-bright)" : "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  textTransform: "lowercase",
                  transition: "color 150ms ease",
                }}
              >
                {tab}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60%",
                      height: 2,
                      borderRadius: 1,
                      background: "var(--accent)",
                      boxShadow: "0 0 8px var(--accent)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
