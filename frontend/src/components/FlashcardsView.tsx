"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  RotateCw,
} from "lucide-react";
import TiltedCard, { TiltedCardLayer } from "./TiltedCard";
import { MathText } from "./MathText";

export interface Flashcard {
  front: string;
  back: string;
  tag?: string;
  colorIndex?: number;
}

interface FlashcardsViewProps {
  cards: Flashcard[];
  provider?: string;
  isLoading: boolean;
  onGenerate: (forceRefresh?: boolean) => void;
}

export const NOTE_THEMES = [
  {
    id: "yellow",
    name: "Yellow",
    bg: "#FFF8B8",
    pinBg: "#E59819",
    accentBtn: "#E5A024",
    accentBtnHover: "#CF8B15",
    textColor: "#1F1E1B",
    subtextColor: "#3F3C36",
    dotBorder: "#1F1E1B",
  },
  {
    id: "pink",
    name: "Pink",
    bg: "#FFE4EC",
    pinBg: "#E15A78",
    accentBtn: "#DE5473",
    accentBtnHover: "#C84360",
    textColor: "#1F1E1B",
    subtextColor: "#3F3C36",
    dotBorder: "#1F1E1B",
  },
  {
    id: "tan",
    name: "Tan",
    bg: "#F0E9DA",
    pinBg: "#8B5E3C",
    accentBtn: "#845634",
    accentBtnHover: "#714624",
    textColor: "#1F1E1B",
    subtextColor: "#3F3C36",
    dotBorder: "#1F1E1B",
  },
  {
    id: "mint",
    name: "Mint",
    bg: "#E1EEE8",
    pinBg: "#2F7E6B",
    accentBtn: "#3D8280",
    accentBtnHover: "#2F6E6C",
    textColor: "#1F1E1B",
    subtextColor: "#3F3C36",
    dotBorder: "#1F1E1B",
  },
  {
    id: "blue",
    name: "Blue",
    bg: "#E0F0F8",
    pinBg: "#2B78A8",
    accentBtn: "#2373A4",
    accentBtnHover: "#1B5E87",
    textColor: "#1F1E1B",
    subtextColor: "#3F3C36",
    dotBorder: "#1F1E1B",
  },
];

export function FlashcardsView({ cards, provider, isLoading, onGenerate }: FlashcardsViewProps) {
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync incoming cards
  useEffect(() => {
    if (cards && cards.length > 0) {
      setDeck(
        cards.map((c, idx) => ({
          ...c,
          colorIndex: c.colorIndex ?? idx % NOTE_THEMES.length,
        }))
      );
    } else {
      setDeck([]);
    }
  }, [cards]);

  const scrollTrack = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 340;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-bold text-[var(--text-main)]">Generating Study Flashcards...</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Synthesizing key formulas, concepts, and definitions into 3D interactive flashcards.
        </p>
      </div>
    );
  }

  if (!deck || deck.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-[var(--card-border)] rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-lime)]/10 text-[var(--brand-lime)] flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-[#0E0F0C] dark:text-[var(--brand-lime)]" />
        </div>
        <h4 className="text-base font-bold text-[var(--text-main)] mb-1">Study Flashcards</h4>
        <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed">
          Transform your video notes and transcript into interactive 3D flashcards that tilt, shine, and flip.
        </p>
        <button
          onClick={() => onGenerate(false)}
          className="px-5 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Flashcards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-1">
      {/* Top Controls Row */}
      <div className="flex items-center justify-end mb-3 px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGenerate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] shadow-2xs transition-all cursor-pointer text-xs font-bold active:scale-95"
            title="Regenerate Flashcards"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>

          <div className="h-4 w-px bg-[var(--card-border)] mx-1" />

          <button
            onClick={() => scrollTrack("left")}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] flex items-center justify-center border border-[var(--card-border)] shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTrack("right")}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] flex items-center justify-center border border-[var(--card-border)] shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
          {deck.map((card, idx) => {
            const theme = NOTE_THEMES[card.colorIndex ?? idx % NOTE_THEMES.length] || NOTE_THEMES[0];
            const contentLines = card.back
              ? card.back
                  .split(/\n+/)
                  .map((l) => l.trim())
                  .filter(Boolean)
              : [];

            return (
              <div key={idx} className="flex-none snap-start py-2">
                <TiltedCard
                  containerHeight="340px"
                  containerWidth="320px"
                  imageHeight="340px"
                  imageWidth="320px"
                  rotateAmplitude={12}
                  scaleOnHover={1.05}
                  glare={0.5}
                  shadow={0.5}
                  className="rounded-[22px]"
                  frontStyle={{
                    backgroundColor: theme.bg,
                    color: theme.textColor,
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                  backStyle={{
                    backgroundColor: theme.bg,
                    color: theme.textColor,
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                  backContent={
                    <div className="w-full h-full p-6 flex flex-col justify-between select-none">
                      <div>
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/10">
                          <span className="text-[11px] font-black uppercase tracking-wider text-black/60">
                            {card.tag || "Answer / Key Insight"}
                          </span>
                        </div>

                        <div className="text-xs sm:text-sm text-[#2E2C28] leading-relaxed">
                          {contentLines.length > 1 ? (
                            <ul className="space-y-1.5">
                              {contentLines.map((line, lIdx) => (
                                <li key={lIdx} className="flex items-start gap-1.5">
                                  <span className="text-black/60 font-bold select-none">•</span>
                                  <MathText text={line.replace(/^[-•*]\s*/, "")} as="span" />
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <MathText text={card.back} as="p" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-black/5 text-black/55 text-xs font-bold">
                        <span className="text-sm font-black text-black/60">{idx + 1}</span>
                      </div>
                    </div>
                  }
                >
                  {/* Layer 1: Spherical 3D Pushpin & Category Tag (Depth 35) */}
                  <TiltedCardLayer depth={35}>
                    <div className="absolute top-4 inset-x-0 flex items-center justify-between px-5 pointer-events-none">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: theme.pinBg,
                            backgroundImage: `radial-gradient(circle at 35% 30%, #FFFFFF 0%, ${theme.pinBg} 60%, rgba(0,0,0,0.45) 100%)`,
                            boxShadow:
                              "0 2px 5px rgba(0,0,0,0.32), inset 0 1px 1.5px rgba(255,255,255,0.7)",
                          }}
                        />
                        <div className="w-3 h-1 rounded-full bg-black/25 filter blur-[1px] -mt-0.5" />
                      </div>

                      {card.tag && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 text-black/70">
                          {card.tag}
                        </span>
                      )}
                    </div>
                  </TiltedCardLayer>

                  {/* Layer 2: Prominent Question Title with Math (Depth 25) */}
                  <TiltedCardLayer depth={25}>
                    <div className="absolute inset-x-0 top-16 px-6 pointer-events-none">
                      <MathText
                        as="h4"
                        text={card.front}
                        className="text-[15px] sm:text-base font-semibold text-[#1F1E1B] tracking-tight leading-snug"
                      />
                    </div>
                  </TiltedCardLayer>

                  {/* Layer 3: Interactive Card Footer / Number & Flip Icon (Depth 15) */}
                  <TiltedCardLayer depth={15}>
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-between px-6 pointer-events-none text-black/55 text-xs font-bold">
                      <span className="text-sm font-black text-black/60">{idx + 1}</span>
                      <span className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-black/70">
                        <RotateCw className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </TiltedCardLayer>
                </TiltedCard>
              </div>
            );
          })}
        </div>
    </div>
  );
}
