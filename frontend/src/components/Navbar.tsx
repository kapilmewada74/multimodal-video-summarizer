"use client";

import React from "react";
import { Sun, Moon, Play } from "lucide-react";

interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <nav className="h-[44px] sticky top-0 z-50 bg-[#000000] text-white border-b border-white/10 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Apple-style Minimal Logo & Name */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-[5px] bg-[#0066cc] flex items-center justify-center">
          <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
        </div>
        <span className="font-semibold text-xs tracking-[-0.12px] uppercase text-white">
          SUMMARIZE<span className="opacity-60">.AI</span>
        </span>
      </div>

      {/* Theme Toggle Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="h-7 px-3 rounded-[8px] flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-normal tracking-[-0.12px] border border-white/15 transition-all cursor-pointer active:scale-95"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>
    </nav>
  );
}
