"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { JobState } from "../lib/types";

interface ProgressStepperProps {
  job: JobState;
}

export function ProgressStepper({ job }: ProgressStepperProps) {
  const steps = [
    { num: 1, label: "Audio Extraction" },
    { num: 2, label: "Whisper Speech-to-Text" },
    { num: 3, label: "AI Summarization & Math" },
  ];

  const getStepStatus = (stepNum: number) => {
    if (job.status === "failed") return stepNum === job.step ? "failed" : "pending";
    if (job.status === "completed") return "completed";
    if (stepNum < job.step) return "completed";
    if (stepNum === job.step) return "active";
    return "pending";
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-xl mb-8">
      {/* Header & Percentage */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold">Processing Video Pipeline</span>
        <span className="text-sm font-black text-[var(--brand-lime)]">{job.progress}%</span>
      </div>

      {/* Shimmer Progress Track */}
      <div className="w-full h-2 bg-[rgba(242,242,240,0.1)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[var(--brand-lime)] rounded-full transition-all duration-300 animate-shimmer shadow-[0_0_12px_rgba(217,236,149,0.5)]"
          style={{ width: `${Math.max(5, job.progress)}%` }}
        />
      </div>

      {/* Message Text */}
      <p className="text-xs text-[var(--text-muted)] mb-5">
        {job.error ? (
          <span className="text-[var(--color-danger)] font-semibold">{job.error}</span>
        ) : (
          job.message || "Working..."
        )}
      </p>

      {/* 3 Step Indicator Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((s) => {
          const status = getStepStatus(s.num);
          return (
            <div
              key={s.num}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                status === "completed"
                  ? "bg-[rgba(142,208,129,0.1)] border-[rgba(142,208,129,0.25)] text-[var(--color-success)]"
                  : status === "active"
                  ? "bg-[rgba(244,201,93,0.12)] border-[rgba(244,201,93,0.3)] text-[var(--color-warning)]"
                  : status === "failed"
                  ? "bg-[rgba(255,107,107,0.12)] border-[rgba(255,107,107,0.3)] text-[var(--color-danger)]"
                  : "bg-[var(--card-elevated)] border-[var(--card-border)] text-[var(--text-muted)]"
              }`}
            >
              {status === "completed" ? (
                <div className="w-5 h-5 rounded-full bg-[var(--color-success)] text-[#0E0F0C] flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : status === "active" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--color-warning)]" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                  {s.num}
                </div>
              )}
              <span className="text-xs font-semibold">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
