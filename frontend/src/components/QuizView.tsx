"use client";

import React, { useState } from "react";
import { HelpCircle, Check, X, RefreshCw, Trophy, Sparkles, ChevronRight, Sliders, RotateCcw } from "lucide-react";

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
      <div className="max-w-md mx-auto py-6 text-center animate-in fade-in duration-200">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Practice Quiz Studio</span>
        </div>

        <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-1">
          {quiz.length > 0 ? "Customize Quiz" : "Test Your Knowledge"}
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mb-6">
          Configure difficulty and question count to test your understanding.
        </p>

        <div className="p-5 rounded-2xl bg-[var(--card-surface-elevated)] border border-[var(--card-border)] text-left mb-6 shadow-sm">
          {/* Difficulty Segmented Controller */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Difficulty
              </span>
              <span className="text-[11px] font-bold text-[var(--text-main)]">
                {difficulty === "easy" && "Core Facts"}
                {difficulty === "medium" && "Standard Recall"}
                {difficulty === "hard" && "Deep Synthesis"}
              </span>
            </div>
            <div className="grid grid-cols-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1 gap-1">
              {(["easy", "medium", "hard"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    difficulty === diff
                      ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-sm font-black"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2 leading-relaxed">
              {difficulty === "easy" && "Fundamental definitions and explicit facts from the video."}
              {difficulty === "medium" && "Conceptual understanding, deduction, and practical relationships."}
              {difficulty === "hard" && "Deep conceptual analysis, edge cases, and tricky plausible options."}
            </p>
          </div>

          {/* Number of Questions Segmented Controller */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Number of Questions
              </span>
              <span className="text-[11px] font-bold text-[var(--text-main)]">
                {numQuestions === 3 && "~2 mins"}
                {numQuestions === 5 && "~4 mins"}
                {numQuestions === 10 && "~8 mins"}
              </span>
            </div>
            <div className="grid grid-cols-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1 gap-1">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    numQuestions === num
                      ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-sm font-black"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {quiz.length > 0 && (
            <button
              onClick={() => setShowConfig(false)}
              className="px-4 py-2.5 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleStartCustomQuiz}
            className="px-6 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Practice Quiz</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 font-mono font-bold">
              {numQuestions} Qs • {difficulty}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
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
          {provider && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)]">
              {provider}
            </span>
          )}
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
        <h3 className="text-base sm:text-lg font-black text-[var(--text-main)] mb-6 leading-snug">
          {q.question}
        </h3>

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
                  <span>{opt}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation Box */}
        {hasAnswered && (
          <div className="mt-5 p-4 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] text-xs text-[var(--text-muted)] animate-in fade-in duration-150">
            <div className="font-bold text-[var(--text-main)] mb-1">
              {userChoice === q.answerIndex ? "✅ Correct!" : "❌ Incorrect"}
            </div>
            <p className="leading-relaxed">{q.explanation}</p>
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
