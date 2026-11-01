"use client";

import React, { useState } from "react";
import { Check, X, RefreshCw, Trophy, Sparkles, ChevronRight, Sliders, RotateCcw, ArrowRight } from "lucide-react";
import { MathText } from "./MathText";

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface QuizViewProps {
  quiz: QuizQuestion[];
  provider?: string;
  isLoading: boolean;
  onGenerate: (difficulty: string, numQuestions: number, forceRefresh?: boolean) => void;
}

export function QuizView({ quiz, provider, isLoading, onGenerate }: QuizViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Quiz customization state
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [showConfig, setShowConfig] = useState(false);

  // Sync when quiz updates
  React.useEffect(() => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  }, [quiz]);

  const handleSelectOption = (optIdx: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  const handleGenerateMore = () => {
    setShowConfig(true);
  };

  const handleStartCustomQuiz = () => {
    setShowConfig(false);
    onGenerate(difficulty, numQuestions, true);
  };

  // Keyboard navigation & Shortcuts for Quiz
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // 1. Setup Screen Shortcuts
      if (!quiz || quiz.length === 0 || showConfig) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleStartCustomQuiz();
        }
        return;
      }

      // 2. Completed Screen Shortcuts
      if (isCompleted) {
        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          handleRetake();
        } else if (e.key.toLowerCase() === "m" || e.key === "Enter") {
          e.preventDefault();
          handleGenerateMore();
        }
        return;
      }

      // 3. Question Answering Shortcuts (1..4 or A..D)
      const key = e.key.toLowerCase();
      if (["1", "a"].includes(key)) {
        e.preventDefault();
        handleSelectOption(0);
      } else if (["2", "b"].includes(key)) {
        e.preventDefault();
        handleSelectOption(1);
      } else if (["3", "c"].includes(key)) {
        e.preventDefault();
        handleSelectOption(2);
      } else if (["4", "d"].includes(key)) {
        e.preventDefault();
        handleSelectOption(3);
      } else if (e.key === "Enter" || e.code === "Space") {
        if (selectedAnswers[currentIdx] !== undefined) {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quiz, showConfig, isCompleted, currentIdx, selectedAnswers, difficulty, numQuestions]);

  // Calculate score
  const totalCorrect = quiz.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.answerIndex ? 1 : 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-bold text-[var(--text-main)]">
          Generating {difficulty.toUpperCase()} Quiz ({numQuestions} Questions)...
        </h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">Analyzing video key points and building questions with explanations</p>
      </div>
    );
  }

  // Setup / Config Screen (when no quiz or when user clicks "Generate More Questions")
  if (!quiz || quiz.length === 0 || showConfig) {
    return (
      <div className="max-w-xl mx-auto py-4 text-center animate-in fade-in duration-200">
        {/* Illustrated Quiz Clipboard Header SVG */}
        <svg
          width="120"
          height="110"
          viewBox="0 0 120 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-2.5 block"
        >
          <path d="M25 65C15 50 25 25 50 25C70 15 95 25 100 45C108 65 95 85 75 90C50 95 35 80 25 65Z" fill="#D9EC95" fillOpacity="0.38" />
          <line x1="18" y1="28" x2="26" y2="22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <line x1="26" y1="36" x2="34" y2="30" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <path d="M96 22L97.5 27L102.5 28.5L97.5 30L96 35L94.5 30L89.5 28.5L94.5 27L96 22Z" fill="#15803D" />
          <rect x="36" y="22" width="48" height="62" rx="7" fill="#FFFFFF" stroke="#1E3A1A" strokeWidth="2.5" />
          <rect x="49" y="17" width="22" height="10" rx="3" fill="#D9EC95" stroke="#1E3A1A" strokeWidth="2.2" />
          <circle cx="60" cy="22" r="2" fill="#1E3A1A" />
          <path d="M44 38L47 41L53 35" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="57" y1="38" x2="74" y2="38" stroke="#1E3A1A" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 51L47 54L53 48" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="57" y1="51" x2="74" y2="51" stroke="#1E3A1A" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 64L47 67L53 61" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="57" y1="64" x2="74" y2="64" stroke="#1E3A1A" strokeWidth="2" strokeLinecap="round" />
          <g transform="rotate(35 82 48)">
            <rect x="74" y="24" width="7" height="24" rx="1.5" fill="#FBBF24" stroke="#1E3A1A" strokeWidth="1.8" />
            <rect x="74" y="20" width="7" height="5" rx="1.5" fill="#F87171" stroke="#1E3A1A" strokeWidth="1.8" />
            <rect x="74" y="24" width="7" height="2" fill="#9CA3AF" />
            <polygon points="74,48 81,48 77.5,55" fill="#FDE68A" stroke="#1E3A1A" strokeWidth="1.8" />
            <polygon points="76.5,52 78.5,52 77.5,55" fill="#1E3A1A" />
          </g>
        </svg>

        <h3 className="text-3xl font-black text-[var(--text-main)] mb-1.5 tracking-tight">Quiz</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-8">Test your knowledge with customizable quizzes.</p>

        <div className="max-w-[480px] mx-auto mb-9 space-y-5">
          {/* Row 1: Difficulty */}
          <div className="flex items-center justify-between gap-4 text-left">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-main)]">Difficulty</span>
            <div className="grid grid-cols-3 gap-2 w-[260px]">
              {(["easy", "medium", "hard"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 rounded-full text-sm font-semibold capitalize transition-all cursor-pointer text-center border w-full ${
                    difficulty === diff
                      ? "bg-[var(--brand-lime)] text-[#0E0F0C] border-[var(--brand-lime)] font-bold shadow-xs"
                      : "bg-[var(--card-bg)] text-[var(--text-main)] border-[var(--card-border)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Number of Questions */}
          <div className="flex items-center justify-between gap-4 text-left">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-main)]">Number of Questions</span>
            <div className="grid grid-cols-3 gap-2 w-[260px]">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`py-2 rounded-full text-sm font-semibold transition-all cursor-pointer text-center border w-full ${
                    numQuestions === num
                      ? "bg-[var(--brand-lime)] text-[#0E0F0C] border-[var(--brand-lime)] font-bold shadow-xs"
                      : "bg-[var(--card-bg)] text-[var(--text-main)] border-[var(--card-border)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handleStartCustomQuiz}
            className="py-3.5 px-10 rounded-full bg-[#2E7D32] hover:bg-[#256828] text-white text-base font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {quiz.length > 0 && (
            <button
              onClick={() => setShowConfig(false)}
              className="mt-3 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer block mx-auto"
            >
              Back to Current Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  // Completion Results View
  if (isCompleted) {
    const percentage = Math.round((totalCorrect / quiz.length) * 100);

    return (
      <div className="max-w-lg mx-auto py-8 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-lime)] text-[#0E0F0C] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-[var(--text-main)] mb-1">Quiz Completed!</h3>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Difficulty: <strong className="capitalize text-[var(--text-main)]">{difficulty}</strong> • Here is your score report.
        </p>

        <div className="p-6 rounded-2xl bg-[var(--card-surface-elevated)] border border-[var(--card-border)] mb-6 shadow-sm">
          <div className="text-4xl font-black text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] mb-1">
            {percentage}%
          </div>
          <p className="text-sm font-bold text-[var(--text-main)]">
            You scored {totalCorrect} out of {quiz.length} correct
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {percentage >= 80 && "Outstanding mastery! You have a solid grasp of this material."}
            {percentage >= 50 && percentage < 80 && "Good effort! A quick review of the notes will boost your score."}
            {percentage < 50 && "Keep practicing! Review the summary points and try again."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetake}
            className="px-5 py-2.5 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[var(--card-border)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={handleGenerateMore}
            className="px-5 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate More Questions</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz View
  const q = quiz[currentIdx];
  const hasAnswered = selectedAnswers[currentIdx] !== undefined;
  const userChoice = selectedAnswers[currentIdx];

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="font-bold text-[var(--text-main)]">Question {currentIdx + 1} of {quiz.length}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] capitalize font-semibold">
            {difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]">
            Score: {totalCorrect} / {quiz.length}
          </div>
          <button
            onClick={handleGenerateMore}
            title="Configure difficulty or questions"
            className="p-1 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Progress Track */}
      <div className="w-full h-1 bg-[var(--card-border)] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[var(--brand-lime)] transition-all duration-300"
          style={{ width: `${Math.round(((currentIdx + 1) / quiz.length) * 100)}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-surface-elevated)] border border-[var(--card-border)] shadow-md mb-5">
        <MathText
          as="h3"
          text={q.question}
          className="text-base sm:text-lg font-black text-[var(--text-main)] mb-6 leading-snug"
        />

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, optIdx) => {
            let optionStyles = "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-main)] hover:border-[var(--brand-lime)]";
            let icon = null;

            if (hasAnswered) {
              if (optIdx === q.answerIndex) {
                optionStyles = "bg-green-500/15 border-green-500 text-green-700 dark:text-green-400 font-bold";
                icon = <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />;
              } else if (optIdx === userChoice) {
                optionStyles = "bg-red-500/15 border-red-500 text-red-700 dark:text-red-400 font-bold";
                icon = <X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
              } else {
                optionStyles = "bg-[var(--card-bg)] border-[var(--card-border)] opacity-40";
              }
            }

            return (
              <button
                key={optIdx}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full p-4 rounded-xl border text-left text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${optionStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[var(--btn-secondary-bg)] flex items-center justify-center text-xs font-black shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <MathText text={opt} as="span" />
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation Box */}
        {hasAnswered && (
          <div className="mt-5 p-4 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-xs text-[var(--text-muted)] animate-in fade-in duration-150">
            <div className="font-bold text-[var(--text-main)] mb-1 flex items-center gap-1.5">
              {userChoice === q.answerIndex ? (
                <>
                  <Check className="w-4 h-4 text-[var(--color-success)]" />
                  <span className="text-[var(--color-success)] font-extrabold">Correct!</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-[var(--color-danger)]" />
                  <span className="text-[var(--color-danger)] font-extrabold">Incorrect</span>
                </>
              )}
            </div>
            <MathText text={q.explanation} as="p" className="leading-relaxed" />
          </div>
        )}
      </div>

      {/* Next Button */}
      {hasAnswered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <span>{currentIdx < quiz.length - 1 ? "Next Question" : "View Results"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
