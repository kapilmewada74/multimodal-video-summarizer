"use client";

import React, { useState, useMemo } from "react";
import { renderMarkdownWithMath } from "../lib/mathUtils";
import {
  Copy,
  Download,
  Printer,
  FileText,
  Check,
  Layers,
  Presentation as PresentationIcon,
  Sparkles,
  ArrowRight,
  AlignLeft
} from "lucide-react";
import { JobResult } from "../lib/types";
import { FlashcardsView, Flashcard } from "./FlashcardsView";
import { PresentationView, PresentationData } from "./PresentationView";
import { QuizView, QuizQuestion } from "./QuizView";

function cleanAndDeduplicateSummary(rawText: string): string {
  if (!rawText) return "";

  // 1. Remove hallucinated CJK characters and punctuation
  let cleaned = rawText.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]+/g, "");
  cleaned = cleaned.replace(/\(\s*\)/g, "");
  cleaned = cleaned.replace(/\(\s*Section\s*\d*\s*\)/gi, "");
  cleaned = cleaned.replace(/\*\*\s*\*\*/g, "");
  cleaned = cleaned.replace(/^\s*[-*]\s*[-*:\s]*$/gm, "");

  // 2. Check for duplicate blocks separated by --- or repeated # Video Summary / ## Main Topic
  let parts = cleaned.split(/\n\s*---\s*\n/);
  if (parts.length <= 1) {
    const summaryHeaderMatches = [...cleaned.matchAll(/(?:^|\n)#+\s*Video Summary/gi)];
    if (summaryHeaderMatches.length > 1) {
      parts = [cleaned.slice(0, summaryHeaderMatches[1].index), cleaned.slice(summaryHeaderMatches[1].index)];
    }
  }

  if (parts.length <= 1) {
    const mainTopicMatches = [...cleaned.matchAll(/(?:^|\n)##\s*Main Topic/gi)];
    if (mainTopicMatches.length > 1) {
      parts = [cleaned.slice(0, mainTopicMatches[1].index), cleaned.slice(mainTopicMatches[1].index)];
    }
  }

  if (parts.length <= 1) {
    // Strip leading # Video Summary or # Summary heading since we have a dedicated UI header row
    return cleaned.replace(/^\s*#+\s*(?:Video\s+)?Summary\s*\n+/i, "").trim();
  }

  // Multiple blocks detected - merge them
  const mainTopics: string[] = [];
  const keyConcepts: string[] = [];
  const detailedBreakdowns: string[] = [];
  const keyTakeaways: string[] = [];

  for (const part of parts) {
    const mtMatch = part.match(/##\s*Main Topic\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (mtMatch) {
      const mt = mtMatch[1].trim();
      if (mt && !mainTopics.includes(mt)) mainTopics.push(mt);
    }

    const kcMatch = part.match(/##\s*Key Concepts\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (kcMatch) {
      const lines = kcMatch[1].trim().split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const item = trimmed.replace(/^[-*]\s*/, "").replace(/^[-:\s]+/, "").trim();
          if (item && !keyConcepts.some((e) => e.toLowerCase() === item.toLowerCase())) {
            keyConcepts.push(item);
          }
        }
      }
    }

    const dbMatch = part.match(/##\s*Detailed Breakdown\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (dbMatch) {
      const lines = dbMatch[1].trim().split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const item = trimmed.replace(/^[-*]\s*/, "").replace(/^[-:\s]+/, "").trim();
          if (item && !detailedBreakdowns.some((e) => e.toLowerCase() === item.toLowerCase())) {
            detailedBreakdowns.push(item);
          }
        }
      }
    }

    const ktMatch = part.match(/##\s*Key Takeaways\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (ktMatch) {
      const lines = ktMatch[1].trim().split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const item = trimmed.replace(/^[-*]\s*/, "").replace(/^[-:\s]+/, "").trim();
          if (item && !keyTakeaways.some((e) => e.toLowerCase() === item.toLowerCase())) {
            keyTakeaways.push(item);
          }
        } else if (trimmed && !trimmed.startsWith("#") && trimmed.length > 3) {
          if (!keyTakeaways.includes(trimmed)) keyTakeaways.push(trimmed);
        }
      }
    }
  }

  const out: string[] = [];
  if (mainTopics.length) {
    out.push("## Main Topic\n" + mainTopics.join(" ") + "\n");
  }
  if (keyConcepts.length) {
    out.push("## Key Concepts\n" + keyConcepts.map((c) => `- ${c}`).join("\n") + "\n");
  }
  if (detailedBreakdowns.length) {
    out.push("## Detailed Breakdown\n" + detailedBreakdowns.map((b) => `- ${b}`).join("\n") + "\n");
  }
  if (keyTakeaways.length) {
    out.push("## Key Takeaways\n" + keyTakeaways.map((t) => (t.startsWith("-") ? t : `- ${t}`)).join("\n") + "\n");
  }

  return out.join("\n").trim();
}

