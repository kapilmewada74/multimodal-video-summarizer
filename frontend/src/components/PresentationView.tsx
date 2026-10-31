"use client";

import React, { useState } from "react";
import { Presentation, Download, ChevronLeft, ChevronRight, RefreshCw, MessageSquare, Sparkles } from "lucide-react";

export interface Slide {
  title: string;
  bullets: string[];
  notes?: string;
}

export interface PresentationData {
  title: string;
  slides: Slide[];
  provider?: string;
}

interface PresentationViewProps {
  data: PresentationData | null;
  isLoading: boolean;
  onGenerate: () => void;
  onToast: (msg: string, type?: "success" | "info" | "error") => void;
}

export function PresentationView({ data, isLoading, onGenerate, onToast }: PresentationViewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-bold text-[var(--text-main)]">Generating Slide Presentation...</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">Designing keynote slides with speaker notes via Gemini AI</p>
      </div>
    );
  }

  if (!data || !data.slides || data.slides.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-[var(--card-border)] rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-lime)]/10 text-[var(--brand-lime)] flex items-center justify-center mx-auto mb-3">
          <Presentation className="w-6 h-6 text-[#0E0F0C] dark:text-[var(--brand-lime)]" />
        </div>
        <h4 className="text-base font-bold text-[var(--text-main)] mb-1">Presentation & PPT Generation</h4>
        <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed">
          Convert your video insights into a structured 16:9 slide deck with speaker notes and downloadable Microsoft PowerPoint (.pptx) file.
        </p>
        <button
          onClick={onGenerate}
          className="px-5 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Slides</span>
        </button>
      </div>
    );
  }

  const slides = data.slides;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleDownloadPptx = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/download/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          slides: data.slides,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate PPTX file.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data.title || "Presentation").replace(/[^a-z0-9]+/gi, "_")}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast("PowerPoint (.pptx) downloaded successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error downloading PPTX";
      onToast(msg, "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="py-2">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">{data.title || "Video Presentation"}</h3>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
            <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            {data.provider && (
              <>
                <span>•</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)]">
                  {data.provider}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showNotes
                ? "bg-[var(--brand-lime)] text-[#0E0F0C] border-[var(--brand-lime)]"
                : "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-[var(--card-border)] hover:bg-[var(--btn-secondary-hover)]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Speaker Notes</span>
          </button>

          <button
            onClick={handleDownloadPptx}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? "Generating..." : "Download .PPTX"}</span>
          </button>

          <button
            onClick={onGenerate}
            title="Regenerate Presentation"
            className="p-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 16:9 Slide Screen View */}
      <div className="relative w-full aspect-[16/9] min-h-[300px] max-h-[480px] p-8 sm:p-12 rounded-2xl bg-[#0E0F0C] text-[#F2F2F0] border border-[var(--card-border)] shadow-xl flex flex-col justify-between overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--brand-lime)]" />

        {/* Slide Header */}
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[var(--brand-lime)] uppercase mb-2 block">
            SLIDE {currentSlideIndex + 1}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#F2F2F0] leading-tight">
            {currentSlide.title}
          </h2>
        </div>

        {/* Slide Content Bullets */}
        <div className="my-auto py-4 space-y-3">
          {currentSlide.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-lime)] mt-2 shrink-0" />
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-medium">
                {bullet}
              </p>
            </div>
          ))}
        </div>

        {/* Slide Footer */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800/80 pt-3">
          <span>{data.title || "Video Presentation"}</span>
          <span>{currentSlideIndex + 1} / {slides.length}</span>
        </div>
      </div>

      {/* Speaker Notes Drawer (Expandable) */}
      {showNotes && currentSlide.notes && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--card-surface-elevated)] border border-[var(--card-border)] text-xs text-[var(--text-muted)] animate-in fade-in duration-150">
          <div className="font-bold text-[var(--text-main)] mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--brand-lime)]" />
            <span>Speaker Notes</span>
          </div>
          <p className="leading-relaxed">{currentSlide.notes}</p>
        </div>
      )}

      {/* Controls & Thumbnail Strip */}
      <div className="flex items-center justify-between gap-4 mt-5">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Direct Slide Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentSlideIndex === idx
                  ? "bg-[var(--brand-lime)] text-[#0E0F0C] font-black scale-105"
                  : "bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
