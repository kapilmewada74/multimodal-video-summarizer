"use client";

import React, { useState, useMemo } from "react";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Copy,
  Download,
  Printer,
  FileText,
  Check,
  Layers,
  Presentation as PresentationIcon,
  HelpCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { JobResult } from "../lib/types";
import { FlashcardsView, Flashcard } from "./FlashcardsView";
import { PresentationView, PresentationData } from "./PresentationView";
import { QuizView, QuizQuestion } from "./QuizView";

interface OutputWorkspaceProps {
  result: JobResult;
  onToast: (msg: string, type?: "success" | "info" | "error") => void;
}

export function OutputWorkspace({ result, onToast }: OutputWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "flashcards" | "presentation" | "quiz">("summary");
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Advanced features state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsProvider, setFlashcardsProvider] = useState<string>("");
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);

  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [isLoadingPresentation, setIsLoadingPresentation] = useState(false);

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizProvider, setQuizProvider] = useState<string>("");
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Render markdown with KaTeX math formula rendering
  const renderedSummaryHtml = useMemo(() => {
    if (!result.summary) return "";
    let raw = result.summary;

    // Render Display Math Blocks: \[ ... \] or $$ ... $$
    raw = raw.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (_, eq1, eq2) => {
      const eq = (eq1 || eq2 || "").trim();
      try {
        return katex.renderToString(eq, { displayMode: true, throwOnError: false });
      } catch {
        return `<pre class="katex-error">${eq}</pre>`;
      }
    });

    // Render Inline Math: \( ... \) or $ ... $
    raw = raw.replace(/\\\(([\s\S]*?)\\\)|\$([^\$\n]+?)\$/g, (_, eq1, eq2) => {
      const eq = (eq1 || eq2 || "").trim();
      try {
        return katex.renderToString(eq, { displayMode: false, throwOnError: false });
      } catch {
        return `<code>${eq}</code>`;
      }
    });

    return (marked.parse(raw) as string) || "";
  }, [result.summary]);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
      onToast("Summary copied to clipboard!", "success");
    } catch {
      onToast("Failed to copy summary", "error");
    }
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(result.transcript);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
      onToast("Transcript copied to clipboard!", "success");
    } catch {
      onToast("Failed to copy transcript", "error");
    }
  };

  const handleDownloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(`Downloaded ${filename}`, "success");
  };

  const printCleanPdf = (title: string, contentHtml: string) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title></title>
  <style>
    @page {
      margin: 16mm;
      size: auto;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111111;
      background: #ffffff;
      line-height: 1.6;
      padding: 0;
      margin: 0;
    }
    .pdf-header {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #eaeaea;
    }
    .pdf-title {
      font-size: 22px;
      font-weight: 800;
      color: #0E0F0C;
      margin: 0;
    }
    .pdf-body {
      font-size: 13.5px;
      color: #222222;
      line-height: 1.7;
    }
    h1, h2, h3, h4 { color: #0E0F0C; font-weight: 700; margin-top: 18px; margin-bottom: 8px; }
    h1 { font-size: 18px; }
    h2 { font-size: 15px; }
    h3 { font-size: 13.5px; }
    p { margin: 8px 0; }
    ul, ol { padding-left: 20px; margin: 8px 0; }
    li { margin: 4px 0; }
    code { font-family: monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-size: 12px; }
    pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
    .transcript-line { margin-bottom: 10px; font-size: 13.5px; color: #222; }
  </style>
</head>
<body>
  <div class="pdf-header">
    <h1 class="pdf-title">${title}</h1>
  </div>
  <div class="pdf-body">
    ${contentHtml}
  </div>
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  // --- Generation Handlers ---
  const handleGenerateFlashcards = async () => {
    setIsLoadingFlashcards(true);
    try {
      const res = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          summary: result.summary,
          transcript: result.transcript,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate flashcards.");
      const data = await res.json();
      setFlashcards(data.flashcards || []);
      setFlashcardsProvider(data.provider || "");
      onToast(`Flashcards ready! (${data.provider || "AI"})`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating flashcards";
      onToast(msg, "error");
    } finally {
      setIsLoadingFlashcards(false);
    }
  };

  const handleGeneratePresentation = async () => {
    setIsLoadingPresentation(true);
    try {
      const res = await fetch("/api/generate/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          summary: result.summary,
          transcript: result.transcript,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate presentation.");
      const data = await res.json();
      setPresentation(data);
      onToast(`Presentation slides ready! (${data.provider || "AI"})`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating slides";
      onToast(msg, "error");
    } finally {
      setIsLoadingPresentation(false);
    }
  };

  const handleGenerateQuiz = async (difficulty: string = "medium", numQuestions: number = 5, forceRefresh: boolean = false) => {
    setIsLoadingQuiz(true);
    try {
      const res = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          summary: result.summary,
          transcript: result.transcript,
          difficulty,
          num_questions: numQuestions,
          force_refresh: forceRefresh,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate quiz.");
      const data = await res.json();
      setQuiz(data.quiz || []);
      setQuizProvider(data.provider || "");
      onToast(`Quiz ready! (${numQuestions} Qs • ${difficulty.toUpperCase()})`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating quiz";
      onToast(msg, "error");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const transcriptLines = useMemo(() => {
    if (!result.transcript) return [];
    return result.transcript.split("\n").filter((l) => l.trim().length > 0);
  }, [result.transcript]);

  const safeFilename = (result.title || "video").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-6 sm:px-9 sm:py-8 mb-8 print-content transition-colors">
      {/* Title & Actions Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--card-border)] pb-5 mb-6 no-print min-h-[42px]">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.28px] text-[var(--text-main)] truncate sm:whitespace-normal">
            {result.title || "Video Summary"}
          </h2>
        </div>

        {/* Export Toolbar (at rightmost part of video summary title) */}
        {activeTab === "summary" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopySummary}
              className="px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Summary</span>
            </button>

            <button
              onClick={() => printCleanPdf(result.title || "Video Summary", renderedSummaryHtml)}
              className="px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => handleDownloadFile(result.summary, `${safeFilename}_summary.txt`, "text/plain")}
              className="px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.TXT</span>
            </button>
          </div>
        )}
      </div>

      {/* 5 High Contrast Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--card-border)] pb-3 mb-6 no-print">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
            activeTab === "summary"
              ? "bg-[#0066cc] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] font-normal"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Summary</span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
            activeTab === "transcript"
              ? "bg-[#0066cc] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] font-normal"
          }`}
        >
          <span>Full Transcript</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("flashcards");
            if (flashcards.length === 0) handleGenerateFlashcards();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
            activeTab === "flashcards"
              ? "bg-[#0066cc] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] font-normal"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards</span>
          {flashcards.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
              {flashcards.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("presentation");
            if (!presentation) handleGeneratePresentation();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
            activeTab === "presentation"
              ? "bg-[#0066cc] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] font-normal"
          }`}
        >
          <PresentationIcon className="w-4 h-4" />
          <span>Presentation (PPT)</span>
          {presentation?.slides && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
              {presentation.slides.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
            activeTab === "quiz"
              ? "bg-[#0066cc] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] font-normal"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Practice Quiz</span>
          {quiz.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
              {quiz.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: AI Summary Content Pane */}
      {activeTab === "summary" && (
        <div
          className="markdown-content text-sm sm:text-base leading-relaxed text-[var(--text-main)]"
          dangerouslySetInnerHTML={{ __html: renderedSummaryHtml }}
        />
      )}

      {/* Tab 2: Full Transcript Content Pane */}
      {activeTab === "transcript" && (
        <div>
          {/* Transcript Export Toolbar */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4 no-print">
            <button
              onClick={handleCopyTranscript}
              className="px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-normal flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              {copiedTranscript ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <button
              onClick={() => {
                const transcriptHtml = result.transcript
                  .split("\n")
                  .filter((l) => l.trim().length > 0)
                  .map((l) => `<p class="transcript-line">${l.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
                  .join("");
                printCleanPdf(`${result.title || "Video"} — Full Transcript`, transcriptHtml);
              }}
              className="px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-normal flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleDownloadFile(result.transcript, `${safeFilename}_transcript.txt`, "text/plain")}
              className="px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-normal cursor-pointer active:scale-95 transition-all"
            >
              .TXT
            </button>
          </div>

          <div className="max-h-[480px] overflow-y-auto space-y-2.5 pr-2">
            {transcriptLines.length > 0 ? (
              transcriptLines.map((line, idx) => (
                <p key={idx} className="text-sm leading-relaxed text-[var(--text-main)]">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)] py-4">No transcript available.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Flashcards Pane */}
      {activeTab === "flashcards" && (
        <FlashcardsView
          cards={flashcards}
          provider={flashcardsProvider}
          isLoading={isLoadingFlashcards}
          onGenerate={handleGenerateFlashcards}
        />
      )}

      {/* Tab 4: Presentation (PPT) Pane */}
      {activeTab === "presentation" && (
        <PresentationView
          data={presentation}
          isLoading={isLoadingPresentation}
          onGenerate={handleGeneratePresentation}
          onToast={onToast}
        />
      )}

      {/* Tab 5: Quiz Pane */}
      {activeTab === "quiz" && (
        <QuizView
          quiz={quiz}
          provider={quizProvider}
          isLoading={isLoadingQuiz}
          onGenerate={handleGenerateQuiz}
        />
      )}
    </div>
  );
}
