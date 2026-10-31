"use client";

import React from "react";
import { Sparkles, ShieldCheck, Zap, FileDown, BookOpen } from "lucide-react";

export function HeroSection() {
  return (
    <header className="text-center mb-10 sm:mb-12 no-print animate-in fade-in duration-300">
      {/* Top Pill Eyebrow */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-main)] mb-6 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
        <span>Next-Generation Multimodal Learning Suite</span>
      </div>

      {/* Main Display Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-[1.12] mb-4 text-[var(--text-main)] max-w-3xl mx-auto">
        Summarize Any Video in Seconds
      </h1>

      {/* Subheadline */}
      <p className="text-sm sm:text-base lg:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed font-normal mb-7">
        Generate structured study notes, complete transcripts, active-recall flashcards, slide presentations, and interactive quizzes from any video.
      </p>

      {/* Feature Value Badges Strip */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-[var(--text-muted)] max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)]">
          <Zap className="w-3.5 h-3.5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
          <span>Instant Processing</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-success)]" />
          <span>100% Private & Local</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)]">
          <FileDown className="w-3.5 h-3.5 text-[var(--text-main)]" />
          <span>PPTX & PDF Exports</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)]">
          <BookOpen className="w-3.5 h-3.5 text-[var(--text-main)]" />
          <span>Active-Recall Suite</span>
        </div>
      </div>
    </header>
  );
}