interface OutputWorkspaceProps {
  result: JobResult;
  onToast: (msg: string, type?: "success" | "info" | "error") => void;
  onRegenerateSummary?: () => void;
  isRegeneratingSummary?: boolean;
}

export function OutputWorkspace({
  result,
  onToast,
}: OutputWorkspaceProps) {
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

  const cleanedSummary = useMemo(() => {
    return cleanAndDeduplicateSummary(result.summary || "");
  }, [result.summary]);

  const fullSummaryForExport = useMemo(() => {
    return `# Video Summary\n\n${cleanedSummary}`;
  }, [cleanedSummary]);

  // Render markdown with KaTeX math formula rendering
  const renderedSummaryHtml = useMemo(() => {
    if (!cleanedSummary) return "";
    return renderMarkdownWithMath(cleanedSummary);
  }, [cleanedSummary]);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(fullSummaryForExport);
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
  const handleGenerateFlashcards = async (forceRefresh: boolean = false) => {
    setIsLoadingFlashcards(true);
    try {
      const res = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          summary: result.summary,
          transcript: result.transcript,
          force_refresh: forceRefresh,
          forceRefresh: forceRefresh,
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
    <div id="workspace-container" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-6 sm:p-8 shadow-xl mt-2 sm:mt-4 mb-20 sm:mb-28 lg:mb-32 print-content transition-colors">
      {/* Video Title Header */}
      <div className="border-b border-[var(--card-border)] pb-5 mb-6 no-print">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] truncate sm:whitespace-normal">
          {result.title || "Video"}
        </h2>
      </div>

      {/* 5 High Contrast Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--card-border)] pb-3 mb-6 no-print">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
            activeTab === "summary"
              ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs font-black"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
            activeTab === "transcript"
              ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs font-black"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
          }`}
        >
          <AlignLeft className="w-4 h-4" />
          <span>Transcript</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("flashcards");
            if (flashcards.length === 0) handleGenerateFlashcards();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
            activeTab === "flashcards"
              ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs font-black"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("presentation");
            if (!presentation) handleGeneratePresentation();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
            activeTab === "presentation"
              ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs font-black"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
          }`}
        >
          <PresentationIcon className="w-4 h-4" />
          <span>Presentation (PPT)</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
            activeTab === "quiz"
              ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs font-black"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
          }`}
        >
          <span>Quiz</span>
        </button>
      </div>

      {/* Tab 1: AI Summary Content Pane */}
      {activeTab === "summary" && (
        <div>
          {/* Summary Header: "Video Summary" on left, [Copy Summary] [PDF] [.TXT] on right-most side */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--card-border)] no-print">
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
              Video Summary
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopySummary}
                className="px-4 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Summary</span>
              </button>

              <button
                onClick={() => printCleanPdf(result.title || "Video Summary", renderedSummaryHtml)}
                className="px-3.5 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                onClick={() => handleDownloadFile(fullSummaryForExport, `${safeFilename}_summary.txt`, "text/plain")}
                className="px-3.5 py-1.5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.TXT</span>
              </button>
            </div>
          </div>

          <div
            className="markdown-content text-sm sm:text-base leading-relaxed text-[var(--text-main)]"
            dangerouslySetInnerHTML={{ __html: renderedSummaryHtml }}
          />
        </div>
      )}

      {/* Tab 2: Full Transcript Content Pane */}
      {activeTab === "transcript" && (
        <div>
          {/* Transcript Export Toolbar */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4 no-print">
            <button
              onClick={handleCopyTranscript}
              className="px-3.5 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
                printCleanPdf(`${result.title || "Video"} — Transcript`, transcriptHtml);
              }}
              className="px-3.5 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleDownloadFile(result.transcript, `${safeFilename}_transcript.txt`, "text/plain")}
              className="px-3.5 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold cursor-pointer"
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
