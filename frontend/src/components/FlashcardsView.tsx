"use client";

import React, { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, Shuffle, RefreshCw, CheckCircle2 } from "lucide-react";

export interface Flashcard {
  front: string;
  back: string;
  tag?: string;
}

interface FlashcardsViewProps {
  cards: Flashcard[];
  provider?: string;
  isLoading: boolean;
  onGenerate: () => void;
}

export function FlashcardsView({ cards, provider, isLoading, onGenerate }: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deck, setDeck] = useState<Flashcard[]>(cards);

  // Sync if cards update
  React.useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-bold text-[var(--text-main)]">Generating Study Flashcards...</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">Extracting core concepts from summary and transcript</p>
      </div>
    );
  }

  if (!deck || deck.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-[var(--card-border)] rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-lime)]/10 text-[var(--brand-lime)] flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-[#0E0F0C] dark:text-[var(--brand-lime)]" />
        </div>
        <h4 className="text-base font-bold text-[var(--text-main)] mb-1">Interactive Flashcards</h4>
        <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed">
          Transform your video notes and transcript into active-recall flashcards powered by Gemini AI with local fallback.
        </p>
        <button
          onClick={onGenerate}
          className="px-5 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Flashcards</span>
        </button>
      </div>
    );
  }

  const currentCard = deck[currentIndex] || deck[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="font-bold text-[var(--text-main)]">Card {currentIndex + 1} of {deck.length}</span>
          {provider && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)]">
              {provider}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="p-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onGenerate}
            title="Regenerate Flashcards"
            className="p-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[260px] p-8 rounded-2xl bg-[var(--card-surface-elevated)] border border-[var(--card-border)] shadow-md flex flex-col justify-between cursor-pointer transition-all hover:border-[var(--brand-lime)]/50 select-none group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--btn-secondary-bg)] text-[var(--text-muted)]">
            {currentCard.tag || (isFlipped ? "Answer" : "Question")}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors flex items-center gap-1 font-medium">
            <RotateCcw className="w-3 h-3" />
            <span>Click to flip</span>
          </span>
        </div>

        <div className="my-auto py-6 text-center">
          {!isFlipped ? (
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)] leading-snug">
              {currentCard.front}
            </h3>
          ) : (
            <div className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-normal">
              {currentCard.back}
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-[var(--text-muted)] font-medium">
          {isFlipped ? "Showing Explanation (Click to flip back)" : "Showing Concept (Click to reveal answer)"}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold transition-all cursor-pointer"
        >
          Flip Card
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
