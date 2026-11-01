"use client";

import React, { useState } from "react";
import { Asterisk, ArrowDown, ArrowUpRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  // All FAQs collapsed by default
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "What is this app, and how can it help me?",
      answer:
        "SUMMARIZE.AI is an AI-powered multimodal study platform that transforms lengthy YouTube videos and local recordings into structured study notes, complete transcripts, active-recall flashcards, slide presentations, and quizzes in seconds.",
    },
    {
      question: "Is there a free trial available or upload limits?",
      answer:
        "Yes, our local processing pipeline is completely free to use. You can summarize YouTube links (standard, Shorts, youtu.be) and upload local video or audio files up to 500MB with zero subscription limits or hidden paywalls.",
    },
    {
      question: "How does the app keep my data secure and private?",
      answer:
        "All media extraction, local Whisper speech-to-text, and generative synthesis occur within your private session environment. Your videos and files are never stored on third-party public databases or used for public AI model training.",
    },
    {
      question: "Which video and audio formats do you accept?",
      answer:
        "We support YouTube URLs as well as local file uploads in MP4, MKV, WebM, MOV, MP3, WAV, and M4A formats. Both high-definition video and raw audio lectures are processed seamlessly.",
    },
    {
      question: "Can I export presentations (.pptx) and study notes offline?",
      answer:
        "Yes! You can export complete 16:9 presentation slide decks directly as native PowerPoint (.pptx) files, download structured study notes as formatted PDFs or plain text (.txt), and copy the full timestamped transcript at any time.",
    },
    {
      question: "I need help with the app. How can I contact support?",
      answer:
        "We are here to assist! Reach out directly via our contact button, open an issue on our GitHub repository, or email our developer team for immediate assistance and feature requests.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="mt-20 sm:mt-28 no-print scroll-mt-20" id="faq">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Heading, Subheading & Help Card */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/15 dark:border-white/15 text-xs font-semibold text-[var(--text-main)] mb-6">
              <Asterisk className="w-3.5 h-3.5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
              <span>FAQ</span>
            </div>

            {/* Display Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tight leading-[1.15] mb-4">
              Have more questions?
            </h2>

            {/* Subtitle Paragraph */}
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-8 sm:mb-10 max-w-sm">
              Our app is designed to make learning from video easy and stress-free. With intuitive multimodal AI, you can generate notes, flashcards, slides, and quizzes effortlessly.
            </p>
          </div>

          {/* Bottom Help / Contact Card with Elegant Hover Effect */}
          <div className="group relative rounded-[24px] border border-black/10 dark:border-white/10 bg-[var(--card-bg)] p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-[var(--brand-lime)]/50 dark:hover:border-[var(--brand-lime)]/40 hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden cursor-default">
            {/* Ambient Corner Glow on Hover */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--brand-lime)]/15 dark:bg-[var(--brand-lime)]/20 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <h3 className="relative font-bold text-lg text-[var(--text-main)] mb-2 group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
              Can&apos;t find answers?
            </h3>
            <p className="relative text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              We&apos;re here to help you out whenever you need! Get in touch with our dedicated support team for personalized assistance anytime.
            </p>
            <a
              href="#app-top"
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181916] hover:bg-black text-white dark:bg-white dark:hover:bg-[var(--brand-lime)] dark:text-black font-semibold text-xs transition-all shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer group/btn"
            >
              <span>Contact us</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Interactive FAQ Accordion with Hover & Active Effect */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-3.5">
          {faqs.map((faq, idx) => {
            const isTarget = hoveredIndex !== null ? hoveredIndex === idx : openIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => toggle(idx)}
                className={`rounded-[20px] p-5 sm:p-6 transition-all duration-500 ease-in-out cursor-pointer border ${
                  isTarget
                    ? "bg-[#EAEAE7] dark:bg-[#181916] border-black/10 dark:border-white/15 shadow-xs"
                    : "bg-[#F5F5F3] dark:bg-[#121310] border-black/[0.04] dark:border-white/[0.06] hover:bg-[#ECECE9] dark:hover:bg-[#161714]"
                }`}
              >
                {/* Header Row: Question & Toggle Button */}
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-bold text-sm sm:text-[15px] text-[var(--text-main)] leading-snug">
                    {faq.question}
                  </h4>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ease-in-out ${
                      isTarget
                        ? "bg-[#0E0F0C] text-white dark:bg-[var(--brand-lime)] dark:text-[#0E0F0C] shadow-sm"
                        : "bg-black/[0.06] dark:bg-white/[0.08] text-black/70 dark:text-white/70"
                    }`}
                  >
                    <ArrowDown
                      className={`w-4 h-4 transition-transform duration-500 ease-in-out ${
                        isTarget ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </div>

                {/* Collapsible Answer Pane */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isTarget
                      ? "grid-rows-[1fr] opacity-100 mt-3 pt-1"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-black/70 dark:text-white/75 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
