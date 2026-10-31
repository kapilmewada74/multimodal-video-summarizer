"use client";

import React, { useRef, useState, useEffect } from "react";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import {
  Clock,
  Shield,
  Terminal,
  HelpCircle,
  CheckCircle2,
  Monitor,
  Download,
  Link2,
  Cpu,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function FeaturesSection() {
  const stackWrapperRef = useRef<HTMLDivElement>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const scrollByCard = (direction: 1 | -1) => {
    if (!stackWrapperRef.current) return;
    const scrollEl = stackWrapperRef.current.querySelector<HTMLElement>("[data-scroll-stack-root]");
    if (scrollEl) {
      scrollEl.scrollBy({ top: direction * 380, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const scrollEl = stackWrapperRef.current?.querySelector<HTMLElement>("[data-scroll-stack-root]");
    if (!scrollEl) return;

    const handleScroll = () => {
      const st = scrollEl.scrollTop;
      if (st < 180) setCurrentCardIndex(0);
      else if (st < 540) setCurrentCardIndex(1);
      else setCurrentCardIndex(2);
    };

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  const steps = [
    {
      step: "01",
      icon: Link2,
      title: "Paste URL or Upload Media",
      desc: "Provide any YouTube link or upload video/audio files directly from your device.",
    },
    {
      step: "02",
      icon: Cpu,
      title: "Local Multimodal Analysis",
      desc: "Whisper transcribes the dialogue while advanced LLM engines synthesize core concepts.",
    },
    {
      step: "03",
      icon: Download,
      title: "Study, Test & Export",
      desc: "Review notes, practice flashcards, take quizzes, and download PPTX or PDF files immediately.",
    },
  ];

  return (
    <section className="mt-20 sm:mt-28 space-y-24 no-print scroll-mt-20" id="features">
      {/* ============================================================
           WORK YOUR WAY: REACT BITS SCROLL STACK (3 Pinned Cards)
           ============================================================ */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-3">
            <Layers className="w-3.5 h-3.5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
            <span>Interactive Card Stack</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-main)]">
            Work your way
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto">
            Scroll or use controls to stack our 3 core study superpowers into an active deck.
          </p>
        </div>

        {/* Framing Stage with Interactive Controls */}
        <div className="rounded-[32px] bg-[var(--card-bg)] border border-[var(--card-border)] p-3 sm:p-6 shadow-sm">
          {/* Top Control Strip */}
          <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-2xl bg-[var(--btn-secondary-bg)]/60 border border-[var(--card-border)] text-xs font-bold text-[var(--text-muted)] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-lime)] animate-pulse" />
              <span className="text-[var(--text-main)] font-extrabold">Card {currentCardIndex + 1} of 3</span>
              <span className="hidden sm:inline text-black/40 dark:text-white/40">• Scroll inside or use arrows to stack</span>
            </div>

            {/* Stepper Dots & Arrow Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      currentCardIndex === idx
                        ? "w-5 bg-[var(--brand-lime-hover)] dark:bg-[var(--brand-lime)]"
                        : "w-2 bg-black/20 dark:bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 border-l border-[var(--card-border)] pl-2">
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  disabled={currentCardIndex === 0}
                  className="w-7 h-7 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-main)] flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--card-border)]"
                  title="Previous Card (Unstack)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  disabled={currentCardIndex === 2}
                  className="w-7 h-7 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-main)] flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--card-border)]"
                  title="Next Card (Stack)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ScrollStack Container with exact React Bits configuration */}
          <div ref={stackWrapperRef} style={{ height: 600 }} className="w-full relative">
            <ScrollStack
              itemDistance={40}
              itemStackDistance={22}
              stackPosition="12%"
              itemScale={0.05}
              baseScale={0.8}
              dimAmount={0.25}
              blurAmount={0}
              tiltAmount={0}
              rotationAmount={0}
              smoothScroll={true}
              snap={false}
            >
              {/* ---------------- Card 1: Local Multimodal AI (Dark) ---------------- */}
              <ScrollStackItem itemClassName="h-[360px] sm:h-[380px] bg-[#0C0D0A] text-white border border-white/10 rounded-[28px] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
                  {/* Left: Laptop Screen Mockup */}
                  <div className="hidden md:flex md:col-span-5 items-center justify-center">
                    <div className="w-full max-w-[280px] bg-[#161714] rounded-t-xl border border-white/10 shadow-2xl p-3 pb-5">
                      <div className="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-white/10">
                        <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                        <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                        <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                        <span className="ml-auto text-[8px] font-mono text-white/40">local-pipeline</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-white/90">
                          Multimodal Lecture Notes
                        </div>
                        <div className="h-12 bg-black/40 rounded p-2 text-[8px] text-white/70 leading-relaxed font-mono">
                          02:15 • Whisper audio transcription synced. Key takeaway synthesized locally.
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-[var(--brand-lime)] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-lime)] animate-pulse" />
                          <span>100% Private • Local Inference</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Copy & CTAs */}
                  <div className="md:col-span-7 flex flex-col justify-between h-full py-1">
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                        2.0 Multimodal AI: Structured Summaries & Local Transcription
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4 max-w-lg">
                        Condense hours of lectures and recordings into crisp, executive-level summaries with timestamps and key takeaways — completely local and private.
                      </p>

                      {/* Value Badges */}
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/80 mb-5">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                          <Clock className="w-3.5 h-3.5 text-[var(--brand-lime)]" />
                          <span>Fast Inference</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                          <Shield className="w-3.5 h-3.5 text-[#8ED081]" />
                          <span>100% Private</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                          <Terminal className="w-3.5 h-3.5 text-white/70" />
                          <span>Whisper AI</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[11px] text-white/50 block">Pricing</span>
                        <span className="text-sm font-black text-white">Free & Unlimited</span>
                      </div>
                      <a
                        href="#app-top"
                        className="px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Summarize Video →
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* ---------------- Card 2: Active-Recall Desk Notes (Terracotta) ---------------- */}
              <ScrollStackItem itemClassName="h-[360px] sm:h-[380px] bg-[#DE5428] text-white border border-black/10 rounded-[28px] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
                  {/* Left: Copy & CTAs */}
                  <div className="md:col-span-7 flex flex-col justify-between h-full py-1">
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                        Active-Recall Study Suite: 3D Desk Notes & Quizzes
                      </h3>
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-4 max-w-lg">
                        Turn lecture concepts into tactile 3D sticky notes with paper-flip physics and adaptive practice quizzes scaled from Easy to Hard.
                      </p>

                      {/* Value Badges */}
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-white mb-5">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/20 border border-white/20">
                          <span className="w-2 h-2 rounded-full bg-[#FFF8B8]" />
                          <span>3D Sticky Notes</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/20 border border-white/20">
                          <HelpCircle className="w-3.5 h-3.5 text-white" />
                          <span>Adaptive Quizzes</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/20 border border-white/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Instant Explanations</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <div>
                        <span className="text-[11px] text-white/70 block">Retention</span>
                        <span className="text-sm font-black text-white">Active Recall</span>
                      </div>
                      <a
                        href="#app-top"
                        className="px-5 py-2 rounded-full bg-white hover:bg-neutral-100 text-[#DE5428] font-extrabold text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Practice Flashcards →
                      </a>
                    </div>
                  </div>

                  {/* Right: Desk Sticky Notes Graphic */}
                  <div className="hidden md:flex md:col-span-5 items-center justify-center">
                    <div className="relative w-full max-w-[280px] h-[190px] flex items-center justify-center">
                      {/* Pink Note in Back */}
                      <div className="absolute top-2 right-4 w-36 h-36 bg-[#FFE4EC] text-[#1F1E1B] rounded-2xl p-3 shadow-lg rotate-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#E15A78] mx-auto mb-2 shadow-xs" />
                        <div className="text-[9px] font-black leading-tight">Key Formulas</div>
                        <div className="text-[8px] text-black/60 mt-1">J(θ) = 1/2m Σ(h-y)²</div>
                      </div>

                      {/* Yellow Note in Front */}
                      <div className="absolute bottom-2 left-4 w-40 h-40 bg-[#FFF8B8] text-[#1F1E1B] rounded-2xl p-3.5 shadow-xl -rotate-3 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#E59819] mx-auto mb-2 shadow-xs" />
                        <div className="text-[10px] font-black leading-tight">Machine Learning</div>
                        <div className="text-[8px] text-black/70 mt-1.5 space-y-1">
                          <div>• Linear Regression</div>
                          <div>• Gradient Descent</div>
                        </div>
                        <div className="text-[7px] text-black/40 mt-3 text-right">↗ Expand</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* ---------------- Card 3: Keynote Slide Presentations (Graphite/Lime) ---------------- */}
              <ScrollStackItem itemClassName="h-[360px] sm:h-[380px] bg-[#161814] text-white border border-[var(--brand-lime)]/20 rounded-[28px] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
                  {/* Left: 16:9 Keynote Slide Mockup */}
                  <div className="hidden md:flex md:col-span-5 items-center justify-center">
                    <div className="w-full max-w-[280px] aspect-[16/10] bg-[#1F221B] rounded-xl border border-[var(--brand-lime)]/30 p-3 shadow-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[8px] text-[var(--brand-lime)] font-mono">
                        <span>SLIDE 01 / 06</span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--brand-lime)]/10 text-[var(--brand-lime)] font-bold">16:9 Widescreen</span>
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-white">Executive Keynote Overview</div>
                        <div className="h-1 w-8 bg-[var(--brand-lime)] rounded my-1.5" />
                        <div className="text-[8px] text-white/60 space-y-0.5">
                          <div>• Core Takeaways & Strategic Summary</div>
                          <div>• Speaker Notes Included in Deck</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[7px] text-white/40 pt-1 border-t border-white/10">
                        <span>PowerPoint Presentation</span>
                        <span className="text-[var(--brand-lime)] font-bold">.PPTX</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Copy & CTAs */}
                  <div className="md:col-span-7 flex flex-col justify-between h-full py-1">
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                        Keynote Slide Decks & Native PowerPoint Exports
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4 max-w-lg">
                        Generate presentation-ready 16:9 widescreen slides with presenter speaker notes and direct .pptx, printable PDF, and raw text downloads.
                      </p>

                      {/* Value Badges */}
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/80 mb-5">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                          <Monitor className="w-3.5 h-3.5 text-[var(--brand-lime)]" />
                          <span>16:9 Widescreen</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                          <Download className="w-3.5 h-3.5 text-[var(--brand-lime)]" />
                          <span>Native .PPTX</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8ED081]" />
                          <span>Speaker Notes</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[11px] text-white/50 block">Formats</span>
                        <span className="text-sm font-black text-white">.pptx • .pdf • .txt</span>
                      </div>
                      <a
                        href="#app-top"
                        className="px-5 py-2 rounded-full bg-[var(--brand-lime)] hover:bg-[#C8DE65] text-[#0E0F0C] font-extrabold text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Create Slide Deck →
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </div>

      {/* ============================================================
           HOW IT WORKS 3-STEP PROCESS
           ============================================================ */}
      <div id="how-it-works" className="pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-3">
            Simple Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
            From Raw Video to Study Deck in 3 Steps
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">
            No friction, no complicated configuration. Paste or upload, and let the local pipeline handle the heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-[18px] bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-main)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]">
                      {st.step}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[var(--text-main)] mb-1.5">
                    {st.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 flex items-center text-[11px] font-bold text-[var(--text-muted)]">
                  <span>Step {idx + 1} of 3</span>
                  <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}