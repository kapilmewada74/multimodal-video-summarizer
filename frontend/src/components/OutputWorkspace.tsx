"use client";

import React, { useState, useMemo } from "react";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Copy, Download, Printer, Search, FileText, Check } from "lucide-react";
import { JobResult } from "../lib/types";

interface OutputWorkspaceProps {
  result: JobResult;
  onToast: (msg: string, type?: "success" | "info" | "error") => void;
}

export function OutputWorkspace({ result, onToast }: OutputWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "transcript">("summary");
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

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

    return marked.parse(raw);
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

  const filteredTranscriptLines = useMemo(() => {
    if (!result.transcript) return [];
    const lines = result.transcript.split("\n").filter((l) => l.trim().length > 0);
    if (!transcriptSearch.trim()) return lines;
    return lines.filter((l) => l.toLowerCase().includes(transcriptSearch.toLowerCase()));
  }, [result.transcript, transcriptSearch]);

  const safeFilename = (result.title || "video").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-2xl mb-8 print-content">
      {/* Title & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-5 mb-6 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-1.5">{result.title || "Video Summary"}</h2>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <span>Model: <strong className="text-[var(--text-main)]">Qwen2.5 (Local)</strong></span>
            <span>•</span>
            <span>Status: <strong className="text-[var(--color-success)]">Complete</strong></span>
          </div>
        </div>

        {/* Export Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-1.5 rounded-lg bg-[rgba(242,242,240,0.06)] hover:bg-[rgba(242,242,240,0.12)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Summary</span>
          </button>

          <button
            onClick={() => handleDownloadFile(result.summary, `${safeFilename}_summary.md`, "text/markdown")}
            className="px-3 py-1.5 rounded-lg bg-[rgba(242,242,240,0.06)] hover:bg-[rgba(242,242,240,0.12)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-[rgba(242,242,240,0.06)] hover:bg-[rgba(242,242,240,0.12)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--card-border)] pb-2 mb-6 no-print">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "summary"
              ? "bg-[rgba(217,236,149,0.12)] text-[var(--brand-lime)] border-b-2 border-[var(--brand-lime)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[rgba(242,242,240,0.05)]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Summary Notes</span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "transcript"
              ? "bg-[rgba(217,236,149,0.12)] text-[var(--brand-lime)] border-b-2 border-[var(--brand-lime)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[rgba(242,242,240,0.05)]"
          }`}
        >
          <span>Full Transcript</span>
        </button>
      </div>

      {/* Content Panes */}
      {activeTab === "summary" ? (
        <div
          className="markdown-content text-sm sm:text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderedSummaryHtml }}
        />
      ) : (
        <div>
          {/* Transcript Search Toolbar */}
          <div className="flex items-center gap-2 mb-4 no-print">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search words in transcript..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-lime)]"
              />
            </div>
            <button
              onClick={handleCopyTranscript}
              className="px-3 py-2 rounded-xl bg-[rgba(242,242,240,0.06)] hover:bg-[rgba(242,242,240,0.12)] border border-[var(--card-border)] text-xs font-semibold flex items-center gap-1.5"
            >
              {copiedTranscript ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <button
              onClick={() => handleDownloadFile(result.transcript, `${safeFilename}_transcript.txt`, "text/plain")}
              className="px-3 py-2 rounded-xl bg-[rgba(242,242,240,0.06)] hover:bg-[rgba(242,242,240,0.12)] border border-[var(--card-border)] text-xs font-semibold"
            >
              .TXT
            </button>
          </div>

          <div className="max-h-[480px] overflow-y-auto space-y-2.5 pr-2">
            {filteredTranscriptLines.length > 0 ? (
              filteredTranscriptLines.map((line, idx) => (
                <p key={idx} className="text-sm leading-relaxed text-[var(--text-main)]/90">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)] py-4">
                No matching lines found for &quot;{transcriptSearch}&quot;.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
