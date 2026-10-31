"use client";

import React, { useState } from "react";
import { HelpCircle, Check, X, RefreshCw, Trophy, Sparkles, ChevronRight } from "lucide-react";

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
  onGenerate: () => void;
}

export function QuizView({ quiz, provider, isLoading, onGenerate }: QuizViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync if quiz updates
  React.useEffect(() => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  }, [quiz]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-bold text-[var(--text-main)]">Generating Interactive Quiz...</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">Synthesizing multiple-choice questions powered by Grok AI</p>
      </div>
    );
  }

  if (!quiz || quiz.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-[var(--card-border)] rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-lime)]/10 text-[var(--brand-lime)] flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-6 h-6 text-[#0E0F0C] dark:text-[var(--brand-lime)]" />
        </div>
        <h4 className="text-base font-bold text-[var(--text-main)] mb-1">Knowledge Check Quiz</h4>
        <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed">
          Test your comprehension with an interactive quiz powered by Grok AI with intelligent distractors and detailed explanations.
        </p>
        <button
          onClick={onGenerate}
          className="px-5 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Quiz</span>
        </button>
      </div>
    );
  }

  const handleSelectOption = (optIdx: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return; // already answered

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

  // Calculate score
  const totalCorrect = quiz.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.answerIndex ? 1 : 0);
  }, 0);

  // If Completed, Show Results
  if (isCompleted) {
    const percentage = Math.round((totalCorrect / quiz.length) * 100);

    return (
      <div className="max-w-lg mx-auto py-8 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-lime)] text-[#0E0F0C] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-[var(--text-main)] mb-1">Quiz Completed!</h3>
        <p className="text-xs text-[var(--text-muted)] mb-6">Here is your performance report based on the video content.</p>

        <div className="p-6 rounded-2xl bg-[var(--card-surface-elevated)] border border-[var(--card-border)] mb-6">
          <div className="text-4xl font-black text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] mb-1">
            {percentage}%
          </div>
          <p className="text-sm font-bold text-[var(--text-main)]">
            You scored {totalCorrect} out of {quiz.length} correct
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetake}
            className="px-5 py-2.5 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold transition-all cursor-pointer"
          >
            Retake Quiz
          </button>
          <button
            onClick={onGenerate}
            className="px-5 py-2.5 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Questions</span>
          </button>
        </div>
      </div>
    );
  }

  const q = quiz[currentIdx];
  const hasAnswered = selectedAnswers[currentIdx] !== undefined;
  const userChoice = selectedAnswers[currentIdx];

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="font-bold text-[var(--text-main)]">Question {currentIdx + 1} of {quiz.length}</span>
          {provider && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--card-border)]">
              {provider}
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]">
          Score: {totalCorrect} / {quiz.length}
        </div>
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
