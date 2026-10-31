"use client";

import React from "react";
import { Sun, Moon, Play } from "lucide-react";

interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <nav className="h-14 sticky top-0 z-50 bg-[var(--card-bg)]/90 backdrop-blur-md border-b border-[var(--card-border)] px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand-lime)] flex items-center justify-center">
          <Play className="w-4 h-4 text-[#0E0F0C] fill-[#0E0F0C]" />
        </div>
        <span className="font-extrabold text-base tracking-tight uppercase text-[var(--text-main)]">
          SUMMARIZE<span className="text-[var(--text-main)] opacity-70">.AI</span>
        </span>
      </div>

      {/* Nav Links & Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-[var(--text-muted)]">
          <a href="#features" className="hover:text-[var(--text-main)] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[var(--text-main)] transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-[var(--text-main)] transition-colors">FAQ</a>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--card-border)] text-[var(--text-main)] transition-all cursor-pointer active:scale-95"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}
