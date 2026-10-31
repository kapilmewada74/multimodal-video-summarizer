"use client";

import React from "react";
import {
  FileText,
  Layers,
  Presentation,
  HelpCircle,
  Link2,
  Cpu,
  Download,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      badge: "EXECUTIVE NOTES",
      title: "Structured Summaries",
      description:
        "Condense hours of lectures, meetings, and podcasts into crisp, hierarchically formatted notes with key takeaways and timestamps.",
      highlights: ["Hierarchical markdown", "1-click copy & exports", "Distraction-free reading"],
    },
    {
      icon: Layers,
      badge: "ACTIVE RECALL",
      title: "3D Study Flashcards",
      description:
        "Retain key terms, formulas, and concepts with responsive paper-flip flashcards equipped with keyboard navigation and progress trackers.",
      highlights: ["3D flip physics", "Arrow key shortcuts", "Instant term memorization"],
    },
    {
      icon: Presentation,
      badge: "PRESENTATION READY",
      title: "Keynote Slide Decks",
      description:
        "Transform video content into polished 16:9 presentation slides with integrated presenter notes and native PPTX downloads.",
      highlights: ["Widescreen 16:9 preview", "Presenter speaker notes", "Native PowerPoint export"],
    },
    {
      icon: HelpCircle,
      badge: "KNOWLEDGE CHECK",
      title: "Adaptive Practice Quizzes",
      description:
        "Generate custom multiple-choice quizzes with selectable difficulty (Easy, Medium, Hard) and question counts (3, 5, 10).",
      highlights: ["Difficulty scaling", "Instant explanation breakdown", "Score recap & retake"],
    },
  ];

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
    <section className="mt-16 sm:mt-24 space-y-20 no-print" id="features">
      {/* 4 Superpower Feature Cards */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-3">
            Core Capabilities
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-main)]">
            Everything You Need to Master Video Content
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)]">
            A comprehensive study workspace designed to turn passive watching into active, long-term mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-[18px] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--brand-lime-hover)] dark:hover:border-[var(--brand-lime)]/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-main)] group-hover:bg-[var(--brand-lime)] group-hover:text-black transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[var(--text-muted)]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-5">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--card-border)]/60 flex flex-wrap gap-2">
                  {item.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works 3-Step Process */}
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