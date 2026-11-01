"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Check, Mic, Lightbulb, FileText } from "lucide-react";
import { JobState } from "../lib/types";

interface GeneratingProgressCardProps {
  job: JobState;
}

export function GeneratingProgressCard({ job }: GeneratingProgressCardProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [displayProgress, setDisplayProgress] = useState<number>(job.progress || 5);

  // Timer to track seconds and pace progress realistically
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setDisplayProgress((prev) => {
        if (job.status === "completed") return 100;
        const target = Math.max(job.progress || 0, 5);

        // Smoothly approach backend reported progress
        if (prev < target) {
          return Math.min(target, +(prev + 0.3).toFixed(1));
        }

        // Subtly advance progress within realistic caps for the current phase
        let phaseCap = 38;
        if (job.step >= 3 || (job.progress && job.progress >= 50)) phaseCap = 75;
        if (job.progress && job.progress >= 75) phaseCap = 92;

        if (prev < phaseCap) {
          return +(prev + 0.08).toFixed(2);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [job.progress, job.status, job.step]);

  // Compute active stage (1: Transcribing audio, 2: Extracting key concepts, 3: Generating summary)
  // Ensures proper time is taken between stages and does not prematurely advance to stage 3
  const activeStage = useMemo(() => {
    if (job.status === "completed") return 4;

    const msg = (job.message || "").toLowerCase();
    const stepName = (job.step_name || "").toLowerCase();
    const progress = job.progress || 0;

    // Real backend signals take absolute precedence
    let stage = 1;

    // Stage 3: Only when actually synthesizing final summary or >= 85% progress
    if (
      progress >= 85 ||
      msg.includes("synthesiz") ||
      msg.includes("final") ||
      stepName.includes("synthesiz")
    ) {
      stage = 3;
    }
    // Stage 2: When transcription is finished and extracting key concepts / chunking
    else if (
      (progress >= 55 && !msg.includes("whisper") && !msg.includes("transcribing")) ||
      job.step >= 3 ||
      stepName.includes("ai summarization") ||
      stepName.includes("concept") ||
      msg.includes("splitting transcript") ||
      msg.includes("chunks")
    ) {
      stage = 2;
    }
    // Stage 1: Audio extraction and transcription
    else {
      stage = 1;
    }

    // Time-paced fallback: transcription takes realistic time (at least 35-45s)
    // Only advance to stage 2 after 40 seconds if backend didn't signal, and stage 3 after 80 seconds
    if (stage === 1 && elapsedSeconds >= 42 && !msg.includes("transcribing")) {
      stage = 2;
    }
    if (stage <= 2 && elapsedSeconds >= 85) {
      stage = 3;
    }

    return stage;
  }, [job, elapsedSeconds]);

  // Stages configuration: 1: Transcribing audio, 2: Extracting key concepts, 3: Generating summary
  const stages = [
    {
      id: 1,
      name: "Transcribing audio",
      shortName: "Transcription",
      icon: Mic,
      desc: "Converting speech into high-fidelity transcript",
    },
    {
      id: 2,
      name: "Extracting key concepts",
      shortName: "Key Concepts",
      icon: Lightbulb,
      desc: "Identifying core ideas, formulas, and insights",
    },
    {
      id: 3,
      name: "Generating summary",
      shortName: "Summary",
      icon: FileText,
      desc: "Synthesizing structured notes, takeaways, and insights",
    },
  ];

  // Dynamic status subtitle
  const dynamicSubtitle = useMemo(() => {
    if (job.message && !job.message.toLowerCase().includes("processing")) {
      return job.message;
    }
    if (activeStage === 1) {
      return "Transcribing audio speech with local AI model...";
    }
    if (activeStage === 2) {
      return "Extracting core concepts, principles, and structured highlights...";
    }
    return "Synthesizing final structured summary...";
  }, [activeStage, job.message]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 sm:mt-4 mb-20 sm:mb-28 lg:mb-32 p-6 sm:p-9 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm text-center relative overflow-hidden transition-all duration-300 no-print">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-36 bg-[var(--brand-lime)]/15 dark:bg-[var(--brand-lime)]/10 blur-3xl rounded-full pointer-events-none -z-0" />

      {/* Progress Headline & Contextual Status */}
      <div className="mt-2 mb-7 relative z-10">
        <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-main)] tracking-tight">
          Understanding your video...
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-md mx-auto line-clamp-1 transition-all">
          {dynamicSubtitle}
        </p>
      </div>

      {/* ============================================================
          THREE-STAGE PROGRESS INDICATOR
          ============================================================ */}
      <div className="w-full max-w-lg mx-auto relative z-10 px-1 sm:px-3">
        <div className="flex items-center justify-between relative">
          {/* Step 1 to Step 2 Track */}
          <div
            className="absolute top-4 sm:top-4.5 left-[16%] right-[50%] h-[2px] -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              background:
                activeStage > 1
                  ? "var(--brand-lime)"
                  : activeStage === 1
                  ? "linear-gradient(to right, var(--brand-lime), var(--card-border))"
                  : "var(--card-border)",
            }}
          />

          {/* Step 2 to Step 3 Track */}
          <div
            className="absolute top-4 sm:top-4.5 left-[50%] right-[16%] h-[2px] -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              background:
                activeStage > 2
                  ? "var(--brand-lime)"
                  : activeStage === 2
                  ? "linear-gradient(to right, var(--brand-lime), var(--card-border))"
                  : "var(--card-border)",
            }}
          />

          {/* Render 3 Stage Nodes */}
          {stages.map((stage) => {
            const isCompleted = activeStage > stage.id;
            const isActive = activeStage === stage.id;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center flex-1 relative z-10 px-1"
              >
                {/* Node Circle */}
                <div className="relative mb-2.5">
                  {/* Ping effect on active stage */}
                  {isActive && (
                    <span className="absolute -inset-1 rounded-full bg-[var(--brand-lime)]/40 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-sm font-black"
                        : isActive
                        ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-md ring-4 ring-[var(--brand-lime)]/20 font-black scale-105"
                        : "border border-[var(--card-border)] bg-[var(--card-elevated)] text-[var(--text-muted)] text-xs font-semibold"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0E0F0C] animate-pulse" />
                    ) : (
                      <span>{stage.id}</span>
                    )}
                  </div>
                </div>

                {/* Stage Label */}
                <span
                  className={`text-[11px] sm:text-xs text-center transition-colors leading-tight ${
                    isCompleted
                      ? "font-semibold text-[var(--text-main)]"
                      : isActive
                      ? "font-bold text-[var(--text-main)] dark:text-white"
                      : "font-normal text-[var(--text-muted)] opacity-60"
                  }`}
                >
                  <span className="hidden sm:inline">{stage.name}</span>
                  <span className="sm:hidden">{stage.shortName}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SLIM PROGRESS BAR & PERCENTAGE FOOTER
          ============================================================ */}
      <div className="w-full max-w-lg mx-auto mt-7 pt-4 border-t border-[var(--card-border)]/50 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
          <span className="font-semibold text-[var(--text-main)]">
            Processing
          </span>
          <span className="font-mono font-bold text-[var(--text-main)]">
            {Math.round(displayProgress)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--card-border)]/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--brand-lime)] rounded-full transition-all duration-700 ease-out animate-shimmer"
            style={{ width: `${Math.max(6, Math.round(displayProgress))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
