"use client";

import React from "react";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import {
  FileText,
  Clock,
  Code2,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  BarChart2,
  Monitor,
  Presentation,
  Download,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  Link2,
  Cpu,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="relative mt-12 sm:mt-20 lg:mt-28 space-y-20 no-print scroll-mt-20" id="features">
      {/* Subtle Ambient Pale-Green Glow behind Feature Cards */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] rounded-full blur-[110px] opacity-40 dark:opacity-15 pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(217, 236, 149, 0.20) 0%, rgba(217, 236, 149, 0.04) 55%, transparent 75%)"
        }}
        aria-hidden="true"
      />
      {/* ============================================================
           CORE CAPABILITIES: REACT BITS SCROLL STACK (3 Stacked Cards)
           ============================================================ */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-3">
            <Layers className="w-3.5 h-3.5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-main)]">
            Three Pillars of Accelerated Learning
          </h2>
        </div>

        {/* ScrollStack flowing naturally with window page scroll — no container limits and no inner scrollbar */}
        <div className="w-full relative">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={120}
            itemStackDistance={24}
            stackPosition="12%"
            itemScale={0.05}
            baseScale={0.8}
            dimAmount={0}
            blurAmount={0}
            tiltAmount={0}
            rotationAmount={0}
            smoothScroll={false}
            snap={false}
            holdDistance={180}
          >
            {/* ============================================================
                 CARD 1: STRUCTURED AI NOTES & WORKSPACE (Pure Space Black)
                 ============================================================ */}
            <ScrollStackItem itemClassName="min-h-[380px] bg-[#0E0F0C] text-white border border-white/10 rounded-[28px] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
                {/* Left: Real SUMMARIZE.AI Note Workspace Mockup Preview */}
                <div className="hidden md:flex md:col-span-5 items-center justify-center">
                  <div className="w-full max-w-[320px] bg-[#121310] rounded-2xl border border-white/10 shadow-2xl p-4">
                    {/* Window top bar */}
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10 text-[9px] font-mono text-white/50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                        <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                        <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                        <span className="ml-1 text-white/80 font-bold">Lecture_Summary.md</span>
                      </div>
                      <span className="text-[var(--brand-lime)] font-bold">Local Whisper Sync</span>
                    </div>

                    {/* Mini Tab Nav */}
                    <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-white/5 text-[8px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-[var(--brand-lime)]/20 text-[var(--brand-lime)] border border-[var(--brand-lime)]/30">Summary</span>
                      <span className="px-1.5 py-0.5 rounded text-white/40">Transcript</span>
                      <span className="px-1.5 py-0.5 rounded text-white/40">Flashcards</span>
                      <span className="px-1.5 py-0.5 rounded text-white/40">Slides</span>
                      <span className="px-1.5 py-0.5 rounded text-white/40">Quiz</span>
                    </div>

                    {/* Document Body */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-black text-white/95 leading-snug">
                        Neural Networks & Backpropagation
                      </div>
                      <div className="text-[8px] text-white/50 font-mono flex items-center gap-1">
                        <span className="text-[var(--brand-lime)]">▶</span>
                        <span>youtube.com/watch?v=... • 42:15</span>
                      </div>

                      {/* Key Takeaway Callout with KaTeX math symbol */}
                      <div className="p-2 rounded-lg bg-[var(--brand-lime)]/10 border-l-2 border-[var(--brand-lime)] text-[8.5px] text-white/85 leading-relaxed">
                        <span className="font-bold text-[var(--brand-lime)] block text-[7.5px] uppercase tracking-wider mb-0.5">
                          ⚡ Key Takeaway
                        </span>
                        Backpropagation computes loss gradients via chain rule: ∇_w L(θ) to update network weights.
                      </div>

                      {/* Timestamp References */}
                      <div className="space-y-1 text-[8px] font-mono text-white/70">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[var(--brand-lime)] font-bold">04:15</span>
                          <span className="truncate">Gradient descent & learning rates</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[var(--brand-lime)] font-bold">12:30</span>
                          <span className="truncate">Non-linear activation functions</span>
                        </div>
                      </div>

                      {/* Formats Footer */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[7.5px] font-mono text-white/50">
                        <span>Markdown • PDF • TXT</span>
                        <span className="text-[var(--brand-lime)] font-bold">✓ Copy Markdown</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Copy & Feature Points */}
                <div className="md:col-span-7 flex flex-col justify-between h-full py-1">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-[var(--brand-lime)] uppercase tracking-wider mb-2.5">
                      <FileText className="w-3 h-3" />
                      <span>Structured AI Notes</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                      Turn Any Video into Structured Notes
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4 max-w-lg">
                      Transcribe and summarize YouTube videos or uploaded files into organized study notes with timestamps, key takeaways, and mathematical formulas.
                    </p>

                    {/* 4 Feature Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white/85 mb-5 max-w-md">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <FileText className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">YouTube & File Upload</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">Local Whisper AI</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <Clock className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">Timestamp references</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <Code2 className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">KaTeX Math Formulas</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      <span className="text-[11px] text-white/50 block">Output Format</span>
                      <span className="text-xs font-black text-white">Markdown • Plain Text • PDF</span>
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

            {/* ============================================================
                 CARD 2: ACTIVE RECALL SUITE (Flashcards & Quizzes in Lime)
                 ============================================================ */}
            <ScrollStackItem itemClassName="min-h-[380px] bg-[var(--brand-lime)] text-[#0E0F0C] border border-black/10 rounded-[28px] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
                {/* Left: Copy & Feature Points */}
                <div className="md:col-span-7 flex flex-col justify-between h-full py-1">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/10 border border-black/10 text-[10px] font-bold text-[#0E0F0C] uppercase tracking-wider mb-2.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Active Recall Suite</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0E0F0C] tracking-tight leading-snug mb-3">
                      Learn Smarter with Active Recall
                    </h3>
                    <p className="text-xs sm:text-sm text-[#0E0F0C]/80 leading-relaxed mb-4 max-w-lg">
                      Convert video content into interactive flashcards and adaptive quizzes to strengthen understanding and improve long-term retention.
                    </p>

                    {/* 4 Feature Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#0E0F0C] mb-5 max-w-md">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/[0.06] border border-black/10">
                        <Layers className="w-3.5 h-3.5 text-[#0E0F0C] shrink-0" />
                        <span className="truncate">Interactive flashcards</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/[0.06] border border-black/10">
                        <HelpCircle className="w-3.5 h-3.5 text-[#0E0F0C] shrink-0" />
                        <span className="truncate">AI-generated quizzes</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/[0.06] border border-black/10">
                        <BarChart2 className="w-3.5 h-3.5 text-[#0E0F0C] shrink-0" />
                        <span className="truncate">Multiple difficulty levels</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/[0.06] border border-black/10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E0F0C] shrink-0" />
                        <span className="truncate">Instant explanations</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/10">
                    <div>
                      <span className="text-[11px] text-[#0E0F0C]/70 block">Study Engine</span>
                      <span className="text-xs font-black text-[#0E0F0C]">Spaced Repetition & Quizzes</span>
                    </div>
                    <a
                      href="#app-top"
                      className="px-5 py-2 rounded-full bg-[#0E0F0C] hover:bg-black text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
                    >
                      Practice Flashcards →
                    </a>
                  </div>
                </div>

                {/* Right: Real Interactive Flashcard & Quiz Mockup Preview */}
                <div className="hidden md:flex md:col-span-5 items-center justify-center">
                  <div className="w-full max-w-[310px] space-y-3">
                    {/* Interactive Flashcard UI Card */}
                    <div className="bg-[#FFFFFF] text-[#1F1E1B] rounded-2xl p-4 shadow-2xl border border-black/10 flex flex-col justify-between min-h-[175px]">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-black/10 text-[8px] font-bold text-black/50">
                          <span className="text-[#0E0F0C] font-black">CARD 03 OF 12</span>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--brand-lime)]/40 text-[#0E0F0C] font-bold">Active Recall</span>
                        </div>
                        <div className="text-[10px] font-black leading-snug text-black/90 mb-1.5">
                          Q: How does Backpropagation update neural weights?
                        </div>
                        <div className="text-[8px] text-black/70 leading-relaxed bg-neutral-50 p-2 rounded-lg border border-black/5">
                          <span className="font-bold text-[#0E0F0C] block mb-0.5">Answer:</span>
                          By computing partial derivatives of loss with respect to weights via chain rule: ∂L/∂w.
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[7.5px] font-bold text-black/60">
                        <span className="flex items-center gap-1 text-[#0E0F0C]">↺ Flip Card (Space)</span>
                        <span className="text-emerald-600">✓ 92% Recall Score</span>
                      </div>
                    </div>

                    {/* Adaptive Quiz Score Pill */}
                    <div className="bg-black/15 backdrop-blur-md text-[#0E0F0C] rounded-xl p-2.5 border border-black/10 flex items-center justify-between text-[8px]">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-800 font-bold flex items-center justify-center text-[7px]">✓</span>
                        <span className="font-bold">Adaptive Quiz: 5/5 Correct</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-black/10 text-[#0E0F0C] font-mono font-bold">100% Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>

            {/* ============================================================
                 CARD 3: PRESENTATION GENERATION (Pure Space Black & Lime)
                 ============================================================ */}
            <ScrollStackItem itemClassName="min-h-[380px] bg-[#0E0F0C] text-white border border-white/10 rounded-[28px] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
                {/* Left: 16:9 Presentation Slide Mockup Preview */}
                <div className="hidden md:flex md:col-span-5 items-center justify-center">
                  <div className="w-full max-w-[320px] aspect-[16/10] bg-[#121310] rounded-xl border border-white/10 p-3.5 shadow-2xl flex flex-col justify-between">
                    {/* Slide Header */}
                    <div className="flex items-center justify-between text-[8px] text-[var(--brand-lime)] font-mono">
                      <span className="font-bold">SLIDE 02 / 06</span>
                      <span className="px-1.5 py-0.5 rounded bg-[var(--brand-lime)]/10 text-[var(--brand-lime)] font-bold">
                        16:9 Widescreen
                      </span>
                    </div>

                    {/* Slide Body */}
                    <div>
                      <div className="text-[11px] font-black text-white">
                        Neural Architecture & Optimization
                      </div>
                      <div className="h-0.5 w-8 bg-[var(--brand-lime)] rounded my-1.5" />
                      <div className="text-[8px] text-white/70 space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-[var(--brand-lime)]" />
                          <span>Automated timestamp extraction from video lectures</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-[var(--brand-lime)]" />
                          <span>Non-linear activation functions (ReLU, GELU)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-[var(--brand-lime)]" />
                          <span>Fast convergence via adaptive Adam optimizer</span>
                        </div>
                      </div>
                    </div>

                    {/* Speaker Notes Preview */}
                    <div className="p-1.5 rounded bg-black/40 border border-white/5 text-[7px] text-white/60 font-mono">
                      <span className="text-[var(--brand-lime)] font-bold block mb-0.5">Presenter Note:</span>
                      Highlight 10x synthesis speedup and 100% offline local privacy.
                    </div>

                    {/* Slide Footer */}
                    <div className="flex items-center justify-between text-[7px] text-white/40 pt-1 border-t border-white/10">
                      <span>Native PowerPoint File</span>
                      <span className="text-[var(--brand-lime)] font-bold">.PPTX Export Ready</span>
                    </div>
                  </div>
                </div>

                {/* Right: Copy & Feature Points */}
                <div className="md:col-span-7 flex flex-col justify-between h-full py-1">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--brand-lime)]/15 text-[10px] font-bold text-[var(--brand-lime)] uppercase tracking-wider mb-2.5">
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Presentation Generation</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                      From Video to Presentation
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4 max-w-lg">
                      Turn video lectures into polished presentation slides with structured content, speaker notes, and native PowerPoint export.
                    </p>

                    {/* 4 Feature Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white/85 mb-5 max-w-md">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <Presentation className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">Auto-generated slides</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <Monitor className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">16:9 layout</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">Presenter notes</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                        <Download className="w-3.5 h-3.5 text-[var(--brand-lime)] shrink-0" />
                        <span className="truncate">Native PPTX export</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      <span className="text-[11px] text-white/50 block">Formats</span>
                      <span className="text-xs font-black text-white">.pptx • .pdf • Presentation</span>
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

      {/* ============================================================
           HOW IT WORKS 3-STEP PROCESS (Styled like Image 2 Reference)
           ============================================================ */}
      <div id="how-it-works" className="pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-3">
            Simple Workflow
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-main)]">
            Work your way
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">
            From raw video to a complete study deck in 3 seamless steps.
          </p>
        </div>

        {/* 3-Card Grid Matching Reference Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Paste URL or Upload */}
          <div className="group rounded-[28px] overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 hover:border-[var(--brand-lime-hover)] dark:hover:border-[var(--brand-lime)] transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
            {/* Top Illustration Area */}
            <div className="bg-[#F5F5F0] dark:bg-[#151613] h-[210px] w-full rounded-t-[26px] overflow-hidden relative flex items-end justify-center pt-6 px-4 border-b border-[var(--card-border)]">
              {/* Desktop Window Mockup */}
              <div className="w-full max-w-[270px] bg-white dark:bg-[#0E0F0C] rounded-t-xl border border-black/10 dark:border-white/10 shadow-lg p-3 pb-8 flex flex-col gap-2 translate-y-3 transition-transform duration-300 ease-out group-hover:translate-y-1 group-hover:scale-[1.02]">
                {/* Window Top Controls */}
                <div className="flex items-center gap-1.5 pb-1 border-b border-black/5 dark:border-white/5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                  <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                </div>
                {/* Window Content */}
                <div className="grid grid-cols-12 gap-2 pt-1 text-[8px]">
                  {/* Mini Sidebar */}
                  <div className="col-span-4 space-y-1.5 text-[8px] text-black/50 dark:text-white/50 border-r border-black/5 dark:border-white/5 pr-1 font-medium">
                    <div className="truncate">Recent</div>
                    <div className="px-1.5 py-0.5 rounded bg-[var(--brand-lime)]/20 dark:bg-[var(--brand-lime)]/15 text-[#0E0F0C] dark:text-[var(--brand-lime)] font-bold truncate">
                      Tools
                    </div>
                    <div className="truncate">History</div>
                    <div className="truncate">Settings</div>
                  </div>
                  {/* Mini Document Content */}
                  <div className="col-span-8 space-y-1.5 pl-1">
                    <div className="text-[9px] font-bold text-black/80 dark:text-white/80">
                      Lecture Pipeline
                    </div>
                    <div className="text-[7px] text-black/60 dark:text-white/60">
                      YouTube URL or Upload
                    </div>
                    <div className="p-1 rounded bg-[#FFF8B8] text-[#1F1E1B] font-mono text-[7px] font-bold">
                      youtube.com/watch?v=...
                    </div>
                    <div className="flex items-center gap-1 text-[7px] text-black/40 dark:text-white/40 pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-lime)]" />
                      <span>Zero upload limits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
                  Paste URL or Upload
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  Provide any YouTube link or upload audio/video files directly from your machine with no internet limits.
                </p>
              </div>

              {/* Bottom Arrow Indicator */}
              <div className="flex items-center justify-end pt-2">
                <a
                  href="#app-top"
                  aria-label="Paste URL or Upload"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-main)] group-hover:text-[var(--brand-lime-hover)] dark:group-hover:text-[var(--brand-lime)] transition-colors duration-300 cursor-pointer"
                >
                  <ArrowUpRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-115" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Local Multimodal Analysis */}
          <div className="group rounded-[28px] overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 hover:border-[var(--brand-lime-hover)] dark:hover:border-[var(--brand-lime)] transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
            {/* Top Illustration Area */}
            <div className="bg-[#FBF1EC] dark:bg-[#151613] h-[210px] w-full rounded-t-[26px] overflow-hidden relative flex items-end justify-center pt-4 px-4 border-b border-[var(--card-border)]">
              {/* Smartphone Frame Mockup */}
              <div className="w-[170px] bg-white dark:bg-[#0E0F0C] rounded-t-2xl border border-black/10 dark:border-white/10 shadow-xl p-2.5 pb-8 flex flex-col gap-2 translate-y-3 transition-transform duration-300 ease-out group-hover:translate-y-1 group-hover:scale-[1.02] relative">
                {/* Phone Status Bar */}
                <div className="flex items-center justify-between text-[7px] text-black/60 dark:text-white/60 font-mono pb-1 border-b border-black/5 dark:border-white/5">
                  <span className="font-bold">9:41</span>
                  <div className="w-10 h-1.5 bg-black/10 dark:bg-white/10 rounded-full" />
                </div>
                {/* Phone Content */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="p-1 rounded bg-[var(--brand-lime)]/20 dark:bg-[var(--brand-lime)]/15 border border-[var(--brand-lime)]/30 text-[8px] font-bold text-[#0E0F0C] dark:text-[var(--brand-lime)]">
                    Local Whisper AI
                  </div>
                  <div className="h-9 rounded bg-neutral-100 dark:bg-white/5 p-1 flex items-center gap-1">
                    <span className="w-1 h-4 rounded bg-[var(--brand-lime-hover)] dark:bg-[var(--brand-lime)] animate-pulse" />
                    <span className="w-1 h-6 rounded bg-[var(--brand-lime-hover)] dark:bg-[var(--brand-lime)] animate-pulse" />
                    <span className="w-1 h-3 rounded bg-[var(--brand-lime-hover)] dark:bg-[var(--brand-lime)] animate-pulse" />
                    <span className="w-1 h-5 rounded bg-[var(--brand-lime-hover)] dark:bg-[var(--brand-lime)] animate-pulse" />
                    <span className="text-[7px] text-black/50 dark:text-white/50 ml-1 font-mono">100% Private</span>
                  </div>
                  <div className="h-2 w-full bg-[#FFEAA7] rounded-xs" />
                </div>
                {/* Floating Tools Strip */}
                <div className="absolute right-1.5 top-8 w-5 rounded-lg bg-neutral-100 dark:bg-white/10 p-1 flex flex-col items-center gap-1 text-[7px] font-bold text-black/60 dark:text-white/60 shadow-xs">
                  <span>A</span>
                  <span>Tt</span>
                  <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                </div>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
                  Local Multimodal Analysis
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  Whisper extracts clean audio while advanced LLMs synthesize notes, slides, and quizzes locally with total privacy.
                </p>
              </div>

              {/* Bottom Arrow Indicator with Hover Orange Accent */}
              <div className="flex items-center justify-end pt-2">
                <a
                  href="#app-top"
                  aria-label="Local Multimodal Analysis"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-main)] group-hover:text-[var(--brand-lime-hover)] dark:group-hover:text-[var(--brand-lime)] transition-colors duration-300 cursor-pointer"
                >
                  <ArrowUpRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-115" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Study, Test & Export */}
          <div className="group rounded-[28px] overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 hover:border-[var(--brand-lime-hover)] dark:hover:border-[var(--brand-lime)] transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
            {/* Top Illustration Area */}
            <div className="bg-[#FBF1EC] dark:bg-[#151613] h-[210px] w-full rounded-t-[26px] overflow-hidden relative flex items-end justify-center pt-4 px-4 border-b border-[var(--card-border)]">
              {/* Document + API Code Mockup */}
              <div className="w-full max-w-[270px] bg-white dark:bg-[#0E0F0C] rounded-t-xl border border-black/10 dark:border-white/10 shadow-lg p-3 pb-8 flex flex-col gap-2 translate-y-3 transition-transform duration-300 ease-out group-hover:translate-y-1 group-hover:scale-[1.02] relative">
                {/* Avatars Header */}
                <div className="flex items-center gap-1.5 pb-1">
                  <span className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center text-[8px] font-bold">R</span>
                  <span className="w-5 h-5 rounded-full bg-[#00CEC9] text-white flex items-center justify-center text-[8px] font-bold">G</span>
                  <span className="w-5 h-5 rounded-full bg-[#FF7675] text-white flex items-center justify-center text-[8px] font-bold">+</span>
                </div>
                {/* Document Title & Signature */}
                <div className="text-[10px] font-bold text-black/80 dark:text-white/80">
                  STUDY SUITE
                </div>
                <div className="font-serif italic text-[11px] text-black/40 dark:text-white/40 -mt-1">
                  Summarize.ai
                </div>
                {/* Floating Code Snippet Window */}
                <div className="absolute right-2 bottom-3 w-32 bg-[#2B2D31] text-white p-2 rounded-lg font-mono text-[7px] leading-relaxed shadow-xl border border-white/10">
                  <div className="text-white/40 mb-0.5">/* EXPORT */</div>
                  <div>format: <span className="text-[var(--brand-lime)] font-bold">&quot;pptx&quot;</span></div>
                  <div>notes: <span className="text-[#8ED081]">true</span></div>
                </div>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
                  Study, Test &amp; Export
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  Practice with active recall flashcards, test your memory with adaptive quizzes, and download PPTX or PDF files.
                </p>
              </div>

              {/* Bottom Arrow Indicator */}
              <div className="flex items-center justify-end pt-2">
                <a
                  href="#app-top"
                  aria-label="Study, Test & Export"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-main)] group-hover:text-[var(--brand-lime-hover)] dark:group-hover:text-[var(--brand-lime)] transition-colors duration-300 cursor-pointer"
                >
                  <ArrowUpRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-115" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
