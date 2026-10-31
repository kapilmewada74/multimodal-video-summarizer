"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, Shuffle, RefreshCw } from "lucide-react";

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
  useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const handleNext = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation: Spacebar to flip, Left/Right arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (deck.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deck.length, handleFlip, handleNext, handlePrev]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-9 h-9 border-[2.5px] border-[var(--card-border)] border-t-[#0066cc] rounded-full animate-spin mb-4" />
        <h4 className="text-base font-semibold tracking-[-0.2px] text-[var(--text-main)]">Generating Study Flashcards...</h4>
        <p className="text-sm text-[var(--text-muted)] mt-1">Extracting core concepts from summary and transcript</p>
      </div>
    );
  }

  if (!deck || deck.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-[var(--card-border)] rounded-[18px]">
        <div className="w-11 h-11 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-5 h-5 text-[#0066cc]" />
        </div>
        <h4 className="text-base font-semibold text-[var(--text-main)] mb-1">Interactive Flashcards</h4>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed font-normal">
          Transform your video notes and transcript into active-recall flashcards powered by AI.
        </p>
        <button
          onClick={onGenerate}
          className="px-6 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-sm font-normal transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Flashcards</span>
        </button>
      </div>
    );
  }

  const currentCard = deck[currentIndex] || deck[0];
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-main)]">Card {currentIndex + 1} of {deck.length}</span>
          {provider && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] font-normal">
              {provider}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="px-3 py-1 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] transition-colors cursor-pointer text-xs font-normal flex items-center gap-1 active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
          <button
            onClick={onGenerate}
            title="Regenerate Flashcards"
            className="p-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] transition-colors cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[var(--card-border)] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[#0066cc] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[280px] p-8 sm:p-10 rounded-[18px] bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between cursor-pointer transition-all hover:border-[#0066cc] select-none group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] border border-[var(--card-border)]">
            {currentCard.tag || (isFlipped ? "Answer" : "Question")}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors flex items-center gap-1 font-normal">
            <RotateCcw className="w-3 h-3" />
            <span>Click or Space to flip</span>
          </span>
        </div>

        <div className="my-auto py-6 text-center">
          {!isFlipped ? (
            <h3 className="text-xl sm:text-2xl font-semibold text-[var(--text-main)] tracking-[-0.28px] leading-snug">
              {currentCard.front}
            </h3>
          ) : (
            <div className="text-base sm:text-[17px] text-[var(--text-main)] leading-[1.47] tracking-[-0.374px] font-normal">
              {currentCard.back}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls: Apple circular 44px buttons */}
      <div className="flex items-center justify-between mt-5 gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous card"
          title="Previous (Left Arrow)"
          className="w-11 h-11 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-all border border-[var(--card-border)] active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicator Dots */}
        <div className="flex items-center gap-1.5 max-w-[200px] overflow-x-auto py-1">
          {deck.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? "bg-[#0066cc] w-5"
                  : "bg-[var(--card-border)] hover:bg-[var(--text-muted)] w-2"
              }`}
              title={`Card ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          aria-label="Next card"
          title="Next (Right Arrow)"
          className="w-11 h-11 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-all border border-[var(--card-border)] active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
