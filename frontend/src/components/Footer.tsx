"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-muted)] no-print">
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
              Transform hours of video lectures, meetings, and podcasts into structured notes, active-recall flashcards, slide presentations, and quizzes.
            </p>
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
              <li>
                <span>PowerPoint Presentation (.pptx)</span>
              </li>
              <li>
                <span>Printable PDF (.pdf)</span>
              </li>
              <li>
                <span>Plain Text (.txt)</span>
              </li>
              <li>
                <span>Markdown Notes (.md)</span>
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
            </ul>
          </div>
        </div>

        {/* Clean Professional Bottom Bar */}
        <div className="pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SUMMARIZE.AI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[var(--text-muted)]">
            <a href="#app-top" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</a>
            <a href="#app-top" className="hover:text-[var(--text-main)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
