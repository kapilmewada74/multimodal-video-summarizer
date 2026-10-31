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

  const filteredTranscriptLines = useMemo(() => {
    if (!result.transcript) return [];
    const lines = result.transcript.split("\n").filter((l) => l.trim().length > 0);
    if (!transcriptSearch.trim()) return lines;
    return lines.filter((l) => l.toLowerCase().includes(transcriptSearch.toLowerCase()));
  }, [result.transcript, transcriptSearch]);

  const safeFilename = (result.title || "video").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-xl mb-8 print-content transition-colors">
      {/* Title & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-5 mb-6 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-1.5 text-[var(--text-main)]">{result.title || "Video Summary"}</h2>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <span>Status: <strong className="text-[var(--color-success)]">Complete</strong></span>
          </div>
        </div>

        {/* Export Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Summary</span>
          </button>

          <button
            onClick={() => printCleanPdf(result.title || "Video Summary", renderedSummaryHtml)}
            className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => handleDownloadFile(result.summary, `${safeFilename}_summary.txt`, "text/plain")}
            className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--card-border)] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>
        </div>
      </div>

      {/* High Contrast Tabs */}
      <div className="flex gap-2 border-b border-[var(--card-border)] pb-3 mb-6 no-print">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            activeTab === "summary"
              ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Summary Notes</span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            activeTab === "transcript"
              ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
          }`}
        >
          <span>Full Transcript</span>
        </button>
      </div>

      {/* Content Panes */}
      {activeTab === "summary" ? (
        <div
          className="markdown-content text-sm sm:text-base leading-relaxed text-[var(--text-main)]"
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
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-lime)]"
              />
            </div>
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
                printCleanPdf(`${result.title || "Video"} — Full Transcript`, transcriptHtml);
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
            {filteredTranscriptLines.length > 0 ? (
              filteredTranscriptLines.map((line, idx) => (
                <p key={idx} className="text-sm leading-relaxed text-[var(--text-main)]">
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
