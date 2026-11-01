"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sparkles,
  LayoutTemplate,
  Check,
  FileText,
} from "lucide-react";
import { MathText } from "./MathText";

export interface Slide {
  title: string;
  kicker?: string;
  summary?: string;
  bullets: string[];
  layout?: "split_left_image" | "split_right_image" | "cards_right";
  image_asset?: string;
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

export const PRESENTATION_TEMPLATES = [
  {
    id: "modern_editorial",
    name: "Modern Editorial Navy (Sample 2)",
    tag: "Featured • Multi-Layout",
    desc: "Blueprint navy & light grey with photo splits, numbered badges & horizontal cards",
    bgCover: "/templates/modern_editorial/bg_cover.png",
    bgSplitLeft: "/templates/modern_editorial/bg_split_left.png",
    bgSplitRight: "/templates/modern_editorial/bg_split_right.png",
    bgCardsRight: "/templates/modern_editorial/bg_cards_right.png",
    palette: ["#1B395D", "#EEF0F6", "#DEDEE0", "#000000"],
    titleFont: "Arial, -apple-system, sans-serif",
  },
  {
    id: "warm_hexagons",
    name: "Earthy Hexagons (Sample 1)",
    tag: "Warm Aesthetic",
    desc: "Warm cream background with wireframe & terracotta honeycomb hexagons",
    bgCover: "/templates/warm_hexagons/slide_first.png",
    bgBody: "/templates/warm_hexagons/slide_body.png",
    bgLast: "/templates/warm_hexagons/slide_last.png",
    palette: ["#3B2213", "#F0E7DD", "#C29452", "#5C4436"],
    titleFont: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "modern_dark",
    name: "Midnight Lime (Classic)",
    tag: "High Contrast",
    desc: "High-contrast dark obsidian slate with neon lime accents",
    bgCover: "",
    bgBody: "",
    bgLast: "",
    palette: ["#0E0F0C", "#D9EC95", "#FFFFFF"],
    titleFont: "system-ui, -apple-system, sans-serif",
  },
];

interface DeckSlide {
  type: "title" | "body" | "last";
  title: string;
  kicker?: string;
  summary?: string;
  subtitle?: string;
  bullets?: string[];
  layout?: "split_left_image" | "split_right_image" | "cards_right";
  image_asset?: string;
  notes?: string;
}

export function PresentationView({ data, isLoading, onGenerate, onToast }: PresentationViewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("modern_editorial");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Close download dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const currentTemplate =
    PRESENTATION_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    PRESENTATION_TEMPLATES[0];

  // Construct unified deck: 1 Title Slide + N Content Slides + 1 Thank You Slide
  const rawSlides = data?.slides || [];
  const defaultLayouts: ("split_left_image" | "split_right_image" | "cards_right")[] = [
    "split_left_image",
    "split_right_image",
    "cards_right",
  ];
  const defaultImages = [
    "photo_classroom_raising_hands.png",
    "photo_classroom_desks.png",
    "photo_school_building.png",
  ];

  const totalDeckSlides: DeckSlide[] = [
    {
      type: "title",
      title: data?.title || "Presentation",
      kicker: rawSlides[0]?.kicker || "Presentation Overview",
      summary:
        rawSlides[0]?.summary ||
        "A structured keynote presentation exploring core principles, systematic frameworks, and key strategic takeaways.",
      subtitle: "KEY TAKEAWAYS & EXECUTIVE SUMMARY",
      bullets: [],
      notes: "Opening introduction and presentation overview.",
    },
    ...rawSlides.map((s, idx) => ({
      type: "body" as const,
      title: s.title || `Slide ${idx + 1}`,
      kicker: s.kicker || `Section ${String(idx + 1).padStart(2, "0")} • Core Focus`,
      summary:
        s.summary ||
        (s.bullets && s.bullets[0]
          ? `${s.title} establishes a critical mechanism in this domain, providing structured clarity and actionable insight.`
          : "Overview of key insights."),
      subtitle: "",
      bullets: s.bullets || [],
      layout: s.layout || defaultLayouts[idx % defaultLayouts.length],
      image_asset: s.image_asset || defaultImages[idx % defaultImages.length],
      notes: s.notes || "",
    })),
    {
      type: "last",
      title: "Thank you",
      kicker: "Summary & Takeaways",
      summary: data?.title
        ? `Key takeaways and strategic conclusions for "${data.title}".`
        : "Keynote Presentation",
      subtitle: data?.title ? `Key insights & overview for "${data.title}"` : "Keynote Presentation",
      bullets: [],
      notes: "Closing Slide: Summary and final remarks.",
    },
  ];

  const totalCount = totalDeckSlides.length;
  const currentSlide = totalDeckSlides[currentSlideIndex] || totalDeckSlides[0];

  // Keyboard navigation for slides
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalCount === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(totalCount - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalCount]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-bold text-[var(--text-main)]">Planning & Generating Slide Deck...</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Structuring content budgeting, photo pairing, and layout formatting
        </p>
      </div>
    );
  }

  // Initial Empty State with upfront Template Picker
  if (!data || !data.slides || data.slides.length === 0) {
    return (
      <div className="py-8 px-2 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-lime)]/15 text-[var(--brand-lime)] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Presentation className="w-6 h-6 text-[#0E0F0C] dark:text-[var(--brand-lime)]" />
          </div>
          <h4 className="text-lg font-black text-[var(--text-main)] mb-1">Choose Presentation Template</h4>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Select your preferred presentation layout upfront. Content lengths, titles, and slide structures will be tailored to fit the template perfectly.
          </p>
        </div>

        {/* Visual Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
          {PRESENTATION_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-[var(--brand-lime)] bg-[var(--brand-lime)]/5 shadow-md scale-[1.02]"
                    : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--text-muted)]/40 hover:bg-[var(--card-surface-elevated)]"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--brand-lime)] text-[#0E0F0C] flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] border border-[var(--card-border)]">
                      {tmpl.tag}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-[var(--text-main)] mb-1">{tmpl.name}</h5>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{tmpl.desc}</p>
                </div>

                {/* Color Palette Swatches */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-[var(--card-border)]/60">
                  {tmpl.palette.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] ml-auto">
                    {isSelected ? "Selected" : "Click to select"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={onGenerate}
            className="px-6 py-3 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs sm:text-sm font-black transition-all shadow-md inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Slides with Selected Template</span>
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPptx = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/download/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          slides: data.slides,
          template: selectedTemplateId,
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

  const handleDownloadPdf = () => {
    setIsDownloadOpen(false);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      onToast("Unable to generate PDF", "error");
      return;
    }

    const slidesHtml = totalDeckSlides
      .map((slide, sIdx) => {
        const isTitle = slide.type === "title";
        const isLast = slide.type === "last";
        const pageNum = String(sIdx + 1).padStart(2, "0");

        return `
          <div class="slide-page ${selectedTemplateId === "warm_hexagons" ? "warm-hexagons" : "modern-editorial"}">
            <div class="slide-content">
              ${
                isTitle
                  ? `
                  <div class="title-slide-box">
                    <div class="kicker-tag">${slide.kicker || "Presentation Overview"}</div>
                    <h1 class="main-title">${slide.title}</h1>
                    <p class="summary-text">${slide.summary || slide.subtitle || ""}</p>
                  </div>
                `
                  : isLast
                  ? `
                  <div class="last-slide-box">
                    <div class="kicker-tag">Summary & Key Takeaways</div>
                    <h1 class="main-title">THANK YOU</h1>
                    <p class="summary-text">${slide.summary || slide.subtitle || ""}</p>
                  </div>
                `
                  : `
                  <div class="body-slide-box">
                    <div class="kicker-tag">${slide.kicker || `Section ${pageNum}`}</div>
                    <h2 class="slide-heading">${slide.title}</h2>
                    <ul class="bullet-list">
                      ${(slide.bullets || []).map((b) => `<li>${b}</li>`).join("")}
                    </ul>
                    ${slide.summary ? `<p class="summary-text">${slide.summary}</p>` : ""}
                  </div>
                `
              }
            </div>
            <div class="slide-footer">
              <span>${data?.title || "Presentation"}</span>
              <span>Page ${pageNum}</span>
            </div>
          </div>
        `;
      })
      .join("");

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <title>${data?.title || "Presentation"}</title>
  <style>
    @page { size: landscape; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #FFFFFF;
    }
    .slide-page {
      width: 100vw;
      height: 100vh;
      page-break-after: always;
      position: relative;
      padding: 48px 64px 64px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background-color: #EEF0F6;
    }
    .slide-page.warm-hexagons {
      background-color: #F0E7DD;
    }
    .kicker-tag {
      font-size: 13px;
      font-weight: 700;
      color: #4A5568;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .main-title {
      font-size: 38px;
      font-weight: 900;
      color: #000000;
      margin: 0 0 16px 0;
      line-height: 1.15;
      text-transform: uppercase;
    }
    .slide-heading {
      font-size: 26px;
      font-weight: 800;
      color: #000000;
      margin: 0 0 16px 0;
      line-height: 1.25;
    }
    .summary-text {
      font-size: 15px;
      color: #2D3748;
      line-height: 1.6;
      max-width: 85%;
      margin: 12px 0;
    }
    .bullet-list {
      margin: 16px 0;
      padding-left: 24px;
      font-size: 15px;
      line-height: 1.8;
      color: #1F1E1B;
    }
    .bullet-list li { margin-bottom: 8px; }
    .slide-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 44px;
      background: #1B395D;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      font-size: 12px;
      font-weight: 700;
    }
    .warm-hexagons .slide-footer {
      background: #3B2213;
    }
  </style>
</head>
<body>
  ${slidesHtml}
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 400);

    onToast("Preparing presentation PDF...", "info");
  };

  // Determine background image for Earthy Hexagons
  let hexagonBgImage = "";
  if (selectedTemplateId === "warm_hexagons") {
    if (currentSlide.type === "title") hexagonBgImage = currentTemplate.bgCover;
    else if (currentSlide.type === "last") hexagonBgImage = currentTemplate.bgLast || currentTemplate.bgCover;
    else hexagonBgImage = currentTemplate.bgBody || currentTemplate.bgCover;
  }

  return (
    <div className="py-2">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">{data.title || "Video Presentation"}</h3>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
            <span>Slide {currentSlideIndex + 1} of {totalCount}</span>
          </div>
        </div>

        {/* Toolbar & Template Selector */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Template Selector Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--text-main)]">
            <LayoutTemplate className="w-3.5 h-3.5 text-[#1B395D] dark:text-[var(--brand-lime)]" />
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-xs cursor-pointer text-[var(--text-main)]"
            >
              {PRESENTATION_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id} className="bg-[var(--card-bg)] text-[var(--text-main)]">
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Download Dropdown (PowerPoint & PDF) */}
          <div className="relative" ref={downloadRef}>
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? "Compiling..." : "Download"}</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isDownloadOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 text-left">
                <button
                  onClick={() => {
                    setIsDownloadOpen(false);
                    handleDownloadPptx();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] transition-colors cursor-pointer text-left"
                >
                  <Presentation className="w-3.5 h-3.5 text-[#E2552B]" />
                  <span>PowerPoint (.PPTX)</span>
                </button>
                <button
                  onClick={() => {
                    setIsDownloadOpen(false);
                    handleDownloadPdf();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1B395D] dark:text-[var(--brand-lime)]" />
                  <span>PDF Document (.PDF)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onGenerate}
            title="Regenerate Presentation"
            className="p-1.5 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 16:9 Slide Canvas Screen View */}
      <div
        className="relative w-full aspect-[16/9] min-h-[320px] max-h-[580px] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl flex flex-col justify-between transition-all"
        style={{
          backgroundColor:
            selectedTemplateId === "modern_editorial"
              ? "#EEF0F6"
              : selectedTemplateId === "warm_hexagons"
              ? "#F0E7DD"
              : "#0E0F0C",
        }}
      >
        {/* ======================================================== */}
        {/* TEMPLATE 2: Modern Editorial Navy (Clean Image-Free Layout) */}
        {/* ======================================================== */}
        {selectedTemplateId === "modern_editorial" ? (
          <div className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden bg-[#EEF0F6]">
            {/* Top Navy Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-[#1B395D] z-10" />

            {/* 1. Cover / Title Slide (Image-Free Clean Editorial) */}
            {currentSlide.type === "title" && (
              <div className="w-full h-full p-[5%] flex flex-col justify-between relative bg-[#EEF0F6]">
                {/* Top Section: Kicker & Main Headline */}
                <div className="max-w-[70%] text-left pt-2">
                  <div className="text-xs sm:text-sm font-bold text-[#4A5568] tracking-wide mb-2 sm:mb-3">
                    <MathText text={currentSlide.kicker || "Core Lecture & Keynote"} />
                  </div>
                  <MathText
                    as="h2"
                    text={currentSlide.title}
                    className="text-2xl sm:text-3xl md:text-5xl font-black text-black uppercase tracking-tight leading-[1.08]"
                  />
                </div>

                {/* Middle Right Thesis / Summary Panel */}
                <div className="self-end max-w-[48%] text-left my-auto pr-[2%] p-4 sm:p-5 rounded-xl bg-white/70 border border-black/10 shadow-xs">
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#1B395D] mb-1.5">
                    Executive Briefing
                  </div>
                  <MathText
                    as="p"
                    text={currentSlide.summary || ""}
                    className="text-xs sm:text-sm md:text-base text-[#2D3748] leading-relaxed font-normal"
                  />
                </div>

                {/* Bottom Spacer */}
                <div className="pb-[5%]" />
              </div>
            )}

            {/* 2. Content Slides with 3 Archetypes (Image-Free Clean Editorial) */}
            {currentSlide.type === "body" && (
              <>
                {/* Archetype A: Split Left Editorial Focus Card */}
                {currentSlide.layout === "split_left_image" && (
                  <div className="w-full h-full flex pb-[8%]">
                    {/* Left Side: Kicker, Title & Key Concept Callout Card */}
                    <div className="w-1/2 p-[4%] flex flex-col justify-between bg-[#EEF0F6]">
                      <div>
                        <div className="text-[11px] sm:text-xs font-bold text-[#4A5568] mb-1">
                          <MathText text={currentSlide.kicker || ""} />
                        </div>
                        <MathText
                          as="h2"
                          text={currentSlide.title}
                          className="text-lg sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tight leading-snug"
                        />
                      </div>

                      {/* Editorial Focus / Concept Callout (Replaces Image) */}
                      <div className="w-full rounded-xl bg-white border border-black/10 shadow-sm p-4 sm:p-5 flex flex-col justify-between mt-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1B395D]" />
                          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#1B395D]">
                            Core Principle & Mathematical Formulation
                          </span>
                        </div>
                        <div className="my-auto py-3">
                          <MathText
                            as="div"
                            text={currentSlide.summary || currentSlide.title}
                            className="text-xs sm:text-sm text-[#1F1E1B] leading-relaxed font-medium"
                          />
                        </div>
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#4A5568] font-bold">
                          <span>Structured Insight</span>
                          <span className="font-mono text-[#1B395D]">Keynote Deck</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Contrast Grey Panel with Summary & Dotted Bullets */}
                    <div className="w-1/2 p-[4%] bg-[#DEDEE0] flex flex-col justify-center">
                      <div className="space-y-2 sm:space-y-3.5">
                        {currentSlide.bullets?.map((b, idx) => (
                          <div key={idx} className="pb-2 border-b border-dotted border-black/35">
                            <div className="flex items-start gap-2.5 text-xs sm:text-sm md:text-base text-black font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" />
                              <MathText text={b} as="span" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Archetype B: Split Right Analytical Framework Panel */}
                {currentSlide.layout === "split_right_image" && (
                  <div className="w-full h-full flex pb-[8%]">
                    {/* Left Side: Title, Subtitle, Summary & Numbered Badges */}
                    <div className="w-[52%] p-[4%] flex flex-col justify-center bg-[#EEF0F6]">
                      <MathText
                        as="h2"
                        text={currentSlide.title}
                        className="text-lg sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tight leading-snug mb-1"
                      />
                      <div className="text-xs sm:text-sm font-bold text-black mb-2">
                        <MathText text={currentSlide.kicker || ""} />
                      </div>
                      <MathText
                        as="p"
                        text={currentSlide.summary || ""}
                        className="text-xs sm:text-sm text-[#2D3748] leading-relaxed mb-3 font-normal"
                      />
                      <div className="space-y-2 sm:space-y-2.5">
                        {currentSlide.bullets?.map((b, idx) => (
                          <div key={idx} className="flex items-center gap-2.5">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#1B395D] text-white flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 rounded-xs shadow-2xs">
                              {String(idx + 1).padStart(2, "0")}
                            </div>
                            <span className="text-xs sm:text-sm md:text-base text-black font-semibold leading-tight">
                              <MathText text={b} as="span" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Side: Analytical Framework Deep Navy Card (Replaces Image) */}
                    <div className="w-[48%] p-[3%] flex items-center justify-center bg-[#EEF0F6]">
                      <div className="w-full h-full rounded-xl bg-[#1B395D] text-white p-5 sm:p-6 flex flex-col justify-between shadow-md">
                        <div>
                          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/70">
                            Analytical Framework
                          </span>
                          <MathText
                            as="h3"
                            text={currentSlide.title}
                            className="text-base sm:text-xl font-black text-white mt-2 leading-tight"
                          />
                        </div>
                        <div className="my-auto py-3">
                          <MathText
                            as="div"
                            text={currentSlide.summary || ""}
                            className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal"
                          />
                        </div>
                        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-white/60 font-semibold">
                          <span>Key Takeaway</span>
                          <span>Quantitative Metric</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Archetype C: Cards Right with Editorial Briefing */}
                {currentSlide.layout === "cards_right" && (
                  <div className="w-full h-full flex pb-[8%]">
                    {/* Left Side: Contrast Grey Panel with Executive Briefing (Replaces Image) */}
                    <div className="w-[45%] p-[4%] bg-[#DEDEE0] flex flex-col justify-center">
                      <div className="w-full rounded-xl bg-white border border-black/10 shadow-xs p-4 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#1B395D] block mb-1">
                          Executive Briefing
                        </span>
                        <MathText
                          as="div"
                          text={currentSlide.kicker || "Core Principle"}
                          className="text-xs font-bold text-black"
                        />
                      </div>
                      <MathText
                        as="p"
                        text={currentSlide.summary || ""}
                        className="text-[11px] sm:text-xs md:text-sm text-[#2D3748] leading-relaxed font-normal"
                      />
                    </div>

                    {/* Right Side: Title with Navy Accent Square & Navy Banner Cards */}
                    <div className="w-[55%] p-[4%] flex flex-col justify-center bg-[#EEF0F6]">
                      <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#1B395D] shrink-0" />
                        <MathText
                          as="h2"
                          text={currentSlide.title}
                          className="text-lg sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tight"
                        />
                      </div>
                      <div className="space-y-2 sm:space-y-2.5">
                        {currentSlide.bullets?.map((b, idx) => (
                          <div
                            key={idx}
                            className="bg-[#1B395D] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-sm shadow-sm flex items-center gap-3"
                          >
                            <span className="text-xs sm:text-sm md:text-base font-black tracking-wider opacity-90 shrink-0">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="text-xs sm:text-sm md:text-base font-bold leading-tight">
                              <MathText text={b} as="span" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 3. Closing / Thank You Slide (Image-Free Clean Editorial) */}
            {currentSlide.type === "last" && (
              <div className="w-full h-full p-[5%] flex flex-col justify-between relative bg-[#EEF0F6]">
                <div className="max-w-[65%] text-left pt-2">
                  <div className="text-xs sm:text-sm font-bold text-[#4A5568] tracking-wide mb-2 sm:mb-3">
                    Summary & Key Takeaways
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-black uppercase tracking-tight">
                    THANK YOU
                  </h2>
                  <MathText
                    as="p"
                    text={currentSlide.summary || ""}
                    className="text-xs sm:text-sm md:text-base text-[#2D3748] leading-relaxed mt-4"
                  />
                </div>
                {/* Bottom Spacer */}
                <div className="pb-[5%]" />
              </div>
            )}

            {/* Solid Navy Bottom Footer Bar (Page 01, 02, etc.) */}
            <div className="absolute bottom-0 left-0 right-0 h-[8%] sm:h-[9%] bg-[#1B395D] flex items-center justify-between px-[4%] text-white text-[10px] sm:text-xs md:text-sm font-bold z-20 shadow-md">
              <span className="truncate max-w-[70%]">{data.title || "Presentation"}</span>
              <span>Page {String(currentSlideIndex + 1).padStart(2, "0")}</span>
            </div>
          </div>
        ) : selectedTemplateId === "warm_hexagons" ? (
          /* ======================================================== */
          /* TEMPLATE 1: Earthy Hexagons (Sample 1)                   */
          /* ======================================================== */
          <div
            className="w-full h-full relative"
            style={{
              backgroundImage: hexagonBgImage ? `url(${hexagonBgImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* 1. Title Slide */}
            {currentSlide.type === "title" && (
              <div className="absolute left-[6.2%] top-[55%] -translate-y-1/2 max-w-[55%] text-left">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-[#3B2213] drop-shadow-2xs"
                  style={{ fontFamily: currentTemplate.titleFont }}
                >
                  {currentSlide.title}
                </h2>
                <div className="mt-4 sm:mt-5 text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-[#5C4436]">
                  {currentSlide.subtitle}
                </div>
              </div>
            )}

            {/* 2. Content / Body Slide */}
            {currentSlide.type === "body" && (
              <>
                <div className="absolute left-[6.2%] top-[18%] max-w-[58%] text-left">
                  <h2
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-snug text-[#3B2213] tracking-tight"
                    style={{ fontFamily: currentTemplate.titleFont }}
                  >
                    {currentSlide.title}
                  </h2>
                </div>

                <div className="absolute left-[6.2%] top-[34%] max-w-[58%] text-left space-y-3 sm:space-y-4">
                  {currentSlide.bullets?.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#5C4436] mt-2 shrink-0" />
                      <p className="text-xs sm:text-sm md:text-base text-[#423730] leading-relaxed font-medium">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 3. Concluding / Thank You Slide */}
            {currentSlide.type === "last" && (
              <div className="absolute left-[6.0%] top-[60%] -translate-y-1/2 max-w-[52%] text-left">
                <h2
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-[#3B2213]"
                  style={{ fontFamily: currentTemplate.titleFont }}
                >
                  Thank you
                </h2>
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-[#5C4436]">
                  {currentSlide.subtitle}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* TEMPLATE 3: Modern Dark (Classic Midnight Lime)           */
          /* ======================================================== */
          <div className="p-8 sm:p-12 flex flex-col justify-between h-full text-[#F2F2F0]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--brand-lime)]" />
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[var(--brand-lime)] uppercase mb-2 block">
                SLIDE {currentSlideIndex + 1}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
                {currentSlide.title}
              </h2>
            </div>
            <div className="my-auto py-4 space-y-3">
              {currentSlide.bullets?.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-lime)] mt-2 shrink-0" />
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-medium">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800/80 pt-3">
              <span>{data.title || "Video Presentation"}</span>
              <span>{currentSlideIndex + 1} / {totalCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Thumbnail Strip */}
      <div className="flex items-center justify-between gap-4 mt-5">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all border border-[var(--card-border)]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Direct Slide Jump Pills */}
        <div
          className="flex items-center justify-center gap-1.5 py-1 flex-wrap overflow-hidden no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {totalDeckSlides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              title={s.title}
              className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                currentSlideIndex === idx
                  ? "bg-[var(--brand-lime)] text-[#0E0F0C] font-black border-[var(--brand-lime)] shadow-xs scale-105"
                  : "bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] border-[var(--card-border)] hover:text-[var(--text-main)]"
              }`}
            >
              {idx === 0 ? "Title" : idx === totalCount - 1 ? "End" : idx}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(totalCount - 1, prev + 1))}
          disabled={currentSlideIndex === totalCount - 1}
          className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all border border-[var(--card-border)]"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
