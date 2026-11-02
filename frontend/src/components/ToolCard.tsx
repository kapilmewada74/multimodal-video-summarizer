"use client";

import React, { useState, useRef } from "react";
import {
  Link2,
  UploadCloud,
  Clipboard,
  Play,
  FileVideo,
  X,
  Loader2,
  ArrowRight,
  FileText,
  Layers,
  Monitor,
  HelpCircle,
  Check
} from "lucide-react";

interface ToolCardProps {
  isProcessing: boolean;
  onSubmitUrl: (url: string) => void;
  onSubmitUpload: (file: File) => void;
  onError: (msg: string) => void;
}

export function ToolCard({ isProcessing, onSubmitUrl, onSubmitUpload, onError }: ToolCardProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setJustPasted(true);
        setTimeout(() => setJustPasted(false), 1800);
      }
    } catch {
      onError("Clipboard access denied. Please paste manually into the input box.");
    }
  };

  const handleFileChange = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const valid = [".mp4", ".mov", ".mkv", ".avi", ".webm", ".mp3", ".wav", ".m4a"];
    if (!valid.includes(ext)) {
      onError(`Unsupported file type '${ext}'. Supported: ${valid.join(", ")}`);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeTab === "url") {
      if (!url.trim()) {
        onError("Please enter a YouTube video URL.");
        return;
      }
      onSubmitUrl(url.trim());
    } else {
      if (!selectedFile) {
        onError("Please select or drop a media file.");
        return;
      }
      onSubmitUpload(selectedFile);
    }
  };

  return (
    <div className="w-full no-print select-none transition-colors">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* ============================================================
             1. HERO TITLE & SUBTITLE (CLEAN & CENTERED)
             ============================================================ */}
        <div className="w-full text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] text-[var(--text-main)] leading-[1.12]">
            Summarize Any Video in <span className="text-[var(--text-main)]">Seconds</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] max-w-2xl mx-auto mt-3 sm:mt-4 leading-relaxed font-normal">
            Generate structured study notes, complete transcripts, active-recall flashcards, slide presentations, and interactive quizzes from any video.
          </p>
        </div>

        {/* ============================================================
             2. MODE SWITCHER TABS (YOUTUBE URL / UPLOAD MEDIA)
             ============================================================ */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-7 sm:mt-9 mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
              activeTab === "url"
                ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>YouTube URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
              activeTab === "upload"
                ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Upload Video / Audio</span>
          </button>
        </div>

        {/* ============================================================
             3. INPUT PILL BAR (PLAY ICON + TEXT INPUT + PASTE BUTTON)
             ============================================================ */}
        <div className="w-full max-w-3xl px-3 sm:px-4">
          <div
            onClick={() => {
              if (activeTab === "upload" && !selectedFile) {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              if (activeTab === "upload") {
                e.preventDefault();
                setIsDragging(true);
              }
            }}
            onDragLeave={() => {
              if (activeTab === "upload") setIsDragging(false);
            }}
            onDrop={(e) => {
              if (activeTab === "upload") {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }
            }}
            className={`w-full h-14 sm:h-16 rounded-full border border-black/15 dark:border-white/15 bg-white dark:bg-[#141512] shadow-xs hover:shadow-sm flex items-center px-3 sm:px-4 gap-2.5 sm:gap-3 transition-all focus-within:border-[var(--brand-lime-hover)] focus-within:ring-2 focus-within:ring-[var(--brand-lime)]/20 ${
              activeTab === "upload" && !selectedFile ? "cursor-pointer" : ""
            } ${
              isDragging
                ? "ring-2 ring-[var(--brand-lime)] border-[var(--brand-lime)] bg-[var(--brand-lime)]/10"
                : ""
            }`}
          >
            {/* Left Icon in subtle circular badge */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-black/15 dark:border-white/15 flex items-center justify-center shrink-0 text-black/60 dark:text-white/60 bg-black/[0.02] dark:bg-white/[0.02]">
              {activeTab === "url" ? (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
              ) : selectedFile ? (
                <FileVideo className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>

            {/* Middle Section: Input field or File details */}
            {activeTab === "url" ? (
              <input
                type="text"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Paste a YouTube link (e.g. https://youtu.be/...)"
                disabled={isProcessing}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full h-full bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none px-1 text-xs sm:text-sm md:text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                aria-label="Paste a YouTube link"
              />
            ) : (
              <div className="w-full h-full flex items-center px-1 select-none min-w-0">
                {!selectedFile ? (
                  <span className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] truncate">
                    {isDragging ? "Drop video or audio right here..." : "Click to upload or drag & drop video/audio"}
                  </span>
                ) : (
                  <div className="flex items-center min-w-0">
                    <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--text-main)] truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[var(--text-muted)] ml-2 shrink-0">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Right Button: Paste or Browse/Remove */}
            <div className="shrink-0">
              {activeTab === "url" ? (
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={isProcessing}
                  className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-[#EFEFEc] hover:bg-[#E5E5E1] dark:bg-[#20211D] dark:hover:bg-[#2A2B25] text-[var(--text-main)] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Paste from clipboard"
                >
                  {justPasted ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Pasted!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)]" />
                      <span>Paste</span>
                    </>
                  )}
                </button>
              ) : !selectedFile ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isProcessing}
                  className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-[#EFEFEc] hover:bg-[#E5E5E1] dark:bg-[#20211D] dark:hover:bg-[#2A2B25] text-[var(--text-main)] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Browse files"
                >
                  <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)]" />
                  <span>Browse</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="h-9 sm:h-10 px-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-[var(--color-danger)] border border-red-500/20 text-xs sm:text-sm font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* ============================================================
             4. SUMMARIZE VIDEO BUTTON (LARGE CENTERED CTA)
             ============================================================ */}
        <div className="flex justify-center mt-6 sm:mt-7">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isProcessing}
            className="h-12 sm:h-13 md:h-14 px-8 sm:px-10 rounded-full bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] active:scale-95 text-[#0E0F0C] font-black text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Summarize Video"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0E0F0C]" />
                <span>{activeTab === "upload" ? "Uploading..." : "Processing..."}</span>
              </>
            ) : (
              <>
                <span>Summarize Video</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>

        {/* ============================================================
             5. FEATURE PILLS (NOTES, FLASHCARDS, SLIDES, QUIZ)
             ============================================================ */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-7 sm:mt-8">
          <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#181915]/80 text-xs sm:text-sm font-medium text-[var(--text-main)] shadow-2xs">
            <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Notes</span>
          </div>

          <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#181915]/80 text-xs sm:text-sm font-medium text-[var(--text-main)] shadow-2xs">
            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Flashcards</span>
          </div>

          <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#181915]/80 text-xs sm:text-sm font-medium text-[var(--text-main)] shadow-2xs">
            <Monitor className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Slides</span>
          </div>

          <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#181915]/80 text-xs sm:text-sm font-medium text-[var(--text-main)] shadow-2xs">
            <HelpCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Quiz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
