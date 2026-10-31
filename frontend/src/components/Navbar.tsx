"use client";

import React from "react";
import { Sun, Moon, Play } from "lucide-react";

interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <nav className="h-14 sticky top-0 z-50 bg-[#0E0F0C]/90 backdrop-blur-md border-b border-[var(--card-border)] px-4 sm:px-8 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand-lime)] flex items-center justify-center shadow-[0_0_12px_rgba(217,236,149,0.35)]">
          <Play className="w-4 h-4 text-[#0E0F0C] fill-[#0E0F0C]" />
        </div>
        <span className="font-extrabold text-base tracking-tight uppercase">
          SUMMARIZE<span className="text-[var(--brand-lime)]">.AI</span>
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(142,208,129,0.12)] text-[var(--color-success)] border border-[rgba(142,208,129,0.25)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse-dot" />
          <span>Local Engine Active</span>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(242,242,240,0.06)] hover:bg-[rgba(242,242,240,0.12)] border border-[var(--card-border)] text-[var(--text-main)] transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}
