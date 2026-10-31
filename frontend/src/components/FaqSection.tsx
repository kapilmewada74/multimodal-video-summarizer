"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "What video formats and platforms are supported?",
      answer:
        "You can summarize YouTube links (including youtube.com, youtu.be, and Shorts) or upload local video and audio recordings in MP4, MKV, WebM, MOV, MP3, WAV, and M4A formats up to 500MB.",
    },
    {
      question: "How does data privacy and processing work?",
      answer:
        "All media extraction and transcription occurs within your local environment. Your content remains completely private and is never stored on third-party public databases or used for public model training.",
    },
    {
      question: "Can I export presentations and study notes offline?",
      answer:
        "Yes. You can export complete 16:9 presentation slide decks directly as native PowerPoint (.pptx) files, download notes as formatted PDFs or plain text (.txt), and copy the full timestamped transcript at any time.",
    },
    {
      question: "How are the flashcards and practice quizzes generated?",
      answer:
        "Our pipeline analyzes the transcript for core terms, definitions, formulas, and conceptual relationships. It synthesizes 3D flip flashcards for active recall and constructs multi-tier quizzes with instant explanations.",
    },
    {
      question: "How do the quiz difficulty levels work?",
      answer:
        "You can choose Easy (definition and fact recall), Medium (conceptual understanding and practical deduction), or Hard (synthesis and scenario analysis). You can also configure 3, 5, or 10 questions per quiz session.",
    },
    {
      question: "How long does it take to summarize a video?",
      answer:
        "Typical 10-to-30-minute videos are processed in under 20 seconds. The pipeline utilizes lightweight audio streaming and fast inference engines to deliver immediate results without long queue times.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="mt-20 sm:mt-28 no-print" id="faq">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
          Got Questions? We Have Answers.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">
          Everything you need to know about video processing, supported formats, privacy, and exports.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-[14px] bg-[var(--card-bg)] border border-[var(--card-border)] transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]/50 animate-in fade-in duration-150">
                  <p className="pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}