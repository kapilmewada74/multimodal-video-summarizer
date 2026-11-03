"use client";

import React from "react";
import { AlertCircle, RefreshCw, XCircle, FileVideo, Youtube, HelpCircle } from "lucide-react";

interface ErrorCardProps {
  error?: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorCard({ error, onRetry, onDismiss }: ErrorCardProps) {
  const errorMessage = error || "An unexpected error occurred while processing the video.";

  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-6 sm:p-8 rounded-2xl border border-red-500/20 bg-red-500/[0.03] dark:bg-red-950/20 shadow-xs transition-all no-print">
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Status Icon Badge */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6 stroke-[2]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] tracking-tight">
              Summarization Encountered an Issue
            </h3>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg transition-colors cursor-pointer"
                title="Dismiss"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Error Message Box */}
          <div className="mt-2.5 p-3 sm:p-3.5 rounded-xl bg-red-500/[0.06] border border-red-500/15 font-mono text-xs sm:text-sm text-red-700 dark:text-red-300 break-words leading-relaxed">
            {errorMessage}
          </div>

          {/* Helpful Troubleshooting Steps */}
          <div className="mt-4 pt-3.5 border-t border-red-500/10">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Troubleshooting Suggestions
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--text-muted)] leading-relaxed">
              <li className="flex items-center gap-2">
                <Youtube className="w-3.5 h-3.5 shrink-0 text-[var(--text-main)]" />
                <span>Verify that the video link is public, not private or age-restricted.</span>
              </li>
              <li className="flex items-center gap-2">
                <FileVideo className="w-3.5 h-3.5 shrink-0 text-[var(--text-main)]" />
                <span>Ensure the video has audible spoken speech or automated subtitles.</span>
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[var(--text-main)]" />
                <span>For uploaded files, supported formats include .mp4, .mov, .mp3, and .wav.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="h-10 px-5 rounded-full bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] active:scale-95 text-[#0E0F0C] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Try Again</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-10 px-4 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-main)] border border-[var(--card-border)] text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
            >
              Enter Another Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
