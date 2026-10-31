"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Maximize2,
  Minimize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

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
  onGenerate: () => void;
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
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
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

  // Keyboard navigation for modal: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModalIndex !== null) {
        setActiveModalIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex]);

  const scrollTrack = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 340;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleUpdateNoteColor = (index: number, colorIndex: number) => {
    setDeck((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], colorIndex };
      }
      return updated;
    });
  };

  const handleUpdateNoteTitle = (index: number, front: string) => {
    setDeck((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], front };
      }
      return updated;
    });
  };

  const handleUpdateNoteBody = (index: number, back: string) => {
    setDeck((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], back };
      }
      return updated;
    });
  };

  const handleDeleteNote = (index: number) => {
    setDeck((prev) => prev.filter((_, i) => i !== index));
    setActiveModalIndex(null);
  };

  const handleAddNote = () => {
    const newNote: Flashcard = {
      front: "New Sticky Note",
      back: "• Key concept point\n• Important takeaway",
      tag: "Concept",
      colorIndex: deck.length % NOTE_THEMES.length,
    };
    const nextDeck = [...deck, newNote];
    setDeck(nextDeck);
    setActiveModalIndex(nextDeck.length - 1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-bold text-[var(--text-main)]">Generating Study Flashcards...</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Synthesizing key formulas, concepts, and definitions into desk sticky notes.
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
        <h4 className="text-base font-bold text-[var(--text-main)] mb-1">Desk Sticky Notes</h4>
        <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed">
          Transform your video notes and transcript into interactive desk sticky notes powered by AI.
        </p>
        <button
          onClick={onGenerate}
          className="px-5 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Sticky Notes</span>
        </button>
      </div>
    );
  }

  const activeCard = activeModalIndex !== null ? deck[activeModalIndex] : null;
  const activeTheme =
    activeCard && activeCard.colorIndex !== undefined
      ? NOTE_THEMES[activeCard.colorIndex] || NOTE_THEMES[0]
      : NOTE_THEMES[0];

  return (
    <div className="w-full py-2">
      {/* Warm Desk Mat Surface */}
      <div className="rounded-[24px] bg-[#EFECE6]/80 dark:bg-[#181816] border border-black/5 dark:border-white/10 p-5 sm:p-7 transition-colors">
        {/* Top Header Row with Wooden Pushpin */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            {/* Realistic Wooden Pushpin Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8B5E3C"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotate-45 shrink-0"
            >
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
            <h3 className="text-xl sm:text-2xl font-black text-[#2A241F] dark:text-[#EAE6DE] tracking-tight">
              Desk Sticky Notes
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#6B645D] dark:text-[#A09B93]">
              {deck.length} notes
            </span>
          </div>

          {/* Action and Scroll Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-xs font-bold text-[#2A241F] dark:text-[#EAE6DE] border border-black/5 dark:border-white/10 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Add New Note"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>

            <button
              onClick={onGenerate}
              className="p-1.5 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#2A241F] dark:text-[#EAE6DE] border border-black/5 dark:border-white/10 shadow-2xs transition-all cursor-pointer"
              title="Regenerate Notes"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-black/10 dark:bg-white/15 mx-1" />

            <button
              onClick={() => scrollTrack("left")}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#2A241F] dark:text-[#EAE6DE] flex items-center justify-center border border-black/5 dark:border-white/10 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTrack("right")}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#2A241F] dark:text-[#EAE6DE] flex items-center justify-center border border-black/5 dark:border-white/10 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track: Exactly 3 Notes Visible Initially on Desktop */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-3 scroll-smooth no-scrollbar snap-x snap-mandatory"
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
              <div
                key={idx}
                onClick={() => setActiveModalIndex(idx)}
                className="group relative flex-none w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] min-w-[260px] max-w-[340px] snap-start rounded-[22px] p-5 sm:p-6 pt-3 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none hover:-translate-y-1"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.textColor,
                  boxShadow:
                    "0 6px 16px -4px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                {/* 3D Spherical Pushpin at Top Center */}
                <div className="relative mx-auto mb-3 flex flex-col items-center">
                  <div
                    className="w-3.5 h-3.5 rounded-full z-10"
                    style={{
                      backgroundColor: theme.pinBg,
                      backgroundImage: `radial-gradient(circle at 35% 30%, #FFFFFF 0%, ${theme.pinBg} 60%, rgba(0,0,0,0.4) 100%)`,
                      boxShadow:
                        "0 2px 4px rgba(0,0,0,0.28), inset 0 1px 1.5px rgba(255,255,255,0.7)",
                    }}
                  />
                  <div className="w-2.5 h-1 rounded-full bg-black/25 filter blur-[1px] -mt-0.5" />
                </div>

                {/* Card Title */}
                <div>
                  <h4 className="text-lg font-black text-[#1F1E1B] tracking-tight leading-snug mb-2.5">
                    {card.front}
                  </h4>

                  {/* Body Preview */}
                  <div className="text-xs sm:text-sm text-[#3E3C38] leading-relaxed line-clamp-4">
                    {contentLines.length > 1 ? (
                      <ul className="space-y-1">
                        {contentLines.slice(0, 3).map((line, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-1.5">
                            <span className="text-black/60 font-bold select-none">•</span>
                            <span className="truncate">{line.replace(/^[-•*]\s*/, "")}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="line-clamp-4">{card.back}</p>
                    )}
                  </div>
                </div>

                {/* Bottom Right Expand Icon */}
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalIndex(idx);
                    }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-black/30 group-hover:text-black/75 hover:bg-black/5 transition-all cursor-pointer"
                    title="Open Full Note"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
           MODAL: OPENED STICKY NOTE (Exactly Matching Images 2 & 3)
           ============================================================ */}
      {activeModalIndex !== null && activeCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModalIndex(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl transition-all duration-200 animate-in zoom-in-95"
            style={{
              backgroundColor: activeTheme.bg,
              color: activeTheme.textColor,
            }}
          >
            {/* Header: Color Picker Dots & Actions */}
            <div className="flex items-center justify-between mb-5">
              {/* 5 Color Picker Dots */}
              <div className="flex items-center gap-2.5">
                {NOTE_THEMES.map((th, cIdx) => {
                  const isSelected =
                    (activeCard.colorIndex ?? (activeModalIndex % NOTE_THEMES.length)) === cIdx;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => handleUpdateNoteColor(activeModalIndex, cIdx)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer relative ${
                        isSelected
                          ? "ring-2 ring-black ring-offset-2 ring-offset-transparent scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{
                        backgroundColor: th.bg,
                        border: isSelected ? "none" : "1px solid rgba(0,0,0,0.15)",
                      }}
                      title={th.name}
                    />
                  );
                })}
              </div>

              {/* Top-Right Control Buttons */}
              <div className="flex items-center gap-2">
                {/* Red Trash Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteNote(activeModalIndex)}
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-red-500 border border-black/5 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={() => setActiveModalIndex(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-bold text-[#1F1E1B] border border-black/10 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Minimize</span>
                </button>
              </div>
            </div>

            {/* Note Title Input */}
            <input
              type="text"
              value={activeCard.front}
              onChange={(e) => handleUpdateNoteTitle(activeModalIndex, e.target.value)}
              className="w-full text-xl sm:text-2xl font-black bg-transparent border-none outline-none text-[#1F1E1B] tracking-tight placeholder-black/40"
              placeholder="Note Title..."
            />

            {/* Horizontal Divider Line */}
            <div className="h-px w-full bg-black/10 my-4" />

            {/* Note Body Textarea */}
            <div className="min-h-[160px] max-h-[340px] overflow-y-auto pr-1">
              <textarea
                value={activeCard.back}
                onChange={(e) => handleUpdateNoteBody(activeModalIndex, e.target.value)}
                className="w-full h-full min-h-[160px] bg-transparent border-none outline-none text-sm sm:text-base text-[#2E2C28] leading-relaxed resize-none placeholder-black/40 font-normal"
                placeholder="Note content..."
              />
            </div>

            {/* Bottom Footer Row */}
            <div className="flex items-center justify-between mt-6 pt-2">
              <span className="text-xs text-[#525252] font-medium">
                Changes save automatically
              </span>

              <button
                type="button"
                onClick={() => setActiveModalIndex(null)}
                className="px-6 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: activeTheme.accentBtn,
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}