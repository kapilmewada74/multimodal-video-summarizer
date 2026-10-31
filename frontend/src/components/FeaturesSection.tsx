"use client";

import React from "react";
import { ArrowUpRight, Link2, Cpu, Download, ArrowRight } from "lucide-react";

export function FeaturesSection() {
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
    <section className="mt-20 sm:mt-28 space-y-24 no-print" id="features">
      {/* ============================================================
           WORK YOUR WAY (Exact 3-Card Showcase from Reference Image)
           ============================================================ */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-main)]">
            Work your way
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto">
            Batch process, review active-recall notes, and export presentation decks locally with zero limits.
          </p>
        </div>

        {/* 3 Tall Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {/* Card 1: Desktop Offline */}
          <div className="group rounded-[26px] bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
            {/* Top Mockup Banner */}
            <div className="h-[210px] sm:h-[230px] bg-[#FCEEE8] dark:bg-[#221C18] pt-6 px-5 flex items-end justify-center overflow-hidden transition-colors">
              {/* Desktop App Window Mockup */}
              <div className="w-full max-w-[270px] bg-white dark:bg-[#181916] rounded-t-xl shadow-lg border border-black/5 dark:border-white/10 p-3 pb-6 flex flex-col transition-transform group-hover:scale-[1.02] duration-300">
                {/* Window Title Bar */}
                <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-black/5 dark:border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                  <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                  <span className="ml-auto text-[9px] font-mono text-black/30 dark:text-white/30">desktop-app</span>
                </div>

                <div className="flex gap-2.5">
                  {/* Mini Sidebar */}
                  <div className="w-16 space-y-1.5 text-[9px] font-medium text-black/50 dark:text-white/50">
                    <div className="px-1.5 py-0.5 rounded text-black/40 dark:text-white/40">Recent</div>
                    <div className="px-1.5 py-0.5 rounded bg-[#FFEAE4] dark:bg-white/10 text-[#DE5442] dark:text-[#FFA090] font-bold">Tools</div>
                    <div className="px-1.5 py-0.5 rounded text-black/40 dark:text-white/40">History</div>
                    <div className="px-1.5 py-0.5 rounded text-black/40 dark:text-white/40">Settings</div>
                  </div>

                  {/* Document Body */}
                  <div className="flex-1 space-y-1.5 pl-1">
                    <div className="text-[10px] font-extrabold text-[#1F1E1B] dark:text-[#EAE6DE] leading-tight">
                      Exclusivity <span className="bg-[#FFE885] dark:bg-[#B3931E] px-1 rounded text-black">agreement</span>
                    </div>
                    <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded" />
                    <div className="w-3/4 h-1 bg-black/10 dark:bg-white/10 rounded" />
                    <div className="w-5/6 h-1 bg-black/10 dark:bg-white/10 rounded" />
                    <div className="pt-1 flex items-center gap-1 text-[8px] text-[#15803D] font-bold">
                      <span className="w-2.5 h-2.5 rounded border border-[#15803D] flex items-center justify-center text-[7px]">✓</span>
                      <span>Verified Offline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-tight">
                  Work offline with Desktop
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Batch edit and manage documents locally, with no internet and no limits.
                </p>
              </div>

              <div className="pt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Mobile on the Go */}
          <div className="group rounded-[26px] bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
            {/* Top Mockup Banner */}
            <div className="h-[210px] sm:h-[230px] bg-[#FCEEE8] dark:bg-[#221C18] pt-6 px-5 flex items-end justify-center overflow-hidden transition-colors">
              {/* Phone Device Mockup */}
              <div className="w-[180px] bg-white dark:bg-[#181916] rounded-t-2xl shadow-lg border border-black/5 dark:border-white/10 p-2.5 pb-6 flex flex-col transition-transform group-hover:scale-[1.02] duration-300">
                {/* Mobile Status Bar */}
                <div className="flex items-center justify-between text-[8px] font-bold text-black/60 dark:text-white/60 px-1 mb-2">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40" />
                    <span className="w-2.5 h-1.5 border border-black/40 dark:border-white/40 rounded-xs" />
                  </div>
                </div>

                {/* Mobile Screen Content */}
                <div className="flex gap-1.5">
                  <div className="flex-1 space-y-1.5">
                    <div className="border border-dashed border-[#0284C7] p-1 rounded bg-[#E0F2FE]/50 text-[9px] font-black text-[#0369A1] leading-tight">
                      Modern architecture
                    </div>
                    <div className="h-10 bg-[#EFECE6] dark:bg-white/10 rounded overflow-hidden flex items-center justify-center text-[8px] text-black/40 dark:text-white/40">
                      [Architecture.jpg]
                    </div>
                    <div className="w-3/4 h-1.5 bg-[#FFE885] rounded" />
                  </div>

                  {/* Vertical Tool Dock */}
                  <div className="w-5 py-1 rounded bg-[#F4F4F1] dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center gap-1.5 text-[8px] font-bold text-black/60 dark:text-white/60">
                    <span className="text-[#DE5442]">A</span>
                    <span>Tt</span>
                    <span className="w-2 h-2 rounded-full bg-[#DE5442]" />
                    <span>✎</span>
                    <span>⚲</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-tight">
                  On-the-go with Mobile
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Your favorite tools, right in your pocket. Keep working on your projects anytime, anywhere.
                </p>
              </div>

              <div className="pt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#E11D48] dark:text-[#FF6B6B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-5 h-5 font-bold" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Built for Business */}
          <div className="group rounded-[26px] bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
            {/* Top Mockup Banner */}
            <div className="h-[210px] sm:h-[230px] bg-[#FCEEE8] dark:bg-[#221C18] pt-6 px-5 flex items-end justify-center overflow-hidden transition-colors">
              {/* Team Avatars & Code Window Mockup */}
              <div className="w-full max-w-[270px] relative flex flex-col items-center">
                {/* Team Avatars Bar */}
                <div className="flex items-center gap-1.5 mb-2 self-start pl-1">
                  <div className="w-5 h-5 rounded-full bg-[#38BDF8] flex items-center justify-center text-[8px] font-black text-white shadow-2xs">JS</div>
                  <div className="w-5 h-5 rounded-full bg-[#FB923C] flex items-center justify-center text-[8px] font-black text-white shadow-2xs">AK</div>
                  <div className="w-5 h-5 rounded-full bg-[#E11D48] flex items-center justify-center text-[10px] font-black text-white shadow-2xs">+</div>
                </div>

                <div className="w-full flex gap-2">
                  {/* Invoice Document with Signature */}
                  <div className="w-[110px] bg-white dark:bg-[#181916] rounded-t-xl p-2.5 shadow-md border border-black/5 dark:border-white/10">
                    <div className="text-[9px] font-black tracking-wider text-[#38BDF8] mb-1">INVOICE</div>
                    <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded mb-1" />
                    <div className="w-2/3 h-1 bg-black/10 dark:bg-white/10 rounded mb-3" />
                    {/* Handwritten signature mark */}
                    <div className="font-serif italic text-sm text-[#1F1E1B] dark:text-[#EAE6DE] opacity-70 border-t border-black/5 pt-1">
                      Qu...
                    </div>
                  </div>

                  {/* Dark API Terminal Mockup */}
                  <div className="flex-1 bg-[#1F2428] rounded-t-xl p-2.5 text-[8px] font-mono text-[#E1E4E8] shadow-md border border-black/20">
                    <div className="text-white/40 mb-1">/* API */</div>
                    <div className="text-[#79B8FF]">&#123;</div>
                    <div className="pl-2">
                      <span className="text-[#B392F0]">&quot;id&quot;</span>: <span className="text-[#9ECBFF]">&quot;db601c95&quot;</span>,
                    </div>
                    <div className="pl-2">
                      <span className="text-[#B392F0]">&quot;name&quot;</span>: <span className="text-[#9ECBFF]">&quot;export&quot;</span>,
                    </div>
                    <div className="pl-2">
                      <span className="text-[#B392F0]">&quot;props&quot;</span>: &lt;payload&gt;
                    </div>
                    <div className="text-[#79B8FF]">&#125;</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-tight">
                  Built for business
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Automate document management, onboard teams easily, and scale with flexible plans.
                </p>
              </div>

              <div className="pt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
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