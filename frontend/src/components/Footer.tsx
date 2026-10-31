"use client";

import React from "react";
import { Shield, Terminal, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 sm:mt-32 border-t border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-muted)] no-print">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Logo size={26} />
              <span className="font-extrabold text-sm tracking-tight text-[var(--text-main)]">
                SUMMARIZE<span className="text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]">.AI</span>
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Local-first multimodal study workspace. Transform hours of video lectures into structured knowledge, flashcards, slides, and quizzes.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[10px] font-bold text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span>Local Inference Ready</span>
            </div>
          </div>

          {/* Study Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-3">
              Study Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-default">
                  Structured Summary Notes
                </span>
              </li>
              <li>
                <span className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-default">
                  Timestamped Transcript
                </span>
              </li>
              <li>
                <span className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-default">
                  Active-Recall Flashcards
                </span>
              </li>
              <li>
                <span className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-default">
                  16:9 Presentation Decks
                </span>
              </li>
              <li>
                <span className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-default">
                  Adaptive Practice Quizzes
                </span>
              </li>
            </ul>
          </div>

          {/* Export Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-3">
              Export Formats
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <span>PowerPoint (.pptx)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>Printable PDF</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>Plain Text (.txt)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>Markdown Clipboard</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>Auto-clean PPT Cache</span>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1">
                  Features <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1">
                  How It Works <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1">
                  FAQ <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li className="pt-1 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <Shield className="w-3.5 h-3.5 text-[var(--color-success)]" />
                <span>100% Private Processing</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SUMMARIZE.AI. Built for high-efficiency learning.</p>
          <div className="flex items-center gap-6">
            <span className="text-[var(--text-muted)] font-mono text-[11px]">v2.4.0 (Local)</span>
            <span className="text-[var(--text-muted)]">Private & Unlimited</span>
          </div>
        </div>
      </div>
    </footer>
  );
}