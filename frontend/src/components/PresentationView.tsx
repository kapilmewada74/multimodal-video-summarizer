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

  // Keyboard navigation for slides
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data?.slides || data.slides.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(data.slides.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data?.slides]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-9 h-9 border-[2.5px] border-[var(--card-border)] border-t-[#0066cc] rounded-full animate-spin mb-4" />
        <h4 className="text-base font-semibold tracking-[-0.2px] text-[var(--text-main)]">Building Presentation Slides...</h4>
        <p className="text-sm text-[var(--text-muted)] mt-1">Designing keynote slides with speaker notes</p>
      </div>
    );
  }

  if (!data || !data.slides || data.slides.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-[var(--card-border)] rounded-[18px]">
        <div className="w-11 h-11 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center mx-auto mb-3">
          <Presentation className="w-5 h-5 text-[#0066cc]" />
        </div>
        <h4 className="text-base font-semibold text-[var(--text-main)] mb-1">Presentation & PPT Generation</h4>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed font-normal">
          Convert your video insights into a structured 16:9 slide deck with speaker notes and downloadable Microsoft PowerPoint (.pptx) file.
        </p>
        <button
          onClick={onGenerate}
          className="px-6 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-sm font-normal transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
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
          <h3 className="text-base font-semibold text-[var(--text-main)]">{data.title || "Video Presentation"}</h3>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
            <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            {data.provider && (
              <>
                <span>•</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] font-normal">
                  {data.provider}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-4 py-1.5 rounded-full border text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              showNotes
                ? "bg-[#0066cc] text-white border-[#0066cc] font-semibold"
                : "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-[var(--card-border)] hover:bg-[var(--btn-secondary-hover)]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Speaker Notes</span>
          </button>

          <button
            onClick={handleDownloadPptx}
            disabled={isDownloading}
            className="px-5 py-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? "Generating..." : "Download .PPTX"}</span>
          </button>

          <button
            onClick={onGenerate}
            title="Regenerate Presentation"
            className="p-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] transition-colors cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 16:9 Slide Screen View: Apple Dark Canvas */}
      <div className="relative w-full aspect-[16/9] min-h-[300px] max-h-[480px] p-8 sm:p-12 rounded-[18px] bg-[#272729] text-white border border-white/10 flex flex-col justify-between overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0066cc]" />

        {/* Slide Header */}
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[#2997ff] uppercase mb-2 block">
            SLIDE {currentSlideIndex + 1}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-[-0.28px] text-white leading-tight">
            {currentSlide.title}
          </h2>
        </div>

        {/* Slide Content Bullets */}
        <div className="my-auto py-4 space-y-3">
          {currentSlide.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#0066cc] mt-2 shrink-0" />
              <p className="text-sm sm:text-base text-gray-200 leading-[1.47] font-normal">
                {bullet}
              </p>
            </div>
          ))}
        </div>

        {/* Slide Footer */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-3">
          <span>{data.title || "Video Presentation"}</span>
          <span>{currentSlideIndex + 1} / {slides.length}</span>
        </div>
      </div>

      {/* Speaker Notes Drawer (Expandable) */}
      {showNotes && currentSlide.notes && (
        <div className="mt-4 p-4 rounded-[11px] bg-[var(--card-surface-elevated)] border border-[var(--card-border)] text-xs text-[var(--text-muted)] animate-in fade-in duration-150">
          <div className="font-semibold text-[var(--text-main)] mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>Speaker Notes</span>
          </div>
          <p className="leading-relaxed font-normal">{currentSlide.notes}</p>
        </div>
      )}

      {/* Controls & Thumbnail Strip */}
      <div className="flex items-center justify-between gap-4 mt-5">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-normal flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 border border-[var(--card-border)]"
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
              className={`w-7 h-7 rounded-full text-xs transition-all cursor-pointer active:scale-95 ${
                currentSlideIndex === idx
                  ? "bg-[#0066cc] text-white font-semibold"
                  : "bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--card-border)]"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className="px-4 py-2 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-normal flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 border border-[var(--card-border)]"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
